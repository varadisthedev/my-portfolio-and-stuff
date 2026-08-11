import "server-only";
import connectToMongo from "@/lib/db/connect";
import DomainModel from "@/lib/db/models/Domain";
import StatusCheckModel from "@/lib/db/models/StatusCheck";
import { aggregateDomain, type RawCheck } from "@/lib/statusAggregate";
import type { DomainView } from "@/lib/types";

const HISTORY_WINDOW_DAYS = 45;

export interface DashboardData {
  domains: DomainView[];
  overall: {
    totalCount: number;
    upCount: number;
    downCount: number;
    avgLatencyMs: number | null;
    uptime30d: number | null;
    incidents24h: number;
  };
}

export async function getDashboardData(): Promise<DashboardData> {
  await connectToMongo();

  const domains = await DomainModel.find().sort({ createdAt: 1 }).lean();
  const since = new Date(Date.now() - HISTORY_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const domainViews: DomainView[] = await Promise.all(
    domains.map(async (domain) => {
      const checks = (await StatusCheckModel.find({ domain: domain._id, checkedAt: { $gte: since } })
        .sort({ checkedAt: -1 })
        .lean()) as unknown as RawCheck[];

      const aggregate = aggregateDomain(checks);

      return {
        id: domain._id.toString(),
        name: domain.name,
        url: domain.url,
        currentStatus: aggregate.currentStatus,
        currentLatencyMs: aggregate.currentLatencyMs,
        lastCheckedAt: aggregate.lastCheckedAt ? aggregate.lastCheckedAt.toISOString() : null,
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

  const latencies = domainViews.map((d) => d.avgLatency24h).filter((v): v is number => v != null);
  const avgLatencyMs = latencies.length ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : null;

  const uptimes = domainViews.map((d) => d.uptime30d).filter((v): v is number => v != null);
  const uptime30d = uptimes.length ? uptimes.reduce((a, b) => a + b, 0) / uptimes.length : null;

  const incidents24h = domainViews.reduce((sum, d) => sum + d.incidents24h, 0);

  return {
    domains: domainViews,
    overall: {
      totalCount: domainViews.length,
      upCount,
      downCount,
      avgLatencyMs,
      uptime30d,
      incidents24h,
    },
  };
}
