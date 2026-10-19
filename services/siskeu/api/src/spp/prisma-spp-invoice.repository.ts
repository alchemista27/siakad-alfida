import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { SppInvoiceRepository } from "./spp-invoice.service";

@Injectable()
export class PrismaSppInvoiceRepository implements SppInvoiceRepository {
  constructor(private readonly prisma: PrismaService) {}

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
}
