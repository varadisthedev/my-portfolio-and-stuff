"use client";

import { stackCategories, visualProof } from "@/lib/stack";
import { CategoryCard } from "./CategoryCard";
import { VisualProofCard } from "./VisualProofCard";

export function StackGrid() {
  return (
    <div className="flex flex-col gap-20">
      {/* ── Category grid ── */}
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 xl:grid-cols-4">
        {stackCategories.map((cat) => (
          <CategoryCard key={cat.id} category={cat} />
        ))}
      </div>

      {/* ── Visual Proof divider ── */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <span className="h-px flex-1 bg-outline-variant" />
          <span className="font-code-label text-xs uppercase tracking-widest text-muted-foreground">
            Visual Proof
          </span>
          <span className="h-px flex-1 bg-outline-variant" />
        </div>

        {/* ── Proof cards grid ── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {visualProof.map((item) => (
            <VisualProofCard key={item.tech} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
