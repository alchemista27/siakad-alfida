import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(import.meta.dirname, "../src/attendance/attendance.controller.ts"), "utf8");

assert.match(source, /getHolidays\(@Query\("unitId"\) unitId: string \| undefined, @Req\(\) req: any\)[\s\S]*getHolidays\(unitId, req\.user\)/, "holiday reads must pass the authenticated principal to scoped service authorization");
assert.match(source, /const strictValidation = new ValidationPipe\(\{ whitelist: true, forbidNonWhitelisted: true \}\)/, "holiday and duty writes must configure strict DTO validation");
assert.match(source, /upsertHoliday\(@Body\(strictValidation\) dto: UpsertHolidayDto, @Req\(\) req: any\)[\s\S]*upsertHoliday\(dto, req\.user\)/, "holiday writes must use strict DTO validation and principal-aware authorization");
assert.match(source, /deleteHoliday\(id, req\.user\)/, "holiday deletes must pass the authenticated principal");
assert.match(source, /@Get\("saturday-duties"\)/, "Saturday-duty collection route must exist");
assert.match(source, /@Post\("saturday-duties"\)/, "Saturday-duty write route must exist");
assert.match(source, /@Delete\("saturday-duties\/:id"\)/, "Saturday-duty delete route must exist");
assert.doesNotMatch(source, /@SimpegRoles\("super_admin", "admin_kepegawaian", "admin_bidang"\)[\s\S]*upsertHoliday/, "admin_bidang must not retain holiday write permission");

console.log("holiday and duty routing contract passed");
