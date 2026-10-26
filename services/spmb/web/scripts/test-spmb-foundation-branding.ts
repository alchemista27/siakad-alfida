import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  normalizeFoundationBranding,
  resolveAdminFoundationBaseUrl,
} from "../src/lib/foundation-settings";

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
assert.equal(
  resolveAdminFoundationBaseUrl({
    INTERNAL_ADMIN_API_URL: "http://admin-internal:3000/",
    ADMIN_PUBLIC_API_URL: "https://admin.example.test",
    FOUNDATION_API_URL: "https://foundation.example.test",
    NEXT_PUBLIC_ADMIN_URL: "https://legacy.example.test",
  }),
  "http://admin-internal:3000",
  "server-side branding must prefer a verified internal Admin URL",
);
assert.equal(
  resolveAdminFoundationBaseUrl({
    FOUNDATION_API_URL: "https://foundation.example.test/",
    NEXT_PUBLIC_ADMIN_URL: "https://legacy.example.test",
  }),
  "https://foundation.example.test",
  "existing FOUNDATION_API_URL must remain a supported runtime fallback",
);
assert.deepEqual(
  normalizeFoundationBranding({
    data: {
      foundationName: "Yayasan Contoh",
      logoUrl: "https://res.cloudinary.com/example/image/upload/v1/foundation/logo.png",
      faviconUrl: "https://res.cloudinary.com/example/image/upload/v1/foundation/favicon.png",
    },
  }),
  {
    foundationName: "Yayasan Contoh",
    logoUrl: "https://res.cloudinary.com/example/image/upload/v1/foundation/logo.png",
    faviconUrl: "https://res.cloudinary.com/example/image/upload/v1/foundation/favicon.png",
  },
  "branding resolver must accept a compatible deployment envelope",
);
assert.equal(normalizeFoundationBranding({ logoUrl: 42 }), null, "malformed branding payload must not render a broken asset");
assert.match(helper, /\/api\/public\/foundation-settings/);
assert.match(helper, /cache:\s*["']no-store["']/);
assert.match(helper, /connection\s*\(\s*\)/);
assert.match(helper, /AbortSignal\.timeout/);

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
assert.match(brand, /isTopbar\s*\?\s*"h-9 w-9 border-border bg-white text-tertiary"/);
assert.match(brand, /"text-tertiary text-\[22px\]"/);
assert.match(brand, /bg-surface/);
assert.doesNotMatch(brand, /isTopbar[\s\S]*?bg-tertiary/);
assert.match(brand, /onError/);
assert.match(brand, /foundationName/);

const env = read(".env.example");
assert.match(env, /^ADMIN_PUBLIC_API_URL=/m);
assert.match(env, /^INTERNAL_ADMIN_API_URL=/m);
assert.match(env, /^AUTH_PUBLIC_API_URL=/m);
assert.match(env, /^INTERNAL_AUTH_API_URL=/m);

console.log("SPMB foundation branding contract passed");
