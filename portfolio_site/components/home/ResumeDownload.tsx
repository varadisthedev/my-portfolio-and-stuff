"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";

const SIZE = 64;
const STROKE = 2.5;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const DWELL_MS = 2000;
// Pixels of slack for "at the bottom," not exact equality. window.scrollY
// reaching *exactly* scrollHeight-innerHeight is not reliable to depend on:
// sub-pixel rounding on some browsers/zoom levels, and momentum/inertial
// scrolling (trackpads especially) can keep nudging scrollY by a px or two
// for a second or more after the user's input has visibly stopped. Either
// one meant scrollProgress kept landing at 0.997ish instead of exactly 1,
// so the old `scrollProgress < 1` check never actually let the dwell timer
// run — this tolerance is what makes "at the bottom" achievable at all.
const AT_BOTTOM_PX = 24;

function downloadResume() {
  const link = document.createElement("a");
  link.href = site.cvUrl;
  link.download = "";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * An arrow-in-a-circle that downloads the résumé automatically once you
 * scroll all the way to the bottom of the page and *stay* there — the ring
 * fills with scroll progress, and once you've been within `AT_BOTTOM_PX` of
 * the true bottom for `DWELL_MS` without scrolling back up, it fires on its
 * own: downloads the file and pulses a short, low-opacity ring outward from
 * the button — a cursor-locator-style ping (PowerToys' "find my mouse" on
 * Ctrl+double-tap) confirming the action landed. A plain click/tap (or
 * Enter/Space via keyboard focus) triggers it immediately instead of
 * waiting, both as an accessible fallback and a shortcut for anyone who
 * doesn't want to wait. Also carries `id="cv"` so SiteHeader's scrollspy
 * lights up a "CV" nav entry exactly like it does for every real section.
 */
export function ResumeDownload() {
  const ref = useRef<HTMLButtonElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [pingKey, setPingKey] = useState(0);
  const firedAtBottomRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const doc = document.documentElement;
      const maxScrollY = Math.max(1, doc.scrollHeight - window.innerHeight);
      const raw = window.scrollY / maxScrollY;
      setScrollProgress(Math.min(1, Math.max(0, raw)));
      setIsAtBottom(maxScrollY - window.scrollY <= AT_BOTTOM_PX);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    // Async content (the GitHub calendar fetches client-side) can grow the
    // page's height *after* the user has already scrolled to what was, at
    // that moment, the bottom — a plain resize listener only catches the
    // viewport changing, not the document's own content height changing
    // underneath it. Re-measure whenever that happens too.
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(document.body);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      resizeObserver.disconnect();
    };
  }, []);

  const triggerCompletion = useCallback(() => {
    setCompleted(true);
    setPingKey((key) => key + 1);
    downloadResume();
    window.setTimeout(() => setCompleted(false), 700);
  }, []);

  // Dwell watcher: depends on the *boolean* isAtBottom, not the raw
  // continuous scrollProgress float. That's the actual fix — a boolean
  // only changes value when crossing the AT_BOTTOM_PX threshold, so minor
  // jitter while genuinely sitting at the bottom (which constantly nudges
  // the float by fractions of a percent) no longer keeps re-triggering
  // this effect and restarting the timer before it can ever complete.
  useEffect(() => {
    if (!isAtBottom) {
      firedAtBottomRef.current = false;
      return;
    }
    if (firedAtBottomRef.current || completed) return;

    const timer = window.setTimeout(() => {
      firedAtBottomRef.current = true;
      triggerCompletion();
    }, DWELL_MS);

    return () => window.clearTimeout(timer);
  }, [isAtBottom, completed, triggerCompletion]);

  const handleClick = () => {
    firedAtBottomRef.current = true; // don't also auto-fire once dwell time is reached
    triggerCompletion();
  };

  // Once within tolerance, show the ring as genuinely complete rather than
  // whatever the unrounded float happens to be (which might visibly read
  // as, say, 98%) — the dwell countdown is already running at that point,
  // so the ring should agree that it's "done."
  const displayProgress = isAtBottom ? 1 : scrollProgress;
  const dwelling = isAtBottom && !completed;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <AnimatePresence>
          {completed && (
            <motion.span
              key={pingKey}
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-full border-2 border-white/70"
              initial={{ scale: 0.7, opacity: 0.6 }}
              animate={{ scale: 2.6, opacity: 0 }}
              transition={{ duration: 0.65, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>

        <button
          ref={ref}
          id="cv"
          type="button"
          aria-label="Download résumé (scroll to the bottom and wait, or click)"
          onClick={handleClick}
          className="group relative flex size-full scroll-mt-32 items-center justify-center select-none"
        >
          <svg width={SIZE} height={SIZE} className="-rotate-90">
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="var(--outline-variant)"
              strokeWidth={STROKE}
            />
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="#fff"
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * (1 - displayProgress)}
              style={{ transition: "stroke-dashoffset 0.25s ease-out" }}
            />
          </svg>
          <ArrowDown
            className={cn(
              "absolute size-5 text-foreground transition-transform duration-300",
              dwelling && "animate-pulse",
              completed && "scale-125 text-primary",
            )}
          />
        </button>
      </div>
      <span className="max-w-[11rem] text-center font-code-label text-[11px] tracking-wide text-muted-foreground uppercase">
        Scroll down and hold for résumé
      </span>
    </div>
  );
}
