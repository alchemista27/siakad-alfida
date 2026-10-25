import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

async function main() {
  const root = resolve(import.meta.dirname, "..");
  const source = async (relativePath: string) => {
    try {
      return await readFile(resolve(root, relativePath), "utf8");
    } catch {
      assert.fail(`required branding file missing: ${relativePath}`);
    }
  };

  const helper = await source("src/lib/foundation-settings.ts");
  assert.match(helper, /ADMIN_PUBLIC_API_URL\s*\|\|\s*process\.env\.INTERNAL_ADMIN_API_URL/);
  assert.match(helper, /\/api\/public\/foundation-settings/);
  assert.match(helper, /cache:\s*["']no-store["']/);
  assert.match(helper, /connection\s*\(\s*\)/, "branding helper must force request-time rendering");
  assert.match(helper, /content-type/);
  assert.match(helper, /catch/);

  const [login, registerParent, registerStaff, publicLayout, parentForm, staffForm] = await Promise.all([
    source("src/app/login/page.tsx"),
    source("src/app/register/page.tsx"),
    source("src/app/register-staff/page.tsx"),
    source("src/components/public-auth-layout.tsx"),
    source("src/components/register-parent-form.tsx"),
    source("src/components/register-staff-form.tsx"),
  ]);
  assert.match(login, /FoundationBrand/);
  assert.doesNotMatch(login, /<span[^>]*>\s*hub\s*<\/span>/s);

  for (const [route, label] of [
    [login, "login"],
    [registerParent, "parent register"],
    [registerStaff, "staff register"],
  ] as const) {
    assert.match(route, /getFoundationBranding/, `${label} route must load Admin branding on the server`);
    assert.match(route, /PublicAuthLayout/, `${label} route must use the shared public-auth shell`);
  }

  assert.match(publicLayout, /FoundationBrand/, "shared shell must render the branding component");
  assert.match(publicLayout, /fallbackIcon/, "shared shell must preserve a contextual fallback icon");
  assert.match(publicLayout, /subtitle/, "shared shell must preserve registration-specific context");
  assert.match(parentForm, /^"use client";/, "parent registration interaction must stay client-side");
  assert.match(parentForm, /\/api\/auth\/register/, "parent registration endpoint must be preserved");
  assert.match(staffForm, /^"use client";/, "staff registration interaction must stay client-side");
  assert.match(staffForm, /\/api\/auth\/register-staff/, "staff registration endpoint must be preserved");

  const brand = await source("src/components/foundation-brand.tsx");
  assert.match(brand, /logoUrl/);
  assert.match(brand, /foundationName/);
  assert.match(brand, /onError=\{\(\)\s*=>\s*setImageFailed\(true\)\}/);
  assert.match(brand, /fallbackIcon/);
  assert.match(brand, /bg-white/);
  assert.doesNotMatch(brand, /bg-white\/15/);
  assert.match(brand, /rounded-md/);
  assert.doesNotMatch(brand, /rounded-2xl|shadow-/);
  assert.match(brand, /text-tertiary/);

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
