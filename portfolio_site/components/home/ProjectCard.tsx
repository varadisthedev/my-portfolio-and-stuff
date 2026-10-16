"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Download } from "lucide-react";
import { SiGithub } from "react-icons/si";
import { motion, useInView, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { SkillTag } from "@/components/ui/SkillTag";
import type { Project } from "@/lib/projects";
import { cn } from "@/lib/utils";

/** The opening shot gets long enough to actually read the UI in it; the
 * rest are a tour, so they move at a browsing pace. */
const FIRST_SLIDE_MS = 3000;
const SLIDE_MS = 2000;

/** Decorative title-bar glyphs: minimize, maximize, close. Purely part of
 * the window dressing — not controls, so they're aria-hidden rather than
 * buttons that would promise something. */
const CHROME_GLYPHS = ["–", "☐", "✕"];

/** Raised-then-shadowed edges on a flat fill — the whole Win9x bevel is
 * just light on the top/left and dark on the bottom/right. */
const BEVEL_UP =
  "border border-t-foreground/35 border-l-foreground/35 border-r-black/60 border-b-black/60";

/** Decelerating cubic — fast off the mark, long settle. Typed as a tuple
 * so it still reads as a bezier once it's out of an inline literal. */
const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

type SlideState = { index: number; prev: number };

function WindowChrome({ label, counter }: { label: string; counter?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 bg-surface-container px-2 py-1.5",
        BEVEL_UP,
        "border-b-outline-variant"
      )}
    >
      <span
        aria-hidden
        className={cn("size-3.5 shrink-0 bg-primary/70", BEVEL_UP)}
      />
      <span className="truncate font-code-label text-[11px] text-foreground/80">
        {label}
      </span>
      <span className="ml-auto flex shrink-0 items-center gap-1.5">
        {counter ? (
          <span className="font-code-label text-[10px] text-muted-foreground/70 tabular-nums">
            {counter}
          </span>
        ) : null}
        <span className="flex items-center gap-[3px]" aria-hidden>
          {CHROME_GLYPHS.map((glyph) => (
            <span
              key={glyph}
              className={cn(
                "flex size-4 items-center justify-center bg-foreground/10 pb-px text-[9px] leading-none text-foreground/70",
                BEVEL_UP
              )}
            >
              {glyph}
            </span>
          ))}
        </span>
      </span>
    </div>
  );
}

function ProjectWindow({ project }: { project: Project }) {
  const { images, title } = project;
  const frameRef = useRef<HTMLDivElement>(null);
  // Per-card rather than per-section: a card two screens down shouldn't be
  // burning timers and compositing layers because the heading is visible.
  const onScreen = useInView(frameRef, { amount: 0.35 });
  const reduceMotion = useReducedMotion();
  const [slide, setSlide] = useState<SlideState>({ index: 0, prev: -1 });

  const playing = onScreen && !reduceMotion && images.length > 1;
  const slideMs = slide.index === 0 ? FIRST_SLIDE_MS : SLIDE_MS;

  useEffect(() => {
    // One timer at a time, re-armed on every slide: scrolling away just
    // drops it (clearTimeout) and scrolling back re-arms from wherever the
    // deck stopped, so an off-screen card costs nothing.
    if (!playing) return;
    const timer = setTimeout(() => {
      setSlide(({ index }) => ({
        index: (index + 1) % images.length,
        prev: index,
      }));
    }, slideMs);
    return () => clearTimeout(timer);
  }, [playing, slide.index, slideMs, images.length]);

  return (
    <div className="shadow-[0_18px_40px_-24px_rgba(0,0,0,0.9)]">
      <WindowChrome
        label={project.previewLabel}
        counter={
          images.length > 1
            ? `${String(slide.index + 1).padStart(2, "0")}/${String(images.length).padStart(2, "0")}`
            : undefined
        }
      />

      <div
        ref={frameRef}
        // Matches the screenshots' own ~2.1 ratio, so object-cover has
        // nothing to crop and the frame never letterboxes.
        className={cn(
          "relative aspect-[21/10] w-full overflow-hidden bg-surface-container-low",
          BEVEL_UP,
          "border-t-black/60 border-l-black/60 border-r-foreground/20 border-b-foreground/20"
        )}
      >
        {images.map((src, i) => {
          const active = i === slide.index;
          const exiting = i === slide.prev && !active;
          return (
            <motion.div
              key={src}
              className="absolute inset-0"
              style={{ zIndex: active ? 2 : exiting ? 1 : 0 }}
              initial={false}
              // Every slide enters from the right and leaves to the left;
              // the ones parked off-screen jump between those two edges
              // with no transition, so nothing is ever seen flying the
              // wrong way on a loop-around.
              animate={{ x: active ? "0%" : exiting ? "-100%" : "100%" }}
              transition={
                active || exiting
                  ? { duration: 0.62, ease: EASE_OUT }
                  : { duration: 0 }
              }
            >
              <Image
                src={src}
                alt={`${title} screenshot ${i + 1} of ${images.length}`}
                fill
                sizes="(min-width: 1280px) 760px, (min-width: 768px) 60vw, 100vw"
                className="object-cover object-top"
              />
            </motion.div>
          );
        })}

        {images.length > 1 ? (
          <div className="absolute inset-x-0 bottom-0 z-[3] flex gap-1.5 bg-gradient-to-t from-black/55 to-transparent p-3 pt-8">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() =>
                  setSlide(({ index }) => ({ index: i, prev: index }))
                }
                aria-label={`Show ${title} screenshot ${i + 1}`}
                aria-current={i === slide.index}
                className="group/seg h-3 flex-1 cursor-pointer focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
              >
                <span className="block h-[3px] w-full overflow-hidden bg-white/25 transition-colors group-hover/seg:bg-white/50">
                  {i === slide.index && playing ? (
                    <motion.span
                      className="block h-full bg-primary"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: slideMs / 1000, ease: "linear" }}
                    />
                  ) : (
                    <span
                      className={cn(
                        "block h-full bg-primary/50",
                        i < slide.index ? "w-full" : "w-0"
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

export function ProjectCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const cardRef = useRef<HTMLElement>(null);
  // once: true — a card that re-collapsed behind you on the way back up
  // would feel broken rather than clever.
  const expanded = useInView(cardRef, { margin: "-18% 0px", once: true });
  const reduceMotion = useReducedMotion();
  const grow = { duration: reduceMotion ? 0 : 0.7, ease: EASE_OUT };
  const isDownload = Boolean(project.liveLabel);

  return (
    <motion.article
      ref={cardRef}
      // Collapsed, the card is just its title bar; the screenshot and the
      // write-up unfold into place as it comes up the viewport.
      className="group relative overflow-hidden border border-outline-variant bg-surface-container-low transition-colors hover:bg-surface-container"
      initial={false}
      animate={{ opacity: expanded ? 1 : 0.75 }}
      transition={grow}
    >
      <span
        aria-hidden
        className="absolute top-0 left-0 z-10 h-full w-0.5 origin-top scale-y-0 bg-primary transition-transform duration-500 group-hover:scale-y-100"
      />

      {/* Always visible — this row *is* the collapsed card. */}
      <div className="flex items-baseline gap-3 p-5 md:p-7">
        <span className="font-code-label text-secondary">
          {String(index + 1).padStart(2, "0")}
        </span>
        <h3 className="font-headline-md text-foreground transition-colors group-hover:text-primary">
          {project.title}
        </h3>
        <span
          aria-hidden
          className="ml-auto hidden h-px flex-1 self-center bg-outline-variant md:block"
        />
      </div>

      {/* One height animation for the whole body, so a collapsed card leaves
      no stranded padding behind and the screenshot + write-up unfold as a
      single move. */}
      <motion.div
        className="overflow-hidden"
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}
        transition={grow}
      >
        <motion.div
          className="grid gap-6 px-5 pb-5 md:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] md:gap-8 md:px-7 md:pb-7"
          initial={{ y: 18 }}
          animate={{ y: expanded ? 0 : 18 }}
          transition={grow}
        >
          <ProjectWindow project={project} />

          <div className="flex flex-col gap-5">
            <p className="font-body-md text-muted-foreground">
              {project.description}
            </p>

            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <SkillTag key={tag} label={tag} />
              ))}
            </div>

            <div className="mt-auto flex flex-wrap items-center gap-3">
              <Button asChild className="h-11 px-5 font-code-label text-xs">
                <a href={project.liveHref} target="_blank" rel="noreferrer">
                  {project.liveLabel ?? "Live site"}
                  {isDownload ? (
                    <Download className="size-4" />
                  ) : (
                    <ArrowUpRight className="size-4 transition-transform group-hover/button:translate-x-0.5 group-hover/button:-translate-y-0.5" />
                  )}
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 px-5 font-code-label text-xs"
              >
                <a href={project.repoHref} target="_blank" rel="noreferrer">
                  <SiGithub className="size-4" />
                  Source
                </a>
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.article>
  );
}
