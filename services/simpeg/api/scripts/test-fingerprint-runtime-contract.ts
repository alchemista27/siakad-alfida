import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const simpegRoot = resolve(import.meta.dirname, "../..");
const dockerfile = readFileSync(resolve(simpegRoot, "Dockerfile"), "utf8");
const requirementsPath = resolve(simpegRoot, "fingerprint/requirements.txt");
const adapterPath = resolve(simpegRoot, "fingerprint/zk_read_attendance.py");

assert.ok(existsSync(requirementsPath), "fingerprint requirements must exist");
assert.ok(existsSync(adapterPath), "read-only fingerprint adapter must exist");
assert.match(dockerfile, /apk add --no-cache python3 py3-pip/, "runner image must install Python runtime");
assert.match(dockerfile, /pip install[^\n]+fingerprint\/requirements\.txt/, "runner image must install pinned fingerprint requirements");
assert.match(readFileSync(requirementsPath, "utf8"), /^pyzk==\d+(?:\.\d+)+$/m, "pyzk must be pinned");

const adapter = readFileSync(adapterPath, "utf8");
for (const allowed of ["connect(", "get_attendance(", "get_firmware_version", "get_serialnumber", "get_device_name", "disconnect("]) {
  assert.ok(adapter.includes(allowed), `adapter must use ${allowed}`);
}
for (const forbidden of ["set_user(", "delete_user(", "clear_attendance(", "clear_data(", "restart(", "set_time(", "enable_device(", "disable_device("]) {
  assert.equal(adapter.includes(forbidden), false, `adapter must not contain mutating call ${forbidden}`);
}
assert.match(adapter, /json\.dumps\(/, "adapter must emit JSON");
assert.match(adapter, /SIMPEG_FINGERPRINT_HOST/, "adapter must read allowlisted fingerprint environment");
assert.match(adapter, /finally:/, "adapter must disconnect in finally");

console.log("SIMPEG fingerprint runtime contract passed");
