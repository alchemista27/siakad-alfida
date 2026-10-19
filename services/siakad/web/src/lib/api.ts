const API_BASE = "/api";

function messageFromPayload(payload: unknown, fallback: string): string {
  if (typeof payload === "string" && payload.trim()) return payload;
  if (Array.isArray(payload)) {
    const messages = payload.filter((item): item is string => typeof item === "string");
    if (messages.length) return messages.join(", ");
  }
  if (typeof payload === "object" && payload) {
    const value = payload as { message?: unknown; error?: unknown };
    if (value.message !== undefined) return messageFromPayload(value.message, fallback);
    if (value.error !== undefined) return messageFromPayload(value.error, fallback);
  }
  return fallback;
}

async function readResponsePayload(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return undefined;

  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json") || contentType.includes("+json")) {
    try {
      return JSON.parse(text) as unknown;
    } catch {
      return text;
    }
  }

  return text;
}

export async function siakadApiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${API_BASE}${normalizedEndpoint}`;
  const headers = new Headers(options.headers);

  if (typeof FormData === "undefined" || !(options.body instanceof FormData)) {
    if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, { ...options, headers });
  const payload = await readResponsePayload(res);

  if (!res.ok) {
    throw new Error(messageFromPayload(payload, `Request failed with status ${res.status}`));
  }

  return payload as T;
}
