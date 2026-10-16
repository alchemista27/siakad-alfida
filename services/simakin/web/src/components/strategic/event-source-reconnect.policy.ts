export const MAX_EVENT_SOURCE_RECONNECT_ATTEMPTS = 5;

export function eventSourceReconnectDelay(attempt: number): number | null {
  if (attempt < 1 || attempt > MAX_EVENT_SOURCE_RECONNECT_ATTEMPTS) return null;
  return Math.min(1_000 * (2 ** (attempt - 1)), 16_000);
}
