import { RegistrationsController } from "../src/registrations/registrations.controller";
import { RegistrationsService } from "../src/registrations/registrations.service";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function run() {
  const queries: Array<Record<string, unknown>> = [];
  const registration = { id: "registration-owned", parentId: "parent-1" };
  const service = new RegistrationsService({
    registration: {
      findMany: async (args: Record<string, unknown>) => {
        queries.push(args);
        return [registration];
      },
    },
  } as any);

  const result = await (service as any).listForParent("parent-1");
  assert(result[0] === registration, "parent list must return the owner's registrations");
  assert(queries.length === 1, "parent list must execute exactly one query");
  assert(
    JSON.stringify(queries[0]).includes('"parentId":"parent-1"'),
    "parent list must scope its query to the authenticated parent",
  );

  const received: string[] = [];
  const controller = new RegistrationsController({
    listForParent: async (parentId: string) => {
      received.push(parentId);
      return [];
    },
  } as any);
  await (controller as any).listForParent({ user: { id: "parent-1" } });
  assert(JSON.stringify(received) === JSON.stringify(["parent-1"]), "parent list route must use the authenticated parent ID");

  for (const [label, registration] of [
    ["foreign registration", { id: "registration-foreign", parentId: "parent-2" }],
    ["unclaimed registration", { id: "registration-unclaimed", parentId: null }],
  ] as const) {
    const detailQueries: Array<Record<string, unknown>> = [];
    const inaccessibleService = new RegistrationsService({
      registration: {
        findFirst: async (args: Record<string, unknown>) => {
          detailQueries.push(args);
          return null;
        },
      },
    } as any);

    try {
      await (inaccessibleService as any).getForParent(registration.id, "parent-1");
      throw new Error(`${label} was disclosed to another parent`);
    } catch (error: any) {
      assert(error?.constructor?.name === "NotFoundException", `${label} must return NotFoundException`);
    }
    assert(detailQueries.length === 1, `${label} must use one owner-scoped query`);
    assert(
      JSON.stringify(detailQueries[0]).includes('"parentId":"parent-1"'),
      `${label} lookup must scope the registration to the authenticated parent`,
    );
  }

  const detailReceived: Array<[string, string]> = [];
  const detailController = new RegistrationsController({
    getForParent: async (registrationId: string, parentId: string) => {
      detailReceived.push([registrationId, parentId]);
      return { id: registrationId };
    },
  } as any);
  await (detailController as any).getForParent("registration-owned", { user: { id: "parent-1" } });
  assert(
    JSON.stringify(detailReceived) === JSON.stringify([["registration-owned", "parent-1"]]),
    "parent detail route must use the authenticated parent ID",
  );

  const sanitizedService = new RegistrationsService({
    registration: {
      findFirst: async () => ({
        id: "registration-owned",
        parentId: "parent-1",
        status: "observation_done",
        dossierReviewStatus: "approved",
        rejectionReason: null,
        handoffStatus: "failed",
        handoffError: "internal secret mismatch",
        observationResult: { id: "obs-1", score: 88.5, rank: 2, notes: "staff private note" },
        documents: [{ id: "doc-1", type: "photo", fileName: "foto.jpg", mimeType: "image/jpeg", fileSize: 1024, objectKey: "spmb/secret" }],
        events: [{ id: "ev-1", toStatus: "observation_done", kind: "transition", note: "Observasi selesai", createdAt: new Date() }],
      }),
      findMany: async () => [{
        id: "registration-owned",
        parentId: "parent-1",
        status: "observation_done",
        handoffError: "internal secret mismatch",
        observationResult: { score: 88.5, rank: 2, notes: "staff private note" },
      }],
    },
  } as any);

  const parentDetail = await (sanitizedService as any).getForParent("registration-owned", "parent-1");
  assert(!("handoffError" in parentDetail), "parent detail must not expose handoffError");
  assert(!parentDetail.observationResult || (!("score" in parentDetail.observationResult) && !("rank" in parentDetail.observationResult)), "parent detail must not expose staff score or rank");
  assert(!JSON.stringify(parentDetail.documents || []).includes("spmb/secret"), "parent detail must not expose raw storage objectKey");

  const activeDelegated = await (sanitizedService as any).getActiveRegistrationForParent("parent-1");
  assert(activeDelegated.id === "registration-owned", "active parent lookup must return the active owned registration");
  assert(!("handoffError" in activeDelegated), "active parent lookup must use the same purpose-limited projection");

  console.log("SPMB parent registration access contract passed");
}

run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
