import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

async function main() {
  const root = resolve(import.meta.dirname, "..");
  const source = async (relativePath: string) => readFile(resolve(root, relativePath), "utf8");

  const helper = await source("src/lib/foundation-settings.ts");
  assert.match(helper, /ADMIN_PUBLIC_API_URL\s*\|\|\s*process\.env\.INTERNAL_ADMIN_API_URL/);
  assert.match(helper, /\/api\/public\/foundation-settings/);
  assert.match(helper, /cache:\s*["']no-store["']/);
  assert.match(helper, /content-type/);
  assert.match(helper, /catch/);

  const login = await source("src/app/login/page.tsx");
  assert.match(login, /FoundationBrand/);
  assert.doesNotMatch(login, /<span[^>]*>\s*hub\s*<\/span>/s);

  const brand = await source("src/components/foundation-brand.tsx");
  assert.match(brand, /logoUrl/);
  assert.match(brand, /foundationName/);
  assert.match(brand, /onError=\{\(\)\s*=>\s*setImageFailed\(true\)\}/);
  assert.match(brand, />hub</);

  const layout = await source("src/app/layout.tsx");
  assert.doesNotMatch(layout, /s3\.alfida\.or\.id/);
  assert.match(layout, /getFoundationBranding/);
  assert.match(layout, /faviconUrl\s*\|\|\s*branding\.logoUrl/);

  const envExample = await source(".env.example");
  assert.match(envExample, /^ADMIN_PUBLIC_API_URL=/m);
  assert.match(envExample, /^INTERNAL_ADMIN_API_URL=/m);

  console.log("Auth foundation branding contract passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
