import "server-only";
import { headers } from "next/headers";
import connectToMongo from "@/lib/db/connect";
import LoginAttemptModel from "@/lib/db/models/LoginAttempt";

// Fixed-window limiter, persisted in Mongo so it holds up across serverless
// instances/cold starts (an in-memory Map would reset per instance).
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS_PER_WINDOW = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

export async function getClientKey(): Promise<string> {
  const h = await headers();
  const forwardedFor = h.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim();
  return ip || h.get("x-real-ip") || "unknown";
}

export async function checkLoginRateLimit(key: string): Promise<RateLimitResult> {
  await connectToMongo();
  const record = await LoginAttemptModel.findOne({ key }).lean();
  if (!record) return { allowed: true };

  const now = Date.now();
  if (record.lockedUntil && record.lockedUntil.getTime() > now) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((record.lockedUntil.getTime() - now) / 1000),
    };
  }

  return { allowed: true };
}

export async function recordFailedLogin(key: string): Promise<void> {
  await connectToMongo();
  const now = Date.now();
  const record = await LoginAttemptModel.findOne({ key });

  const windowExpired = !record || now - record.windowStart.getTime() > WINDOW_MS;
  const nextCount = windowExpired ? 1 : record.count + 1;
  const lockedUntil = nextCount >= MAX_ATTEMPTS_PER_WINDOW ? new Date(now + LOCKOUT_MS) : null;

  await LoginAttemptModel.updateOne(
    { key },
    {
      $set: {
        count: nextCount,
        windowStart: windowExpired ? new Date(now) : record.windowStart,
        lockedUntil,
        // Keep the record around a bit past whichever expiry is later, so a
        // lockout can't be cleared early by the window's own TTL.
        expiresAt: new Date((lockedUntil?.getTime() ?? now + WINDOW_MS) + WINDOW_MS),
      },
    },
    { upsert: true },
  );
}

export async function recordSuccessfulLogin(key: string): Promise<void> {
  await connectToMongo();
  await LoginAttemptModel.deleteOne({ key });
}
