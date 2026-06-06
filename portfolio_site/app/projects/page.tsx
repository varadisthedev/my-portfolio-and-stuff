import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SkillTag } from "@/components/ui/SkillTag";

const projects = [
  {
    title: "WALL8 (Live)",
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
    tags: ["socket.io", "node.js", "react"],
    image:
      "https://res.cloudinary.com/dbo6csymr/image/upload/v1778500117/hawkins_aqmzdy.png",
    href: "https://...",
  },
  {
    title: "Redis chat app",
    desc: "Real-time chat application using Redis Pub/Sub for efficient message broadcasting and low latency.",
    meta: "100+ users",
    tags: ["redis", "node.js", "react"],
    image:
      "https://res.cloudinary.com/dbo6csymr/image/upload/v1778500117/redis_chat_app_ajlq8c.png",
    href: "https://...",
  },
];

export default function ProjectsPage() {
  return (
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
  );
}
