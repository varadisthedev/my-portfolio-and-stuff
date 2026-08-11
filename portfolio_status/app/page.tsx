import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { getDashboardData } from "@/lib/dashboard";
import { ThemeToggle } from "@/components/theme-toggle";
import { OverallBanner } from "@/components/status/overall-banner";
import { StatTile } from "@/components/status/stat-tile";
import { DomainCard } from "@/components/status/domain-card";
import { AutoRefresh } from "@/components/status/auto-refresh";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { domains, overall } = await getDashboardData();

  return (
    <main className="min-h-screen">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-ink-muted">Global Status</p>
            <h1 className="mt-1 text-2xl font-semibold text-ink">Service Health</h1>
          </div>
          <div className="flex items-center gap-3">
            <AutoRefresh />
            <ThemeToggle />
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3 py-1.5 text-xs font-medium text-ink-secondary hover:text-ink"
            >
              <ShieldCheck size={13} />
              Admin
            </Link>
          </div>
        </header>

        <OverallBanner upCount={overall.upCount} downCount={overall.downCount} totalCount={overall.totalCount} />

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile
            label="Uptime (30d)"
            value={overall.uptime30d != null ? `${overall.uptime30d.toFixed(2)}%` : "—"}
            tone={overall.uptime30d != null && overall.uptime30d < 99 ? "critical" : "good"}
          />
          <StatTile label="Avg latency (24h)" value={overall.avgLatencyMs != null ? `${overall.avgLatencyMs} ms` : "—"} />
          <StatTile
            label="Services up"
            value={`${overall.upCount}/${overall.totalCount}`}
            tone={overall.downCount > 0 ? "critical" : "good"}
          />
          <StatTile
            label="Incidents (24h)"
            value={String(overall.incidents24h)}
            tone={overall.incidents24h > 0 ? "critical" : "good"}
          />
        </section>

        <section className="grid gap-4">
          {domains.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-hairline px-5 py-10 text-center text-sm text-ink-muted">
              No services configured yet. Sign in to the{" "}
              <Link href="/admin" className="text-accent hover:underline">
                admin dashboard
              </Link>{" "}
              to add one.
            </div>
          ) : (
            domains.map((domain) => <DomainCard key={domain.id} domain={domain} />)
          )}
        </section>

        <footer className="pb-4 text-center text-xs text-ink-muted">
          Checks run on a schedule and refresh here automatically.
        </footer>
      </div>
    </main>
  );
}
