import { siteConfig } from "@/config/site";
import { APPROVED_BENGALI_FONTS } from "@/lib/bengali/typography";
import { toBengaliNumeral } from "@/lib/bengali/numbers";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 sm:p-12 md:p-24 bg-gradient-to-b from-utsob-cream/30 via-background to-background">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-border bg-gradient-to-b from-background pb-6 pt-8 backdrop-blur-2xl sm:static sm:w-auto sm:rounded-xl sm:border sm:p-4">
          <span className="font-semibold text-utsob-crimson">{siteConfig.nameBn}</span>
          <span className="text-muted-foreground ml-2">| Phase 01: Foundation Architecture</span>
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-background via-background sm:static sm:h-auto sm:w-auto sm:bg-none">
          <span className="text-xs text-muted-foreground">
            Status: <strong className="text-emerald-600">Phase 01 Active</strong>
          </span>
        </div>
      </div>

      <div className="relative flex flex-col items-center text-center my-12 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-utsob-mustard/15 text-utsob-gold text-xs font-medium mb-4">
          <span>🎉</span>
          <span>{siteConfig.taglineBn} — {siteConfig.tagline}</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground font-sans">
          স্বাগতম <span className="text-utsob-crimson">{siteConfig.nameBn}</span>-এ
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
          বাংলাদেশের প্রথম ও সর্ববৃহৎ বাংলা ডিজিটাল গ্রিটিং কার্ড ও আমন্ত্রণপত্র প্ল্যাটফর্ম।
        </p>
      </div>

      {/* Typography & Localization System Verification Section */}
      <section className="w-full max-w-5xl mt-6 border border-border rounded-xl p-6 sm:p-8 bg-card shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 mb-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold">বাংলা টাইপোগ্রাফি ও ফন্ট ইঞ্জিন প্রিভিউ</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Phase 01 Bengali Typography & Font Engine Verification Matrix
            </p>
          </div>
          <span className="mt-2 sm:mt-0 text-xs px-2.5 py-1 rounded bg-muted text-muted-foreground font-mono">
            মোট ফন্ট: {toBengaliNumeral(APPROVED_BENGALI_FONTS.length)}টি
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {APPROVED_BENGALI_FONTS.map((font, idx) => (
            <div
              key={font.id}
              className="p-4 rounded-lg border border-border/70 hover:border-utsob-crimson/50 transition-colors bg-muted/20"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">
                    #{toBengaliNumeral(idx + 1)}
                  </span>
                  <span className="font-medium text-sm text-foreground">
                    {font.displayName}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase">
                    {font.category}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">{font.idealUse}</span>
              </div>
              <p
                className="text-2xl mt-3 text-foreground"
                style={{ fontFamily: `var(${font.cssVariable}), sans-serif` }}
              >
                {font.sampleText}
              </p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-16 text-center text-xs text-muted-foreground">
        © {toBengaliNumeral(2026)} {siteConfig.nameBn} ({siteConfig.name}). সর্বস্বত্ব সংরক্ষিত।
      </footer>
    </main>
  );
}

