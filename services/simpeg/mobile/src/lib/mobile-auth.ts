import * as SecureStore from "expo-secure-store";
import { isAccessTokenExpired } from "./session-policy";

const AUTH_URL = "https://auth.alfida.or.id";
const ACCESS_TOKEN_KEY = "simpeg-mobile-access-token";

type MobileUser = { id: string; fullName: string; email: string };
type LoginResponse = { token?: string; user?: MobileUser; message?: string };

export async function loginWithAuthCredentials(emailOrUsername: string, password: string): Promise<{ token: string; user: MobileUser }> {
  const identifier = emailOrUsername.trim();
  if (!identifier || !password) throw new Error("Email atau username dan password wajib diisi.");

  const response = await fetch(`${AUTH_URL}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: identifier, password }),
  });
  const body = await response.json().catch(() => null) as LoginResponse | null;
  if (!response.ok || !body?.token || !body.user?.id || !body.user.fullName || !body.user.email || isAccessTokenExpired(body.token)) {
    throw new Error(body?.message || "Email, username, atau password tidak sesuai.");
  }

  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, body.token);
  return { token: body.token, user: body.user };
}

export async function getMobileAccessToken() {
  const stored = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  if (stored && isAccessTokenExpired(stored)) {
    await clearMobileAccessToken();
    return null;
  }
  return stored;
}

export function clearMobileAccessToken() {
  return SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
}
