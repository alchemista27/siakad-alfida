import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function read(relative: string) {
  return readFileSync(resolve(process.cwd(), relative), "utf8");
}

const schema = read("prisma/schema.prisma");
const dto = read("src/units/units.dto.ts");
const service = read("src/units/units.service.ts");
const controller = read("src/units/units.controller.ts");
const moduleSource = read("src/units/units.module.ts");

assert.match(schema, /logoUrl\s+String\?\s+@map\("logo_url"\)\s+@db\.Text/, "Unit must persist logo_url");
assert.match(schema, /principalName\s+String\?\s+@map\("principal_name"\)\s+@db\.VarChar\(200\)/, "Unit must persist principal_name");
assert.match(schema, /phone\s+String\?\s+@db\.VarChar\(30\)/, "Unit must persist an optional phone");
assert.match(schema, /email\s+String\?\s+@db\.VarChar\(255\)/, "Unit must persist an optional email");
assert.match(dto, /export class UpdateUnitLetterheadDto/, "letterhead DTO is required");
assert.match(dto, /address\?: string \| null/, "letterhead DTO must accept an optional address");
assert.match(dto, /phone\?: string \| null/, "letterhead DTO must accept an optional phone");
assert.match(dto, /email\?: string \| null/, "letterhead DTO must accept an optional email");
assert.match(dto, /@IsEmail\(\)/, "unit email must be validated by class-validator");
assert.match(dto, /logoUrl\?/, "letterhead DTO must accept logoUrl");
assert.match(dto, /principalName\?/, "letterhead DTO must accept principalName");
assert.doesNotMatch(dto, /principalSignatureUrl/, "letterhead DTO must not accept signature uploads");
assert.match(service, /async updateLetterheadProfile\(/, "scoped letterhead update service is required");
assert.match(service, /canManageUnit\(principal\.roles, unitId\)/, "letterhead update must enforce unit scope");
assert.match(service, /unit\.category !== "pendidikan"/, "non-education units must not issue school letterheads");
assert.match(service, /assertUnitLetterheadCloudinaryUrl/, "letterhead assets must be validated server-side");
assert.match(service, /\{ address \}/, "profile update must persist address when supplied");
assert.match(service, /\{ phone \}/, "profile update must persist phone when supplied");
assert.match(service, /\{ email \}/, "profile update must persist email when supplied");
assert.match(service, /async getLetterheadForInternal\(/, "minimal internal letterhead projection is required");
assert.match(service, /address: unit\.address/, "internal letterhead must project the address");
assert.match(service, /phone: unit\.phone/, "internal letterhead must project the phone");
assert.match(service, /email: unit\.email/, "internal letterhead must project the email");
assert.doesNotMatch(service, /principalSignatureUrl/, "service must not read or write legacy signature URLs");
assert.match(controller, /@Patch\(":id\/letterhead-profile"\)/, "scoped letterhead endpoint is required");
assert.match(controller, /@SimpegRoles\("super_admin", "admin_kepegawaian", "admin_unit"\)/, "letterhead endpoint must admit scoped education admins");
assert.match(moduleSource, /InternalUnitLetterheadController/, "internal letterhead controller must be registered");
assert.match(moduleSource, /InternalServiceAuthGuard/, "internal endpoint must use shared-secret guard");

console.log("SIMPEG unit letterhead profile contract passed");
