import { cn } from "@/lib/utils";

export type DialogDirection = "up" | "left" | "right";

type DialogBubbleProps = {
  text?: string;
  /** The bubble always sits above the cat — this picks which way it leans:
   * "up" centers it, "left"/"right" shift it to sit top-left/top-right
   * instead. The thought-trail dots flip to match, so they always lead
   * from the bubble back down toward the cat regardless of direction. */
  direction?: DialogDirection;
  className?: string;
};

// Single-step "pixel" notch at each corner (a right-angle cut, not a
// diagonal chamfer) — reads as blocky/8-bit rather than just "clipped".
const NOTCH = 6;
const BUBBLE_CLIP = `polygon(
  ${NOTCH}px 0, calc(100% - ${NOTCH}px) 0,
  calc(100% - ${NOTCH}px) ${NOTCH}px, 100% ${NOTCH}px,
  100% calc(100% - ${NOTCH}px), calc(100% - ${NOTCH}px) calc(100% - ${NOTCH}px),
  calc(100% - ${NOTCH}px) 100%, ${NOTCH}px 100%,
  ${NOTCH}px calc(100% - ${NOTCH}px), 0 calc(100% - ${NOTCH}px),
  0 ${NOTCH}px, ${NOTCH}px ${NOTCH}px
)`;

const INK = "#0a0a0a";
const PAPER = "#f5f4f2";
// One "pixel" unit for the thought-dots — matches the bubble's own border
// weight so the whole thing reads as one consistent pixel grid.
const PX = 3;

// "up" centers the bubble above the cat. "left"/"right" anchor its
// bottom-right/bottom-left *corner* at the cat's top-left/top-right corner
// (`bottom-full` + `right-full`/`left-full` together pin that corner, no
// centering translate) and grow away from there — the bubble ends up
// entirely to that side, not straddling the space above the cat's head.
const WRAPPER_POSITION: Record<DialogDirection, string> = {
  up: "bottom-full left-1/2 mb-6 -translate-x-1/2",
  left: "bottom-full right-full mb-2 mr-2",
  right: "bottom-full left-full mb-2 ml-2",
};

/** One dot in the thought trail. The small dot is a lone center pixel; the
 * big one adds a same-size pixel on each of the 4 cardinal sides — the
 * minimal pixel-art "circle" (a plus/diamond of 5 cells), not a literal
 * circle. Filled with `PAPER` (white), not `INK` — unlike the bubble's
 * border/text, these dots float over the page's own near-black background
 * rather than over the bubble's white fill, so a near-black dot was
 * invisible against it. White also matches the cat's own sprite color. */
function ThoughtDot({ big, style }: { big?: boolean; style: React.CSSProperties }) {
  return (
    <div
      className="absolute"
      style={{
        width: PX,
        height: PX,
        background: PAPER,
        boxShadow: big
          ? [
              `${PX}px 0 0 0 ${PAPER}`,
              `${-PX}px 0 0 0 ${PAPER}`,
              `0 ${PX}px 0 0 ${PAPER}`,
              `0 ${-PX}px 0 0 ${PAPER}`,
            ].join(", ")
          : undefined,
        ...style,
      }}
    />
  );
}

/** The thought trail. For "left"/"right" the bubble's near corner is
 * already pinned right at the cat's corner (see `WRAPPER_POSITION`), so
 * the dots just continue that same diagonal outward from `100%,100%` (or
 * its mirror) rather than tracking a percentage across the bubble — the
 * cat is right there at the corner, not somewhere along the bubble's
 * width. "up" still walks straight down the middle. */
function ThoughtTrail({ direction }: { direction: DialogDirection }) {
  if (direction === "left") {
    return (
      <>
        <ThoughtDot big style={{ top: "calc(100% + 3px)", left: "calc(100% + 1px)" }} />
        <ThoughtDot style={{ top: "calc(100% + 11px)", left: "calc(100% + 9px)" }} />
      </>
    );
  }
  if (direction === "right") {
    return (
      <>
        <ThoughtDot big style={{ top: "calc(100% + 3px)", right: "calc(100% + 1px)" }} />
        <ThoughtDot style={{ top: "calc(100% + 11px)", right: "calc(100% + 9px)" }} />
      </>
    );
  }
  return (
    <>
      <ThoughtDot big style={{ top: "calc(100% + 7px)", left: "42%" }} />
      <ThoughtDot style={{ top: "calc(100% + 17px)", left: "56%" }} />
    </>
  );
}

/** A pixel-art comic speech bubble — white fill, black stepped border —
 * sized to whatever `text` is passed rather than a fixed pixel canvas, so
 * it works for any word/phrase. Trails off into two thought-dots instead of
 * a speech-bubble tail, pointed back at the cat. Renders nothing without
 * `text`, which is the only thing that should ever mount this. Meant to be
 * absolutely positioned by a `relative`/positioned ancestor (see PixelCat,
 * its one caller). */
export function DialogBubble({ text, direction = "left", className }: DialogBubbleProps) {
  if (!text) return null;

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute", WRAPPER_POSITION[direction], className)}
    >
      <div
        className="border-[3px] px-2.5 py-1.5"
        style={{ clipPath: BUBBLE_CLIP, borderColor: INK, background: PAPER }}
      >
        <span
          className="font-pixel block leading-none whitespace-nowrap"
          style={{ color: INK, fontSize: 10 }}
        >
          {text}
        </span>
      </div>
      <ThoughtTrail direction={direction} />
    </div>
  );
}
