export type SiskeuUser = { fullName: string; roles?: Array<{ role?: string }> };
export type FinanceSummary = {
  unpaid: { count: number; amount: number };
  paid: { count: number; amount: number };
  overdue: { count: number; amount: number };
};
export type FinanceInvoice = {
  id: string;
  unitId: string;
  studentName: string;
  billingPeriod: string;
  dueDate: string;
  reference: string;
  amount: number;
  currency: "IDR";
  status: "unpaid" | "pending" | "paid" | "cancelled" | "overdue";
  paidAt: string | null;
};

async function request<T>(path: string): Promise<T> {
  const response = await fetch(path, { credentials: "include" });
  if (!response.ok) {
    const contentType = response.headers.get("content-type") || "";
    const body = contentType.includes("application/json")
      ? await response.json().catch(() => null) as { message?: string | string[] } | null
      : null;
    const message = Array.isArray(body?.message) ? body.message.join(" ") : body?.message;
    throw new Error(message || `Layanan keuangan tidak tersedia (${response.status}).`);
  }
  return response.json() as Promise<T>;
}

export function getDashboard() {
  return request<FinanceSummary>("/api/spp/invoices/dashboard");
}

export function getInvoices(status?: FinanceInvoice["status"]) {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return request<{ data: FinanceInvoice[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(`/api/spp/invoices${query}`);
}
