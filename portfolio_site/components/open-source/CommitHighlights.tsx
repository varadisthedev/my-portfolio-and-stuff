"use client";

type CommitStat = {
  id: string;
  label: string;
  value: string;
  sublabel: string;
  icon: string;
  accent: string;
};

const stats: CommitStat[] = [
  {
    id: "total-commits",
    label: "Total Commits",
    value: "293+",
    sublabel: "across public repos",
    icon: "⬡",
    accent: "#c0c1ff",
  },
  {
    id: "gsoc-commits",
    label: "GSoC Commits",
    value: "80+",
    sublabel: "merged into upstream",
    icon: "◈",
    accent: "#4285F4",
  },
  {
    id: "hacktober-prs",
    label: "Hacktoberfest PRs",
    value: "4",
    sublabel: "all merged & validated",
    icon: "◆",
    accent: "#ff6b35",
  },
  {
    id: "repos-touched",
    label: "Repos Contributed",
    value: "6+",
    sublabel: "TypeScript / JS ecosystem",
    icon: "◉",
    accent: "#4cd7f6",
  },
];

export function CommitHighlights() {
  return (
    <section className="mt-12">
      <h2 className="font-headline-md text-foreground mb-6">Commit Highlights</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.id}
            className="relative rounded-xl p-5 overflow-hidden group transition-transform duration-300 hover:-translate-y-1"
            style={{
              background: "#1c1b1b",
              border: `1px solid #464554`,
            }}
          >
            {/* glow orb */}
            <div
              className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-500 blur-xl"
              style={{ background: s.accent }}
            />

            <span
              className="text-2xl mb-3 block transition-transform duration-300 group-hover:scale-110"
              style={{ color: s.accent }}
            >
              {s.icon}
            </span>

            <p
              className="text-2xl font-bold font-mono"
              style={{ color: s.accent }}
            >
              {s.value}
            </p>
            <p className="text-xs font-semibold text-foreground mt-1">{s.label}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{s.sublabel}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
