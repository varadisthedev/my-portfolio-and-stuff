import { cn } from "@/lib/utils";

type DialogBubbleProps = {
  text?: string;
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

/** A pixel-art comic speech bubble — white fill, black stepped border —
 * sized to whatever `text` is passed rather than a fixed pixel canvas, so
 * it works for any word/phrase. Trails off into two thought-dots instead of
 * a speech-bubble tail. Renders nothing without `text`, which is the only
 * thing that should ever mount this. Meant to be absolutely positioned by a
 * `relative`/positioned ancestor (see PixelCat, its one caller). */
export function DialogBubble({ text, className }: DialogBubbleProps) {
  if (!text) return null;

  return (
    <div aria-hidden className={cn("pointer-events-none absolute", className)}>
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
      {/* Thought trail, big dot first then a lone pixel further down toward
      the cat. Anchored by percentage, not a fixed px offset: PixelCat
      shifts this bubble left by ~55% of its own width so it sits above-left
      of the cat, which puts the cat roughly 60-70% of the way across the
      bubble regardless of how long `text` is. */}
      <ThoughtDot big style={{ top: "calc(100% + 6px)", left: "58%" }} />
      <ThoughtDot style={{ top: "calc(100% + 15px)", left: "67%" }} />
    </div>
  );
}
