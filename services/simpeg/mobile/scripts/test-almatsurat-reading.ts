import assert from "node:assert/strict";
import { getReading, type ReadingVariant, type ReadingTime } from "../src/lib/almatsurat-reading";

for (const variant of ["sugro", "kubro"] as ReadingVariant[]) {
  for (const time of ["pagi", "petang"] as ReadingTime[]) {
    const items = getReading(variant, time);
    assert.equal(items.length, variant === "sugro" ? 32 : 40, `${variant}/${time}: jumlah bacaan`);
    assert.equal(items[1].verses.length, 7, "Al-Fatihah menampilkan tujuh ayat berurutan");
    for (const item of items) {
      assert.deepEqual(Object.keys(item).sort(), ["repeat", "title", "verses"], "tampilkan bacaan saja, bukan terjemahan/transliterasi");
      assert.ok(item.title.trim() && Number.isInteger(item.repeat) && item.repeat > 0);
      assert.ok(item.verses.length > 0 && item.verses.every(v => /[\u0600-\u06ff]/u.test(v)));
    }
  }
  const pagi = getReading(variant, "pagi");
  const petang = getReading(variant, "petang");
  assert.notDeepEqual(pagi, petang, `${variant}: varian pagi dan petang harus berbeda`);
}
console.log("almatsurat reading passed");
