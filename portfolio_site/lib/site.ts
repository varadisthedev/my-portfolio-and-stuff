import github from "../logos/light/github.png"
import linkedin from "../logos/light/linkedin.png"
import mail from "../logos/light/mail.png"
import x from "../logos/light/x.png"

export const site = {
  name: "VARAD RAUT",
  title: "Varad Raut - Full Stack Developer",
  description:
    "Full stack developer specializing in high-performance digital ecosystems.",
  copyright: "© 2024 Varad Raut. Engineered with precision.",
  cvUrl: "/cv.pdf",
} as const;

export const socialLinks = [
  { label: "GitHub", href: "https://github.com/varadisthedev", icon: github },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/varad-raut-", icon: linkedin },
  { label: "Twitter", href: "https://twitter.com", icon: x },
  { label: "Email", href: "mailto:varadisthedev@gmail.com", icon: mail },
] as const;

export const heroContent = {
  availability: "Looking for internship opportunities",
  headline: ["Full Stack Developer.", "Problem Solver.", "Architect."],
  subheadline:
    "I engineer high-performance digital ecosystems. Specializing in robust scalable backends and precise, minimalist front-end interfaces that bridge complex logic with elegant user experiences.",
  primaryCta: { label: "View My Work", href: "#work" },
  secondaryCta: { label: "Explore Stack", href: "#stack" },
} as const;

export const contactContent = {
  status: "STATUS: ONLINE & RESPONSIVE",
  headline: "Let's build something together.",
  subheadline:
    "Whether you have a project in mind or want to discuss architecture, I'm always open to meaningful conversations about building scalable digital products.",
  email: {
    title: "Direct Email",
    description: "For direct inquiries, collaborations, and opportunities.",
    address: "varadisthedev@gmail.com",
    href: "mailto:varadisthedev@gmail.com",
  },
  terminal: {
    path: "~/socials",
    links: [
      { label: "GitHub", href: "https://github.com/varadisthedev", icon: github },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/varad-raut-", icon: linkedin },
      { label: "Twitter", href: "https://twitter.com", icon: x },
    ],
  },
  form: {
    submitLabel: "Send Message",
  },
} as const;

export const featuredHighlights = {
  title: "Featured work",
  architecture: {
    label: "Architecture",
    title: "Event-driven systems & scalable backends",
    skills: ["Redis", "Socket.io", "Docker", "TypeScript"],
  },
  metric: {
    value: "500+",
    label: "Concurrent users",
  },
  project: {
    image:
      "https://res.cloudinary.com/dbo6csymr/image/upload/v1778500117/peafowl_placeholder.png",
    imageAlt: "Peafowl project screenshot",
    label: "Selected project",
    title: "Peafowl",
    description:
      "Scalable real-time chat platform using Redis Pub/Sub, Socket.io, and JWT-based security.",
  },
} as const;
