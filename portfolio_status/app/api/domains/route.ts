import { NextResponse } from "next/server";
import { z } from "zod";
import connectToMongo from "@/lib/db/connect";
import DomainModel from "@/lib/db/models/Domain";
import { verifySession } from "@/lib/auth/session";

const DomainSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  url: z.url({ error: "Must be a valid URL, e.g. https://example.com/health" }),
});

export async function GET() {
  await connectToMongo();
  const domains = await DomainModel.find().sort({ createdAt: 1 }).lean();
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

  await connectToMongo();
  const domain = await DomainModel.create({
    name: parsed.data.name,
    url: parsed.data.url,
  });

  return NextResponse.json(
    { id: domain._id.toString(), name: domain.name, url: domain.url, createdAt: domain.createdAt },
    { status: 201 },
  );
}
