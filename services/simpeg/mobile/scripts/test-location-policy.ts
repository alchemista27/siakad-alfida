import assert from "node:assert/strict";
import { validateLocationFix } from "../src/lib/location-policy";

const now = 1_800_000_000_000;
const fix = { coords: { latitude: -6.2, longitude: 106.8, accuracy: 12 }, timestamp: now - 2_000, mocked: false };
function rejects(position: Parameters<typeof validateLocationFix>[0], text: RegExp, radius?: number) {
  assert.throws(() => validateLocationFix(position, now, radius), text);
}

assert.deepEqual(validateLocationFix(fix, now), {
  latitude: -6.2, longitude: 106.8, accuracyMeters: 12,
  capturedAt: new Date(now - 2_000).toISOString(), mocked: false,
  mockStatus: "not-mocked-reported",
});
rejects(null, /tidak tersedia/i);
rejects({ ...fix, mocked: true }, /palsu|mock/i);
rejects({ ...fix, coords: { ...fix.coords, latitude: NaN } }, /koordinat/i);
rejects({ ...fix, coords: { ...fix.coords, longitude: 181 } }, /koordinat/i);
rejects({ ...fix, coords: { ...fix.coords, latitude: -91 } }, /koordinat/i);
rejects({ ...fix, coords: { ...fix.coords, accuracy: Infinity } }, /akurasi/i);
rejects({ ...fix, coords: { ...fix.coords, accuracy: -1 } }, /akurasi/i);
rejects({ ...fix, coords: { ...fix.coords, accuracy: 51 } }, /akurasi/i);
rejects({ ...fix, coords: { ...fix.coords, accuracy: 21 } }, /akurasi/i, 20);
rejects({ ...fix, timestamp: now - 15_001 }, /lama/i);
rejects({ ...fix, timestamp: now + 5_001 }, /masa depan/i);
assert.equal(validateLocationFix({ ...fix, mocked: undefined }, now).mockStatus, "tidak dapat diverifikasi");
assert.equal(validateLocationFix({ ...fix, timestamp: now - 15_000 }, now).accuracyMeters, 12);
console.log("location policy passed");
