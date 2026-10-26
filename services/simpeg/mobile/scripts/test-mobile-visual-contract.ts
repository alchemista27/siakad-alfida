import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";

async function main() {
  const [app, pkg] = await Promise.all([
    readFile(resolve(process.cwd(), "App.tsx"), "utf8"),
    readFile(resolve(process.cwd(), "package.json"), "utf8"),
  ]);
  assert.ok(JSON.parse(pkg).dependencies["expo-font"], "App must explicitly declare expo-font");
  const tokens = await import("../src/theme/tokens");
  assert.deepEqual(tokens.colors, {
    primary: "#454545", tertiary: "#0f7f6d", neutral: "#F7F8F8",
    surface: "#FFFFFF", border: "#E3E8E7", onTertiary: "#F7F8F8",
  });
  assert.deepEqual(tokens.space, { sm: 8, md: 16, lg: 24 });
  assert.deepEqual(tokens.radius, { sm: 4, md: 8 });

  assert.match(app, /useFonts\(/);
  assert.match(app, /fontFamily: "Lora"/);
  assert.match(app, /fontFamily: "Inter"/);
  assert.match(app, /accessibilityRole="alert"/);
  assert.doesNotMatch(app, /\bAlert\.alert\(|\bconsole\.(?:log|error)\(|shadow(?:Color|Opacity|Radius)/);
  for (const name of ["Lora.ttf", "Inter.ttf"]) {
    assert.ok((await stat(resolve(process.cwd(), "assets/fonts", name))).size > 10000, `Missing licensed font: ${name}`);
  }
  console.log("mobile visual contract passed");
}
main().catch(error => { console.error(error); process.exitCode = 1; });
