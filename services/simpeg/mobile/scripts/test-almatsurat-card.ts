import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getAlMatsurat } from "@guidelightid/almatsurat";
import { getReading, type ReadingTime, type ReadingVariant } from "../src/lib/almatsurat-reading";

const card = readFileSync(resolve(__dirname, "../src/components/almatsurat-card.tsx"), "utf8");

for (const variant of ["sugro", "kubro"] as ReadingVariant[]) {
  for (const time of ["pagi", "petang"] as ReadingTime[]) {
    const source = getAlMatsurat(variant, time).data;
    const reading = getReading(variant, time);
    assert.equal(reading.length, source.length, `${variant}/${time}: complete in-app collection`);
    reading.forEach((item, index) => {
      const original = source[index];
      assert.deepEqual(item, {
        title: original.title,
        repeat: original.repeat,
        verses: original.type === "parent" ? original.data?.map(verse => verse.arabic) : [original.arabic],
      }, `${variant}/${time} #${index + 1}: preserve source order and nested Arabic verses, no translations/transliterations`);
      assert.ok(item.title.trim() && item.verses.length > 0);
      assert.ok(item.verses.every(verse => verse.trim() && /[\u0600-\u06ff]/u.test(verse) && !/[A-Za-z]/u.test(verse)),
        `${variant}/${time} #${index + 1}: no empty or Latin recitation displayed`);
    });
    assert.equal(reading[1].verses.length, 7, "Al-Fatihah has seven visible verses");
  }
}
assert.match(card, /getReading\(variant, time\)/, "selected collection is read in app");
assert.match(card, /setVariant\(/);
assert.match(card, /setTime\(/);
assert.match(card, /\["sugro", "kubro"\]/);
assert.match(card, /\["pagi", "petang"\]/);
assert.match(card, /items\.map\(/);
assert.match(card, /item\.verses\.map\(/, "each nested verse is rendered individually");
assert.match(card, /\{item\.title\}/);
assert.match(card, /\{item\.repeat\}/);
assert.match(card, /\{verse\}/);
assert.match(card, /accessibilityRole="button"/);
assert.match(card, /accessibilityState=\{\{ selected:/);
assert.match(card, /writingDirection: "rtl"/);
assert.match(card, /textAlign: "right"/);
assert.match(card, /lineHeight: (?:3[6-9]|[4-9][0-9])\b/);
assert.match(card, /fontFamily: "Lora"/);
assert.match(card, /fontFamily: "Inter"/);
assert.match(card, /import \{ colors, radius, space \} from "\.\.\/theme\/tokens"/);
assert.match(card, /MIT.*Aliif Arief/s, "app-visible attribution");
assert.doesNotMatch(card, /WebBrowser|openBrowserAsync|https?:\/\/|\.(?:latin|translation)\b|(?:item|verse)\.arabic\b|accessibilityRole="link"|situs eksternal|membutuhkan internet/i);
const notice = readFileSync(resolve(__dirname, "../NOTICE.md"), "utf8");
assert.match(notice, /92edd45d7cfa0e5cd1528ccc16015dcb383419a9/);
assert.match(notice, /MIT License/);
assert.match(notice, /Copyright \(c\) 2024 Aliif Arief/);
assert.match(notice, /Permission is hereby granted/);

// Render the actual component with lightweight host primitives, including selector presses.
// This checks what reaches Text nodes rather than only searching JSX source.
const Module = require("node:module") as { _load: (id: string, parent: unknown, main: boolean) => unknown };
const originalLoad = Module._load;
const react = require("react") as typeof import("react");
const state: unknown[] = [];
let slot = 0;
Module._load = function (id, parent, main) {
  if (id === "react-native") return { View: "View", Text: "Text", Pressable: "Pressable", StyleSheet: { create: (styles: unknown) => styles } };
  if (id === "react") return {
    ...react,
    useState: (initial: unknown) => {
      const at = slot++;
      if (!(at in state)) state[at] = initial;
      return [state[at], (value: unknown) => { state[at] = value; }];
    },
  };
  return originalLoad.call(this, id, parent, main);
};
const { AlmatsuratCard } = require("../src/components/almatsurat-card") as { AlmatsuratCard: () => unknown };
Module._load = originalLoad;

type Node = { type?: string; props?: Record<string, any> };
function walk(node: unknown): Node[] {
  if (Array.isArray(node)) return node.flatMap(walk);
  if (!node || typeof node !== "object" || !("props" in node)) return [];
  const element = node as Node;
  return [element, ...walk(element.props?.children)];
}
function text(node: unknown): string {
  if (Array.isArray(node)) return node.map(text).join("");
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node !== "object") return String(node);
  return text((node as Node).props?.children);
}
function render(): Node[] { slot = 0; return walk(AlmatsuratCard()); }
for (const variant of ["sugro", "kubro"] as ReadingVariant[]) {
  for (const time of ["pagi", "petang"] as ReadingTime[]) {
    let tree = render();
    const variantButton = tree.find(node => node.type === "Pressable" && node.props?.accessibilityLabel === `Versi ${variant}`);
    assert.ok(variantButton, `${variant}: selectable version`);
    variantButton.props!.onPress();
    tree = render();
    const timeButton = tree.find(node => node.type === "Pressable" && node.props?.accessibilityLabel === `Waktu ${time}`);
    assert.ok(timeButton, `${time}: selectable time`);
    timeButton.props!.onPress();
    tree = render();
    assert.ok(tree.find(node => node.props?.accessibilityLabel === `Versi ${variant}`)?.props?.accessibilityState.selected);
    assert.ok(tree.find(node => node.props?.accessibilityLabel === `Waktu ${time}`)?.props?.accessibilityState.selected);
    const arabic = tree.filter(node => node.type === "Text" && node.props?.style?.writingDirection === "rtl")
      .map(node => text(node.props?.children));
    assert.deepEqual(arabic, getReading(variant, time).flatMap(item => item.verses),
      `${variant}/${time}: all recitations, including nested verses, render in order`);
    assert.ok(arabic.every(verse => verse.trim() && /[\u0600-\u06ff]/u.test(verse) && !/[A-Za-z]/u.test(verse)),
      `${variant}/${time}: rendered recitation contains no empty, Latin or translation text`);
    const labels = tree.filter(node => node.type === "Text").map(node => text(node.props?.children));
    assert.ok(getReading(variant, time).every(item => labels.includes(`Dibaca ${item.repeat}×`)));
    const source = getAlMatsurat(variant, time).data;
    assert.ok(source.every(item => !item.latin || !labels.includes(item.latin)));
    assert.ok(source.every(item => !item.translation || !labels.includes(item.translation)));
  }
}
console.log("almatsurat in-app reading card contract passed");
