const confirmedAliases = new Map<string, string>([
  ["abdul ramad", "abdul rahmat"],
  ["anugrah sadiqin", "anugrah sadikin"],
]);

export function normalizeYmqName(value: string): string {
  const normalized = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("id-ID")
    .replace(/[’'`]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
  return confirmedAliases.get(normalized) || normalized;
}
