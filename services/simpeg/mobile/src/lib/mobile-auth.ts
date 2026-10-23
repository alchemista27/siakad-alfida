import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

const AUTH_URL = "https://auth.alfida.or.id";
const REDIRECT_URI = "simpeg-absensi://auth";
const ACCESS_TOKEN_KEY = "simpeg-mobile-access-token";
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";

function query(url: string, key: string): string | null {
  const match = url.match(new RegExp(`[?&]${key}=([^&]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

async function randomUrlSafe(length: number): Promise<string> {
  const bytes = await Crypto.getRandomBytesAsync(length);
  return Array.from(bytes, (value) => alphabet[value % alphabet.length]).join("");
}

async function codeChallengeFor(code_verifier: string): Promise<string> {
  const base64 = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, code_verifier, { encoding: Crypto.CryptoEncoding.BASE64 });
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export async function startMobileLogin(): Promise<{ token: string; user: { id: string; fullName: string; email: string } }> {
  const code_verifier = await randomUrlSafe(64);
  const state = await randomUrlSafe(32);
  const authorization = new URL(`${AUTH_URL}/api/auth/mobile/authorize`);
  authorization.searchParams.set("redirect_uri", REDIRECT_URI);
  authorization.searchParams.set("state", state);
  authorization.searchParams.set("code_challenge", await codeChallengeFor(code_verifier));

  const login = new URL(`${AUTH_URL}/login`);
  login.searchParams.set("return_to", authorization.toString());
  const result = await WebBrowser.openAuthSessionAsync(login.toString(), REDIRECT_URI);
  if (result.type !== "success") throw new Error("Masuk dibatalkan.");

  const code = query(result.url, "code");
  const returnedState = query(result.url, "state");
  if (!code || returnedState !== state) throw new Error("Respons SSO mobile tidak valid.");

  const response = await fetch(`${AUTH_URL}/api/auth/mobile/token`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ code, code_verifier }),
  });
  const body = await response.json().catch(() => null) as { token?: string; user?: { id: string; fullName: string; email: string }; message?: string } | null;
  if (!response.ok || !body?.token || !body.user) throw new Error(body?.message || "Tidak dapat menyelesaikan SSO mobile.");
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, body.token);
  return { token: body.token, user: body.user };
}

export function getMobileAccessToken() {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export function clearMobileAccessToken() {
  return SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
}
