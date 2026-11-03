import "reflect-metadata";
import assert from "node:assert/strict";
import { FingerprintDeviceClient } from "../src/attendance/fingerprint-device.client";

async function main() {
  const old = { ...process.env };
  try {
    process.env.SIMPEG_FINGERPRINT_ENABLED = "true";
    process.env.SIMPEG_FINGERPRINT_DEVICE_ID = "solution-x100c";
    process.env.SIMPEG_FINGERPRINT_HOST = "192.168.100.14";
    process.env.SIMPEG_FINGERPRINT_PORT = "4370";
    process.env.SIMPEG_FINGERPRINT_COMM_KEY = "0";
    process.env.SIMPEG_FINGERPRINT_TIMEZONE = "Asia/Jakarta";

    let received: any;
    const client = new FingerprintDeviceClient(async (command, args, options) => {
      received = { command, args, options };
      return { stdout: JSON.stringify({ device: { id: "solution-x100c", serial: "SN-1", firmware: null, name: null }, events: [{ enrollmentId: "0012", occurredAt: "2026-10-05T00:15:00.000Z", punch: 0, status: 0 }] }), stderr: "" };
    });
    const result = await client.readAttendance();

    assert.equal(result.device.id, "solution-x100c");
    assert.equal(result.events.length, 1);
    assert.equal(received.command, "python3");
    assert.match(received.args[0], /zk_read_attendance\.py$/);
    assert.deepEqual(Object.keys(received.options.env).sort(), [
      "SIMPEG_FINGERPRINT_COMM_KEY",
      "SIMPEG_FINGERPRINT_DEVICE_ID",
      "SIMPEG_FINGERPRINT_HOST",
      "SIMPEG_FINGERPRINT_PORT",
      "SIMPEG_FINGERPRINT_TIMEZONE",
    ]);

    const secret = process.env.SIMPEG_FINGERPRINT_COMM_KEY;
    const invalidClient = new FingerprintDeviceClient(async () => ({ stdout: "not-json", stderr: "" }));
    await assert.rejects(() => invalidClient.readAttendance(), (error: unknown) => error instanceof Error && !error.message.includes(secret!));

    process.env.SIMPEG_FINGERPRINT_ENABLED = "false";
    await assert.rejects(() => client.readAttendance(), /SIMPEG_FINGERPRINT_ENABLED/);
    process.env.SIMPEG_FINGERPRINT_ENABLED = "true";

    delete process.env.SIMPEG_FINGERPRINT_HOST;
    await assert.rejects(() => client.readAttendance(), /SIMPEG_FINGERPRINT_HOST/);

    console.log("SIMPEG fingerprint device client contract passed");
  } finally {
    for (const key of Object.keys(process.env)) if (!(key in old)) delete process.env[key];
    Object.assign(process.env, old);
  }
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
