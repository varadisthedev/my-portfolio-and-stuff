import { cn } from "@/lib/utils";

export function StatTile({
  label,
  value,
  sublabel,
  tone = "default",
}: {
  label: string;
  value: string;
  sublabel?: string;
  tone?: "default" | "good" | "critical";
}) {
  return (
    <div className="rounded-xl border border-hairline bg-surface px-4 py-3.5">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">{label}</p>
      <p
        className={cn(
          "mt-1.5 text-2xl font-semibold tabular-nums",
          tone === "good" && "text-status-good",
          tone === "critical" && "text-status-critical",
          tone === "default" && "text-ink",
        )}
      >
        {value}
      </p>
      {sublabel ? <p className="mt-0.5 text-xs text-ink-secondary">{sublabel}</p> : null}
    </div>
  );
}
