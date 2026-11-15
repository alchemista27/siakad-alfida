import { DocumentsService } from "../src/documents/documents.service";

const registrationId = "11111111-1111-4111-8111-111111111111";
const parentId = "22222222-2222-4222-8222-222222222222";
const basicDocumentTypes = ["photo", "birth_certificate", "family_card", "father_id", "mother_id"];

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function run() {
  const updates: Record<string, unknown>[] = [];
  const registration = {
    id: registrationId,
    parentId,
    status: "documents_uploaded",
    period: { educationLevel: "sd" },
  };
  const service = new DocumentsService({
    registration: {
      findUnique: async () => registration,
      update: async ({ data }: any) => {
        updates.push(data);
        return { ...registration, ...data };
      },
    },
    document: { findMany: async () => basicDocumentTypes.map((type) => ({ type })) },
    registrationEvent: { create: async () => ({}) },
    $transaction: async (items: any[]) => Promise.all(items),
  } as any);

  await service.finalizeDocuments(registrationId, parentId);
  if (updates.length !== 1 || updates[0].status !== "verification" || updates[0].dossierReviewStatus !== "pending" || updates[0].rejectionReason !== null) {
    throw new Error("finalizing complete basic documents must queue the dossier for admin verification before medical");
  }

  console.log("SPMB basic dossier queue contract passed");
}

void run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
