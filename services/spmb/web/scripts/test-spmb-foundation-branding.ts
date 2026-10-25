import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const read = (file: string) => readFileSync(resolve(root, file), "utf8");

for (const file of [
  "src/lib/foundation-settings.ts",
  "src/components/foundation-branding-provider.tsx",
  "src/components/spmb-brand-mark.tsx",
  "src/app/layout.tsx",
  ".env.example",
]) {
  assert(existsSync(resolve(root, file)), `missing ${file}`);
}

const helper = read("src/lib/foundation-settings.ts");
assert.match(
  helper,
  /ADMIN_PUBLIC_API_URL\s*\|\|\s*process\.env\.INTERNAL_ADMIN_API_URL\s*\|\|\s*process\.env\.NEXT_PUBLIC_ADMIN_URL/,
);
assert.match(helper, /\/api\/public\/foundation-settings/);
assert.match(helper, /cache:\s*["']no-store["']/);
assert.match(helper, /connection\s*\(\s*\)/);

const layout = read("src/app/layout.tsx");
assert.match(layout, /getFoundationBranding/);
assert.match(layout, /faviconUrl\s*\|\|\s*branding\.logoUrl/);
assert.doesNotMatch(layout, /s3\.alfida\.or\.id/);

const navbar = read("src/components/SpmbNavbar.tsx");
const selector = read("src/components/spmb-entry-selector.tsx");
const brand = read("src/components/spmb-brand-mark.tsx");
assert.match(navbar, /SpmbBrandMark/);
assert.match(navbar, /surface=["']topbar["']/);
assert.doesNotMatch(navbar, /w-9 h-9 rounded-lg bg-\[#06bfa2\]/);
assert.match(selector, /SpmbBrandMark/);
assert.match(selector, /surface=["']content["']/);
assert.match(brand, /bg-tertiary/);
assert.match(brand, /bg-surface/);
assert.match(brand, /onError/);
assert.match(brand, /foundationName/);

const env = read(".env.example");
assert.match(env, /^ADMIN_PUBLIC_API_URL=/m);
assert.match(env, /^INTERNAL_ADMIN_API_URL=/m);
assert.match(env, /^AUTH_PUBLIC_API_URL=/m);
assert.match(env, /^INTERNAL_AUTH_API_URL=/m);

console.log("SPMB foundation branding contract passed");
