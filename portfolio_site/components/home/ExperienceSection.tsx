"use client";

import { useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ChevronDown,
  GitBranch,
  MoreHorizontal,
  RefreshCw,
  Target,
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SectionKicker } from "@/components/ui/SectionKicker";
import { cn } from "@/lib/utils";
import {
  branchById,
  buildRows,
  commits,
  computeGraph,
} from "@/lib/experience";
import type {
  BranchId,
  Commit,
  DisplayRow,
  RailElbow,
  RailSegment,
  RowGraph,
  WorkCommit,
} from "@/lib/experience";

/** Horizontal center of a lane, in the gutter's coordinate space. The 0.5px
 * back-off puts the 1px rail on a whole pixel so it can't render as a 2px
 * half-lit smear, and lets the elbow borders land exactly on it. */
const laneX = (lane: number) =>
  `calc(var(--lane-pad) + ${lane} * var(--lane-gap) - 0.5px)`;

/** Width from the trunk out to `lane`, plus the 1px the rail itself occupies. */
const laneSpan = (lane: number) => `calc(${lane} * var(--lane-gap) + 1px)`;

const tint = (color: string, percent: number) =>
  `color-mix(in srgb, ${color} ${percent}%, transparent)`;

const legend: { ref: string; branch: BranchId }[] = [
  { ref: "main", branch: "main" },
  ...commits
    .filter((commit) => commit.ref)
    .map((commit) => ({ ref: commit.ref as string, branch: commit.branch })),
];

// ─── Rail ────────────────────────────────────────────────────────────────────

function Segment({
  segment,
  hasOutElbow,
  dimmed,
}: {
  segment: RailSegment;
  hasOutElbow: boolean;
  dimmed: boolean;
}) {
  const left = laneX(segment.lane);
  // A branch spawned by a merge starts below that row's elbow, not at the node.
  const belowTop = hasOutElbow
    ? "calc(var(--node-y) + var(--elbow-h))"
    : "var(--node-y)";

  return (
    <>
      {segment.above ? (
        <span
          className="absolute w-px transition-opacity duration-300"
          style={{
            left,
            top: 0,
            height: "var(--node-y)",
            background: segment.color,
            opacity: dimmed ? 0.14 : 0.75,
          }}
        />
      ) : null}
      {segment.below ? (
        <span
          className="absolute w-px transition-opacity duration-300"
          style={{
            left,
            top: belowTop,
            bottom: 0,
            background: segment.color,
            opacity: dimmed ? 0.14 : 0.75,
            // The trunk runs off the bottom of the graph rather than stopping
            // at a root node, so its last segment dissolves instead of ending.
            ...(segment.fadeOut
              ? {
                  maskImage: "linear-gradient(to bottom, black 10%, transparent)",
                  WebkitMaskImage:
                    "linear-gradient(to bottom, black 10%, transparent)",
                }
              : null),
          }}
        />
      ) : null}
    </>
  );
}

/** A rounded right-angle between a branch lane and the trunk, drawn with two
 * borders and one corner radius. Pure CSS, so it survives any row height and
 * needs no measurement — see the solver note in lib/experience.ts. */
function Elbow({ elbow, dimmed }: { elbow: RailElbow; dimmed: boolean }) {
  const incoming = elbow.direction === "in";

  return (
    <span
      className={cn(
        "absolute transition-opacity duration-300",
        incoming
          ? "rounded-br-[10px] border-r border-b"
          : "rounded-tr-[10px] border-t border-r",
      )}
      style={{
        left: laneX(0),
        top: "var(--node-y)",
        width: laneSpan(elbow.lane),
        height: "var(--elbow-h)",
        borderColor: elbow.color,
        opacity: dimmed ? 0.14 : 0.75,
      }}
    />
  );
}

function Node({
  kind,
  lane,
  color,
  dimmed,
  pulse,
}: {
  kind: "head" | "commit" | "merge" | "work";
  lane: number;
  color: string;
  dimmed: boolean;
  pulse: boolean;
}) {
  const size = kind === "work" ? 5 : kind === "head" ? 11 : 10;

  return (
    <span
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: laneX(lane), top: "var(--node-y)" }}
    >
      {pulse ? (
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full border"
          style={{ borderColor: color }}
          initial={{ scale: 1, opacity: 0.55 }}
          animate={{ scale: 2.6, opacity: 0 }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
        />
      ) : null}
      <span
        className={cn(
          "block rounded-full transition-opacity duration-300",
          kind === "merge" && "flex items-center justify-center",
        )}
        style={{
          width: size,
          height: size,
          opacity: dimmed ? 0.2 : 1,
          background:
            kind === "head" || kind === "work" ? color : "var(--background)",
          border: kind === "head" ? "none" : `2px solid ${color}`,
          boxShadow: kind === "head" && !dimmed ? `0 0 8px ${color}` : "none",
        }}
      >
        {kind === "merge" ? (
          <span
            className="block size-[3px] rounded-full"
            style={{ background: color }}
          />
        ) : null}
      </span>
    </span>
  );
}

function Rail({
  graph,
  nodeKind,
  nodeBranch,
  nodeLane,
  nodeColor,
  dimmedFor,
  pulse,
}: {
  graph: RowGraph;
  nodeKind: "head" | "commit" | "merge" | "work";
  nodeBranch: BranchId;
  nodeLane: number;
  nodeColor: string;
  dimmedFor: (branch: BranchId) => boolean;
  pulse: boolean;
}) {
  const outElbows = new Set(
    graph.elbows.filter((e) => e.direction === "out").map((e) => e.branch),
  );

  return (
    <div
      className="pointer-events-none absolute inset-y-0 left-0 w-(--gutter-w) overflow-hidden"
      aria-hidden
    >
      {graph.segments.map((segment) => (
        <Segment
          key={segment.branch}
          segment={segment}
          hasOutElbow={outElbows.has(segment.branch)}
          dimmed={dimmedFor(segment.branch)}
        />
      ))}
      {graph.elbows.map((elbow) => (
        <Elbow
          key={`${elbow.branch}-${elbow.direction}`}
          elbow={elbow}
          dimmed={dimmedFor(elbow.branch)}
        />
      ))}
      <Node
        kind={nodeKind}
        lane={nodeLane}
        color={nodeColor}
        dimmed={dimmedFor(nodeBranch)}
        pulse={pulse}
      />
    </div>
  );
}

// ─── Rows ────────────────────────────────────────────────────────────────────

function CommitMessage({
  type,
  scope,
  subject,
  color,
}: {
  type: string;
  scope?: string;
  subject: string;
  color: string;
}) {
  return (
    <span className="font-code-label text-[13px] break-words">
      <span style={{ color }}>{type}</span>
      {scope ? <span className="text-secondary">({scope})</span> : null}
      <span className="text-muted-foreground">:</span>{" "}
      <span className="text-foreground">{subject}</span>
    </span>
  );
}

function RefBadge({
  label,
  color,
  head,
}: {
  label: string;
  color: string;
  head?: boolean;
}) {
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1 border px-2 py-0.5 font-code-label text-[10px] whitespace-nowrap"
      style={{
        borderColor: tint(color, 35),
        backgroundColor: tint(color, 10),
        color,
      }}
    >
      {head ? <span className="text-primary">HEAD →</span> : null}
      {label}
    </span>
  );
}

function WorkRow({
  work,
  color,
  graph,
  branch,
  lane,
  dimmedFor,
  index,
  reduced,
}: {
  work: WorkCommit;
  color: string;
  graph: RowGraph;
  branch: BranchId;
  lane: number;
  dimmedFor: (branch: BranchId) => boolean;
  index: number;
  reduced: boolean;
}) {
  return (
    <motion.li
      layout={!reduced}
      className="relative overflow-hidden border-b border-outline-variant/40 bg-primary/[0.025] last:border-b-0"
      style={{ "--node-y": "17px" } as CSSProperties}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={
        reduced
          ? { duration: 0.12, ease: "linear" }
          : { duration: 0.32, ease: "easeOut", delay: index * 0.05 }
      }
    >
      <Rail
        graph={graph}
        nodeKind="work"
        nodeBranch={branch}
        nodeLane={lane}
        nodeColor={color}
        dimmedFor={dimmedFor}
        pulse={false}
      />
      <div className="py-2 pr-4 pl-(--gutter-w)">
        <p className="flex items-start gap-2">
          <span
            aria-hidden
            className="mt-px font-code-label text-[13px] text-primary/70"
          >
            +
          </span>
          <CommitMessage
            type={work.type}
            scope={work.scope}
            subject={work.subject}
            color={color}
          />
        </p>
        <p className="mt-1 max-w-2xl pl-4 font-body-md text-xs text-muted-foreground">
          {work.detail}
        </p>
      </div>
    </motion.li>
  );
}

function CommitRow({
  commit,
  graph,
  expanded,
  onToggle,
  onHover,
  dimmedFor,
  isDimmed,
  revealed,
  index,
  reduced,
  pulse,
}: {
  commit: Commit;
  graph: RowGraph;
  expanded: boolean;
  onToggle: () => void;
  onHover: (branch: BranchId | null) => void;
  dimmedFor: (branch: BranchId) => boolean;
  isDimmed: boolean;
  revealed: boolean;
  index: number;
  reduced: boolean;
  pulse: boolean;
}) {
  const branch = branchById.get(commit.branch)!;
  const color = branch.color;
  const expandable = (commit.children?.length ?? 0) > 0;

  const body = (
    <>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5 md:flex-nowrap">
        <CommitMessage
          type={commit.type}
          scope={commit.scope}
          subject={commit.subject}
          color={commit.kind === "merge" ? "var(--muted-foreground)" : color}
        />
        <span className="flex flex-wrap items-center gap-1.5">
          {commit.ref ? (
            <RefBadge
              label={commit.ref}
              color={color}
              head={commit.kind === "head"}
            />
          ) : null}
          {commit.note ? (
            <RefBadge label={commit.note} color="var(--muted-foreground)" />
          ) : null}
        </span>
        <span className="ml-auto hidden shrink-0 font-code-label text-[11px] text-muted-foreground tabular-nums md:block">
          {commit.date}
        </span>
      </div>

      {commit.role ? (
        <p className="mt-1.5 font-body-md text-xs text-muted-foreground">
          <span className="text-foreground">{commit.role}</span>
          {" · "}
          {commit.org}
          {" · "}
          {commit.location}
          <span className="md:hidden">
            {" · "}
            {commit.date}
          </span>
        </p>
      ) : null}

      {commit.tags?.length ? (
        <ul className="mt-2.5 flex flex-wrap gap-1.5">
          {commit.tags.map((tag) => (
            <li
              key={tag}
              className="border border-outline-variant/60 px-2 py-0.5 font-code-label text-[10px] text-muted-foreground"
            >
              {tag}
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );

  return (
    <motion.li
      className="group relative min-h-[54px] border-b border-outline-variant/60 transition-colors last:border-b-0 hover:bg-surface-container"
      style={{ "--node-y": "25px" } as CSSProperties}
      onMouseEnter={() => onHover(commit.branch)}
      onMouseLeave={() => onHover(null)}
      initial={reduced ? false : { opacity: 0, y: 6 }}
      animate={revealed ? { opacity: 1, y: 0 } : undefined}
      transition={
        reduced
          ? { duration: 0.15, ease: "linear" }
          : { duration: 0.45, ease: "easeOut", delay: index * 0.08 }
      }
    >
      <Rail
        graph={graph}
        nodeKind={commit.kind}
        nodeBranch={commit.branch}
        nodeLane={branch.lane}
        nodeColor={color}
        dimmedFor={dimmedFor}
        pulse={pulse}
      />

      {/* The green edge-marker every list row on this site gets on hover. */}
      <span
        aria-hidden
        className="absolute top-0 left-0 h-full w-0.5 scale-y-0 transition-transform duration-300 group-hover:scale-y-100"
        style={{ background: color, opacity: isDimmed ? 0 : 1 }}
      />

      {expandable ? (
        <button
          type="button"
          onClick={onToggle}
          onFocus={() => onHover(commit.branch)}
          onBlur={() => onHover(null)}
          aria-expanded={expanded}
          aria-controls={`commit-${commit.id}-body`}
          className="w-full cursor-pointer py-4 pr-10 pl-(--gutter-w) text-left"
        >
          {body}
          <ChevronDown
            className={cn(
              "absolute top-4 right-3 size-4 text-muted-foreground transition-transform duration-300",
              expanded && "rotate-180",
            )}
            aria-hidden
          />
          <span className="sr-only">
            {expanded ? "Hide" : "Show"} commits on this branch
          </span>
        </button>
      ) : (
        <div className="py-4 pr-4 pl-(--gutter-w)">{body}</div>
      )}
    </motion.li>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────

export function ExperienceSection() {
  const reduced = useReducedMotion() ?? false;
  const graphRef = useRef<HTMLDivElement>(null);
  // `once` for the entrance draw; the live view gates the HEAD pulse so the
  // only continuously-running animation here stops when it's off screen.
  const revealed = useInView(graphRef, { margin: "-12% 0px", once: true });
  const onScreen = useInView(graphRef, { margin: "0px" });

  // The current role starts open, so the graph reads dense on arrival rather
  // than as five lonely rows.
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(["gfg-outreach"]),
  );
  const [hovered, setHovered] = useState<BranchId | null>(null);
  const [pinned, setPinned] = useState<BranchId | null>(null);
  const active = pinned ?? hovered;

  const rows = useMemo(() => buildRows(expanded), [expanded]);
  const graphs = useMemo(() => computeGraph(rows), [rows]);

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const dimmedFor = (branch: BranchId) => active !== null && active !== branch;

  // Row index among commits only — child rows shouldn't shift the stagger.
  const commitIndex = new Map(commits.map((commit, i) => [commit.id, i]));

  return (
    <section
      id="experience"
      className="scroll-mt-32 border-t border-outline-variant py-(--spacing-stack-lg)"
    >
      <Container>
        <SectionKicker index="02" label="EXPERIENCE" />
        <h2 className="max-w-2xl font-headline-lg text-foreground">
          Three teams. Two of them are still checked out.
        </h2>
        <p className="mt-4 max-w-2xl font-body-lg text-muted-foreground">
          Read it the way you would read a commit history. <code>main</code> is
          me; every role is a branch off it. Renovatio merged back in when the
          internship ended — Grovix and the GeeksforGeeks chapter are both still
          open, which is why the graph forks and never rejoins.
        </p>
        <p className="mt-4 font-code-label text-[11px] text-muted-foreground/70">
          <span className="text-primary">$</span> git log --graph --all
          --author=varad
        </p>

        <div
          ref={graphRef}
          className="mt-(--spacing-stack-md) border border-outline-variant bg-background [--elbow-h:22px] [--gutter-w:62px] [--lane-gap:16px] [--lane-pad:16px] md:[--gutter-w:104px] md:[--lane-gap:24px] md:[--lane-pad:22px]"
        >
          {/* VS Code's source-control graph header. Decorative: these are the
          panel's affordances, not ours, so nothing here is interactive. */}
          <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low px-4 py-2.5">
            <span className="flex items-center gap-1.5 font-code-label text-[11px] tracking-widest text-muted-foreground">
              <ChevronDown className="size-3.5" aria-hidden />
              GRAPH
            </span>
            <span
              className="flex items-center gap-3 text-muted-foreground opacity-40"
              aria-hidden
            >
              <span className="hidden items-center gap-1 font-code-label text-[10px] sm:flex">
                <GitBranch className="size-3.5" />
                Auto
              </span>
              <Target className="hidden size-3.5 sm:block" />
              <ArrowDownToLine className="hidden size-3.5 sm:block" />
              <ArrowUpFromLine className="hidden size-3.5 sm:block" />
              <RefreshCw className="size-3.5" />
              <MoreHorizontal className="size-3.5" />
            </span>
          </div>

          <ul className="relative">
            <AnimatePresence initial={false}>
              {rows.map((row: DisplayRow, r) => {
                if (row.kind === "work") {
                  const branch = branchById.get(row.branch)!;
                  return (
                    <WorkRow
                      key={row.id}
                      work={row.work}
                      color={branch.color}
                      branch={row.branch}
                      lane={branch.lane}
                      graph={graphs[r]}
                      dimmedFor={dimmedFor}
                      index={row.childIndex}
                      reduced={reduced}
                    />
                  );
                }

                const { commit } = row;
                return (
                  <CommitRow
                    key={row.id}
                    commit={commit}
                    graph={graphs[r]}
                    expanded={expanded.has(commit.id)}
                    onToggle={() => toggle(commit.id)}
                    onHover={setHovered}
                    dimmedFor={dimmedFor}
                    isDimmed={dimmedFor(commit.branch)}
                    revealed={revealed}
                    index={commitIndex.get(commit.id) ?? 0}
                    reduced={reduced}
                    pulse={
                      commit.kind === "head" &&
                      onScreen &&
                      !reduced &&
                      !dimmedFor(commit.branch)
                    }
                  />
                );
              })}
            </AnimatePresence>
          </ul>
        </div>

        {/* Doubles as the touch affordance for the hover highlight. */}
        <ul className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          {legend.map((entry) => {
            const branch = branchById.get(entry.branch)!;
            const isActive = active === entry.branch;
            return (
              <li key={entry.ref}>
                <button
                  type="button"
                  onMouseEnter={() => setHovered(entry.branch)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(entry.branch)}
                  onBlur={() => setHovered(null)}
                  onClick={() =>
                    setPinned((prev) =>
                      prev === entry.branch ? null : entry.branch,
                    )
                  }
                  aria-pressed={pinned === entry.branch}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 font-code-label text-[11px] transition-opacity duration-300",
                    active !== null && !isActive
                      ? "opacity-30"
                      : "opacity-100",
                  )}
                >
                  <span
                    className="size-2 rounded-full"
                    style={{ background: branch.color }}
                    aria-hidden
                  />
                  <span
                    className={
                      isActive ? "text-foreground" : "text-muted-foreground"
                    }
                  >
                    {entry.ref}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
