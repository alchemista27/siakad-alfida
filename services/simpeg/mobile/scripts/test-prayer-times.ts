import assert from "node:assert/strict";
import { CalculationMethod, Coordinates, Madhab, PrayerTimes } from "adhan";
import { prayerTimesFor, PRAYER_METHOD } from "../src/lib/prayer-times";

const date = new Date(2026, 9, 24, 12);
const jakarta = { latitude: -6.2, longitude: 106.8 };
const slots = prayerTimesFor(jakarta, date);
assert.deepEqual(slots.map(slot => slot.key), ["subuh", "zuhur", "asar", "magrib", "isya"]);
assert.deepEqual(slots.map(slot => slot.label), ["Subuh", "Zuhur", "Asar", "Magrib", "Isya"]);
assert.ok(slots.every(slot => Number.isFinite(slot.at.getTime())));
assert.ok(slots.every((slot, index) => index === 0 || slots[index - 1].at < slot.at));
const parameters = CalculationMethod.MuslimWorldLeague();
parameters.madhab = Madhab.Shafi;
const expected = new PrayerTimes(new Coordinates(jakarta.latitude, jakarta.longitude), date, parameters);
assert.deepEqual(slots.map(slot => slot.at.getTime()),
  [expected.fajr, expected.dhuhr, expected.asr, expected.maghrib, expected.isha].map(time => time.getTime()));
assert.notEqual(prayerTimesFor({ latitude: -5.1, longitude: 119.4 }, date)[0].at.getTime(), slots[0].at.getTime());
assert.match(PRAYER_METHOD, /Muslim World League/i);
assert.match(PRAYER_METHOD, /perkiraan.*bukan jadwal resmi Kemenag/i);
for (const coordinates of [{ latitude: 91, longitude: 106.8 }, { latitude: -6.2, longitude: 181 },
  { latitude: NaN, longitude: 0 }, { latitude: 0, longitude: Infinity }]) {
  assert.throws(() => prayerTimesFor(coordinates, date), /koordinat/i);
}
assert.throws(() => prayerTimesFor(jakarta, new Date(NaN)), /tanggal/i);
console.log("prayer times passed");
