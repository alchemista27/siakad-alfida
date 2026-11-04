export async function fingerprintResponseMessage(response: Response, fallback: string): Promise<string> {
  const raw = await response.text().catch(() => "");
  if (!raw.trim()) return fallback;

  try {
    const body = JSON.parse(raw) as { message?: string | string[] };
    return Array.isArray(body?.message) ? body.message.join(" ") : body?.message || fallback;
  } catch {
    return fallback;
  }
}

export async function readFingerprintJson<T>(response: Response, fallback: string): Promise<T> {
  const raw = await response.text().catch(() => "");
  if (!raw.trim()) throw new Error(fallback);

  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error(fallback);
  }
}
