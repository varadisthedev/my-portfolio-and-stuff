import { connectToMongo } from "@/lib/connectToMongo";
import RateLimit from "@/models/RateLimit";

export type RateLimitResult =
    | { allowed: true }
    | { allowed: false; retryAfterSeconds: number };

/** Fixed-window rate limit: `limit` requests per `windowMs` for a given
 * `key`. One Mongo round-trip per call (read, then either upsert-reset or
 * increment) — fine at this traffic volume, and avoids needing a second
 * piece of infrastructure (Redis) just for a portfolio contact form. */
export async function checkRateLimit(
    key: string,
    limit: number,
    windowMs: number
): Promise<RateLimitResult> {
    await connectToMongo();
    const now = Date.now();
    const existing = await RateLimit.findOne({ key }).lean<{
        count: number;
        windowStart: Date;
    } | null>();

    if (!existing || now - existing.windowStart.getTime() > windowMs) {
        await RateLimit.findOneAndUpdate(
            { key },
            { key, count: 1, windowStart: new Date(now) },
            { upsert: true }
        );
        return { allowed: true };
    }

    if (existing.count >= limit) {
        const retryAfterSeconds = Math.max(
            1,
            Math.ceil((windowMs - (now - existing.windowStart.getTime())) / 1000)
        );
        return { allowed: false, retryAfterSeconds };
    }

    await RateLimit.updateOne({ key }, { $inc: { count: 1 } });
    return { allowed: true };
}

/** Best-effort client IP from the headers a proxy (Vercel included) sets —
 * there's no fully reliable source in a serverless request, so this is a
 * "good enough to rate-limit by" identifier, not an auth-grade one. */
export function getClientIp(req: Request): string {
    const forwardedFor = req.headers.get("x-forwarded-for");
    if (forwardedFor) return forwardedFor.split(",")[0].trim();
    return req.headers.get("x-real-ip") ?? "unknown";
}
