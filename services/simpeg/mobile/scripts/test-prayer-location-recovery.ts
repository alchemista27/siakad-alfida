import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const app = readFileSync(resolve(__dirname, "../App.tsx"), "utf8");

assert.match(app, /Location\.getLastKnownPositionAsync/);
assert.match(app, /maxAge:\s*15 \* 60 \* 1000/);
assert.match(app, /requiredAccuracy:\s*5_000/);
assert.match(app, /mayShowUserSettingsDialog:\s*true/);
assert.match(app, /Promise\.race/);
assert.match(app, /Waktu mengambil lokasi habis/);
assert.match(app, /Menggunakan lokasi terakhir/);

console.log("prayer location recovery contract passed");
