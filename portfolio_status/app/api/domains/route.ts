import { NextResponse } from "next/server";
import { z } from "zod";
import connectToMongo from "@/lib/db/connect";
import { verifySession } from "@/lib/auth/session";
import { domainUrlSchema } from "@/lib/domain-url";

const DomainSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  url: domainUrlSchema,
});

export async function GET() {
  const { Domain } = await connectToMongo();
  const domains = await Domain.find().sort({ createdAt: 1 }).lean();
  return NextResponse.json(
    domains.map((domain) => ({
      id: domain._id.toString(),
      name: domain.name,
      url: domain.url,
      createdAt: domain.createdAt,
    })),
  );
}

export async function POST(request: Request) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = DomainSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { Domain } = await connectToMongo();
  const domain = await Domain.create({
    name: parsed.data.name,
    url: parsed.data.url,
  });

  return NextResponse.json(
    { id: domain._id.toString(), name: domain.name, url: domain.url, createdAt: domain.createdAt },
    { status: 201 },
  );
}
