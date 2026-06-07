"use client";

import { StackCategory } from "@/lib/stack";
import { StackIcon } from "./StackIcon";
import { cn } from "@/lib/utils";

type CategoryCardProps = {
  category: StackCategory;
  /** Accent color class applied to the header line and pill */
  accentClass?: string;
};

// Color variants per category – add more as needed.
const accentMap: Record<string, string> = {
  frontend: "bg-primary/20 text-primary border-primary/30",
  backend: "bg-secondary/20 text-secondary border-secondary/30",
  database: "bg-tertiary/20 text-tertiary border-tertiary/30",
  devops: "bg-muted-foreground/20 text-muted-foreground border-muted-foreground/30",
};

const lineMap: Record<string, string> = {
  frontend: "bg-primary",
  backend: "bg-secondary",
  database: "bg-tertiary",
  devops: "bg-muted-foreground",
};

export function CategoryCard({ category }: CategoryCardProps) {
  const accent = accentMap[category.id] ?? accentMap.frontend;
  const line = lineMap[category.id] ?? lineMap.frontend;

  return (
    <div className="flex flex-col gap-4">
      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <span className={cn("h-px w-8 shrink-0", line)} />
        <span
          className={cn(
            "font-code-label text-xs uppercase tracking-widest border rounded-full px-2 py-0.5",
            accent
          )}
        >
          {category.label}
        </span>
      </div>

      {/* ── Tech item list ── */}
      <ul className="flex flex-col gap-2">
        {category.items.map((item) => (
          <li key={item.name}>
            <div
              className={cn(
                "group flex items-center gap-3 rounded-lg border border-outline-variant",
                "bg-surface-container-low px-4 py-3 transition-all duration-200",
                "hover:border-outline-variant/60 hover:bg-surface-container hover:-translate-y-[2px]",
                "hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
              )}
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-xl",
                  "shadow-lg",
                  "transition-all duration-300",
                  "group-hover:-translate-y-1",
                  "group-hover:shadow-xl"
                )}
              >
                <StackIcon id={item.icon} className="size-6" />
              </span>

              <span className="font-body-md text-foreground leading-none">
                {item.name}
              </span>
            </div>
          </li>
        ))}
      </ul>

      {/* ── Description ── */}
      <p className="font-code-label text-xs text-muted-foreground leading-relaxed px-1">
        {category.description}
      </p>
    </div>
  );
}
