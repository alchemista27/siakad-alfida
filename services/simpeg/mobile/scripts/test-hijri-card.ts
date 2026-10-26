import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const card = readFileSync(resolve(__dirname, "../src/components/hijri-calendar-card.tsx"), "utf8");
assert.match(card, /export function HijriCalendarCard\(\{ now, timeZone \}/);
assert.match(card, /Bulan sebelumnya/);
assert.match(card, /Bulan berikutnya/);
assert.match(card, /Kembali ke bulan ini/);
assert.match(card, /penetapan resmi Kemenag/i);
assert.match(card, /00\.00/);
assert.match(card, /Masehi/);
assert.match(card, /accessibilityRole="alert"/);
assert.match(card, /hijriAt\(now, timeZone\)/);
assert.doesNotMatch(card, /requestForegroundPermissionsAsync|requestBackgroundPermissionsAsync|getCurrentPositionAsync|timeZone\s*\|\|\s*["']UTC["']/);
console.log("hijri card passed");
