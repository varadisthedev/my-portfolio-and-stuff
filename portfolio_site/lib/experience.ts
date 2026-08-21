// The career, rendered as a git history rather than a list of date ranges.
//
// Two roles are genuinely concurrent right now (Grovix and the GFG campus
// body), which a stacked timeline can only state in prose. A branch graph
// *shows* it: `main` is the trunk, every role is a branch off it, and two of
// them are still checked out. The promotion inside GFG becomes a real event on
// the lane instead of a second date range.
//
// Lane 1 is deliberately reused by `grovix` and `renovatio` — Renovatio merges
// back in Sep 2025, freeing the lane long before Grovix takes it in Jul 2026.
// Recycling a free lane is what real graph renderers do, and it keeps the
// gutter down to three columns.

export type BranchId = "main" | "grovix" | "gfg" | "renovatio";

export type Branch = {
  id: BranchId;
  /** Ref name shown in badges and the legend, e.g. "grovix/lms". */
  ref: string;
  /** Column index in the gutter. See the lane-reuse note above. */
  lane: number;
  /** CSS color for the rail, node and badge tint. Tokens only — the palette
   * rule (globals.css) is GitHub green + silver, nothing blue or violet. */
  color: string;
  /** Still checked out: gets a HEAD badge, a brighter rail and a pulsing node. */
  live: boolean;
};

/** A resume bullet, rendered as a child commit on its parent's lane. */
export type WorkCommit = {
  id: string;
  type: string;
  scope?: string;
  subject: string;
  /** The full sentence, shown under the commit line. */
  detail: string;
};

export type Commit = {
  id: string;
  branch: BranchId;
  /** Set on a merge commit: the branch it closes. Drives the elbow that spawns
   * that branch's lane below this row. */
  closes?: BranchId;
  kind: "head" | "commit" | "merge";
  date: string;
  /** Ref chip shown on this row. Per-commit, not per-branch: the GFG lane
   * carries `gfg/tech-lead` lower down and `gfg/outreach-lead` after the
   * promotion. */
  ref?: string;
  /** Conventional-commit pieces, colored token by token when rendered. */
  type: string;
  scope?: string;
  subject: string;
  role?: string;
  org?: string;
  location?: string;
  period?: string;
  tags?: string[];
  /** Extra ref chip beyond the branch's own, e.g. "merged". */
  note?: string;
  children?: WorkCommit[];
};

export const branches: Branch[] = [
  {
    id: "main",
    ref: "main",
    lane: 0,
    color: "var(--muted-foreground)",
    live: true,
  },
  {
    id: "grovix",
    ref: "grovix/lms",
    lane: 1,
    color: "var(--tertiary)",
    live: true,
  },
  {
    id: "gfg",
    ref: "gfg/outreach-lead",
    lane: 2,
    color: "var(--primary)",
    live: true,
  },
  {
    id: "renovatio",
    ref: "renovatio/mern-platform",
    lane: 1,
    color: "var(--secondary)",
    live: false,
  },
];

export const branchById = new Map(branches.map((branch) => [branch.id, branch]));

// Newest first, the way `git log` prints. Order matters — the solver below
// derives every lane span from these indices.
export const commits: Commit[] = [
  {
    id: "gfg-outreach",
    branch: "gfg",
    kind: "head",
    date: "Aug 2026",
    ref: "gfg/outreach-lead",
    type: "feat",
    scope: "gfg",
    subject: "step up as Outreach Lead",
    role: "Outreach Lead",
    org: "GeeksforGeeks Campus Body, RBU",
    location: "Nagpur, India",
    period: "Aug 2026 — Present",
    tags: ["Leadership", "Community", "Events"],
    children: [
      {
        id: "gfg-outreach-1",
        type: "feat",
        scope: "outreach",
        subject: "lead community outreach for the chapter",
        detail:
          "Promoted out of the technical team in Aug 2026 to run how the chapter reaches students on campus — programmes, partnerships and turnout for its flagship events.",
      },
      {
        id: "gfg-outreach-2",
        type: "chore",
        scope: "gfg",
        subject: "carry the event platforms forward",
        detail:
          "Still the person behind the web platforms built during the tech-lead run, now supporting them from the outreach side.",
      },
    ],
  },
  {
    id: "grovix",
    branch: "grovix",
    kind: "head",
    date: "Jul 2026",
    ref: "grovix/lms",
    type: "feat",
    scope: "grovix",
    subject: "join as Full Stack Developer Intern",
    role: "Full Stack Developer Intern",
    org: "Grovix Technologies",
    location: "Remote",
    period: "Jul 2026 — Present",
    tags: ["Next.js", "Express.js", "MongoDB", "Tailwind CSS", "NextAuth"],
    children: [
      {
        id: "grovix-1",
        type: "feat",
        scope: "lms",
        subject: "scalable Learning Management System",
        detail:
          "Building a scalable Learning Management System using Next.js, Express.js, MongoDB and Tailwind CSS, with secure REST APIs and NextAuth behind it.",
      },
      {
        id: "grovix-2",
        type: "feat",
        scope: "dashboards",
        subject: "role-based admin and student surfaces",
        detail:
          "Developing role-based Admin/Student dashboards covering course management, coding assessments and certificates, with an integrated LeetCode-style compiler.",
      },
    ],
  },
  {
    id: "renovatio-merge",
    branch: "main",
    closes: "renovatio",
    kind: "merge",
    date: "Sep 2025",
    type: "merge",
    subject: "branch 'renovatio/mern-platform'",
    note: "merged",
  },
  {
    id: "gfg-tech",
    branch: "gfg",
    kind: "commit",
    date: "Aug 2025",
    ref: "gfg/tech-lead",
    type: "feat",
    scope: "gfg",
    subject: "join the Technical team — UI/UX + Frontend",
    role: "Technical Team Lead (Web Development)",
    org: "GeeksforGeeks Campus Body, RBU",
    location: "Nagpur, India",
    period: "Aug 2025 — Aug 2026",
    tags: ["Next.js", "WebSockets", "MERN", "Figma"],
    children: [
      {
        id: "gfg-tech-1",
        type: "feat",
        scope: "design",
        subject: "UI/UX and frontend for the chapter's events",
        detail:
          "Joined the Technical domain as a UI/UX and Frontend Developer, designing and shipping the interfaces the chapter's events actually run on.",
      },
      {
        id: "gfg-tech-2",
        type: "feat",
        scope: "bytequest",
        subject: "flagship event platform, 2,173+ registrations",
        detail:
          "Engineered full-stack platforms for flagship coding events, including ByteQuest, which took 2,173+ registrations.",
      },
      {
        id: "gfg-tech-3",
        type: "feat",
        scope: "arena",
        subject: "Stranger Things coding arena, live leaderboard",
        detail:
          "Developed a Stranger Things-themed competitive coding platform with WebSockets, compiler integration and a live leaderboard, featuring 100+ teams.",
      },
    ],
  },
  {
    id: "renovatio",
    branch: "renovatio",
    kind: "commit",
    date: "Jul 2025",
    ref: "renovatio/mern-platform",
    type: "feat",
    scope: "renovatio",
    subject: "join as Full Stack Web Developer Intern",
    role: "Full Stack Web Developer Intern",
    org: "Renovatio Foundation",
    location: "Hybrid",
    period: "Jul 2025 — Sep 2025",
    tags: ["MongoDB", "Express", "React", "Node.js", "JWT", "Cloudinary"],
    children: [
      {
        id: "renovatio-1",
        type: "feat",
        scope: "platform",
        subject: "MERN build from scratch, JWT auth and RBAC",
        detail:
          "Built the NGO's complete MERN platform from scratch with JWT authentication, role-based access control and scalable REST APIs.",
      },
      {
        id: "renovatio-2",
        type: "feat",
        scope: "dashboards",
        subject: "admin and volunteer surfaces, Cloudinary uploads",
        detail:
          "Developed Admin and Volunteer dashboards, with Cloudinary handling media storage for everything volunteers submit.",
      },
      {
        id: "renovatio-3",
        type: "feat",
        scope: "attendance",
        subject: "geofenced, location-validated check-ins",
        detail:
          "Integrated geofencing-based attendance verification so volunteer submissions are validated against where they actually happened.",
      },
    ],
  },
];

// ─── Graph solver ────────────────────────────────────────────────────────────
// Everything below is pure arithmetic over the display-row list. Nothing is
// measured from the DOM — the stack diagram needed eight rewrites because it
// read `getBoundingClientRect` (see Decisions.md), and a rail that has to
// reflow with its rows must not depend on layout at all. Expanding a row just
// inserts child rows, and the spans recompute.

export type DisplayRow =
  | { kind: "commit"; id: string; commit: Commit }
  | {
      kind: "work";
      id: string;
      branch: BranchId;
      work: WorkCommit;
      /** Position under its parent, so the reveal staggers from the top. */
      childIndex: number;
    };

/** The visible row list: every commit, plus the children of any commit
 * currently expanded, inserted directly beneath their parent. */
export function buildRows(expanded: ReadonlySet<string>): DisplayRow[] {
  const rows: DisplayRow[] = [];
  for (const commit of commits) {
    rows.push({ kind: "commit", id: commit.id, commit });
    if (!expanded.has(commit.id)) continue;
    (commit.children ?? []).forEach((work, childIndex) => {
      rows.push({
        kind: "work",
        id: work.id,
        branch: commit.branch,
        work,
        childIndex,
      });
    });
  }
  return rows;
}

export type RailSegment = {
  branch: BranchId;
  lane: number;
  color: string;
  /** Rail above the node line — from the row's top edge down to the node. */
  above: boolean;
  /** Rail below the node line — from the node down to the row's bottom edge. */
  below: boolean;
  /** `main` running off the bottom of the graph: fades out instead of stopping. */
  fadeOut: boolean;
};

export type RailElbow = {
  branch: BranchId;
  lane: number;
  color: string;
  /** "in" = a branch ending, bending back into the trunk. Because we read
   * newest-first, that is its creation commit. "out" = a merge commit spawning
   * the branch's lane below this row. */
  direction: "in" | "out";
};

export type RowGraph = {
  segments: RailSegment[];
  elbows: RailElbow[];
};

/** Display-row span each branch's lane occupies, as [top, bottom]. */
function branchSpans(rows: DisplayRow[]) {
  const spans = new Map<BranchId, { top: number; bottom: number }>();

  for (const branch of branches) {
    // Bottom = the branch's own creation commit: the lowest row carrying it.
    let bottom = -1;
    for (let i = rows.length - 1; i >= 0; i -= 1) {
      const row = rows[i];
      const owner = row.kind === "commit" ? row.commit.branch : row.branch;
      if (owner === branch.id) {
        bottom = i;
        break;
      }
    }
    // The trunk never terminates — it runs off the bottom edge of the graph.
    if (branch.id === "main") bottom = rows.length - 1;
    if (bottom < 0) continue;

    // Top = row 0 if still checked out, else the merge commit that closed it.
    let top = 0;
    if (!branch.live) {
      const mergeRow = rows.findIndex(
        (row) => row.kind === "commit" && row.commit.closes === branch.id,
      );
      if (mergeRow >= 0) top = mergeRow;
    }
    spans.set(branch.id, { top, bottom });
  }

  return spans;
}

export function computeGraph(rows: DisplayRow[]): RowGraph[] {
  const spans = branchSpans(rows);
  const lastRow = rows.length - 1;

  return rows.map((_, r) => {
    const segments: RailSegment[] = [];
    const elbows: RailElbow[] = [];

    for (const branch of branches) {
      const span = spans.get(branch.id);
      if (!span || r < span.top || r > span.bottom) continue;

      const isTrunk = branch.id === "main";
      // A merged branch doesn't exist above its merge row; a live one runs
      // straight off the top edge of the graph.
      const startsHere = r === span.top && !branch.live;
      const endsHere = r === span.bottom;

      // The trunk keeps going past the last row instead of stopping at a node.
      const below = !endsHere || (isTrunk && endsHere);

      segments.push({
        branch: branch.id,
        lane: branch.lane,
        color: branch.color,
        above: !startsHere,
        below,
        fadeOut: isTrunk && r === lastRow,
      });

      if (startsHere) {
        elbows.push({
          branch: branch.id,
          lane: branch.lane,
          color: branch.color,
          direction: "out",
        });
      }
      if (endsHere && !isTrunk) {
        elbows.push({
          branch: branch.id,
          lane: branch.lane,
          color: branch.color,
          direction: "in",
        });
      }
    }

    return { segments, elbows };
  });
}

/** Widest lane index in play — drives the gutter width. */
export const laneCount =
  branches.reduce((max, branch) => Math.max(max, branch.lane), 0) + 1;
