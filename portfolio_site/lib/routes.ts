export const routes = {
  home: "/#home",
  projects: "/#projects",
  stack: "/#stack",
  contact: "/#contact",
  achievements: "/#achievements",
  openSource: "/#open-source",
} as const;

export type RouteKey = keyof typeof routes;

export type NavItem = {
  label: string;
  href: (typeof routes)[RouteKey];
};

export const mainNav: NavItem[] = [
  { label: "Home", href: routes.home },
  { label: "Projects", href: routes.projects },
  { label: "Stack", href: routes.stack },
  { label: "Achievements", href: routes.achievements },
  { label: "Contact", href: routes.contact },
  { label: "Open Source", href: routes.openSource },
];
