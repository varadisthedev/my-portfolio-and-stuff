export const routes = {
  home: "/#home",
  work: "/#work",
  stack: "/#stack",
  openSource: "/#open-source",
  contact: "/#contact",
} as const;

export type RouteKey = keyof typeof routes;

export type NavItem = {
  label: string;
  href: (typeof routes)[RouteKey];
};

export const mainNav: NavItem[] = [
  { label: "Home", href: routes.home },
  { label: "Work", href: routes.work },
  { label: "Stack", href: routes.stack },
  { label: "Open Source", href: routes.openSource },
  { label: "Contact", href: routes.contact },
];
