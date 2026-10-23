import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

async function main() {
  const [controller, service] = await Promise.all([
    readFile(resolve(process.cwd(), "src/auth/auth.controller.ts"), "utf8"),
    readFile(resolve(process.cwd(), "src/auth/auth.service.ts"), "utf8"),
  ]);
  assert.match(controller, /@Get\("mobile\/authorize"\)[\s\S]*?@UseGuards\(ServiceJwtAuthGuard\)/, "Mobile authorization must require an existing central session");
  assert.match(controller, /redirectUri !== "simpeg-absensi:\/\/auth"/, "Only the registered mobile redirect URI is allowed");
  assert.match(controller, /@Post\("mobile\/token"\)/, "Mobile token exchange endpoint is required");
  assert.match(service, /pkceChallengeForVerifier\(verifier\) !== expectedChallenge/, "Token exchange must validate PKCE challenge");
  assert.match(service, /usedMobileAuthorizationCodes/, "Authorization codes must be one-time use per running Auth instance");
  console.log("Auth mobile authorization contract passed");
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
