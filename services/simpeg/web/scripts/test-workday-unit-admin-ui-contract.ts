import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

async function main() {
  const source = await readFile(resolve(process.cwd(), "src/app/page.tsx"), "utf8");

  assert.match(source, /async function readManagementJson<T>\(url: string\)/, "management requests must preserve non-OK failures");
  assert.match(source, /readManagementJson<[^>]+>\("\/api\/attendance\/holidays"\)/, "holiday management must use the strict management reader");
  assert.match(source, /readManagementJson<[^>]+>\("\/api\/attendance\/saturday-duties"\)/, "Saturday duty management must use the strict management reader");
  assert.doesNotMatch(source, /fetch\("\/api\/attendance\/holidays"\)\.then\(\(r\) => \(r\.ok \? r\.json\(\) : \[\]\)\)/, "holiday 401/403 must not look empty");
  assert.doesNotMatch(source, /fetch\("\/api\/attendance\/saturday-duties"\)\.then\(\(r\) => \(r\.ok \? r\.json\(\) : \[\]\)\)/, "duty 401/403 must not look empty");

  console.log("SIMPEG workday management UI contract passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
