import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { verifySession } from "@/lib/auth/session";
import connectToMongo from "@/lib/db/connect";
import DomainModel from "@/lib/db/models/Domain";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "@/components/auth/logout-button";
import { AdminDomainManager, type DomainRecord } from "@/components/auth/admin-domain-manager";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await verifySession();
  if (!session) {
    redirect("/login");
  }

  await connectToMongo();
  const domains = await DomainModel.find().sort({ createdAt: 1 }).lean();

  const domainRecords: DomainRecord[] = domains.map((domain) => ({
    id: domain._id.toString(),
    name: domain.name,
    url: domain.url,
    createdAt: domain.createdAt.toISOString(),
  }));

  return (
    <main className="min-h-screen">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link href="/" className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-ink">
              <ArrowLeft size={13} />
              Back to status page
            </Link>
            <h1 className="mt-1 text-2xl font-semibold text-ink">Manage domains</h1>
            <p className="mt-0.5 text-sm text-ink-secondary">Signed in as {session.username}</p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LogoutButton />
          </div>
        </header>

        <AdminDomainManager initialDomains={domainRecords} />
      </div>
    </main>
  );
}
