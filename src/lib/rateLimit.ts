/**
 * Minimal in-memory rate limiter for the public report/recover endpoints.
 *
 * Limitation (documented for the hackathon MVP): this state lives in a
 * single serverless function instance's memory, so it resets on cold start
 * and is not shared across instances/regions. It stops naive repeated
 * submissions from one browser session but is not a substitute for a real
 * shared store (e.g. Upstash/Redis) in production.
 */
const hits = new Map<string, number[]>();

export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const timestamps = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  timestamps.push(now);
  hits.set(key, timestamps);
  return timestamps.length > limit;
}

export function getClientKey(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() ?? "unknown";
}
