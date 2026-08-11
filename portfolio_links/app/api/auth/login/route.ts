import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyCredentials } from "@/lib/auth/credentials";
import { createSession } from "@/lib/auth/session";
import { checkLoginRateLimit, getClientKey, recordFailedLogin, recordSuccessfulLogin } from "@/lib/rateLimit";

const LoginSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const key = await getClientKey();

  const rateLimit = await checkLoginRateLimit(key);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const valid = await verifyCredentials(parsed.data.username, parsed.data.password);
  if (!valid) {
    await recordFailedLogin(key);
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
  }

  await recordSuccessfulLogin(key);
  await createSession({ username: parsed.data.username });
  return NextResponse.json({ ok: true });
}
