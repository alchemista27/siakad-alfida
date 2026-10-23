import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { isValidPkceVerifier, pkceChallengeForVerifier } from "../src/auth/mobile-pkce";

async function main() {
  const verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
  const expected = createHash("sha256").update(verifier).digest("base64url");
  assert.equal(pkceChallengeForVerifier(verifier), expected);
  assert.equal(isValidPkceVerifier(verifier), true);
  assert.equal(isValidPkceVerifier("too-short"), false);
  assert.equal(isValidPkceVerifier("x".repeat(129)), false);
  assert.equal(isValidPkceVerifier("x".repeat(42) + "!"), false);
  console.log("Auth mobile PKCE helper contract passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
