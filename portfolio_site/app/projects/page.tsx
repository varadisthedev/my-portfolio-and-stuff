import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SkillTag } from "@/components/ui/SkillTag";
import { TechLogoMarquee } from "@/components/home/TechLogoMarquee";

const projects = [
  {
    title: "Peafowl ",
    desc: "Scalable real-time chat platform built with TypeScript, ShadCN UI and Socket.io. Uses Redis Pub/Sub for distributed event handling and online presence tracking, supports typing indicators and encrypted one-to-one messaging. Secured with JWT, RBAC and rate limiting; containerized with Docker.",
    meta: "May 2026",
    tags: ["mern", "typescript", "socket.io", "redis", "jwt"],
    image:
      "https://res.cloudinary.com/dbo6csymr/image/upload/v1778500117/peafowl_placeholder.png",
    href: "https://...",
  },
  {
    title: "RentiGO",
    desc: "Peer-to-peer hyper-local rental marketplace with geospatial filtering (Leaflet + OpenStreetMap), integrated Razorpay UPI payments and Clerk authentication. Deployed on Vercel + Railway; placed Top 10 PAN India in KWARGS Group Hackathon 2026.",
    meta: "March 2026",
    tags: ["mern", "tailwind css", "razorpay integration", "jwt", "leaflet"],
    image:
      "https://res.cloudinary.com/dbo6csymr/image/upload/v1778500117/rentigo_placeholder.png",
    href: "https://...",
  },
  {
    title: "Live Legal Analyzer",
    desc: "AI-powered legal document analysis platform using a Python RAG microservice for contextual retrieval and Claude AI for responses. Implements k-means chunk filtering to improve top-k retrieval relevance, with Clerk auth",
    meta: "February 2026",
    tags: ["mern", "clerk", "snowflake db", "elevenlabs", "RAG", "claude ai"],
    image:
      "https://res.cloudinary.com/dbo6csymr/image/upload/v1778500117/live_legal_placeholder.png",
    href: "https://...",
  },
  {
    title: "WALL8",
    desc: "MERN expense tracker with real-time updates, glassmorphism UI, Gemini AI spending insights, Chart.js dashboards, and Clerk auth with OAuth/JWT.",
    meta: "December 2025",
    tags: ["mern", "chart.js", "clerk", "gemini ai"],
    image:
      "https://res.cloudinary.com/dbo6csymr/image/upload/v1778500117/wall8_project_placeholder.png",
    href: "https://...",
  },
  {
    title: "Hawkins Heist",
    desc: "Real-time multiplayer platform supporting 500+ concurrent users using event-driven WebSocket architecture.",
    meta: "500+ users",
    tags: ["mern", "socket.io", "groq ai"],
    image:
      "https://res.cloudinary.com/dbo6csymr/image/upload/v1778500117/hawkins_aqmzdy.png",
    href: "https://...",
  },

];

export default function ProjectsPage() {
  return (
    <>

      <TechLogoMarquee />
      <Container className="py-(--spacing-stack-lg) pt-32">
        <h1 className="font-headline-lg text-foreground">Projects</h1>
        <p className="mt-2 font-body-lg text-muted-foreground">
          Selected work and experiments.
        </p>

        <div className="relative mt-(--spacing-stack-md)">
          {projects.map((project) => (
            <a
              key={project.title}
              href={project.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex cursor-pointer gap-5 border-b border-outline-variant/50 p-5 transition-colors last:border-0 hover:bg-white/5"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={project.image}
                alt=""
                className="h-20 w-32 rounded-md object-cover"
              />
              <div>
                <h3 className="flex items-center gap-1 font-medium text-foreground group-hover:text-secondary">
                  {project.title}
                  <ArrowUpRight
                    size={14}
                    className="transition-transform group-hover:scale-125"
                  />
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{project.desc}</p>
                <p className="mt-1 font-code-label text-xs text-muted-foreground">
                  {project.meta}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <SkillTag key={tag} label={tag.toUpperCase()} />
                  ))}
                </div>
              </div>
            </a>
          ))}
        </div>
      </Container>
    </>
  );
}
