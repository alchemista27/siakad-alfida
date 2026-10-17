import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const root = resolve(__dirname, "..");
const statusPage = readFileSync(resolve(root, "src/app/status/page.tsx"), "utf8");
const middleware = readFileSync(resolve(root, "src/middleware.ts"), "utf8");
const navbar = readFileSync(resolve(root, "src/components/SpmbNavbar.tsx"), "utf8");

assert(!statusPage.includes("registrations/track"), "/status must not call the registration-number tracking API");
assert(statusPage.includes('redirect("/parent")'), "/status must route users to the authenticated parent portal");
assert(middleware.includes('"/status"'), "middleware must authenticate /status before it can render");
assert(navbar.includes('href="/parent"'), "the navbar must expose the parent portal as the status destination");

console.log("SPMB status access contract passed");
