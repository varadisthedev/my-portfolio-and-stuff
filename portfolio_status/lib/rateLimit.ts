import "server-only";
import connectToMongo from "@/lib/db/connect";
import RateLimitModel, { type RateLimitDoc } from "@/lib/db/models/RateLimit";

export interface RateLimitResult {
  allowed: boolean;
  /** Calls left in the current window once this one is accounted for. */
  remaining: number;
  /** Seconds until the current window closes. */
  retryAfterSeconds: number;
}

function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: number }).code === 11000;
}

/** Bump the counter for `key`, opening a new window if the previous one lapsed. */
async function bumpWindow(key: string, windowMs: number, now: Date): Promise<RateLimitDoc> {
  const expiresAt = new Date(now.getTime() + windowMs);

  try {
    return (await RateLimitModel.findOneAndUpdate(
      { key, expiresAt: { $gt: now } },
      { $inc: { count: 1 }, $setOnInsert: { expiresAt } },
      { new: true, upsert: true },
    ).lean()) as RateLimitDoc;
  } catch (error) {
    // The window lapsed but Mongo's TTL monitor (it runs once a minute) hadn't
    // reaped the document yet, so the upsert collided with it. Reopen it.
    if (!isDuplicateKeyError(error)) throw error;
    return (await RateLimitModel.findOneAndUpdate(
      { key },
      { $set: { count: 1, expiresAt } },
      { new: true, upsert: true },
    ).lean()) as RateLimitDoc;
  }
}

export async function consumeRateLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  await connectToMongo();

  const now = new Date();
  const doc = await bumpWindow(key, windowMs, now);
  const retryAfterSeconds = Math.max(1, Math.ceil((doc.expiresAt.getTime() - now.getTime()) / 1000));

  if (doc.count > limit) {
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  return { allowed: true, remaining: Math.max(0, limit - doc.count), retryAfterSeconds };
}
