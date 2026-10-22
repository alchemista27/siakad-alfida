export const API_BASE_URL = "/api";

export class ApiError extends Error {
  readonly status: number;
  readonly details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

function errorMessage(payload: unknown, fallback: string): string {
  if (typeof payload === "string" && payload.trim()) return payload;
  if (payload && typeof payload === "object") {
    const candidate = payload as { message?: unknown; error?: unknown };
    if (Array.isArray(candidate.message)) return candidate.message.join(", ");
    if (typeof candidate.message === "string") return candidate.message;
    if (typeof candidate.error === "string") return candidate.error;
  }
  return fallback;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${normalizedPath}`, {
      ...init,
      headers,
      credentials: "include",
    });
  } catch {
    throw new ApiError("Tidak dapat menghubungi layanan SIYAUM. Silakan coba lagi.", 0);
  }

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : await response.text().catch(() => "");

  if (!response.ok) {
    const fallback = response.status === 403
      ? "Anda tidak memiliki akses untuk tindakan ini."
      : response.status === 400
        ? "Data yang dikirim belum valid."
        : "Permintaan SIYAUM tidak dapat diproses.";
    throw new ApiError(errorMessage(payload, fallback), response.status, payload);
  }

  return payload as T;
}

export function queryString(values: Record<string, string | undefined | null>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value) params.set(key, value);
  }
  const rendered = params.toString();
  return rendered ? `?${rendered}` : "";
}
