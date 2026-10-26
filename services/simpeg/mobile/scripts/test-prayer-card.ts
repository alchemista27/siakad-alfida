import assert from "node:assert/strict";
import Module from "node:module";
import { colors, radius, space } from "../src/theme/tokens";
import { PRAYER_METHOD, type PrayerSlot } from "../src/lib/prayer-times";

// React Native's native entry cannot run in Node; replace only its primitives, not the card logic.
const originalLoad = (Module as any)._load;
(Module as any)._load = function (request: string, ...args: unknown[]) {
  if (request === "react-native") return { View: "View", Text: "Text", StyleSheet: { create: (styles: unknown) => styles } };
  return originalLoad.call(this, request, ...args);
};
let PrayerTimesCard: typeof import("../src/components/prayer-times-card").PrayerTimesCard;
try {
  ({ PrayerTimesCard } = require("../src/components/prayer-times-card"));
} finally {
  (Module as any)._load = originalLoad;
}

type Element = { type: string; props: { children?: unknown; style?: Record<string, unknown> | Record<string, unknown>[] } };
function elements(node: unknown): Element[] {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!node || typeof node !== "object" || !("props" in node)) return [];
  const element = node as Element;
  return [element, ...elements(element.props.children)];
}
function text(node: unknown): string {
  if (Array.isArray(node)) return node.map(text).join("");
  if (node && typeof node === "object" && "props" in node) return text((node as Element).props.children);
  return node == null ? "" : String(node);
}
const slots: PrayerSlot[] = [
  { key: "subuh", label: "Subuh", at: new Date("2026-10-24T22:00:00Z") },
  { key: "zuhur", label: "Zuhur", at: new Date("2026-10-25T05:00:00Z") },
];
const jakarta = elements(PrayerTimesCard({ slots, timezone: "Asia/Jakarta", accuracyMeters: 34.6 }));
const tokyo = elements(PrayerTimesCard({ slots, timezone: "Asia/Tokyo", accuracyMeters: 34.6 }));
const times = (items: Element[]) => items.filter(item => item.type === "Text" &&
  typeof item.props.style === "object" && (item.props.style as Record<string, unknown>).fontWeight === "700")
  .map(item => text(item));
assert.deepEqual(times(jakarta).slice(-2), ["05.00", "12.00"]);
assert.deepEqual(times(tokyo).slice(-2), ["07.00", "14.00"]);
assert.match(text(jakarta[0]), /Jadwal salat/);
assert.match(text(jakarta[0]), /Subuh/);
assert.match(text(jakarta[0]), /Zuhur/);
assert.match(text(jakarta[0]), new RegExp(PRAYER_METHOD.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
assert.match(text(jakarta[0]), /zona waktu perangkat \(Asia\/Jakarta\)/i);
assert.match(text(jakarta[0]), /zona waktu otomatis/i);
assert.match(text(jakarta[0]), /±35 m/);
assert.deepEqual(jakarta[0].props.style, {
  backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1,
  borderRadius: radius.md, padding: space.lg, gap: space.sm,
});
console.log("prayer card passed");
