import { BadRequestException } from "@nestjs/common";
import {
  allowedTransitions,
  assertTransition,
  registrationStatuses,
} from "../src/common/spmb-workflow";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

for (const status of registrationStatuses) {
  assert(Array.isArray(allowedTransitions[status]), `missing transitions for ${status}`);
}

for (const [from, allowed] of Object.entries(allowedTransitions)) {
  for (const to of allowed) assertTransition(from as never, to);
}

for (const [from, to] of [
  ["pending_payment", "accepted"],
  ["documents_uploaded", "observation_scheduled"],
  ["medical_pending", "verification"],
  ["accepted", "rejected"],
] as const) {
  try {
    assertTransition(from as never, to as never);
    throw new Error(`expected invalid transition ${from} → ${to}`);
  } catch (error) {
    assert(error instanceof BadRequestException, `expected BadRequest for ${from} → ${to}`);
  }
}

console.log("SPMB registration workflow contract passed");
