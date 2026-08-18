"use client";
//Red → "#ef4444"
// Blue → "#3b82f6"
// Green → "#22c55e"
// Yellow → "#facc15"
// Purple → "#a855f7"
// Black → "#000000"
// white -> f5f4f2
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
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

// Happy/patted eyes: each eye is a tiny chevron, ">" on the left and "<" on
// the right, so together they read as the "><" squint emoticons make.
const HAPPY_EYES: Array<[row: number, col: number]> = [
  [2, 4], [3, 5], [4, 4],
  [2, 9], [3, 8], [4, 9],
];

function buildOutlineCells(cells: Array<[number, number]>) {
  const occupied = new Set(cells.map(([r, c]) => `${r},${c}`));
  const outline = new Set<string>();

  for (const [r, c] of cells) {
    for (const [dr, dc] of [
      [-1, 0],
      [0, -1],
      [0, 1],
      [1, 0],
    ]) {
      const key = `${r + dr},${c + dc}`;
      if (!occupied.has(key)) outline.add(key);
    }
  }

  return [...outline].map(key => key.split(",").map(Number) as [number, number]);
}

// function buildShadow(px: number, color: string, cells: Array<[number, number]>) {
//   return cells.map(([row, col]) => `${col * px}px ${row * px}px 0 0 ${color}`).join(", ");
// } 
function buildShadow(px: number, color: string, cells: Array<[number, number]>) {
  return cells
    .map(([row, col]) => `${col * px}px ${row * px}px 0 0 ${color}`)
    .join(", ");
}

const BODY_CELLS: Array<[number, number]> = [];
CAT_GRID.forEach((row, r) => {
  [...row].forEach((ch, c) => {
    if (ch === "X" || ch === "o") BODY_CELLS.push([r, c]);
  });
});

// Tiny pixel heart, released a few at a time when the cat is patted.
const HEART_GRID = [
  ".X.X.",
  "XXXXX",
  ".XXX.",
  "..X..",
];

const HEART_CELLS: Array<[number, number]> = [];
HEART_GRID.forEach((row, r) => {
  [...row].forEach((ch, c) => {
    if (ch === "X") HEART_CELLS.push([r, c]);
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
  catOutlineColor?: string;
  catHeartColor?: string;
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
export function PixelCat({ size = 2, className, patrol = 0, delay = 0, catColor = "#f5f4f2", catEyeColor = "#000000", catOutlineColor = "#d4d4d4", catHeartColor = "#ef4444" }: PixelCatProps) {
  const [blinking, setBlinking] = useState(false);
  const [isPatting, setIsPatting] = useState(false);
  const pattingTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    return () => {
      if (pattingTimeout.current) clearTimeout(pattingTimeout.current);
    };
  }, []);

  const handlePat = () => {
    setIsPatting(true);
    if (pattingTimeout.current) clearTimeout(pattingTimeout.current);
    pattingTimeout.current = setTimeout(() => setIsPatting(false), 650);
  };

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

  // The cat is a single div with a box-shadow for each pixel
  const width = (CAT_GRID[0].length + 2) * size;
  const height = (CAT_GRID.length + 2) * size;
  const OUTLINE_CELLS = buildOutlineCells(BODY_CELLS);
  const heartSize = Math.max(1, Math.floor(size / 2));
  const heartWidth = HEART_GRID[0].length * heartSize;
  const heartHeight = HEART_GRID.length * heartSize;
  // Stacked, not aligned in a row: topmost heart sits highest, the last one
  // starts right at the head and trails the other two up.
  const heartLayout = [
    { top: -heartHeight * 2.4, dx: -width * 0.1, delay: 0.22 },
    { top: -heartHeight * 1.3, dx: width * 0.1, delay: 0.11 },
    { top: -heartHeight * 0.2, dx: -width * 0.02, delay: 0 },
  ];

  return (
    <motion.div
      aria-hidden
      className={cn("absolute cursor-pointer", className)}
      style={{ width, height }}
      onClick={handlePat}
      animate={
        prefersReducedMotion || isPatting
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
      <motion.div
        style={{ position: "absolute", inset: 0, transformOrigin: "50% 100%" }}
        animate={{ scaleY: isPatting ? 0.8 : 1, scaleX: isPatting ? 1.08 : 1 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
      >
        {/* handling outline for cat */}
        <div
          style={{
            position: "absolute",
            width: size,
            height: size,
            boxShadow: buildShadow(size, catOutlineColor, OUTLINE_CELLS),
          }}
        />
        <div
          style={{
            position: "absolute",
            width: size,
            height: size,
            boxShadow: buildShadow(size, catColor, BODY_CELLS), // white: "#f5f4f2"
          }}
        />
        {isPatting ? (
          <div
            style={{
              position: "absolute",
              width: size,
              height: size,
              boxShadow: buildShadow(size, catEyeColor, HAPPY_EYES),
            }}
          />
        ) : (
          !blinking && (
            <div
              style={{
                position: "absolute",
                width: size,
                height: size,
                boxShadow: buildShadow(size, catEyeColor, EYES),
              }}
            />
          )
        )}
      </motion.div>

      <AnimatePresence>
        {isPatting &&
          heartLayout.map(({ top, dx, delay }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 0, scale: 0.4 }}
              animate={{ opacity: [0, 1, 1, 0], y: -heartHeight * 1.6, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={prefersReducedMotion ? { duration: 0.01 } : { duration: 0.6, delay, ease: "easeOut" }}
              style={{
                position: "absolute",
                left: width / 2 + dx - heartWidth / 2,
                top,
                width: heartWidth,
                height: heartHeight,
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  width: heartSize,
                  height: heartSize,
                  boxShadow: buildShadow(heartSize, catHeartColor, HEART_CELLS),
                }}
              />
            </motion.div>
          ))}
      </AnimatePresence>
    </motion.div>
  );
}
