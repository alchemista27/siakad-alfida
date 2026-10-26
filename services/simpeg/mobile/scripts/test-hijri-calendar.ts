import assert from "node:assert/strict";
import { getDayOfWeek, GregorianCalendar, toCalendar } from "@internationalized/date";
import { hijriAt, hijriMonth } from "../src/lib/hijri-calendar";

const before = hijriAt(new Date("2026-10-24T16:59:00Z"), "Asia/Jakarta");
const after = hijriAt(new Date("2026-10-24T17:01:00Z"), "Asia/Jakarta");
assert.equal(before.calendar.identifier, "islamic-umalqura");
assert.equal(after.compare(before.add({ days: 1 })), 0, "Jakarta civil date changes at midnight");
assert.equal(hijriAt(new Date("2026-10-24T17:01:00Z"), "UTC").compare(before), 0);
console.log("hijri boundary passed");

const month = hijriMonth(after);
assert.match(month.title, /\d+ H$/);
assert.ok(month.daysInMonth === 29 || month.daysInMonth === 30);
assert.equal(month.cells.filter(c => c.inMonth).length, month.daysInMonth);
assert.equal(month.cells.length % 7, 0);
assert.equal(month.cells[0].weekday, 0, "grid starts on Sunday");
assert.equal(getDayOfWeek(month.cells[0].gregorian, "en-US", "sun"), 0);
assert.ok(month.cells.every((c, i) => c.weekday === i % 7));
assert.ok(month.cells.every((c, i) => i === 0 || month.cells[i - 1].hijri.compare(c.hijri) < 0));
assert.ok(month.cells.every(c => toCalendar(c.hijri, new GregorianCalendar()).compare(c.gregorian) === 0));
assert.equal(month.cells.find(c => c.hijri.compare(after) === 0)?.gregorian.day, 25);
assert.notEqual(hijriMonth(after.add({ months: 1 })).title, month.title);
console.log("hijri month passed");

assert.throws(() => hijriAt(new Date(NaN), "Asia/Jakarta"), /tanggal/i);
assert.throws(() => hijriAt(new Date("2026-10-24T17:01:00Z"), ""), /zona waktu/i);
assert.throws(() => hijriAt(new Date("2026-10-24T17:01:00Z"), "Not/A_Zone"), /zona waktu|time zone/i);
assert.throws(() => hijriAt(new Date("1800-01-01T00:00:00Z"), "UTC"), /tidak tersedia/i);
assert.throws(() => hijriMonth(after.add({ years: 200 })), /tidak tersedia/i);
console.log("hijri calendar passed");
