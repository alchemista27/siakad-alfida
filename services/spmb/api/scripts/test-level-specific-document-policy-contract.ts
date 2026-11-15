import { REQUIRED_DOCUMENT_TYPES_BY_LEVEL, requiredDocumentTypesForLevel } from "@alfida/contracts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function run() {
  assert(requiredDocumentTypesForLevel("smp") === REQUIRED_DOCUMENT_TYPES_BY_LEVEL.smp, "SMP document policy must reuse the shared map");
  assert(requiredDocumentTypesForLevel("sma").includes("school_certificate"), "SMA must require school certificate");
  assert(!requiredDocumentTypesForLevel("sd").includes("school_certificate"), "SD must not require school certificate");
  console.log("SPMB level-specific document policy contract passed");
}

run();
