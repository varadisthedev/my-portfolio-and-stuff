import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth/session";
import connectToMongo from "@/lib/db/connect";
import LinkModel from "@/lib/db/models/Link";
import { AdminLinksManager } from "@/components/admin/AdminLinksManager";

export default async function AdminPage() {
  const session = await verifySession();
  if (!session) {
    redirect("/login?next=/admin");
  }

  await connectToMongo();
  const links = await LinkModel.find().sort({ order: 1 }).lean();

  return (
    <main className="relative min-h-screen">
      <AdminLinksManager
        initialLinks={links.map((link) => ({
          id: link._id.toString(),
          platform: link.platform,
          label: link.label,
          url: link.url,
          order: link.order,
        }))}
      />
    </main>
  );
}

export const dynamic = "force-dynamic";
