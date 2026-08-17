"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { domainLinks } from "@/lib/domains";
import { cn } from "@/lib/utils";

/**
 * Minimal replacement for the old drag-to-deform "island" — a small glass
 * vertical pill (matches SiteHeader's glass nav) listing the three domains
 * as stacked icon buttons. Nothing is labeled at rest — hovering (or
 * focusing) an item slides a shared highlight behind it and reveals its
 * label, including the current domain's "you're here" tag. The current
 * domain is inert either way, just unlabeled until you're actually near it.
 */
export function DomainSlider() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <nav
      aria-label="Other domains"
      className="fixed top-1/2 left-4 z-50 -translate-y-1/2 md:left-6"
      onMouseLeave={() => setActiveIndex(null)}
    >
      <div className="flex flex-col border border-outline-variant/60 bg-background/60 p-1 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        {domainLinks.map((domain, index) => {
          const Icon = domain.icon;
          const isActive = index === activeIndex;

          const content = (
            <>
              {isActive && (
                <motion.span
                  layoutId="domain-slider-active"
                  className="absolute inset-0 -z-10 border border-primary/30 bg-primary/10"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <Icon className="size-4" />
              <span
                className={cn(
                  "pointer-events-none absolute left-full ml-3 whitespace-nowrap border border-outline-variant/60 bg-background/90 px-2.5 py-1 font-code-label text-xs backdrop-blur-xl transition-opacity duration-150",
                  isActive ? "opacity-100" : "opacity-0",
                  domain.current ? "text-primary" : "text-foreground",
                )}
              >
                {domain.label}
                {domain.current && (
                  <span className="ml-1 text-muted-foreground">· current</span>
                )}
              </span>
            </>
          );

          const className = cn(
            "relative flex size-10 items-center justify-center transition-colors",
            domain.current
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground",
          );

          return domain.current ? (
            <div
              key={domain.id}
              aria-current="page"
              className={className}
              onMouseEnter={() => setActiveIndex(index)}
              onFocus={() => setActiveIndex(index)}
              tabIndex={-1}
            >
              {content}
            </div>
          ) : (
            <a
              key={domain.id}
              href={domain.href}
              target="_blank"
              rel="noreferrer"
              className={className}
              onMouseEnter={() => setActiveIndex(index)}
              onFocus={() => setActiveIndex(index)}
              aria-label={domain.label}
            >
              {content}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
