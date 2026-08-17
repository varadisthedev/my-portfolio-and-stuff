"use client";
//Red → "#ef4444"
// Blue → "#3b82f6"
// Green → "#22c55e"
// Yellow → "#facc15"
// Purple → "#a855f7"
// Black → "#000000"
// white -> f5f4f2
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

// Hand-drawn, verified as ASCII before being ported here (each row printed
// and eyeballed for ears/head/tail proportions) — 'X' body, 'o' tail,
// '.' empty. Kept tiny on purpose: a coarse cat-shaped blob is exactly what
// reads as "cat" at a few pixels tall — a black silhouette this size has no
// room for detail anyway, and pointy ears are the only signal that matters.
const CAT_GRID = [
  "..X.......X...",
  "..XX.....XX...",
  "..XXXXXXXXX...",
  ".XXXXXXXXXXX..",
  ".XXXXXXXXXXX..",
  "..XXXXXXXXXXo.",
  "..XXXXXXXXX.oo",
  "...XXXXXXX..oo",
  "...XXXXXX...o.",
  "....XXXXX.....",
];

const EYES: Array<[row: number, col: number]> = [
  [3, 4],
  [3, 9],
];

function buildShadow(px: number, color: string, cells: Array<[number, number]>) {
  return cells.map(([row, col]) => `${col * px}px ${row * px}px 0 0 ${color}`).join(", ");
}

const BODY_CELLS: Array<[number, number]> = [];
CAT_GRID.forEach((row, r) => {
  [...row].forEach((ch, c) => {
    if (ch === "X" || ch === "o") BODY_CELLS.push([r, c]);
  });
});

type PixelCatProps = {
  /** Pixels per grid cell — this is the whole size control. */
  size?: number;
  className?: string;
  /** Horizontal patrol distance in px. 0 keeps it in place (still blinks). */
  patrol?: number;
  /** Stagger multiple cats so they don't all move/blink in lockstep. */
  delay?: number;
  catColor?: string;
  catEyeColor?: string;
};

/** A tiny pixel-art white cat, single-div box-shadow technique (one real
 * pixel-sized div, every other "pixel" is a box-shadow offset from it) —
 * crisp at any zoom level, no image asset, and inherently blocky in a way
 * that fits a sharp-edged design system instead of fighting it. White so it
 * actually shows up against this site's near-black background (the
 * original black-on-black version was invisible). Blinks on a randomized
 * timer and, when `patrol` is set, paces back and forth. Purely decorative
 * (`aria-hidden`), meant to be absolutely positioned by a `relative`
 * parent. */
export function PixelCat({ size = 2, className, patrol = 0, delay = 0, catColor = "#f5f4f2", catEyeColor = "#000000" }: PixelCatProps) {
  const [blinking, setBlinking] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;
    let openTimer: ReturnType<typeof setTimeout>;
    let closeTimer: ReturnType<typeof setTimeout>;

    const scheduleBlink = () => {
      const wait = 2200 + Math.random() * 2800;
      openTimer = setTimeout(() => {
        setBlinking(true);
        closeTimer = setTimeout(() => {
          setBlinking(false);
          scheduleBlink();
        }, 130);
      }, wait);
    };

    scheduleBlink();
    return () => {
      clearTimeout(openTimer);
      clearTimeout(closeTimer);
    };
  }, [prefersReducedMotion]);

  const width = CAT_GRID[0].length * size;
  const height = CAT_GRID.length * size;

  return (
    <motion.div
      aria-hidden
      className={cn("pointer-events-none absolute", className)}
      style={{ width, height }}
      animate={
        prefersReducedMotion
          ? undefined
          : patrol > 0
            ? { x: [0, patrol, 0] }
            : { y: [0, -1, 0] }
      }
      transition={
        prefersReducedMotion
          ? undefined
          : {
            duration: patrol > 0 ? 6.5 : 2.4,
            repeat: Infinity,
            ease: "easeInOut",
            delay,
          }
      }
    >
      <div
        style={{
          position: "absolute",
          width: size,
          height: size,
          boxShadow: buildShadow(size, catColor, BODY_CELLS), // white: "#f5f4f2"
        }}
      />
      {!blinking && (
        <div
          style={{
            position: "absolute",
            width: size,
            height: size,
            boxShadow: buildShadow(size, catEyeColor, EYES),
          }}
        />
      )}
    </motion.div>
  );
}
