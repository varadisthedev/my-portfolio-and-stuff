// ─── Stack Data ────────────────────────────────────────────────────────────────
// Edit this file to update the tech stack section. Each category has a label,
// a short description, and a list of tech items.

export type TechItem = {
  /** Display name */
  name: string;
  /** react-icons identifier, e.g. "SiNextdotjs" — imported dynamically in the component */
  icon: string;
};

export type StackCategory = {
  id: string;
  label: string;
  description: string;
  items: TechItem[];
};

export const stackCategories: StackCategory[] = [
  {
    id: "frontend",
    label: "Frontend",
    description: "Responsive, accessible interfaces built to perform.",
    items: [
      { name: "Next.js", icon: "SiNextdotjs" },
      { name: "React", icon: "SiReact" },
      { name: "TypeScript", icon: "SiTypescript" },
      { name: "JavaScript", icon: "SiJavascript" },
      { name: "Tailwind CSS", icon: "SiTailwindcss" },
      { name: "ShadCN UI", icon: "SiShadcnui" },
      { name: "HTML5", icon: "SiHtml5" },
    ],
  },
  {
    id: "backend",
    label: "Backend",
    description: "Scalable APIs, auth, and real-time systems.",
    items: [
      { name: "Node.js", icon: "SiNodedotjs" },
      { name: "Express.js", icon: "SiExpress" },
      { name: "Spring Boot", icon: "SiSpringboot" },
      { name: "Socket.IO", icon: "SiSocketdotio" },
      { name: "BullMQ", icon: "SiBullmq" },
      { name: "JWT Auth", icon: "SiJsonwebtokens" },
    ],
  },
  {
    id: "database",
    label: "Database",
    description: "Structured data, caching, and query performance.",
    items: [
      { name: "MongoDB", icon: "SiMongodb" },
      { name: "PostgreSQL", icon: "SiPostgresql" },
      { name: "Prisma", icon: "SiPrisma" },
      { name: "Redis", icon: "SiRedis" },
    ],
  },
  {
    id: "devops",
    label: "Tools & DevOps",
    description: "The workflows and pipelines that ship it all.",
    items: [
      { name: "Git", icon: "SiGit" },
      { name: "GitHub", icon: "SiGithub" },
      { name: "Docker", icon: "SiDocker" },
      { name: "Linux", icon: "SiLinux" },
      { name: "Postman", icon: "SiPostman" },
      { name: "Vercel", icon: "SiVercel" },
    ],
  },
];
