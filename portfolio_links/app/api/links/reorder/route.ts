import { NextResponse } from "next/server";
import { z } from "zod";
import connectToMongo from "@/lib/db/connect";
import LinkModel from "@/lib/db/models/Link";
import { verifySession } from "@/lib/auth/session";

const ReorderSchema = z.object({
  ids: z.array(z.string()).min(1),
});

export async function POST(request: Request) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = ReorderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  await connectToMongo();
  await LinkModel.bulkWrite(
    parsed.data.ids.map((id, index) => ({
      updateOne: { filter: { _id: id }, update: { $set: { order: index } } },
    })),
  );

  return NextResponse.json({ ok: true });
}
