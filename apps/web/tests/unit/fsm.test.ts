import { describe, it, expect } from "vitest";
import { PpdbFsm } from "@/lib/ppdb-fsm";
import { RegistrationStatus } from "@sim/shared";

describe("PPDB State Machine", () => {
  it("should allow transition from pending_payment to payment_uploaded", () => {
    expect(PpdbFsm.canTransition("pending_payment", "payment_uploaded")).toBe(true);
  });

  it("should block transition from pending_payment to payment_verified directly", () => {
    expect(PpdbFsm.canTransition("pending_payment", "payment_verified")).toBe(false);
  });

  it("should allow transition from payment_uploaded to pending_payment (rejection)", () => {
    expect(PpdbFsm.canTransition("payment_uploaded", "pending_payment")).toBe(true);
  });

  it("should allow transition from payment_uploaded to payment_verified (approval)", () => {
    expect(PpdbFsm.canTransition("payment_uploaded", "payment_verified")).toBe(true);
  });

  it("should not allow transition from accepted to pending_payment", () => {
    expect(PpdbFsm.canTransition("accepted", "pending_payment")).toBe(false);
  });
});
