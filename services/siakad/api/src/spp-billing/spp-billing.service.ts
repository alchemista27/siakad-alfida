import { BadGatewayException, Injectable, NotFoundException, ServiceUnavailableException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { SiakadPrincipal } from "../common/siakad-scope-policy";

export type SppInvoice = {
  id: string;
  enrollmentId: string;
  reference: string;
  description: string;
  amount: number;
  currency: string;
  dueDate: string;
  status: "unpaid" | "pending" | "paid" | "overdue" | "cancelled";
  paymentUrl: string | null;
};

type ParentEnrollment = { id: string; student: { fullName: string }; classroom: { name: string } | null };
type FetchImplementation = typeof fetch;

function isInvoice(value: unknown): value is SppInvoice {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return typeof item.id === "string" && typeof item.enrollmentId === "string" && typeof item.reference === "string"
    && typeof item.description === "string" && typeof item.amount === "number" && Number.isFinite(item.amount)
    && typeof item.currency === "string" && typeof item.dueDate === "string" && typeof item.status === "string"
    && (item.paymentUrl === null || typeof item.paymentUrl === "string");
}

@Injectable()
export class SppBillingService {
  constructor(private readonly prisma: PrismaService, private readonly fetchImplementation: FetchImplementation = fetch) {}

  async listForParent(principal: SiakadPrincipal) {
    const enrollments = await this.parentEnrollments(principal.id);
    if (enrollments.length === 0) return { enrollments, invoices: [] as SppInvoice[] };
    const invoices = await this.fetchInvoices(enrollments.map((enrollment) => enrollment.id));
    const ownedIds = new Set(enrollments.map((enrollment) => enrollment.id));
    return { enrollments, invoices: invoices.filter((invoice) => ownedIds.has(invoice.enrollmentId)) };
  }

  async createPaymentSession(principal: SiakadPrincipal, invoiceId: string) {
    const { invoices } = await this.listForParent(principal);
    const invoice = invoices.find((item) => item.id === invoiceId);
    if (!invoice) throw new NotFoundException("Tagihan SPP tidak ditemukan untuk akun orang tua ini.");
    if (invoice.status === "paid" || invoice.status === "cancelled") throw new BadGatewayException("Tagihan SPP tidak dapat dibayarkan.");

    const response = await this.request(`/api/internal/spp/invoices/${encodeURIComponent(invoice.id)}/payment-session`, {
      method: "POST",
      body: JSON.stringify({ enrollmentId: invoice.enrollmentId }),
    });
    const payload = await this.json(response);
    if (!payload || typeof payload !== "object" || typeof (payload as Record<string, unknown>).paymentUrl !== "string") {
      throw new BadGatewayException("SISKEU mengembalikan sesi pembayaran yang tidak valid.");
    }
    return { invoiceId: invoice.id, paymentUrl: (payload as Record<string, string>).paymentUrl };
  }

  private async parentEnrollments(parentUserId: string): Promise<ParentEnrollment[]> {
    return this.prisma.enrollment.findMany({
      where: { status: "active", student: { parentUserId } },
      select: { id: true, student: { select: { fullName: true } }, classroom: { select: { name: true } } },
      orderBy: { enrolledAt: "desc" },
    });
  }

  private async fetchInvoices(enrollmentIds: string[]): Promise<SppInvoice[]> {
    const query = new URLSearchParams({ enrollmentIds: enrollmentIds.join(",") });
    const response = await this.request(`/api/internal/spp/invoices?${query.toString()}`);
    const payload = await this.json(response);
    const invoices = payload && typeof payload === "object" ? (payload as Record<string, unknown>).invoices : undefined;
    if (!Array.isArray(invoices) || !invoices.every(isInvoice)) {
      throw new BadGatewayException("SISKEU mengembalikan daftar tagihan yang tidak valid.");
    }
    return invoices;
  }

  private config() {
    const baseUrl = process.env.SISKEU_API_URL?.replace(/\/$/, "");
    const token = process.env.SISKEU_INTERNAL_SERVICE_TOKEN;
    if (!baseUrl || !token) throw new ServiceUnavailableException("Integrasi SISKEU belum dikonfigurasi.");
    return { baseUrl, token };
  }

  private async request(path: string, init: RequestInit = {}) {
    const { baseUrl, token } = this.config();
    let response: Response;
    try {
      response = await this.fetchImplementation(`${baseUrl}${path}`, {
        ...init,
        headers: { Accept: "application/json", "Content-Type": "application/json", "x-internal-service-key": token, ...init.headers },
        signal: AbortSignal.timeout(10_000),
      });
    } catch {
      throw new ServiceUnavailableException("SISKEU tidak dapat dihubungi.");
    }
    if (!response.ok) throw new BadGatewayException("SISKEU menolak permintaan pembayaran SPP.");
    return response;
  }

  private async json(response: Response): Promise<unknown> {
    try {
      return await response.json();
    } catch {
      throw new BadGatewayException("SISKEU mengembalikan respons non-JSON.");
    }
  }
}
