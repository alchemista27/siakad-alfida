const confirmedAliases = new Map<string, string>([
  ["abdul ramad", "abdul rahmat"],
  ["anugrah sadiqin", "anugrah sadikin"],
]);

const trailingCredentialTokens = new Set([
  "s", "pd", "sos", "m", "gr", "si", "kom", "ag", "psi", "hum", "farm", "kep", "km", "th", "d", "dr", "drs", "dra", "prof", "ir", "h",
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
  const tokens = normalized.split(" ").filter(Boolean);
  while (tokens.length > 1 && trailingCredentialTokens.has(tokens.at(-1)!)) tokens.pop();
  const normalizedName = tokens.join(" ");
  return confirmedAliases.get(normalizedName) || normalizedName;
}
