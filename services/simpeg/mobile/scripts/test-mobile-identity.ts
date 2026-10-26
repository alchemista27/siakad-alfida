import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { authorizationCodeFromCallback, isAccessTokenExpired } from "../src/lib/session-policy";

const redirect = "simpeg-absensi://auth";
assert.equal(authorizationCodeFromCallback(`${redirect}?code=ok%2F1&state=xyz`, "xyz"), "ok/1");
assert.throws(() => authorizationCodeFromCallback(`${redirect}?code=x&state=wrong`, "xyz"), /SSO.*valid/i);
assert.throws(() => authorizationCodeFromCallback(`${redirect}?error=access_denied&error_description=Nope&state=xyz`, "xyz"), /ditolak|dibatalkan/i);
assert.throws(() => authorizationCodeFromCallback(`https://evil.example/auth?code=x&state=xyz`, "xyz"), /SSO.*valid/i);
assert.throws(() => authorizationCodeFromCallback(`${redirect}?code=x&code=y&state=xyz`, "xyz"), /SSO.*valid/i);
const jwt = (exp: number) => `head.${Buffer.from(JSON.stringify({ exp })).toString("base64url")}.signature`;
assert.equal(isAccessTokenExpired(jwt(2_000), 2_000_000), true);
assert.equal(isAccessTokenExpired(jwt(2_001), 2_000_000), false);
assert.equal(isAccessTokenExpired("garbage", 2_000_000), true);
readFile(resolve(process.cwd(), "src/lib/mobile-auth.ts"), "utf8").then((authSource) => {
  assert.match(authSource, /authorizationCodeFromCallback\(result.url, state\)/);
  assert.match(authSource, /isAccessTokenExpired\(stored\)/);
  assert.match(authSource, /clearMobileAccessToken\(\)/);
  assert.doesNotMatch(authSource, /function query\(/, "Callback must use the strict URL parser");
  console.log("mobile identity passed");
}).catch((error) => { console.error(error); process.exitCode = 1; });
