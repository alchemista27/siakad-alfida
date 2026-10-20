import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const root = resolve(import.meta.dirname, "..");
const read = (file: string) => readFileSync(resolve(root, file), "utf8");

const controller = read("src/registrations/registrations.controller.ts");
const dto = read("src/registrations/registrations.dto.ts");
const service = read("src/registrations/registrations.service.ts");
const appModule = read("src/app.module.ts");
const invites = read("src/invites/invites.service.ts");

assert(!controller.includes("CreateOfflineRegistrationDto"), "registrations controller must not import the offline creation DTO");
assert(!controller.includes('@Post("offline")'), "POST /registrations/offline must not exist");
assert(!controller.includes("createOffline("), "registrations controller must not expose offline registration creation");
assert(!dto.includes("class CreateOfflineRegistrationDto"), "offline registration creation DTO must be removed");
assert(!service.includes("async createOffline("), "registration service must not create offline registrations");
assert(!appModule.includes("ImportsModule"), "app module must not register CSV imports");
assert(!existsSync(resolve(root, "src/imports")), "CSV import module must be removed");

assert(service.includes("async createOnline("), "parent-owned online registration creation must remain available");
assert(service.includes("const parentId = parent.id;"), "online registration must derive ownership from the authenticated parent");
assert(/data:\s*\{[\s\S]*?parentId,/.test(service), "online registration must persist the authenticated parentId");
assert(invites.includes("async claimInvite("), "legacy parent-account claim flow must remain for existing registrations");
assert(invites.includes("parentId: null"), "legacy claim must only target unclaimed registrations");
assert(invites.includes("parentId: principal.id"), "legacy claim must attach the existing registration to the parent account");

console.log("SPMB parent-account-only registration contract passed");
