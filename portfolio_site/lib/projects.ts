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
};

export const topProjects: Project[] = [
  {
    id: "peafowl",
    title: "Peafowl",
    description:
      "Real-time chat platform with Socket.io messaging, Redis Pub/Sub for horizontal scaling and presence tracking, and JWT-based auth with role-based access and rate limiting.",
    tags: ["TypeScript", "Socket.io", "Redis", "MongoDB", "JWT"],
    repoHref: "https://github.com/varadisthedev/Peafowl",
    liveHref: "https://frontpeafowl.vercel.app",
  },
  {
    id: "rentigo",
    title: "RentiGO",
    description:
      "Peer-to-peer rental marketplace with geospatial search (Leaflet + OpenStreetMap), Razorpay UPI payments, and Clerk auth.",
    tags: ["MERN", "Leaflet", "Razorpay", "Clerk"],
    repoHref: "https://github.com/varadisthedev/RENTIGO_PIH2026",
    liveHref: "https://rentigo-pika2.vercel.app",
    highlight: "Top 10 PAN India — KWARGS Group Hackathon 2026",
  },
  {
    id: "live-legal-ai",
    title: "Live Legal Analyzer",
    description:
      "AI-powered legal document analysis platform — a Python RAG microservice handles contextual retrieval with k-means chunk filtering, Claude AI generates grounded answers over uploaded documents.",
    tags: ["Next.js", "Python", "RAG", "Claude AI", "Clerk"],
    repoHref: "https://github.com/varadisthedev/LiveLegalAI",
    liveHref: "https://front-live-legal-ai.vercel.app",
  },
];
