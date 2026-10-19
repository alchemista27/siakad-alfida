import { BadRequestException, Injectable, NotFoundException, ServiceUnavailableException } from "@nestjs/common";

export const MAX_INTERNAL_ENROLLMENTS = 100;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const INVOICE_STATUSES = new Set(["unpaid", "pending", "paid", "overdue", "cancelled"]);

type InvoiceStatus = "unpaid" | "pending" | "paid" | "overdue" | "cancelled";

type StoredInvoice = {
  id: string;
  enrollmentId: string;
  reference: string;
  description: string;
  amount: number | { toNumber(): number };
  currency: string;
  dueDate: Date;
  status: string;
};

export type InternalInvoiceRepository = {
  findByEnrollmentIds(enrollmentIds: string[]): Promise<StoredInvoice[]>;
  findById(id: string): Promise<StoredInvoice | null>;
};

export function parseEnrollmentIds(input: string | string[] | undefined): string[] {
  if (typeof input !== "string" || input.length === 0) {
    throw new BadRequestException("enrollmentIds wajib berupa daftar UUID yang dipisahkan koma.");
  }
  const identifiers = input.split(",");
  if (identifiers.length === 0 || identifiers.length > MAX_INTERNAL_ENROLLMENTS) {
    throw new BadRequestException(`enrollmentIds harus berisi 1 sampai ${MAX_INTERNAL_ENROLLMENTS} UUID unik.`);
  }
  const normalized = identifiers.map((identifier) => {
    if (!UUID_PATTERN.test(identifier)) {
      throw new BadRequestException("enrollmentIds berisi identifier tidak valid.");
    }
    return identifier.toLowerCase();
  });
  if (new Set(normalized).size !== normalized.length) {
    throw new BadRequestException("enrollmentIds tidak boleh memuat duplikasi.");
  }
  return normalized;
}

function amountAsNumber(amount: StoredInvoice["amount"]): number {
  return typeof amount === "number" ? amount : amount.toNumber();
}

function outputInvoice(invoice: StoredInvoice) {
  if (!INVOICE_STATUSES.has(invoice.status) || invoice.currency !== "IDR" || !Number.isFinite(amountAsNumber(invoice.amount))) {
    throw new ServiceUnavailableException("Data tagihan SISKEU tidak valid.");
  }
  return {
    id: invoice.id,
    enrollmentId: invoice.enrollmentId,
    reference: invoice.reference,
    description: invoice.description,
    amount: amountAsNumber(invoice.amount),
    currency: "IDR" as const,
    dueDate: invoice.dueDate.toISOString().slice(0, 10),
    status: invoice.status as InvoiceStatus,
    paymentUrl: null,
  };
}

function paymentUrl(invoice: StoredInvoice): string {
  const template = process.env.SISKEU_PAYMENT_URL_TEMPLATE;
  if (!template) throw new ServiceUnavailableException("Gateway pembayaran SISKEU belum dikonfigurasi.");
  const rendered = template
    .replaceAll("{invoiceId}", encodeURIComponent(invoice.id))
    .replaceAll("{reference}", encodeURIComponent(invoice.reference));
  try {
    const url = new URL(rendered);
    if (url.protocol !== "https:") throw new Error("non-HTTPS payment URL");
  } catch {
    throw new ServiceUnavailableException("Konfigurasi URL pembayaran SISKEU tidak valid.");
  }
  return rendered;
}

@Injectable()
export class InternalSppService {
  constructor(private readonly invoices: InternalInvoiceRepository) {}

  async list(rawEnrollmentIds: string | string[] | undefined) {
    const enrollmentIds = parseEnrollmentIds(rawEnrollmentIds);
    const requested = new Set(enrollmentIds);
    const invoices = await this.invoices.findByEnrollmentIds(enrollmentIds);
    return { invoices: invoices.filter((invoice) => requested.has(invoice.enrollmentId.toLowerCase())).map(outputInvoice) };
  }

  async createPaymentSession(invoiceId: string, rawEnrollmentId: unknown) {
    if (typeof rawEnrollmentId !== "string" || !UUID_PATTERN.test(rawEnrollmentId)) {
      throw new BadRequestException("enrollmentId wajib berupa UUID.");
    }
    const invoice = await this.invoices.findById(invoiceId);
    if (!invoice || invoice.enrollmentId.toLowerCase() !== rawEnrollmentId.toLowerCase()) {
      throw new NotFoundException("Tagihan tidak ditemukan untuk enrollment tersebut.");
    }
    if (invoice.status === "paid" || invoice.status === "cancelled") {
      throw new NotFoundException("Tagihan tidak tersedia untuk pembayaran.");
    }
    return { invoiceId: invoice.id, paymentUrl: paymentUrl(invoice) };
  }
}
