export interface NavItem {
  title: string;
  href: string;
  authRequired?: boolean;
  aimlOnly?: boolean;
  adminOnly?: boolean;
}

export const NAVITEM: NavItem[] = [
  {
    title: "Home",
    href: "/",
  },
  {
    title: "Members",
    href: "/team/2026",
  },
  {
    title: "Faculty",
    href: "/faculty",
  },
  {
    title: "Events",
    href: "/events",
  },
  // {
  // 	title: 'SNH 2023',
  // 	href: '/snh2023'
  // },
  // {
  //   title: "Handbook",
  //   href: "/handbook",
  // },
  {
    title: "Intel AI Lab",
    href: "/intel-ai-lab",
  },
  {
    title: "Announcements",
    href: "/announcements",
    authRequired: true,
    aimlOnly: true,
  },
  {
    title: "Marathon",
    href: "/marathon",
    authRequired: true,
    aimlOnly: true,
  },
  {
    title: "Forms",
    href: "/forms",
    authRequired: true,
  },
];
