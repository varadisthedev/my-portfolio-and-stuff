// Ordered by what I'd want someone to look at first, not by stars — this
// account is too young for star counts to mean anything. GitArchy leads
// because it's the largest in scope; DupeLocatR closes because it's the
// smallest and the odd one out (a CLI, no live site).

export type Project = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  repoHref: string;
  /** Live deployment, or the next-best "try it" link (a release page for
   * things that aren't websites). */
  liveHref: string;
  /** Overrides the "Live site" button label when liveHref isn't a site. */
  liveLabel?: string;
  /** Shown in the fake browser/terminal chrome above the screenshots. */
  previewLabel: string;
  /** Screenshots under /public, in the order they should play. First one
   * holds longer than the rest — see ProjectCarousel. */
  images: string[];
};

export const topProjects: Project[] = [
  {
    id: "gitarchy",
    title: "GitArchy",
    description:
      "A self-hosted, GitHub-style code host where analytics is part of the platform instead of a third-party integration. Repos, branches, diffs, member roles and activity feeds sit one step from distributed Spark jobs over the same git history — commit activity, Spark SQL file stats, K-Means repo clustering, a bug-fix commit classifier — streaming live progress back over a WebSocket.",
    tags: ["Next.js", "FastAPI", "Apache Spark", "Cassandra", "WebSockets", "JWT"],
    repoHref: "https://github.com/varadisthedev/GitArchy",
    liveHref: "https://gitarchy.varadraut.dev",
    previewLabel: "gitarchy.varadraut.dev",
    images: [
      "/project_images/gitarchy/1.png",
      "/project_images/gitarchy/2.png",
      "/project_images/gitarchy/3.png",
    ],
  },
  {
    id: "tripzy",
    title: "Tripzy",
    description:
      "AI travel planning that commits to a number. A LightGBM model trained on 1.67M Indian domestic flights picks the cheapest day to fly inside a 30-day window, while Gemini (NVIDIA fallback behind circuit breakers) writes the itinerary. One dashboard ties itineraries, bookings, fare history and weather together; the ML service stays internal and never reaches the browser.",
    tags: ["React 19", "Express 5", "FastAPI", "LightGBM", "Neon Postgres", "Gemini"],
    repoHref: "https://github.com/varadisthedev/Tripzy",
    liveHref: "https://mytripzy.vercel.app",
    previewLabel: "mytripzy.vercel.app",
    images: [
      "/project_images/tripzy/1.png",
      "/project_images/tripzy/2.png",
      "/project_images/tripzy/3.png",
      "/project_images/tripzy/4.png",
      "/project_images/tripzy/5.png",
      "/project_images/tripzy/6.png",
    ],
  },
  {
    id: "kaarigar",
    title: "Kaarigar",
    description:
      "Voice-first market linkage for Indian artisans. An artisan photographs a product and describes it out loud in Hindi, English or Marathi; Sarvam AI, Gemini and a scikit-learn pricing model turn that into a bilingual, SEO-ready listing with a price band that goes live on an IndiaMART-style marketplace after human review. Web and Expo apps share the flows, and every third-party key has a documented fallback.",
    tags: ["Next.js 16", "Expo", "FastAPI", "Neon Postgres", "Sarvam AI", "Razorpay"],
    repoHref: "https://github.com/varadisthedev/Kaarigar",
    liveHref: "https://kaarigar.varadraut.dev",
    previewLabel: "kaarigar.varadraut.dev",
    images: [
      "/project_images/kaarigar/1.png",
      "/project_images/kaarigar/2.png",
      "/project_images/kaarigar/3.png",
      "/project_images/kaarigar/4.png",
    ],
  },
  {
    id: "dupelocatr",
    title: "DupeLocatR",
    description:
      "One simple job: hunt down and erase every duplicate document, image, audio file, video or PDF in a folder tree. Menu-driven, launches with `dlr` from any terminal, and far lighter on memory than dragging File Explorer through the same job. No runtime to install — it ships over Scoop and GitHub Releases, with a winget manifest in review.",
    tags: ["PowerShell", "Windows", "Scoop", "winget"],
    repoHref: "https://github.com/varadisthedev/DupeLocatR",
    liveHref: "https://github.com/varadisthedev/DupeLocatR/releases/latest",
    liveLabel: "Download",
    previewLabel: "dlr — PowerShell",
    images: ["/project_images/dupelocatr/1.png"],
  },
];
