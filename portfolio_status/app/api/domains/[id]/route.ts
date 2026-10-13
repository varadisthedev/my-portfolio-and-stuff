import { NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import connectToMongo from "@/lib/db/connect";
import { verifySession } from "@/lib/auth/session";
import { domainUrlSchema } from "@/lib/domain-url";

const UpdateSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100).optional(),
  url: domainUrlSchema.optional(),
});

export async function PATCH(request: Request, ctx: RouteContext<"/api/domains/[id]">) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid domain id" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  if (!parsed.data.name && !parsed.data.url) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const { Domain } = await connectToMongo();
  const domain = await Domain.findByIdAndUpdate(id, parsed.data, { new: true });
  if (!domain) {
    return NextResponse.json({ error: "Domain not found" }, { status: 404 });
  }

  return NextResponse.json({ id: domain._id.toString(), name: domain.name, url: domain.url, createdAt: domain.createdAt });
}

export async function DELETE(_request: Request, ctx: RouteContext<"/api/domains/[id]">) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid domain id" }, { status: 400 });
  }

  const { Domain, StatusCheck } = await connectToMongo();
  const domain = await Domain.findByIdAndDelete(id);
  if (!domain) {
    return NextResponse.json({ error: "Domain not found" }, { status: 404 });
  }
  await StatusCheck.deleteMany({ domain: id });

  return NextResponse.json({ ok: true });
}
