import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const ssoServer = readFileSync(resolve(root, "src/lib/sso-server.ts"), "utf8");
const topbar = readFileSync(resolve(root, "src/components/SpmbTopbar.tsx"), "utf8");

assert.match(ssoServer, /avatarUrl\?: string \| null/, "SPMB SSO identity must carry the canonical Auth avatar URL");
assert.match(topbar, /user\?\.avatarUrl/, "SPMB topbar must render the signed-in avatar URL");
assert.match(topbar, /onError=\{\(\) => setAvatarFailed\(true\)\}/, "SPMB avatar must fall back to initials when the image cannot load");
assert.match(topbar, /Foto profil/, "SPMB avatar must have meaningful alternative text");

console.log("SPMB SSO avatar topbar contract passed");
