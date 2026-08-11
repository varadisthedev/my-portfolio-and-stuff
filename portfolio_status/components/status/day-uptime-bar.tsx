"use client";

import { cn } from "@/lib/utils";
import type { DayBucketView } from "@/lib/types";

function bucketTone(bucket: DayBucketView): "good" | "warning" | "serious" | "critical" | "none" {
  if (bucket.totalChecks === 0 || bucket.uptimePct === null) return "none";
  if (bucket.uptimePct >= 99.9) return "good";
  if (bucket.uptimePct >= 95) return "warning";
  if (bucket.uptimePct >= 50) return "serious";
  return "critical";
}

const TONE_CLASS: Record<ReturnType<typeof bucketTone>, string> = {
  good: "bg-status-good",
  warning: "bg-status-warning",
  serious: "bg-status-serious",
  critical: "bg-status-critical",
  none: "bg-grid",
};

const TONE_LABEL: Record<ReturnType<typeof bucketTone>, string> = {
  good: "Operational",
  warning: "Degraded",
  serious: "Partial outage",
  critical: "Major outage",
  none: "No data",
};

function formatDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function DayUptimeBar({ buckets }: { buckets: DayBucketView[] }) {
  return (
    <div>
      <div className="flex items-end gap-[3px]" role="img" aria-label={`Uptime for the last ${buckets.length} days`}>
        {buckets.map((bucket) => {
          const tone = bucketTone(bucket);
          const pctLabel = bucket.uptimePct === null ? "No data" : `${bucket.uptimePct.toFixed(2)}% uptime`;
          return (
            <div
              key={bucket.date}
              title={`${formatDate(bucket.date)} — ${TONE_LABEL[tone]} (${pctLabel})`}
              className={cn("h-8 flex-1 rounded-[4px]", TONE_CLASS[tone])}
            />
          );
        })}
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-ink-muted">
        <span>{buckets.length} days ago</span>
        <span>Today</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-ink-secondary">
        {(["good", "warning", "serious", "critical", "none"] as const).map((tone) => (
          <span key={tone} className="inline-flex items-center gap-1.5">
            <span className={cn("h-2.5 w-2.5 rounded-[2px]", TONE_CLASS[tone])} />
            {TONE_LABEL[tone]}
          </span>
        ))}
      </div>
    </div>
  );
}
