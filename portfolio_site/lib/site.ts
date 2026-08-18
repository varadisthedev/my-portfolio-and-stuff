import github from "../logos/light/github.png";
import linkedin from "../logos/light/linkedin.png";

export const site = {
  name: "VARAD_",
  title: "Varad Raut — Full-Stack Engineer",
  description:
    "Full-stack engineer building real-time systems, AI-assisted tools, and clean web interfaces. Currently at Grovix.",
  cvUrl: "/varad_raut_fullstack_aug.pdf",
  repoUrl: "https://github.com/varadisthedev/my-portfolio-and-stuff/",
} as const;

export const heroContent = {
  eyebrow: "$ whoami",
  // status: "Open to new opportunities",
  headline: "engineer who ships.",
  headlineHighlight: "Full-stack",
  subheadline:
    "I build production web systems end to end — real-time backends, Powerful tools, and interfaces that hold up under real user load. Most of it in public.",
  primaryCta: { label: "View Work", href: "#work" },
  secondaryCta: { label: "Get in Touch", href: "#contact" },
} as const;

export const contactContent = {
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
      {
        label: "LinkedIn",
        href: "https://www.linkedin.com/in/varad-raut-",
        icon: linkedin,
      },
    ],
  },
  form: {
    submitLabel: "Send Message",
  },
} as const;
