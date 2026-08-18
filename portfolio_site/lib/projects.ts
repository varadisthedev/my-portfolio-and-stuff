// Top 3 by real-world weight, not GitHub stars — this account is too young
// for star counts to mean much (low single digits across the board). These
// are the three with production deployments, the most substantial scope,
// and (for RentiGO) an external result. See Decisions.md for the full
// rationale.

export type Project = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  repoHref: string;
  liveHref?: string;
  highlight?: string;
  /** Path under /public, e.g. "/projects/peafowl.png". Optional — cards
   * render a placeholder until a real screenshot is dropped in. */
  image?: string;
};

export const topProjects: Project[] = [
  {
    id: "peafowl",
    title: "Peafowl",
    description:
      "A WhatsApp-style chat app built to explore scalable real-time architecture: Socket.IO servers publish through a Redis pub/sub adapter instead of holding state directly, so message delivery and presence tracking keep working across multiple stateless server instances.",
    tags: ["TypeScript", "Socket.io", "Redis", "MongoDB", "JWT"],
    repoHref: "https://github.com/varadisthedev/Peafowl",
    liveHref: "https://frontpeafowl.vercel.app",
  },
  {
    id: "rentigo",
    title: "RentiGO",
    description:
      "Peer-to-peer marketplace for renting out underused gear locally. Geospatial search (Leaflet + OpenStreetMap) surfaces what's actually nearby, while Razorpay and Clerk take on payments and identity so the app itself never touches raw credentials or payment data.",
    tags: ["MERN", "Leaflet", "Razorpay", "Clerk"],
    repoHref: "https://github.com/varadisthedev/RENTIGO_PIH2026",
    liveHref: "https://rentigo-pika2.vercel.app",
    highlight: "Top 10 PAN India — KWARGS Group Hackathon 2026",
  },
  {
    id: "live-legal-ai",
    title: "Live Legal Analyzer",
    description:
      "Legal-document Q&A over your own files: a Python FastAPI microservice builds a separate FAISS vector index per uploaded PDF/DOCX and runs retrieval, so answers stay grounded in the source document instead of the model's general knowledge.",
    tags: ["Next.js", "Python", "FastAPI", "FAISS", "Clerk"],
    repoHref: "https://github.com/varadisthedev/LiveLegalAI",
    liveHref: "https://front-live-legal-ai.vercel.app",
  },
];
