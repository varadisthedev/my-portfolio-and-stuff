"use client";

import { ProofItem } from "@/lib/stack";
import { StackIcon } from "./StackIcon";
import { cn } from "@/lib/utils";

type VisualProofCardProps = {
  item: ProofItem;
};

export function VisualProofCard({ item }: VisualProofCardProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col gap-3 overflow-hidden rounded-xl border border-outline-variant",
        "bg-surface-container-low p-5 transition-all duration-300",
        "hover:border-primary/40 hover:-translate-y-1",
        "hover:shadow-[0_8px_32px_rgba(192,193,255,0.08)]"
      )}
    >
      {/* Subtle gradient glow on hover */}
      <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Icon */}
      <span className="flex size-10 items-center justify-center rounded-lg bg-surface-container-highest text-primary transition-colors duration-200 group-hover:bg-primary/20">
        <StackIcon id={item.icon} className="size-5" />
      </span>

      {/* Tech name */}
      <p className="font-headline-md text-foreground leading-none">
        {item.tech}
      </p>

      {/* Proof detail */}
      <p className="font-code-label text-xs text-muted-foreground leading-relaxed">
        {item.detail}
      </p>
    </div>
  );
}
