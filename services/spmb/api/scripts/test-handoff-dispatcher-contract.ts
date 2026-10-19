import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { HandoffProcessor } from "../src/handoff/handoff.processor";
import { HandoffService } from "../src/handoff/handoff.service";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

type OutboxItem = {
  id: string;
  registrationId: string;
  status: "pending" | "failed" | "processing";
  availableAt: Date;
  leasedAt: Date | null;
};

async function run() {
  const processorSource = await readFile(
    join(process.cwd(), "src/handoff/handoff.processor.ts"),
    "utf8",
  );
  const appModuleSource = await readFile(join(process.cwd(), "src/app.module.ts"), "utf8");
  const schemaSource = await readFile(join(process.cwd(), "prisma/schema.prisma"), "utf8");

  assert(
    appModuleSource.includes("ScheduleModule.forRoot()"),
    "root module must initialize the Nest scheduler once",
  );
  assert(
    processorSource.includes("@Interval("),
    "outbox dispatcher must be called automatically by a scheduled interval",
  );
  assert(schemaSource.includes("availableAt"), "outbox must persist retry due time");
  assert(schemaSource.includes("leasedAt"), "outbox must persist a cross-replica lease");
  assert(schemaSource.includes("leaseOwner"), "outbox must identify the worker holding a lease");

  const now = new Date("2026-10-18T10:00:00.000Z");
  const rows: OutboxItem[] = [
    {
      id: "pending-due",
      registrationId: "registration-pending",
      status: "pending",
      availableAt: new Date(now.getTime() - 1_000),
      leasedAt: null,
    },
    {
      id: "failed-due",
      registrationId: "registration-failed",
      status: "failed",
      availableAt: new Date(now.getTime() - 1_000),
      leasedAt: null,
    },
    {
      id: "leased-by-another-worker",
      registrationId: "registration-leased",
      status: "processing",
      availableAt: new Date(now.getTime() - 1_000),
      leasedAt: new Date(now.getTime() - 1_000),
    },
    {
      id: "failed-not-due",
      registrationId: "registration-not-due",
      status: "failed",
      availableAt: new Date(now.getTime() + 30_000),
      leasedAt: null,
    },
  ];

  let findManyQuery: unknown;
  const delivered: string[] = [];
  let releaseFirstDelivery: (() => void) | undefined;
  const firstDelivery = new Promise<void>((resolve) => {
    releaseFirstDelivery = resolve;
  });

  const prisma: any = {
    handoffOutbox: {
      findMany: async (query: unknown) => {
        findManyQuery = query;
        return rows.map((row) => ({ ...row }));
      },
      updateMany: async ({ where, data }: any) => {
        const row = rows.find((candidate) => candidate.id === where.id);
        if (!row || row.status === "processing" || row.availableAt > now) return { count: 0 };
        row.status = data.status;
        row.leasedAt = data.leasedAt;
        return { count: 1 };
      },
    },
  };

  const handoffService = {
    deliverOutbox: async (registrationId: string) => {
      delivered.push(registrationId);
      if (registrationId === "registration-pending") await firstDelivery;
      return { success: registrationId !== "registration-failed" };
    },
  };

  const processor = new HandoffProcessor(prisma, handoffService as any);
  (processor as any).now = () => new Date(now);
  (processor as any).workerId = "dispatcher-contract-test";

  const firstRun = processor.dispatchScheduledOutbox();
  await Promise.resolve();
  const overlappingRun = await processor.dispatchScheduledOutbox();
  assert(overlappingRun.skipped === 1, "overlapping scheduled runs must be skipped in-process");

  releaseFirstDelivery?.();
  const result = await firstRun;

  assert(result.processed === 2, "dispatcher must process pending and due failed rows");
  assert(result.succeeded === 1 && result.failed === 1, "dispatcher must report delivery outcomes");
  assert(result.skipped === 2, "dispatcher must skip active leases and retry rows that are not due");
  assert(
    delivered.join(",") === "registration-pending,registration-failed",
    "dispatcher must not deliver a row that it did not claim",
  );

  const queryText = JSON.stringify(findManyQuery);
  assert(queryText.includes("availableAt"), "dispatcher must only select rows whose retry time is due");
  assert(queryText.includes("leasedAt"), "dispatcher must account for active and expired leases");

  const service = new HandoffService({} as any);
  const firstRetry = (service as any).failedOutboxUpdate({ attempts: 0 }, "delivery failed");
  const secondRetry = (service as any).failedOutboxUpdate({ attempts: 1 }, "delivery failed");
  const firstDelay = firstRetry.availableAt.getTime() - Date.now();
  const secondDelay = secondRetry.availableAt.getTime() - Date.now();
  assert(firstRetry.attempts === 1, "a failed delivery must increment its attempt count");
  assert(firstDelay >= 29_000, "first retry must be delayed instead of hot-looped");
  assert(secondDelay > firstDelay, "retry delay must grow monotonically with attempts");

  console.log("SPMB handoff dispatcher contract passed");
}

run().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
