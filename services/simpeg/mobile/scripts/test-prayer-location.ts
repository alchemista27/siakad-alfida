import assert from "node:assert/strict";
import { validatePrayerLocation } from "../src/lib/prayer-location";

const now = Date.UTC(2026, 9, 24, 6);
const fix = { coords: { latitude: -6.2, longitude: 106.8, accuracy: 5_000 }, timestamp: now - 300_000, mocked: false };
assert.deepEqual(validatePrayerLocation(fix, now), {
  latitude: -6.2, longitude: 106.8, accuracyMeters: 5_000, capturedAt: now - 300_000,
});
assert.throws(() => validatePrayerLocation({ ...fix, timestamp: now - 300_001 }, now), /lama/i);
assert.throws(() => validatePrayerLocation({ ...fix, coords: { ...fix.coords, accuracy: 5_001 } }, now), /akurasi/i);
assert.throws(() => validatePrayerLocation({ ...fix, mocked: true }, now), /mock/i);
assert.throws(() => validatePrayerLocation(null, now), /tersedia/i);
for (const coords of [
  { ...fix.coords, latitude: NaN }, { ...fix.coords, longitude: Infinity },
  { ...fix.coords, latitude: 91 }, { ...fix.coords, longitude: -181 },
]) assert.throws(() => validatePrayerLocation({ ...fix, coords }, now), /koordinat/i);
for (const accuracy of [null, -1, Infinity, NaN]) {
  assert.throws(() => validatePrayerLocation({ ...fix, coords: { ...fix.coords, accuracy } }, now), /akurasi/i);
}
for (const timestamp of [NaN, Infinity, now + 5_001]) {
  assert.throws(() => validatePrayerLocation({ ...fix, timestamp }, now), /waktu|lama/i);
}
assert.equal(validatePrayerLocation({ ...fix, mocked: undefined, coords: { ...fix.coords, accuracy: 0 }, timestamp: now + 5_000 }, now).accuracyMeters, 0);
console.log("prayer location passed");
