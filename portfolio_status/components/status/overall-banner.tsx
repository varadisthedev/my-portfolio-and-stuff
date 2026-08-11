import { CircleCheck, CircleAlert, CircleX } from "lucide-react";
import { cn } from "@/lib/utils";

export function OverallBanner({ upCount, downCount, totalCount }: { upCount: number; downCount: number; totalCount: number }) {
  const unknownCount = totalCount - upCount - downCount;

  let tone: "good" | "warning" | "critical" = "good";
  let message = "All systems operational";
  let Icon = CircleCheck;

  if (totalCount === 0) {
    tone = "warning";
    message = "No services configured yet";
    Icon = CircleAlert;
  } else if (downCount > 0) {
    tone = downCount === totalCount ? "critical" : "warning";
    Icon = downCount === totalCount ? CircleX : CircleAlert;
    message = `${downCount} of ${totalCount} service${totalCount === 1 ? "" : "s"} down`;
  } else if (unknownCount === totalCount) {
    tone = "warning";
    Icon = CircleAlert;
    message = "Waiting on first health check";
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border px-5 py-4",
        tone === "good" && "border-status-good/20 bg-status-good/10 text-status-good",
        tone === "warning" && "border-status-warning/30 bg-status-warning/10 text-status-warning",
        tone === "critical" && "border-status-critical/20 bg-status-critical/10 text-status-critical",
      )}
    >
      <Icon size={22} strokeWidth={2.25} />
      <p className="text-base font-medium">{message}</p>
    </div>
  );
}
