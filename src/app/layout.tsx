import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { fontVariables } from "@/config/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.nameBn} (${siteConfig.name}) — ${siteConfig.taglineBn}`,
    template: `%s | ${siteConfig.nameBn}`,
  },
  description: siteConfig.description,
  keywords: [
    "উত্সব",
    "বাংলা কার্ড",
    "গ্রিটিং কার্ড",
    "ডিজিটাল নিমন্ত্রণপত্র",
    "পহেলা বৈশাখ",
    "ঈদ মোবারক",
    "Bengali Greeting Cards",
    "Digital Invitation Bangladesh",
  ],
  metadataBase: new URL(siteConfig.url),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className={fontVariables} suppressHydrationWarning>
      <body className="min-h-screen font-sans bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
