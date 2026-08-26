import { NextResponse, type NextRequest } from "next/server";
import { runAllChecks } from "@/lib/healthcheck";
import { consumeRateLimit } from "@/lib/rateLimit";

/** Per visitor: enough to watch a deploy recover, not enough to hammer the monitored services. */
const IP_LIMIT = 5;
const IP_WINDOW_MS = 10 * 60 * 1000;

/** Across all visitors: two people clicking at once shouldn't double-ping every service. */
const GLOBAL_COOLDOWN_MS = 15_000;

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  if (first) return first;
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

function tooManyRequests(message: string, retryAfterSeconds: number) {
  return NextResponse.json(
    { error: message, retryAfterSeconds },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
  );
}

export async function POST(request: NextRequest) {
  const perIp = await consumeRateLimit(`refresh:ip:${clientIp(request)}`, IP_LIMIT, IP_WINDOW_MS);
  if (!perIp.allowed) {
    return tooManyRequests(
      `Refresh limit reached (${IP_LIMIT} per ${IP_WINDOW_MS / 60_000} minutes).`,
      perIp.retryAfterSeconds,
    );
  }

  const global = await consumeRateLimit("refresh:global", 1, GLOBAL_COOLDOWN_MS);
  if (!global.allowed) {
    return tooManyRequests("A check just ran — give it a moment.", global.retryAfterSeconds);
  }

  const results = await runAllChecks();

  return NextResponse.json({
    ok: true,
    checkedAt: new Date().toISOString(),
    checked: results.length,
    remaining: perIp.remaining,
  });
}
