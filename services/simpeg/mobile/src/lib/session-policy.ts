const REDIRECT_URI = "simpeg-absensi://auth";

export function authorizationCodeFromCallback(url: string, expectedState: string): string {
  let callback: URL;
  try { callback = new URL(url); } catch { throw new Error("Respons SSO mobile tidak valid."); }
  if (`${callback.protocol}//${callback.host}${callback.pathname}` !== REDIRECT_URI ||
      callback.searchParams.getAll("state").length !== 1 || callback.searchParams.get("state") !== expectedState) {
    throw new Error("Respons SSO mobile tidak valid.");
  }
  if (callback.searchParams.has("error")) throw new Error("Masuk ditolak atau dibatalkan oleh Auth.");
  if (callback.searchParams.getAll("code").length !== 1 || !callback.searchParams.get("code")) {
    throw new Error("Respons SSO mobile tidak valid.");
  }
  return callback.searchParams.get("code")!;
}

/** Expiry is a local UX hint; the API still validates the token signature. */
export function isAccessTokenExpired(token: string, now = Date.now()): boolean {
  try {
    const payload = token.split(".")[1];
    if (!payload || /[^A-Za-z0-9_-]/.test(payload)) return true;
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    let buffer = 0;
    let bits = 0;
    let json = "";
    for (const char of payload) {
      buffer = (buffer << 6) | alphabet.indexOf(char);
      bits += 6;
      if (bits >= 8) { bits -= 8; json += String.fromCharCode((buffer >> bits) & 255); }
    }
    const { exp } = JSON.parse(json) as { exp?: unknown };
    return typeof exp !== "number" || !Number.isFinite(exp) || exp * 1000 <= now;
  } catch { return true; }
}
