import "server-only";
import connectToMongo from "@/lib/db/connect";
import {
  aggregateDomain,
  DEFAULT_STALE_AFTER_MS,
  HISTORY_DAYS,
  type RawCheck,
} from "@/lib/statusAggregate";
import type { DomainView } from "@/lib/types";

export interface DashboardData {
  domains: DomainView[];
  overall: {
    totalCount: number;
    upCount: number;
    downCount: number;
    staleCount: number;
    avgLatencyMs: number | null;
    uptime30d: number | null;
    incidents24h: number;
    /** Most recent check written by any scheduler or manual refresh. */
    lastCheckedAt: string | null;
    /** When this page was rendered — used to keep client-side "x ago" honest. */
    generatedAt: string;
  };
}

function staleAfterMs(): number {
  const minutes = Number(process.env.STALE_AFTER_MINUTES);
  return Number.isFinite(minutes) && minutes > 0 ? minutes * 60 * 1000 : DEFAULT_STALE_AFTER_MS;
}

export async function getDashboardData(): Promise<DashboardData> {
  const { Domain, StatusCheck } = await connectToMongo();

  const now = new Date();
  const domains = await Domain.find().sort({ createdAt: 1 }).lean();
  const since = new Date(now.getTime() - HISTORY_DAYS * 24 * 60 * 60 * 1000);
  const options = { now, staleAfterMs: staleAfterMs(), days: HISTORY_DAYS };

  const domainViews: DomainView[] = await Promise.all(
    domains.map(async (domain) => {
      const checks = (await StatusCheck.find({ domain: domain._id, checkedAt: { $gte: since } })
        .sort({ checkedAt: -1 })
        .lean()) as unknown as RawCheck[];

      const aggregate = aggregateDomain(checks, options);

      return {
        id: domain._id.toString(),
        name: domain.name,
        url: domain.url,
        currentStatus: aggregate.currentStatus,
        currentLatencyMs: aggregate.currentLatencyMs,
        lastCheckedAt: aggregate.lastCheckedAt ? aggregate.lastCheckedAt.toISOString() : null,
        isStale: aggregate.isStale,
        uptime24h: aggregate.uptime24h,
        uptime7d: aggregate.uptime7d,
        uptime30d: aggregate.uptime30d,
        avgLatency24h: aggregate.avgLatency24h,
        latencySeries24h: aggregate.latencySeries24h,
        dayBuckets: aggregate.dayBuckets,
        incidents24h: aggregate.incidents24h,
      };
    }),
  );

  const upCount = domainViews.filter((d) => d.currentStatus === "up").length;
  const downCount = domainViews.filter((d) => d.currentStatus === "down").length;
  const staleCount = domainViews.filter((d) => d.isStale).length;

  const latencies = domainViews.map((d) => d.avgLatency24h).filter((v): v is number => v != null);
  const avgLatencyMs = latencies.length ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : null;

  const uptimes = domainViews.map((d) => d.uptime30d).filter((v): v is number => v != null);
  const uptime30d = uptimes.length ? uptimes.reduce((a, b) => a + b, 0) / uptimes.length : null;

  const incidents24h = domainViews.reduce((sum, d) => sum + d.incidents24h, 0);

  const lastCheckedMs = domainViews
    .map((d) => (d.lastCheckedAt ? new Date(d.lastCheckedAt).getTime() : null))
    .filter((v): v is number => v != null);

  return {
    domains: domainViews,
    overall: {
      totalCount: domainViews.length,
      upCount,
      downCount,
      staleCount,
      avgLatencyMs,
      uptime30d,
      incidents24h,
      lastCheckedAt: lastCheckedMs.length ? new Date(Math.max(...lastCheckedMs)).toISOString() : null,
      generatedAt: now.toISOString(),
    },
  };
}
