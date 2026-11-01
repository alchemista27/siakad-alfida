import type { PlannedAuthAccount } from "./account-plan";
import type { AuthRosterDirectoryUser } from "./auth-roster-broker";

const ROSTER_VERSION = "ymq-2026-2027";
const REQUEST_BATCH_SIZE = 5;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type ClientOptions = {
  baseUrl?: string;
  serviceSecret?: string;
  fetchImplementation?: typeof fetch;
};

type SimpegRosterAccount = {
  id: string;
  fullName: string;
  email: string;
  isActive: boolean;
  sourceUpdatedAt: string;
  unitIds: string[];
};

export class SimpegYmqRosterProjectionClient {
  private readonly baseUrl: string;
  private readonly serviceSecret: string;
  private readonly fetchImplementation: typeof fetch;

  constructor(options: ClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? process.env.SIMPEG_INTERNAL_API_URL?.trim() ?? "";
    this.serviceSecret = options.serviceSecret ?? process.env.INTERNAL_SERVICE_SECRET?.trim() ?? "";
    this.fetchImplementation = options.fetchImplementation ?? fetch;
    if (!this.baseUrl || !this.serviceSecret) {
      throw new Error("SIMPEG_INTERNAL_API_URL dan INTERNAL_SERVICE_SECRET wajib tersedia untuk proyeksi roster YMQ.");
    }
  }

  async sync(directory: AuthRosterDirectoryUser[], accounts: PlannedAuthAccount[]): Promise<{ users: number; assignments: number }> {
    const accountsByEmail = new Map(accounts.map((account) => [account.email.toLowerCase(), account]));
    const payloadAccounts = directory.map((entry) => toSimpegAccount(entry, accountsByEmail.get(entry.email.toLowerCase())));
    let users = 0;
    let assignments = 0;
    for (let offset = 0; offset < payloadAccounts.length; offset += REQUEST_BATCH_SIZE) {
      const batch = payloadAccounts.slice(offset, offset + REQUEST_BATCH_SIZE);
      const response = await this.fetchImplementation(new URL("/api/internal/ymq/roster-projections", this.baseUrl), {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "x-internal-service-key": this.serviceSecret,
        },
        body: JSON.stringify({ rosterVersion: ROSTER_VERSION, accounts: batch }),
        signal: AbortSignal.timeout(30_000),
      });
      const body = await response.json().catch(() => null) as unknown;
      if (!response.ok) throw new Error("SIMPEG menolak proyeksi roster YMQ.");
      let parsed: { users: number; assignments: number };
      try {
        parsed = parseResult(body);
      } catch {
        throw new Error("Respons proyeksi SIMPEG tidak valid.");
      }
      users += parsed.users;
      assignments += parsed.assignments;
    }
    return { users, assignments };
  }
}

function toSimpegAccount(entry: AuthRosterDirectoryUser, account: PlannedAuthAccount | undefined): SimpegRosterAccount {
  if (!account) throw new Error("Directory Auth tidak dapat dipetakan ke account plan untuk proyeksi SIMPEG.");
  if (!UUID.test(entry.id)) throw new Error("ID directory Auth untuk proyeksi SIMPEG tidak valid.");
  const unitIds = [...new Set(account.assignments
    .filter((assignment): assignment is Extract<typeof assignment, { app: "simpeg"; role: "pegawai" }> => assignment.app === "simpeg" && assignment.role === "pegawai")
    .map((assignment) => assignment.unitId))].sort();
  if (unitIds.length === 0) throw new Error("Akun roster YMQ harus memiliki unit pegawai SIMPEG.");
  return {
    id: entry.id,
    fullName: entry.fullName,
    email: entry.email,
    isActive: entry.isActive,
    sourceUpdatedAt: entry.sourceUpdatedAt,
    unitIds,
  };
}

function parseResult(value: unknown): { users: number; assignments: number } {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("invalid");
  const record = value as Record<string, unknown>;
  if (!Number.isInteger(record.users) || (record.users as number) < 0 || !Number.isInteger(record.assignments) || (record.assignments as number) < 0) throw new Error("invalid");
  return { users: record.users as number, assignments: record.assignments as number };
}
