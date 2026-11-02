import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const app = readFileSync(resolve(__dirname, "../App.tsx"), "utf8");

assert.match(app, /KeyboardAvoidingView/);
assert.match(app, /keyboardShouldPersistTaps="handled"/);
assert.match(app, /keyboardDismissMode="on-drag"/);
assert.match(app, /softwareKeyboardLayoutMode/);
assert.match(app, /returnKeyType="next"/);
assert.match(app, /passwordInputRef\.current\?\.focus\(\)/);
assert.match(app, /returnKeyType="go"/);
assert.match(app, /accessibilityLabel="Tampilkan password"/);
assert.match(app, /accessibilityLabel="Sembunyikan password"/);
assert.match(app, /<FoundationLogo branding=\{branding\}/);
assert.doesNotMatch(app, /Masuk melalui Auth Alfida untuk melihat absensi/);
console.log("native login layout contract passed");
