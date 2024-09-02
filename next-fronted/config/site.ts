export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "RISK EYE",
  description: "Uncovering threats, securing futures.",
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Twitter",
      href: "/x",
    },
    {
      label: "Blog",
      href: "/blog",
    },
    {
      label: "About",
      href: "/about",
    },
  ],
  navMenuItems: [
    {
      label: "Profile",
      href: "/profile",
    },
    {
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      label: "Projects",
      href: "/projects",
    },
    {
      label: "Team",
      href: "/team",
    },
    {
      label: "Calendar",
      href: "/calendar",
    },
    {
      label: "Settings",
      href: "/settings",
    },
    {
      label: "Help & Feedback",
      href: "/help-feedback",
    },
    {
      label: "Logout",
      href: "/logout",
    },
  ],
  links: {
    github: "https://github.com/darkqiank/risk-daily-fetch/",
  },
};
