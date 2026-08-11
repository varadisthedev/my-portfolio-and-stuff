import { ArrowUpRight } from "lucide-react";
import { getPlatform } from "@/lib/platforms";

interface LinkRowProps {
  index: number;
  platform: string;
  label: string;
  url: string;
}

export function LinkRow({ index, platform, label, url }: LinkRowProps) {
  const { icon: Icon, color } = getPlatform(platform);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 rounded-md border border-border bg-surface px-3 py-2.5 transition-colors hover:border-border-bright hover:bg-surface-raised"
    >
      <span className="text-[11px] text-text-faint">{String(index).padStart(2, "0")}</span>
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-surface-raised"
        style={{ color }}
      >
        <Icon size={16} />
      </span>
      <span className="flex-1 truncate text-sm text-text">{label}</span>
      <ArrowUpRight size={14} className="text-text-faint transition-colors group-hover:text-accent" />
    </a>
  );
}
