import { NextResponse } from "next/server";
import { z } from "zod";
import connectToMongo from "@/lib/db/connect";
import LinkModel from "@/lib/db/models/Link";
import { verifySession } from "@/lib/auth/session";
import { PLATFORM_KEYS } from "@/lib/platforms";

const UpdateSchema = z.object({
  platform: z.enum(PLATFORM_KEYS as [string, ...string[]]).optional(),
  label: z.string().trim().min(1).max(60).optional(),
  url: z.string().trim().min(1).max(2048).optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  await connectToMongo();
  const link = await LinkModel.findByIdAndUpdate(id, parsed.data, { new: true }).lean();
  if (!link) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: link._id.toString(),
    platform: link.platform,
    label: link.label,
    url: link.url,
    order: link.order,
  });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await connectToMongo();
  const deleted = await LinkModel.findByIdAndDelete(id).lean();
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
