import { getAlMatsurat, type AlMatsuratTime, type AlMatsuratVariant } from "@guidelightid/almatsurat";

export type ReadingVariant = AlMatsuratVariant;
export type ReadingTime = AlMatsuratTime;
export type ReadingItem = { title: string; repeat: number; verses: string[] };

/** Retain only the source title, repetition count, and ordered Arabic recitation. */
export function getReading(variant: ReadingVariant, time: ReadingTime): ReadingItem[] {
  return getAlMatsurat(variant, time).data.map(item => ({
    title: item.title,
    repeat: item.repeat,
    verses: item.type === "parent" ? (item.data ?? []).map(verse => verse.arabic) : [item.arabic],
  }));
}
