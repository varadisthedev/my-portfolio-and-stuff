// ─── Stack Data ────────────────────────────────────────────────────────────────
// Edit this file to update the /stack page. Each category has a label, a short
// description, and a list of tech items. The `proof` array at the bottom drives
// the "Visual Proof" cards.

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

export type ProofItem = {
  tech: string;
  /** Short icon identifier matching a TechItem.icon value */
  icon: string;
  detail: string;
};

export const stackCategories: StackCategory[] = [
  {
    id: "frontend",
    label: "Frontend",
    description:
      "Building responsive, accessible and performant user interfaces.",
    items: [
      { name: "Next.js", icon: "SiNextdotjs" },
      { name: "React", icon: "SiReact" },
      { name: "TypeScript", icon: "SiTypescript" },
      { name: "JavaScript", icon: "SiJavascript" },
      { name: "Tailwind CSS", icon: "SiTailwindcss" },
      { name: "ShadCN UI", icon: "SiShadcnui" },
      { name: "HTML5", icon: "SiHtml5" },
      { name: "CSS3", icon: "SiCss" },
    ],
  },
  {
    id: "backend",
    label: "Backend",
    description:
      "Designing scalable APIs, authentication systems and real-time applications.",
    items: [
      { name: "Node.js", icon: "SiNodedotjs" },
      { name: "Express.js", icon: "SiExpress" },
      { name: "REST APIs", icon: "SiOpenapiinitiative" },
      { name: "JWT Auth", icon: "SiJsonwebtokens" },
      { name: "Socket.IO", icon: "SiSocketdotio" },
    ],
  },
  {
    id: "database",
    label: "Database",
    description:
      "Managing structured data, caching layers and performance optimization.",
    items: [
      { name: "MongoDB", icon: "SiMongodb" },
      { name: "Mongoose", icon: "SiMongoose" },
      { name: "Redis", icon: "SiRedis" },
    ],
  },
  {
    id: "devops",
    label: "Tools & DevOps",
    description:
      "Development workflows, deployment pipelines and production tooling.",
    items: [
      { name: "Git", icon: "SiGit" },
      { name: "GitHub", icon: "SiGithub" },
      { name: "Docker", icon: "SiDocker" },
      { name: "Linux", icon: "SiLinux" },
      { name: "Postman", icon: "SiPostman" },
      { name: "Vercel", icon: "SiVercel" },
      { name: "VS Code", icon: "SiTerminal" },
    ],
  },
];

export const visualProof: ProofItem[] = [
  {
    tech: "Next.js",
    icon: "SiNextdotjs",
    detail: "Used in portfolio and SaaS projects",
  },
  {
    tech: "Redis",
    icon: "SiRedis",
    detail: "Pub/Sub and caching for chat systems",
  },
  {
    tech: "Docker",
    icon: "SiDocker",
    detail: "Local development and deployment",
  },
  {
    tech: "MongoDB",
    icon: "SiMongodb",
    detail: "Schema design and aggregation pipelines",
  },
];
