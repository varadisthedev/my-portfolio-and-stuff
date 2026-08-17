"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";

type CountUpProps = {
  value: number;
  duration?: number;
  className?: string;
  /** Bump this (e.g. an incrementing counter) to force a replay even while
   * still in view — e.g. from a manual refresh action. */
  replayToken?: number | string;
};

const numberFormatter = new Intl.NumberFormat("en-US");

/** Counts up from 0 to `value` every time it scrolls into view, eased out
 * so it settles rather than stopping dead — and resets back to 0 the
 * moment it scrolls out, so returning to it always replays the count. */
export function CountUp({ value, duration = 1.4, className, replayToken }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { margin: "-10% 0px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let raf: number;

    if (!inView) {
      raf = requestAnimationFrame(() => setDisplay(0));
      return () => cancelAnimationFrame(raf);
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      raf = requestAnimationFrame(() => setDisplay(value));
      return () => cancelAnimationFrame(raf);
    }

    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / (duration * 1000));
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(value * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration, replayToken]);

  return (
    <span ref={ref} className={className}>
      {numberFormatter.format(display)}
    </span>
  );
}
