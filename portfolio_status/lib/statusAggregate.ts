export interface RawCheck {
  status: "up" | "down";
  latencyMs: number | null;
  checkedAt: Date;
}

export type LiveStatus = "up" | "down" | "unknown";

export interface LatencyPoint {
  t: number;
  latencyMs: number | null;
}

export interface DayBucket {
  date: string;
  uptimePct: number | null;
  totalChecks: number;
}

export interface DomainAggregate {
  currentStatus: LiveStatus;
  currentLatencyMs: number | null;
  lastCheckedAt: Date | null;
  uptime24h: number | null;
  uptime7d: number | null;
  uptime30d: number | null;
  avgLatency24h: number | null;
  latencySeries24h: LatencyPoint[];
  dayBuckets: DayBucket[];
  incidents24h: number;
}

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

function uptimePctFor(checks: RawCheck[], sinceMs: number): number | null {
  const inWindow = checks.filter((c) => c.checkedAt.getTime() >= sinceMs);
  if (inWindow.length === 0) return null;
  const up = inWindow.filter((c) => c.status === "up").length;
  return (up / inWindow.length) * 100;
}

function avgLatencyFor(checks: RawCheck[], sinceMs: number): number | null {
  const values = checks
    .filter((c) => c.checkedAt.getTime() >= sinceMs && c.status === "up" && c.latencyMs != null)
    .map((c) => c.latencyMs as number);
  if (values.length === 0) return null;
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}

function buildDayBuckets(checks: RawCheck[], days: number): DayBucket[] {
  const now = new Date();
  const buckets: DayBucket[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const dayEnd = new Date(dayStart.getTime() + DAY);
    const dayChecks = checks.filter(
      (c) => c.checkedAt >= dayStart && c.checkedAt < dayEnd,
    );

    buckets.push({
      date: dayStart.toISOString().slice(0, 10),
      uptimePct: dayChecks.length
        ? (dayChecks.filter((c) => c.status === "up").length / dayChecks.length) * 100
        : null,
      totalChecks: dayChecks.length,
    });
  }

  return buckets;
}

function countIncidents(checksAsc: RawCheck[]): number {
  let incidents = 0;
  for (let i = 0; i < checksAsc.length; i++) {
    if (checksAsc[i].status === "down" && (i === 0 || checksAsc[i - 1].status === "up")) {
      incidents++;
    }
  }
  return incidents;
}

/** `checks` should be sorted descending by checkedAt (most recent first). */
export function aggregateDomain(checks: RawCheck[]): DomainAggregate {
  if (checks.length === 0) {
    return {
      currentStatus: "unknown",
      currentLatencyMs: null,
      lastCheckedAt: null,
      uptime24h: null,
      uptime7d: null,
      uptime30d: null,
      avgLatency24h: null,
      latencySeries24h: [],
      dayBuckets: buildDayBuckets([], 45),
      incidents24h: 0,
    };
  }

  const now = Date.now();
  const latest = checks[0];
  const checksAsc = [...checks].reverse();
  const last24h = checksAsc.filter((c) => c.checkedAt.getTime() >= now - DAY);

  return {
    currentStatus: latest.status,
    currentLatencyMs: latest.latencyMs,
    lastCheckedAt: latest.checkedAt,
    uptime24h: uptimePctFor(checks, now - DAY),
    uptime7d: uptimePctFor(checks, now - 7 * DAY),
    uptime30d: uptimePctFor(checks, now - 30 * DAY),
    avgLatency24h: avgLatencyFor(checks, now - DAY),
    latencySeries24h: last24h.map((c) => ({ t: c.checkedAt.getTime(), latencyMs: c.latencyMs })),
    dayBuckets: buildDayBuckets(checks, 45),
    incidents24h: countIncidents(last24h),
  };
}
