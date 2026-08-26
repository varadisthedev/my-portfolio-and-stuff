import { CircleCheck, CircleX, CircleDashed } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LiveStatus } from "@/lib/types";

const STATUS_CONFIG: Record<LiveStatus, { label: string; icon: typeof CircleCheck; className: string }> = {
  up: {
    label: "Operational",
    icon: CircleCheck,
    className: "text-status-good bg-status-good/10",
  },
  down: {
    label: "Down",
    icon: CircleX,
    className: "text-status-critical bg-status-critical/10",
  },
  unknown: {
    label: "No data",
    icon: CircleDashed,
    className: "text-ink-muted bg-ink-muted/10",
  },
};

export function StatusBadge({
  status,
  stale = false,
  className,
}: {
  status: LiveStatus;
  /** Last check is old enough that this reading is history, not a live state. */
  stale?: boolean;
  className?: string;
}) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  const showStale = stale && status !== "unknown";

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
          showStale ? "text-ink-muted bg-ink-muted/10" : config.className,
          className,
        )}
      >
        <Icon size={13} strokeWidth={2.5} />
        {config.label}
      </span>
      {showStale ? (
        <span
          title="No recent check — this is the last known state, not a live reading."
          className="rounded-full bg-status-warning/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-status-warning"
        >
          Stale
        </span>
      ) : null}
    </span>
  );
}
