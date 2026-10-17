import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const requiredFiles = [
  "src/app/layout.tsx",
  "src/app/page.tsx",
  "src/app/globals.css",
  "src/components/service-placeholder.tsx",
  "src/lib/api.ts",
];

for (const file of requiredFiles) {
  if (!existsSync(resolve(root, file))) {
    throw new Error(`missing SIAKAD web shell file: ${file}`);
  }
}

const layout = readFileSync(resolve(root, "src/app/layout.tsx"), "utf8");
const page = readFileSync(resolve(root, "src/app/page.tsx"), "utf8");
const api = readFileSync(resolve(root, "src/lib/api.ts"), "utf8");

if (!layout.includes("SIAKAD")) throw new Error("layout must declare SIAKAD metadata");
if (!page.includes("ServicePlaceholder")) throw new Error("landing page must render the shared service placeholder");
if (!api.includes('"/api"')) throw new Error("web API helper must use the local rewrite path");

console.log("SIAKAD web shell contract passed");
