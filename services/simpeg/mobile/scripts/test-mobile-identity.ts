import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { isAccessTokenExpired } from "../src/lib/session-policy";

const jwt = (exp: number) => `head.${Buffer.from(JSON.stringify({ exp })).toString("base64url")}.signature`;
assert.equal(isAccessTokenExpired(jwt(2_000), 2_000_000), true);
assert.equal(isAccessTokenExpired(jwt(2_001), 2_000_000), false);
assert.equal(isAccessTokenExpired("garbage", 2_000_000), true);
readFile(resolve(process.cwd(), "src/lib/mobile-auth.ts"), "utf8").then((authSource) => {
  assert.match(authSource, /loginWithAuthCredentials/);
  assert.match(authSource, /\$\{AUTH_URL\}\/api\/auth\/login/);
  assert.match(authSource, /isAccessTokenExpired\(stored\)/);
  assert.match(authSource, /clearMobileAccessToken\(\)/);
  assert.doesNotMatch(authSource, /openAuthSessionAsync|authorizationCodeFromCallback|code_verifier/);
  console.log("mobile identity passed");
}).catch((error) => { console.error(error); process.exitCode = 1; });
