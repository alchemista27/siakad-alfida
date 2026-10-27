import {
  canTransition,
  getParentNextAction,
  requiredDocumentTypes,
} from "../src/common/spmb-workflow";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

assert(canTransition("pending_payment", "payment_uploaded"), "payment proof must be allowed");
assert(canTransition("payment_uploaded", "payment_verified"), "admin payment approval must be allowed");
assert(canTransition("payment_verified", "form_filling"), "verified payment must unlock the form");
assert(canTransition("verification", "observation_scheduled"), "verified dossier must unlock scheduling");
assert(!canTransition("pending_payment", "accepted"), "cannot accept before observation");
assert(!canTransition("documents_uploaded", "accepted"), "cannot accept before observation");
assert(getParentNextAction("pending_payment") === "upload_payment", "wrong action for pending payment");
assert(getParentNextAction("payment_verified") === "complete_form", "wrong action for verified payment");
assert(getParentNextAction("documents_uploaded") === "upload_documents", "wrong action for documents stage");
assert(getParentNextAction("medical_pending") === "upload_medical_result", "wrong action for medical stage");
assert(getParentNextAction("medical_uploaded") === "wait_verification", "wrong action after medical upload");
assert(getParentNextAction("verification") === "wait_verification", "wrong action while staff verifies");
assert(requiredDocumentTypes.includes("birth_certificate"), "birth certificate must be mandatory");
assert(requiredDocumentTypes.includes("family_card"), "family card must be mandatory");
assert(requiredDocumentTypes.includes("photo"), "photo must be mandatory");

console.log("SPMB parent workflow contract passed");
