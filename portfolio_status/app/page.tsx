import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { getDashboardData } from "@/lib/dashboard";
import { verifySession } from "@/lib/auth/session";
import { ThemeToggle } from "@/components/theme-toggle";
import { OverallBanner } from "@/components/status/overall-banner";
import { StatTile } from "@/components/status/stat-tile";
import { DomainList } from "@/components/status/domain-list";
import { AutoRefresh } from "@/components/status/auto-refresh";
import { RefreshButton } from "@/components/status/refresh-button";
import { LatencyPanel } from "@/components/status/latency-panel";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [{ domains, overall, latency }, session] = await Promise.all([getDashboardData(), verifySession()]);
  const allStale = overall.totalCount > 0 && overall.staleCount === overall.totalCount;

  return (
    <main className="min-h-screen">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-ink-muted">Global Status</p>
            <h1 className="mt-1 text-2xl font-semibold text-ink">Service Health</h1>
          </div>
          <div className="flex items-center gap-3">
            <AutoRefresh lastCheckedAt={overall.lastCheckedAt} isStale={allStale} isAdmin={session !== null} />
            <RefreshButton />
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

        {/* lg+: services on the left, sticky latency panel on the right. Below lg the panel
            sits between the stats and the service list. The 1fr row takes any extra height
            the panel needs, so it never opens a gap under the stats. */}
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:grid-rows-[auto_1fr]">
          <div className="flex flex-col gap-6">
            <OverallBanner
              upCount={overall.upCount}
              downCount={overall.downCount}
              totalCount={overall.totalCount}
              staleCount={overall.staleCount}
            />

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
          </div>

          <aside className="lg:sticky lg:top-6 lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <LatencyPanel history={latency} />
          </aside>

          <div className="lg:col-start-1">
            {domains.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-hairline px-5 py-10 text-center text-sm text-ink-muted">
                No services configured yet. Sign in to the{" "}
                <Link href="/admin" className="text-accent hover:underline">
                  admin dashboard
                </Link>{" "}
                to add one.
              </div>
            ) : (
              <DomainList domains={domains} />
            )}
          </div>
        </div>

        <footer className="pb-4 text-center text-xs text-ink-muted">
          Every check adds a slice to a service&rsquo;s day — grey means no check ran. Refresh to record one now.
        </footer>
      </div>
    </main>
  );
}
