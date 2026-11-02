import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const app = JSON.parse(readFileSync(resolve(root, "app.json"), "utf8"));
const eas = JSON.parse(readFileSync(resolve(root, "eas.json"), "utf8"));
const expo = app.expo;

assert.equal(expo.icon, "./assets/icon.png", "app icon must use the Alfida artwork");
assert.equal(expo.splash?.image, "./assets/splash-icon.png", "splash screen must use the Alfida artwork");
assert.equal(expo.splash?.backgroundColor, "#FFFFFF", "splash background must be white");
assert.equal(expo.android?.adaptiveIcon?.backgroundColor, "#FFFFFF", "Android adaptive icon background must be white");
assert.equal(expo.android?.adaptiveIcon?.foregroundImage, "./assets/android-icon-foreground.png", "Android foreground icon must use the Alfida artwork");
assert.equal(expo.android?.adaptiveIcon?.backgroundImage, "./assets/android-icon-background.png", "Android background image must be present");
assert.equal(eas.build?.preview?.android?.buildType, "apk", "preview EAS profile must produce an installable APK");
for (const asset of ["icon.png", "splash-icon.png", "android-icon-foreground.png", "favicon.png"]) {
  assert(existsSync(resolve(root, "assets", asset)), `missing generated branding asset: ${asset}`);
}
console.log("SIMPEG mobile branding asset contract passed");
