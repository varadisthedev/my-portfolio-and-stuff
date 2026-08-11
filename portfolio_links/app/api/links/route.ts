import { NextResponse } from "next/server";
import { z } from "zod";
import connectToMongo from "@/lib/db/connect";
import LinkModel from "@/lib/db/models/Link";
import { verifySession } from "@/lib/auth/session";
import { PLATFORM_KEYS, getPlatform } from "@/lib/platforms";

const LinkSchema = z.object({
  platform: z.enum(PLATFORM_KEYS as [string, ...string[]]),
  label: z.string().trim().min(1).max(60).optional(),
  url: z.string().trim().min(1).max(2048),
});

export async function GET() {
  await connectToMongo();
  const links = await LinkModel.find().sort({ order: 1 }).lean();
  return NextResponse.json(
    links.map((link) => ({
      id: link._id.toString(),
      platform: link.platform,
      label: link.label,
      url: link.url,
      order: link.order,
    })),
  );
}

export async function POST(request: Request) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = LinkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  await connectToMongo();
  const last = await LinkModel.findOne().sort({ order: -1 }).lean();
  const nextOrder = last ? last.order + 1 : 0;

  const link = await LinkModel.create({
    platform: parsed.data.platform,
    label: parsed.data.label?.trim() || getPlatform(parsed.data.platform).label,
    url: parsed.data.url,
    order: nextOrder,
  });

  return NextResponse.json(
    { id: link._id.toString(), platform: link.platform, label: link.label, url: link.url, order: link.order },
    { status: 201 },
  );
}
