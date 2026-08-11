export type LiveStatus = "up" | "down" | "unknown";

export interface LatencyPointView {
  t: number;
  latencyMs: number | null;
}

export interface DayBucketView {
  date: string;
  uptimePct: number | null;
  totalChecks: number;
}

export interface DomainView {
  id: string;
  name: string;
  url: string;
  currentStatus: LiveStatus;
  currentLatencyMs: number | null;
  lastCheckedAt: string | null;
  uptime24h: number | null;
  uptime7d: number | null;
  uptime30d: number | null;
  avgLatency24h: number | null;
  latencySeries24h: LatencyPointView[];
  dayBuckets: DayBucketView[];
  incidents24h: number;
}
