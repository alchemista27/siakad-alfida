import { Injectable } from "@nestjs/common";
import { Prisma } from "../generated/prisma";
import { PrismaService } from "../prisma/prisma.service";
import type { FinanceDashboard, FinanceInvoiceListItem, FinanceInvoiceQuery, SppInvoiceRepository } from "./spp-invoice.service";

@Injectable()
export class PrismaSppInvoiceRepository implements SppInvoiceRepository {
  constructor(private readonly prisma: PrismaService) {}

  private startOfToday(): Date {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  }

  private whereFor(query: Pick<FinanceInvoiceQuery, "unitId" | "status">): Prisma.SppInvoiceWhereInput {
    const where: Prisma.SppInvoiceWhereInput = query.unitId ? { unitId: query.unitId } : {};
    if (query.status === "overdue") {
      where.status = { in: ["unpaid", "pending"] };
      where.dueDate = { lt: this.startOfToday() };
    } else if (query.status) {
      where.status = query.status;
    }
    return where;
  }

  private serializeInvoice(invoice: {
    id: string;
    unitId: string;
    studentName: string;
    billingPeriod: string;
    dueDate: Date;
    reference: string;
    amount: Prisma.Decimal;
    currency: string;
    status: string;
    paidAt: Date | null;
  }): FinanceInvoiceListItem {
    const overdue = ["unpaid", "pending"].includes(invoice.status) && invoice.dueDate < this.startOfToday();
    return {
      id: invoice.id,
      unitId: invoice.unitId,
      studentName: invoice.studentName,
      billingPeriod: invoice.billingPeriod,
      dueDate: invoice.dueDate.toISOString().slice(0, 10),
      reference: invoice.reference,
      amount: Number(invoice.amount),
      currency: invoice.currency === "IDR" ? "IDR" : "IDR",
      status: overdue ? "overdue" : invoice.status as FinanceInvoiceListItem["status"],
      paidAt: invoice.paidAt?.toISOString() ?? null,
    };
  }

  private async aggregate(where: Prisma.SppInvoiceWhereInput): Promise<{ count: number; amount: number }> {
    const aggregate = await this.prisma.sppInvoice.aggregate({
      where,
      _count: { _all: true },
      _sum: { amount: true },
    });
    return { count: aggregate._count._all, amount: Number(aggregate._sum.amount || 0) };
  }

  async listInvoices(query: FinanceInvoiceQuery): Promise<{ data: FinanceInvoiceListItem[]; total: number }> {
    const where = this.whereFor(query);
    const [total, invoices] = await Promise.all([
      this.prisma.sppInvoice.count({ where }),
      this.prisma.sppInvoice.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
        select: {
          id: true,
          unitId: true,
          studentName: true,
          billingPeriod: true,
          dueDate: true,
          reference: true,
          amount: true,
          currency: true,
          status: true,
          paidAt: true,
        },
      }),
    ]);
    return { data: invoices.map((invoice) => this.serializeInvoice(invoice)), total };
  }

  async getDashboard(query: Pick<FinanceInvoiceQuery, "unitId">): Promise<FinanceDashboard> {
    const base: Prisma.SppInvoiceWhereInput = query.unitId ? { unitId: query.unitId } : {};
    const [unpaid, paid, overdue] = await Promise.all([
      this.aggregate({ ...base, status: { in: ["unpaid", "pending"] } }),
      this.aggregate({ ...base, status: "paid" }),
      this.aggregate({ ...base, status: { in: ["unpaid", "pending"] }, dueDate: { lt: this.startOfToday() } }),
    ]);
    return { unpaid, paid, overdue };
  }

  $transaction<T>(callback: Parameters<SppInvoiceRepository["$transaction"]>[0]): Promise<T> {
    return this.prisma.$transaction(async (transaction) => callback({
      findByEnrollmentAndPeriod: (enrollmentIds, billingPeriod) => transaction.sppInvoice.findMany({
        where: { enrollmentId: { in: enrollmentIds }, billingPeriod },
        select: { enrollmentId: true, billingPeriod: true },
      }),
      createMany: ({ data }) => transaction.sppInvoice.createMany({ data, skipDuplicates: true }),
    })) as Promise<T>;
  }

  findById(id: string) {
    return this.prisma.sppInvoice.findUnique({
      where: { id },
      select: { id: true, status: true, paymentProviderReference: true },
    });
  }

  async markPaid(id: string, providerReference: string) {
    return this.prisma.$transaction(async (transaction) => {
      const invoice = await transaction.sppInvoice.findUnique({
        where: { id },
        select: { id: true, status: true, paymentProviderReference: true },
      });
      if (!invoice || invoice.status === "cancelled") return null;
      if (invoice.status === "paid") return invoice.paymentProviderReference === providerReference ? invoice : null;
      try {
        const updated = await transaction.sppInvoice.updateMany({
          where: { id, status: { in: ["unpaid", "pending", "overdue"] } },
          data: { status: "paid", paymentProviderReference: providerReference, paidAt: new Date() },
        });
        if (updated.count === 0) {
          const current = await transaction.sppInvoice.findUnique({
            where: { id },
            select: { id: true, status: true, paymentProviderReference: true },
          });
          return current?.status === "paid" && current.paymentProviderReference === providerReference ? current : null;
        }
        return transaction.sppInvoice.findUnique({
          where: { id },
          select: { id: true, status: true, paymentProviderReference: true },
        });
      } catch {
        return null;
      }
    });
  }

  async markPaidManually(id: string, manualReference: string) {
    return this.prisma.$transaction(async (transaction) => {
      try {
        const updated = await transaction.sppInvoice.updateMany({
          where: { id, status: "unpaid" },
          data: { status: "paid", paymentProviderReference: manualReference, paidAt: new Date() },
        });
        if (updated.count === 0) {
          const current = await transaction.sppInvoice.findUnique({
            where: { id },
            select: { id: true, status: true, paymentProviderReference: true },
          });
          return current?.status === "paid" && current.paymentProviderReference === manualReference ? current : null;
        }
        return transaction.sppInvoice.findUnique({
          where: { id },
          select: { id: true, status: true, paymentProviderReference: true },
        });
      } catch {
        return null;
      }
    });
  }
}
