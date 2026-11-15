import { readFile } from "node:fs/promises";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function run() {
  const createPanel = await readFile(new URL("../src/components/admin/period-management-panel.tsx", import.meta.url), "utf8");
  const editModal = await readFile(new URL("../src/components/admin/period-edit-modal.tsx", import.meta.url), "utf8");
  const selectUnit = await readFile(new URL("../src/app/parent/select-unit/page.tsx", import.meta.url), "utf8");

  for (const level of ["tk", "sd", "smp", "sma"]) {
    assert(createPanel.includes(`value=\"${level}\"`), `period creation must offer ${level}`);
    assert(editModal.includes(`value=\"${level}\"`), `period edit must offer ${level}`);
  }
  assert(createPanel.includes("Kelompok TK"), "period creation must render a TK-group label");
  assert(editModal.includes("Kelompok TK"), "period edit must render a TK-group label");
  assert(/educationLevel\s*===\s*["']tk["']/.test(createPanel), "period creation must conditionally show TK group");
  assert(/educationLevel\s*===\s*["']tk["']/.test(editModal), "period edit must conditionally show TK group");
  assert(selectUnit.includes("educationLevel"), "public unit selection must receive the configured education level");
  assert(!/unitName\.(includes|toLowerCase)/.test(selectUnit), "unit selection must not infer level from a unit name");

  console.log("SPMB adaptive period-management UI contract passed");
}

void run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
