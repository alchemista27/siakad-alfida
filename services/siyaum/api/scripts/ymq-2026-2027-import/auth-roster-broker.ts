export type AuthRosterAssignment =
  | { app: "simpeg"; role: "pegawai"; unitId: string }
  | { app: "simpeg"; role: "pimpinan"; unitId: null }
  | { app: "siyaum"; role: "peserta" | "pembina_ymq" | "admin_ymq"; unitId: null };

export type AuthRosterAccount = {
  sourceKey: string;
  fullName: string;
  email: string;
  assignments: AuthRosterAssignment[];
};

export type AuthRosterPreviewInput = {
  actorUserId: string;
  rosterVersion: "ymq-2026-2027";
  accounts: AuthRosterAccount[];
};

export type AuthRosterPreviewAccount = {
  sourceKey: string;
  status: "created" | "existing" | "existing-email-conflict";
  desiredRoles: AuthRosterAssignment[];
  conflicts: string[];
};

export type AuthRosterDirectoryUser = {
  id: string;
  fullName: string;
  email: string;
  isActive: boolean;
  sourceUpdatedAt: string;
};

type ClientOptions = {
  baseUrl?: string;
  serviceSecret?: string;
  initialPassword?: string;
  fetchImplementation?: typeof fetch;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROSTER_REQUEST_BATCH_SIZE = 5;

export class AuthRosterBrokerClient {
  private readonly baseUrl: string;
  private readonly serviceSecret: string;
  private readonly initialPassword: string | undefined;
  private readonly fetchImplementation: typeof fetch;

  constructor(options: ClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? process.env.AUTH_INTERNAL_API_URL?.trim() ?? "";
    this.serviceSecret = options.serviceSecret ?? process.env.INTERNAL_SERVICE_SECRET?.trim() ?? "";
    this.initialPassword = options.initialPassword ?? process.env.YMQ_INITIAL_PASSWORD;
    this.fetchImplementation = options.fetchImplementation ?? fetch;
    if (!this.baseUrl || !this.serviceSecret) {
      throw new Error("AUTH_INTERNAL_API_URL dan INTERNAL_SERVICE_SECRET wajib tersedia untuk roster YMQ.");
    }
  }

  preview(input: AuthRosterPreviewInput): Promise<{ accounts: AuthRosterPreviewAccount[] }> {
    return this.requestBatches(
      "/api/internal/ymq-roster-broker/preview",
      input,
      (accounts) => ({ ...input, accounts: accounts.map(serializeAccount) }),
      parsePreviewResponse,
    );
  }

  provision(input: AuthRosterPreviewInput): Promise<{ accounts: AuthRosterDirectoryUser[] }> {
    if (!this.initialPassword || this.initialPassword.length < 8) {
      throw new Error("YMQ_INITIAL_PASSWORD wajib tersedia untuk provisioning roster YMQ.");
    }
    return this.requestBatches(
      "/api/internal/ymq-roster-broker/provision",
      input,
      (accounts) => ({ ...input, accounts: accounts.map(serializeAccount), initialPassword: this.initialPassword }),
      parseDirectoryResponse,
    );
  }

  private async requestBatches<T>(
    path: string,
    input: AuthRosterPreviewInput,
    payload: (accounts: AuthRosterAccount[]) => unknown,
    parse: (value: unknown) => { accounts: T[] },
  ): Promise<{ accounts: T[] }> {
    const accounts: T[] = [];
    for (let offset = 0; offset < input.accounts.length; offset += ROSTER_REQUEST_BATCH_SIZE) {
      const batch = input.accounts.slice(offset, offset + ROSTER_REQUEST_BATCH_SIZE);
      accounts.push(...(await this.request(path, payload(batch), parse)).accounts);
    }
    return { accounts };
  }

  private async request<T>(path: string, payload: unknown, parse: (value: unknown) => T): Promise<T> {
    const response = await this.fetchImplementation(new URL(path, this.baseUrl), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-internal-service-key": this.serviceSecret,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30_000),
    });
    const body = await response.json().catch(() => null) as unknown;
    if (!response.ok) throw new Error("Broker Auth menolak permintaan roster YMQ.");
    try {
      return parse(body);
    } catch {
      throw new Error("Respons Auth roster YMQ tidak valid.");
    }
  }
}

function serializeAccount(account: AuthRosterAccount): AuthRosterAccount {
  return {
    sourceKey: account.sourceKey,
    fullName: account.fullName,
    email: account.email,
    assignments: account.assignments,
  };
}

function parsePreviewResponse(value: unknown): { accounts: AuthRosterPreviewAccount[] } {
  const root = record(value);
  if (!Array.isArray(root.accounts)) throw new Error("invalid");
  return { accounts: root.accounts.map((entry) => {
    const account = record(entry);
    if (typeof account.sourceKey !== "string" || !["created", "existing", "existing-email-conflict"].includes(String(account.status)) || !Array.isArray(account.desiredRoles) || !Array.isArray(account.conflicts) || account.conflicts.some((conflict) => typeof conflict !== "string")) throw new Error("invalid");
    return {
      sourceKey: account.sourceKey,
      status: account.status as AuthRosterPreviewAccount["status"],
      desiredRoles: account.desiredRoles.map(parseAssignment),
      conflicts: account.conflicts,
    };
  }) };
}

function parseDirectoryResponse(value: unknown): { accounts: AuthRosterDirectoryUser[] } {
  const root = record(value);
  if (!Array.isArray(root.accounts)) throw new Error("invalid");
  return { accounts: root.accounts.map((entry) => {
    const account = record(entry);
    if (typeof account.id !== "string" || !UUID_PATTERN.test(account.id) || typeof account.fullName !== "string" || !account.fullName.trim() || typeof account.email !== "string" || !EMAIL_PATTERN.test(account.email) || typeof account.isActive !== "boolean" || typeof account.sourceUpdatedAt !== "string" || Number.isNaN(Date.parse(account.sourceUpdatedAt))) throw new Error("invalid");
    return { id: account.id, fullName: account.fullName, email: account.email.toLowerCase(), isActive: account.isActive, sourceUpdatedAt: account.sourceUpdatedAt };
  }) };
}

function parseAssignment(value: unknown): AuthRosterAssignment {
  const assignment = record(value);
  if (assignment.app === "simpeg" && assignment.role === "pegawai" && typeof assignment.unitId === "string" && UUID_PATTERN.test(assignment.unitId)) return { app: "simpeg", role: "pegawai", unitId: assignment.unitId };
  if (assignment.app === "simpeg" && assignment.role === "pimpinan" && assignment.unitId === null) return { app: "simpeg", role: "pimpinan", unitId: null };
  if (assignment.app === "siyaum" && ["peserta", "pembina_ymq", "admin_ymq"].includes(String(assignment.role)) && assignment.unitId === null) return { app: "siyaum", role: assignment.role as "peserta" | "pembina_ymq" | "admin_ymq", unitId: null };
  throw new Error("invalid");
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("invalid");
  return value as Record<string, unknown>;
}
