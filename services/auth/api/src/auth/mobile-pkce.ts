import { createHash } from "crypto";

export function isValidPkceVerifier(value: string): boolean {
  return /^[A-Za-z0-9\-._~]{43,128}$/.test(value);
}

export function pkceChallengeForVerifier(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}
