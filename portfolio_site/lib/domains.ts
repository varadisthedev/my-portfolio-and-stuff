import { Activity, Globe, Link2, type LucideIcon } from "lucide-react";

export type DomainLink = {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
  /** True for the domain this app itself is served from. */
  current?: boolean;
};

/**
 * Every domain in the Varad Raut portfolio network. Order here is the
 * stacking order in DomainSlider (components/layout/DomainSlider.tsx).
 */
export const domainLinks: DomainLink[] = [
  {
    id: "links",
    label: "links.varadraut.dev",
    description: "All my socials, one page",
    href: "https://links.varadraut.dev/",
    icon: Link2,
  },
  {
    id: "portfolio",
    label: "portfolio.varadraut.dev",
    description: "You're here",
    href: "/",
    icon: Globe,
    current: true,
  },
  {
    id: "status",
    label: "status.varadraut.dev",
    description: "Uptime & incidents",
    href: "https://status.varadraut.dev/",
    icon: Activity,
  },
];
