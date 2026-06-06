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
  title: "Featured Highlights",
  architecture: {
    label: "SYSTEMS ARCHITECTURE",
    title:
      "Building resilient microservices and seamless data pipelines for enterprise-scale applications.",
    skills: ["TYPESCRIPT", "NODE.JS", "GRAPHQL", "POSTGRES"],
  },
  metric: {
    value: "99.9%",
    label: "Uptime Achieved",
  },
  project: {
    label: "LATEST DEPLOYMENT",
    title: "FinTech Data Visualizer",
    description:
      "Real-time market analysis tool processing millions of data points with sub-second latency.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDS5N2z8k654kcH3pzFeYwjbqL-IsEWoTBsZIbI9KCYL1MByBHO1hQf1hRnySKxf-C1dV-awz2rwUDQPoZACOfePYwDE6w4TGIprdz-FyHdoYq-zjN-5ZnxmMCCCNjOOhNQQCSiZ6Jh2eJNof8FMPWId5G2bt1nz5a46smU6XfrtWbFB9PUPlNjDI1cXpO--Y6JwLJEDCLICgGLh6TFRxHWls10og4c22t4HH9smMGiSVsDGV_-GZmOpyWlSNJ3Y5Cl5NUubKx7f_Y",
    imageAlt:
      "FinTech dashboard with dark mode interface and data visualization charts",
  },
} as const;
