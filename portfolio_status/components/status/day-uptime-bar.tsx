"use client";

import { cn } from "@/lib/utils";
import { useIsClient } from "@/lib/use-is-client";
import type { DayBucketView, UptimeSegmentView } from "@/lib/types";

type Tone = "good" | "warning" | "serious" | "critical" | "none";

function toneForPct(uptimePct: number | null): Tone {
  if (uptimePct === null) return "none";
  if (uptimePct >= 99.9) return "good";
  if (uptimePct >= 95) return "warning";
  if (uptimePct >= 50) return "serious";
  return "critical";
}

const TONE_CLASS: Record<Tone, string> = {
  good: "bg-status-good",
  warning: "bg-status-warning",
  serious: "bg-status-serious",
  critical: "bg-status-critical",
  none: "bg-grid",
};

const TONE_LABEL: Record<Tone, string> = {
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

function formatTime(ms: number) {
  return new Date(ms).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function segmentTitle(bucket: DayBucketView, segment: UptimeSegmentView) {
  const tone = toneForPct(segment.uptimePct);
  const when =
    segment.startMs === segment.endMs
      ? formatTime(segment.startMs)
      : `${formatTime(segment.startMs)}–${formatTime(segment.endMs)}`;
  const checks = `${segment.totalChecks} check${segment.totalChecks === 1 ? "" : "s"}`;

  return `${formatDate(bucket.date)} ${when} — ${TONE_LABEL[tone]} (${segment.uptimePct.toFixed(2)}% over ${checks})`;
}

function dayTitle(bucket: DayBucketView) {
  return `${formatDate(bucket.date)} — No data (no checks ran)`;
}

export function DayUptimeBar({ buckets }: { buckets: DayBucketView[] }) {
  // Tooltips render dates and times in the viewer's locale and timezone, which
  // the server can't predict — hold them back until after hydration.
  const isClient = useIsClient();

  return (
    <div>
      <div
        className="flex items-end gap-[3px]"
        role="img"
        aria-label={`Uptime for the last ${buckets.length} days, one slice per run of checks`}
      >
        {buckets.map((bucket) => (
          <div key={bucket.date} className="flex h-8 flex-1 gap-px">
            {bucket.segments.length === 0 ? (
              <div
                title={isClient ? dayTitle(bucket) : undefined}
                className={cn("h-full flex-1 rounded-[4px]", TONE_CLASS.none)}
              />
            ) : (
              bucket.segments.map((segment, index) => (
                <div
                  key={`${segment.startMs}-${index}`}
                  title={isClient ? segmentTitle(bucket, segment) : undefined}
                  className={cn(
                    "h-full min-w-px flex-1",
                    TONE_CLASS[toneForPct(segment.uptimePct)],
                    index === 0 && "rounded-l-[4px]",
                    index === bucket.segments.length - 1 && "rounded-r-[4px]",
                  )}
                />
              ))
            )}
          </div>
        ))}
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
