import { normalizeYmqName } from "./aliases";

const sourceToCanonicalUnitName = new Map<string, string>([
  ["yayasan", "Kantor Pusat Yayasan"],
  ["staff yayasan", "Kantor Pusat Yayasan"],
  ["pqa", "Pesantren Quran Alfida"],
  ["sdit iqra 1", "SD Islam Terpadu Iqra 1"],
  ["sdit iqra 2", "SD Islam Terpadu Iqra 2"],
  ["sdit iqra 3", "SD Islam Terpadu Iqra 3"],
  ["smpit iqra", "SMP Islam Terpadu Iqra"],
  ["smait iqra", "SMA Islam Terpadu Iqra"],
  ["auladuna 1", "TK Islam Terpadu Auladuna 1"],
  ["tkit auladuna 1", "TK Islam Terpadu Auladuna 1"],
  ["auladuna 2", "TK Islam Terpadu Auladuna 2"],
  ["tkit auladuna 2", "TK Islam Terpadu Auladuna 2"],
  ["lksa", "LKSA Asrama Yatim Alfida"],
  ["lazis", "LAZIS Alfida"],
]);

export function resolveCanonicalUnitName(sourceLabel: string): string | null {
  return sourceToCanonicalUnitName.get(normalizeYmqName(sourceLabel)) || null;
}
