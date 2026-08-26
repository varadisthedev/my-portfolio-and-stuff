"use client";

import { useMemo, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { DomainCard } from "@/components/status/domain-card";
import type { DomainView, LiveStatus } from "@/lib/types";

const STORAGE_KEY = "status:sort";

const SORTS = [
  { id: "working", label: "Working first" },
  { id: "down", label: "Down first" },
  { id: "name", label: "Name A–Z" },
] as const;

type SortId = (typeof SORTS)[number]["id"];

const DEFAULT_SORT: SortId = "working";

function isSortId(value: unknown): value is SortId {
  return SORTS.some((sort) => sort.id === value);
}

/**
 * The chosen sort lives in localStorage so it survives the dashboard's periodic
 * refreshes, read through an external store to stay hydration-safe.
 */
const listeners = new Set<() => void>();
let fallbackSort: SortId = DEFAULT_SORT;

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function readSort(): SortId {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isSortId(stored)) return stored;
  } catch {
    // Private mode or blocked storage — fall through to the in-memory value.
  }
  return fallbackSort;
}

function writeSort(next: SortId) {
  fallbackSort = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Non-fatal: the choice just won't survive a reload.
  }
  for (const onChange of listeners) onChange();
}

/** Working services rank first; anything without data sits between up and down. */
const STATUS_RANK: Record<LiveStatus, number> = { up: 0, unknown: 1, down: 2 };

function compareByName(a: DomainView, b: DomainView) {
  return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
}

function sortDomains(domains: DomainView[], sort: SortId): DomainView[] {
  const sorted = [...domains];

  if (sort === "name") {
    return sorted.sort(compareByName);
  }

  const direction = sort === "working" ? 1 : -1;
  return sorted.sort((a, b) => {
    const rank = (STATUS_RANK[a.currentStatus] - STATUS_RANK[b.currentStatus]) * direction;
    return rank !== 0 ? rank : compareByName(a, b);
  });
}

export function DomainList({ domains }: { domains: DomainView[] }) {
  const sort = useSyncExternalStore(subscribe, readSort, () => DEFAULT_SORT);
  const sorted = useMemo(() => sortDomains(domains, sort), [domains, sort]);

  return (
    <section className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] uppercase tracking-wide text-ink-muted">Sort</span>
        <div className="inline-flex rounded-full border border-hairline p-0.5" role="group" aria-label="Sort services">
          {SORTS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => writeSort(option.id)}
              aria-pressed={sort === option.id}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                sort === option.id ? "bg-accent/10 text-accent" : "text-ink-secondary hover:text-ink",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {sorted.map((domain) => (
        <DomainCard key={domain.id} domain={domain} />
      ))}
    </section>
  );
}
