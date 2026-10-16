"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

/** The opening shot gets long enough to actually read the UI in it; the
 * rest are a tour, so they move at a browsing pace. */
const FIRST_SLIDE_MS = 3000;
const SLIDE_MS = 2000;

type ProjectCarouselProps = {
  images: string[];
  title: string;
  /** Rendered in the window chrome — the live host, usually. */
  label: string;
};

export function ProjectCarousel({ images, title, label }: ProjectCarouselProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  // Per-card rather than per-section: a card two screens down shouldn't be
  // burning timers and compositing layers because the heading is visible.
  const inView = useInView(frameRef, { amount: 0.35 });
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  const playing = inView && !reduceMotion && images.length > 1;
  const slideMs = index === 0 ? FIRST_SLIDE_MS : SLIDE_MS;

  useEffect(() => {
    // One timer at a time, re-armed on every slide: scrolling away just
    // drops it (clearTimeout) and scrolling back re-arms from wherever the
    // deck stopped, so an off-screen card costs nothing.
    if (!playing) return;
    const timer = setTimeout(
      () => setIndex((i) => (i + 1) % images.length),
      slideMs
    );
    return () => clearTimeout(timer);
  }, [playing, index, slideMs, images.length]);

  return (
    <div className="relative">
      {/* Window chrome: these are screenshots of real deployed UIs, and the
      frame says so without a caption. */}
      <div className="flex items-center gap-2 border-b border-outline-variant bg-surface-container px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-foreground/15" />
          <span className="size-2.5 rounded-full bg-foreground/15" />
          <span className="size-2.5 rounded-full bg-foreground/15" />
        </span>
        <span className="truncate font-code-label text-[11px] text-muted-foreground">
          {label}
        </span>
        {images.length > 1 ? (
          <span className="ml-auto shrink-0 font-code-label text-[11px] text-muted-foreground/70 tabular-nums">
            {String(index + 1).padStart(2, "0")}/
            {String(images.length).padStart(2, "0")}
          </span>
        ) : null}
      </div>

      <div
        ref={frameRef}
        // Matches the screenshots' own ~2.1 ratio, so object-cover has
        // nothing to crop and the frame never letterboxes.
        className="group/frame relative aspect-[21/10] w-full overflow-hidden bg-surface-container-low"
      >
        {images.map((src, i) => {
          const active = i === index;
          return (
            <motion.div
              key={src}
              className="absolute inset-0"
              style={{ zIndex: active ? 1 : 0 }}
              initial={false}
              // Incoming slides settle out of a slight over-scale across
              // the whole slot, which reads as a slow drift rather than a
              // crossfade between two flat stills.
              animate={{ opacity: active ? 1 : 0, scale: active ? 1 : 1.05 }}
              transition={{
                opacity: { duration: 0.65, ease: "easeInOut" },
                scale: { duration: active ? slideMs / 1000 : 0.65, ease: "easeOut" },
              }}
            >
              <Image
                src={src}
                alt={`${title} screenshot ${i + 1} of ${images.length}`}
                fill
                sizes="(min-width: 1280px) 1200px, (min-width: 768px) 90vw, 100vw"
                className="object-cover object-top"
              />
            </motion.div>
          );
        })}

        {/* Grounds the screenshot against the content strip below instead of
        ending on a hard horizontal cut. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-24 bg-gradient-to-t from-background/80 to-transparent"
        />

        {images.length > 1 ? (
          <div className="absolute inset-x-0 bottom-0 z-[3] flex gap-1.5 p-4">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show ${title} screenshot ${i + 1}`}
                aria-current={i === index}
                className="group/seg h-3 flex-1 cursor-pointer focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
              >
                <span className="block h-[3px] w-full overflow-hidden rounded-full bg-foreground/20 transition-colors group-hover/seg:bg-foreground/40">
                  {i === index && playing ? (
                    <motion.span
                      className="block h-full rounded-full bg-primary"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: slideMs / 1000, ease: "linear" }}
                    />
                  ) : (
                    <span
                      className={cn(
                        "block h-full rounded-full bg-primary/50",
                        i < index ? "w-full" : "w-0"
                      )}
                    />
                  )}
                </span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
