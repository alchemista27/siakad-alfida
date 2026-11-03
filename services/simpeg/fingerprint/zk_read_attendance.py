#!/usr/bin/env python3
"""Read ZKEM attendance records and emit a bounded JSON document.

This adapter intentionally contains no device mutation calls.
"""

from __future__ import annotations

import json
import os
import sys
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

from zk import ZK


def required_text(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        raise ValueError(f"Konfigurasi {name} wajib diisi.")
    return value


def required_int(name: str, minimum: int, maximum: int) -> int:
    raw = required_text(name)
    try:
        value = int(raw)
    except ValueError as error:
        raise ValueError(f"Konfigurasi {name} harus berupa angka.") from error
    if value < minimum or value > maximum:
        raise ValueError(f"Konfigurasi {name} berada di luar batas yang diizinkan.")
    return value


def optional_metadata(connection: object, method_name: str) -> str | None:
    method = getattr(connection, method_name, None)
    if not callable(method):
        return None
    try:
        value = method()
    except Exception:
        return None
    text = str(value).strip() if value is not None else ""
    return text or None


def to_utc(value: object, local_zone: ZoneInfo) -> str:
    if not isinstance(value, datetime):
        raise ValueError("Timestamp log fingerprint tidak valid.")
    local_value = value.replace(tzinfo=local_zone) if value.tzinfo is None else value.astimezone(local_zone)
    return local_value.astimezone(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")


def main() -> int:
    host = required_text("SIMPEG_FINGERPRINT_HOST")
    device_id = required_text("SIMPEG_FINGERPRINT_DEVICE_ID")
    port = required_int("SIMPEG_FINGERPRINT_PORT", 1, 65535)
    comm_key = required_int("SIMPEG_FINGERPRINT_COMM_KEY", 0, 2_147_483_647)
    timezone_name = os.environ.get("SIMPEG_FINGERPRINT_TIMEZONE", "Asia/Jakarta").strip() or "Asia/Jakarta"
    try:
        local_zone = ZoneInfo(timezone_name)
    except Exception as error:
        raise ValueError("Timezone fingerprint tidak valid.") from error

    connection = None
    try:
        zk = ZK(host, port=port, timeout=10, password=comm_key, force_udp=False, ommit_ping=True)
        connection = zk.connect()
        events = []
        for record in connection.get_attendance():
            enrollment_id = str(getattr(record, "user_id", "")).strip()
            if not enrollment_id:
                continue
            events.append({
                "enrollmentId": enrollment_id,
                "occurredAt": to_utc(getattr(record, "timestamp", None), local_zone),
                "punch": int(getattr(record, "punch", 0)) if getattr(record, "punch", None) is not None else None,
                "status": int(getattr(record, "status", 0)) if getattr(record, "status", None) is not None else None,
            })
        payload = {
            "device": {
                "id": device_id,
                "serial": optional_metadata(connection, "get_serialnumber"),
                "firmware": optional_metadata(connection, "get_firmware_version"),
                "name": optional_metadata(connection, "get_device_name"),
            },
            "events": events,
        }
        print(json.dumps(payload, ensure_ascii=False, separators=(",", ":")))
        return 0
    finally:
        if connection is not None:
            try:
                connection.disconnect()
            except Exception:
                pass


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as error:
        message = str(error).replace("\n", " ")[:300]
        print(f"Fingerprint read gagal: {message}", file=sys.stderr)
        raise SystemExit(1)
