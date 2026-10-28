import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ChangeOwnPasswordSchema, UpdateOwnProfileSchema } from "../src/auth/dto/profile.dto";

const root = resolve(import.meta.dirname, "..");
const read = (relativePath: string) => {
  const target = resolve(root, relativePath);
  assert.ok(existsSync(target), `Expected ${relativePath} to exist`);
  return readFileSync(target, "utf8");
};

const validProfile = UpdateOwnProfileSchema.safeParse({
  fullName: "Pengguna Contoh",
  email: "PENGGUNA@example.test",
  phone: "081234567890",
  avatarUrl: "https://res.cloudinary.com/example/image/upload/auth/user/11111111-1111-1111-1111-111111111111/avatar/photo.png",
});
assert.equal(validProfile.success, true, "valid profile data must parse");

assert.equal(UpdateOwnProfileSchema.safeParse({ fullName: "A", email: "bad", phone: "1", avatarUrl: null }).success, false);
assert.equal(UpdateOwnProfileSchema.safeParse({
  fullName: "Pengguna Contoh",
  email: "pengguna@example.test",
  phone: "081234567890",
  avatarUrl: "https://attacker.example/avatar.png",
}).success, false, "non-Cloudinary avatar URL must be rejected before persistence");

assert.equal(ChangeOwnPasswordSchema.safeParse({
  currentPassword: "password-lama",
  newPassword: "password-baru",
  confirmPassword: "password-baru",
}).success, true);
assert.equal(ChangeOwnPasswordSchema.safeParse({
  currentPassword: "password-lama",
  newPassword: "password-baru",
  confirmPassword: "berbeda",
}).success, false, "new-password confirmation must match");

const serviceSource = read("src/auth/auth.service.ts");
const controllerSource = read("src/auth/auth.controller.ts");
const sdkTypes = read("../../../packages/auth-sdk/src/types.ts");
assert.match(serviceSource, /bcrypt\.compare\([^\n]*currentPassword/, "password replacement must verify the current password");
assert.match(serviceSource, /bcrypt\.hash\([^\n]*newPassword/, "new password must be hashed");
assert.match(serviceSource, /passwordHash: passwordHash/, "user password hash must be updated");
assert.match(serviceSource, /providerId: "credential"/, "credential account password must be updated too");
assert.match(serviceSource, /session\.deleteMany/, "password change must revoke active sessions");
assert.match(serviceSource, /isOwnedAvatarUrl/, "profile update must verify avatar ownership");
assert.match(controllerSource, /@Patch\("me"\)/, "profile endpoint must be authenticated current-user PATCH");
assert.match(controllerSource, /@Post\("me\/password"\)/, "password endpoint must be authenticated current-user POST");
const passwordHandler = controllerSource.slice(controllerSource.indexOf('@Post("me/password")'), controllerSource.indexOf('@Get("me")'));
assert.match(passwordHandler, /res\.clearCookie\(ALFIDA_SESSION_COOKIE/, "password replacement must clear the current browser session cookie");
assert.match(sdkTypes, /avatarUrl\?: string \| null/, "shared AuthUser contract must expose avatar URL");

console.log("Auth self-profile contract passed");
