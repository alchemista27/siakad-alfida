import assert from "node:assert/strict";
import { fingerprintResponseMessage, readFingerprintJson } from "../src/components/attendance/fingerprint-response";

async function main() {
  const valid = await readFingerprintJson<{ lastRun: null }>(
    new Response(JSON.stringify({ lastRun: null }), { headers: { "content-type": "application/json" } }),
    "Status fingerprint tidak dapat dibaca.",
  );
  assert.deepEqual(valid, { lastRun: null });

  await assert.rejects(
    () => readFingerprintJson(new Response(null, { status: 200 }), "Status fingerprint tidak dapat dibaca."),
    /Status fingerprint tidak dapat dibaca\./,
    "an empty success response must become a bounded app error instead of a JSON parser error",
  );

  await assert.rejects(
    () => readFingerprintJson(new Response("gateway unavailable", { status: 200, headers: { "content-type": "text/plain" } }), "Status fingerprint tidak dapat dibaca."),
    /Status fingerprint tidak dapat dibaca\./,
    "a non-JSON success response must become a bounded app error",
  );

  const message = await fingerprintResponseMessage(
    new Response(JSON.stringify({ message: "SIMPEG_FINGERPRINT_ENABLED harus bernilai true." }), { status: 400, headers: { "content-type": "application/json" } }),
    "Sinkronisasi gagal.",
  );
  assert.equal(message, "SIMPEG_FINGERPRINT_ENABLED harus bernilai true.");

  console.log("SIMPEG fingerprint status UI contract passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
