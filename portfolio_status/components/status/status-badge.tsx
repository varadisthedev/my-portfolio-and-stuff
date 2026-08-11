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

export function StatusBadge({ status, className }: { status: LiveStatus; className?: string }) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        config.className,
        className,
      )}
    >
      <Icon size={13} strokeWidth={2.5} />
      {config.label}
    </span>
  );
}
