// Site Metadata and Configuration for UTSOB (উৎসব)

export const siteConfig = {
  name: "Utsob",
  nameBn: "উৎসব",
  tagline: "Celebrate Every Moment",
  taglineBn: "প্রতিটি মুহূর্ত হোক উৎসবমুখর",
  description:
    "Bangladesh's premier Bengali-first digital greeting card and invitation platform. Create, customize, and share beautiful cards for Pohela Boishakh, Eid, weddings, and birthdays.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: "/images/og-default.png",
  links: {
    github: "https://github.com/utsob/utsob",
  },
  creator: "Utsob Team",
  defaultLocale: "bn-BD",
  supportedLocales: ["bn-BD", "en-US"],
} as const;

export type SiteConfig = typeof siteConfig;
