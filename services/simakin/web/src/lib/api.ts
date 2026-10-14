import { ALFIDA_SESSION_COOKIE } from "@alfida/auth-sdk";

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;

  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // Jika di lingkungan Server (Node.js Next.js Server Components / Actions)
  if (typeof window === "undefined") {
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const token =
        cookieStore.get(ALFIDA_SESSION_COOKIE)?.value ||
        cookieStore.get("better-auth.session_token")?.value;

      if (token) {
        headers.set("Authorization", `Bearer ${decodeURIComponent(token)}`);
        headers.set("Cookie", `${ALFIDA_SESSION_COOKIE}=${token}`);
      }
    } catch (e) {
      // Abaikan jika dipanggil di luar request context
    }

    const baseUrl = process.env.INTERNAL_API_URL || "http://127.0.0.1:3001";
    const url = `${baseUrl}/api/${cleanEndpoint}`;

    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (!res.ok) {
      let msg = `API request failed: ${res.status}`;
      try {
        const errJson = await res.json();
        if (errJson.message) {
          msg = Array.isArray(errJson.message) ? errJson.message.join(", ") : errJson.message;
        }
      } catch (_) {}
      throw new Error(msg);
    }

    if (res.status === 204) return null;
    return await res.json();
  }

  // Jika di lingkungan Browser (Client Components)
  const url = `/api/${cleanEndpoint}`;
  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let msg = `API request failed: ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson.message) {
        msg = Array.isArray(errJson.message) ? errJson.message.join(", ") : errJson.message;
      }
    } catch (_) {}
    throw new Error(msg);
  }

  if (res.status === 204) return null;
  return await res.json();
}
