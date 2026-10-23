import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE_PATTERN = /^\d{4}-(0[1-9]|1[0-2])-([0-2]\d|3[01])$/;
const BILLING_PERIOD_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

export type GenerateSppInvoicesInput = {
  unitId: string;
  academicYearId: string;
  billingPeriod: string;
  dueDate: string;
  invoices: Array<{ enrollmentId: string; studentName: string; amount: number; description?: string }>;
};

type GeneratedInvoice = {
  enrollmentId: string;
  billingPeriod: string;
};

type InvoiceCreateInput = {
  unitId: string;
  academicYearId: string;
  enrollmentId: string;
  studentName: string;
  billingPeriod: string;
  dueDate: Date;
  reference: string;
  description: string;
  amount: number;
  currency: "IDR";
  status: "unpaid";
};

type InvoiceRecord = {
  id: string;
  status: string;
  paymentProviderReference: string | null;
};

const INVOICE_STATUSES = ["unpaid", "pending", "paid", "cancelled", "overdue"] as const;
type InvoiceStatusFilter = (typeof INVOICE_STATUSES)[number];

export type FinanceInvoiceQuery = {
  unitId?: string;
  status?: InvoiceStatusFilter;
  page: number;
  limit: number;
};

export type FinanceInvoiceListItem = {
  id: string;
  unitId: string;
  studentName: string;
  billingPeriod: string;
  dueDate: string;
  reference: string;
  amount: number;
  currency: "IDR";
  status: InvoiceStatusFilter;
  paidAt: string | null;
};

export type FinanceDashboard = {
  unpaid: { count: number; amount: number };
  paid: { count: number; amount: number };
  overdue: { count: number; amount: number };
};

type InvoiceTransaction = {
  findByEnrollmentAndPeriod(enrollmentIds: string[], billingPeriod: string): Promise<GeneratedInvoice[]>;
  createMany(input: { data: InvoiceCreateInput[] }): Promise<{ count: number }>;
};

export type SppInvoiceRepository = {
  $transaction<T>(callback: (transaction: InvoiceTransaction) => Promise<T>): Promise<T>;
  findById(id: string): Promise<InvoiceRecord | null>;
  markPaid(id: string, providerReference: string): Promise<InvoiceRecord | null>;
  markPaidManually(id: string, manualReference: string): Promise<InvoiceRecord | null>;
  listInvoices(query: FinanceInvoiceQuery): Promise<{ data: FinanceInvoiceListItem[]; total: number }>;
  getDashboard(query: Pick<FinanceInvoiceQuery, "unitId">): Promise<FinanceDashboard>;
};

function isDate(value: string): boolean {
  const match = DATE_PATTERN.exec(value);
  if (!match) return false;
  const [year, month, day] = value.split("-").map(Number);
  const candidate = new Date(Date.UTC(year, month - 1, day));
  return candidate.getUTCFullYear() === year && candidate.getUTCMonth() === month - 1 && candidate.getUTCDate() === day;
}

function stringField(value: unknown, field: string, max: number): string {
  if (typeof value !== "string" || value.trim().length === 0 || value.length > max) {
    throw new BadRequestException(`${field} wajib berupa teks 1-${max} karakter.`);
  }
  return value.trim();
}

function optionalUuid(value: unknown, field: string): string | undefined {
  if (value === undefined || value === "") return undefined;
  if (typeof value !== "string" || !UUID_PATTERN.test(value)) {
    throw new BadRequestException(`${field} wajib UUID.`);
  }
  return value.toLowerCase();
}

function pageField(value: unknown, field: "page" | "limit", fallback: number, maximum: number): number {
  if (value === undefined || value === "") return fallback;
  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    throw new BadRequestException(`${field} wajib bilangan bulat positif.`);
  }
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > maximum) {
    throw new BadRequestException(`${field} wajib bernilai 1-${maximum}.`);
  }
  return parsed;
}

export function parseFinanceInvoiceQuery(input: unknown): FinanceInvoiceQuery {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new BadRequestException("Query tagihan tidak valid.");
  }
  const query = input as Record<string, unknown>;
  const rawStatus = query.status;
  if (rawStatus !== undefined && rawStatus !== "" && (typeof rawStatus !== "string" || !INVOICE_STATUSES.includes(rawStatus as InvoiceStatusFilter))) {
    throw new BadRequestException("status tagihan tidak valid.");
  }
  return {
    unitId: optionalUuid(query.unitId, "unitId"),
    status: typeof rawStatus === "string" && rawStatus !== "" ? rawStatus as InvoiceStatusFilter : undefined,
    page: pageField(query.page, "page", 1, 1_000_000),
    limit: pageField(query.limit, "limit", 20, 100),
  };
}

export function deterministicReference(enrollmentId: string, billingPeriod: string): string {
  return `SPP-${billingPeriod.replace("-", "")}-${enrollmentId.replaceAll("-", "").toUpperCase()}`;
}

export function validateGenerateSppInvoices(input: unknown): GenerateSppInvoicesInput {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new BadRequestException("Payload pembuatan tagihan tidak valid.");
  const value = input as Record<string, unknown>;
  const unitId = stringField(value.unitId, "unitId", 36).toLowerCase();
  const academicYearId = stringField(value.academicYearId, "academicYearId", 36).toLowerCase();
  const billingPeriod = stringField(value.billingPeriod, "billingPeriod", 7);
  const dueDate = stringField(value.dueDate, "dueDate", 10);
  if (!UUID_PATTERN.test(unitId) || !UUID_PATTERN.test(academicYearId)) throw new BadRequestException("unitId dan academicYearId wajib UUID.");
  if (!BILLING_PERIOD_PATTERN.test(billingPeriod)) throw new BadRequestException("billingPeriod wajib berformat YYYY-MM.");
  if (!isDate(dueDate)) throw new BadRequestException("dueDate wajib berupa tanggal YYYY-MM-DD yang valid.");
  if (!Array.isArray(value.invoices) || value.invoices.length === 0 || value.invoices.length > 1000) {
    throw new BadRequestException("invoices wajib berisi 1 sampai 1000 item.");
  }
  const invoices = value.invoices.map((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) throw new BadRequestException("Item invoice tidak valid.");
    const row = item as Record<string, unknown>;
    const enrollmentId = stringField(row.enrollmentId, "enrollmentId", 36).toLowerCase();
    if (!UUID_PATTERN.test(enrollmentId)) throw new BadRequestException("enrollmentId wajib UUID.");
    const studentName = stringField(row.studentName, "studentName", 160);
    if (typeof row.amount !== "number" || !Number.isSafeInteger(row.amount) || row.amount <= 0) {
      throw new BadRequestException("amount wajib berupa nominal IDR bulat positif.");
    }
    const description = row.description === undefined ? undefined : stringField(row.description, "description", 300);
    return { enrollmentId, studentName, amount: row.amount, description };
  });
  if (new Set(invoices.map((invoice) => invoice.enrollmentId)).size !== invoices.length) {
    throw new BadRequestException("invoices tidak boleh memuat enrollmentId duplikat.");
  }
  return { unitId, academicYearId, billingPeriod, dueDate, invoices };
}

@Injectable()
export class SppInvoiceService {
  constructor(private readonly invoices: SppInvoiceRepository) {}

  async generate(input: unknown): Promise<{ generated: number; skipped: number }> {
    const payload = validateGenerateSppInvoices(input);
    return this.invoices.$transaction(async (transaction) => {
      const existing = await transaction.findByEnrollmentAndPeriod(payload.invoices.map((invoice) => invoice.enrollmentId), payload.billingPeriod);
      const existingEnrollmentIds = new Set(existing.map((invoice) => invoice.enrollmentId.toLowerCase()));
      const missing = payload.invoices.filter((invoice) => !existingEnrollmentIds.has(invoice.enrollmentId)).map((invoice): InvoiceCreateInput => ({
        unitId: payload.unitId,
        academicYearId: payload.academicYearId,
        enrollmentId: invoice.enrollmentId,
        studentName: invoice.studentName,
        billingPeriod: payload.billingPeriod,
        dueDate: new Date(`${payload.dueDate}T00:00:00.000Z`),
        reference: deterministicReference(invoice.enrollmentId, payload.billingPeriod),
        description: invoice.description || `SPP ${payload.billingPeriod}`,
        amount: invoice.amount,
        currency: "IDR",
        status: "unpaid",
      }));
      if (missing.length === 0) return { generated: 0, skipped: payload.invoices.length };
      const result = await transaction.createMany({ data: missing });
      return { generated: result.count, skipped: payload.invoices.length - result.count };
    });
  }

  async listInvoices(query: unknown): Promise<{ data: FinanceInvoiceListItem[]; meta: { total: number; page: number; limit: number; totalPages: number } }> {
    const parsed = parseFinanceInvoiceQuery(query);
    const result = await this.invoices.listInvoices(parsed);
    return {
      data: result.data,
      meta: {
        total: result.total,
        page: parsed.page,
        limit: parsed.limit,
        totalPages: Math.ceil(result.total / parsed.limit),
      },
    };
  }

  async getDashboard(query: unknown): Promise<FinanceDashboard> {
    const parsed = parseFinanceInvoiceQuery(query);
    return this.invoices.getDashboard({ unitId: parsed.unitId });
  }

  async markPaidFromProvider(invoiceId: string, payload: unknown): Promise<{ invoiceId: string; status: "paid" }> {
    if (!UUID_PATTERN.test(invoiceId)) throw new BadRequestException("invoiceId wajib UUID.");
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new BadRequestException("Payload webhook pembayaran tidak valid.");
    const providerReference = stringField((payload as Record<string, unknown>).providerReference, "providerReference", 200);
    const existing = await this.invoices.findById(invoiceId);
    if (!existing) throw new NotFoundException("Tagihan tidak ditemukan.");
    if (existing.status === "cancelled") throw new ConflictException("Tagihan yang dibatalkan tidak dapat dilunasi.");
    if (existing.status === "paid") {
      if (existing.paymentProviderReference !== providerReference) throw new ConflictException("Referensi provider tidak sesuai dengan pembayaran yang sudah tercatat.");
      return { invoiceId, status: "paid" };
    }
    const paid = await this.invoices.markPaid(invoiceId, providerReference);
    if (!paid || paid.status !== "paid") throw new ConflictException("Tagihan tidak dapat ditandai lunas.");
    return { invoiceId: paid.id, status: "paid" };
  }

  async markPaidManually(invoiceId: string, payload: unknown): Promise<{ invoiceId: string; status: "paid"; paymentMethod: "manual_transfer"; manualReference: string }> {
    if (!UUID_PATTERN.test(invoiceId)) throw new BadRequestException("invoiceId wajib UUID.");
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new BadRequestException("Payload konfirmasi transfer manual tidak valid.");
    const manualReference = stringField((payload as Record<string, unknown>).manualReference, "manualReference", 180);
    const persistedReference = `manual_transfer:${manualReference}`;
    const existing = await this.invoices.findById(invoiceId);
    if (!existing) throw new NotFoundException("Tagihan tidak ditemukan.");
    if (existing.status === "paid") {
      if (existing.paymentProviderReference !== persistedReference) throw new ConflictException("Referensi transfer manual tidak sesuai dengan pembayaran yang sudah tercatat.");
      return { invoiceId, status: "paid", paymentMethod: "manual_transfer", manualReference };
    }
    if (existing.status !== "unpaid") throw new ConflictException("Hanya tagihan berstatus belum dibayar yang dapat dikonfirmasi manual.");
    const paid = await this.invoices.markPaidManually(invoiceId, persistedReference);
    if (!paid || paid.status !== "paid" || paid.paymentProviderReference !== persistedReference) {
      throw new ConflictException("Tagihan tidak dapat dikonfirmasi lunas secara manual.");
    }
    return { invoiceId: paid.id, status: "paid", paymentMethod: "manual_transfer", manualReference };
  }
}
