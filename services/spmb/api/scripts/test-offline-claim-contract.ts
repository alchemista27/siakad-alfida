import { ConflictException } from "@nestjs/common";
import { InvitesController } from "../src/invites/invites.controller";
import { InvitesService } from "../src/invites/invites.service";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const principal = {
  id: "parent-1",
  email: "parent@example.test",
  fullName: "Parent One",
};

const claimableRegistration = {
  id: "registration-1",
  status: "pending_payment",
  parentId: null,
  claimedAt: null,
  inviteToken: "invite-token",
  inviteExpiresAt: new Date("2030-01-01T00:00:00.000Z"),
};

async function run() {
  const calls: Array<{ name: string; args: unknown }> = [];
  const service = new InvitesService({
    $transaction: async (callback: (tx: any) => Promise<unknown>) => callback({
      user: {
        upsert: async (args: unknown) => {
          calls.push({ name: "user.upsert", args });
          return principal;
        },
      },
      registration: {
        findUnique: async (args: unknown) => {
          calls.push({ name: "registration.findUnique", args });
          return claimableRegistration;
        },
        updateMany: async (args: unknown) => {
          calls.push({ name: "registration.updateMany", args });
          return { count: 1 };
        },
      },
      registrationEvent: {
        create: async (args: unknown) => {
          calls.push({ name: "registrationEvent.create", args });
          return { id: "event-1" };
        },
      },
    }),
  } as any);

  await (service as any).claimInvite("invite-token", principal);
  const upsert = calls.find((call) => call.name === "user.upsert");
  const claim = calls.find((call) => call.name === "registration.updateMany");
  const event = calls.find((call) => call.name === "registrationEvent.create");

  assert(upsert, "claim must upsert the local authenticated parent projection in the transaction");
  assert(JSON.stringify(upsert.args).includes('"id":"parent-1"'), "parent projection must use session identity");
  assert(claim, "claim must use a conditional updateMany instead of a read-then-update race");
  assert(JSON.stringify(claim.args).includes('"parentId":null'), "claim condition must require unclaimed parentId");
  assert(JSON.stringify(claim.args).includes('"claimedAt":null'), "claim condition must require null claimedAt");
  assert(JSON.stringify(claim.args).includes('"inviteToken":"invite-token"'), "claim condition must bind the invite token");
  assert(event && JSON.stringify(event.args).includes('"kind":"claim"'), "successful claim must emit one claim event");

  const rejectedService = new InvitesService({
    $transaction: async (callback: (tx: any) => Promise<unknown>) => callback({
      user: { upsert: async () => principal },
      registration: {
        findUnique: async () => claimableRegistration,
        updateMany: async () => ({ count: 0 }),
      },
      registrationEvent: { create: async () => { throw new Error("event must not be created for a losing claim"); } },
    }),
  } as any);

  try {
    await (rejectedService as any).claimInvite("invite-token", principal);
    throw new Error("a concurrent losing claim unexpectedly succeeded");
  } catch (error) {
    assert(error instanceof ConflictException, "losing claim must return ConflictException");
  }

  const received: unknown[] = [];
  const controller = new InvitesController({
    claimInvite: async (token: string, receivedPrincipal: unknown) => {
      received.push(token, receivedPrincipal);
      return { success: true };
    },
  } as any);
  await (controller as any).claim("invite-token", { user: principal });
  assert(received[0] === "invite-token" && received[1] === principal, "controller must pass the verified principal, not only a client-derived ID");

  console.log("SPMB offline claim contract passed");
}

run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
