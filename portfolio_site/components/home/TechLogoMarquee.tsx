"use client";

import {
  SiNextdotjs,
  SiReact,
  SiTailwindcss,
  SiTypescript,
} from "react-icons/si";
import { LogoLoop } from "@/components/ReactBits/LogoLoop";

const techLogos = [
  { node: <SiReact />, title: "React", href: "https://react.dev" },
  { node: <SiNextdotjs />, title: "Next.js", href: "https://nextjs.org" },
  {
    node: <SiTypescript />,
    title: "TypeScript",
    href: "https://www.typescriptlang.org",
  },
  {
    node: <SiTailwindcss />,
    title: "Tailwind CSS",
    href: "https://tailwindcss.com",
  },
];

export function TechLogoMarquee() {
  return (
    <div className="relative h-[200px] overflow-hidden">
      <LogoLoop
        logos={techLogos}
        speed={80}
        direction="left"
        logoHeight={55}
        gap={60}
        hoverSpeed={0}
        scaleOnHover
        fadeOut
        fadeOutColor="#0e0e0e"
        ariaLabel="Technology partners"
      />
    </div>
  );
}
