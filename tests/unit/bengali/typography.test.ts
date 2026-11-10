import { describe, it, expect } from "vitest";
import {
  APPROVED_BENGALI_FONTS,
  DEFAULT_BENGALI_FONT,
  isApprovedBengaliFont,
  ensureFontsLoaded,
} from "@/lib/bengali/typography";

describe("Bengali Typography Engine", () => {
  it("should contain all 5 required approved Bengali fonts", () => {
    const families = APPROVED_BENGALI_FONTS.map((f) => f.family);
    expect(families).toContain("Hind Siliguri");
    expect(families).toContain("Noto Serif Bengali");
    expect(families).toContain("Anek Bangla");
    expect(families).toContain("Tiro Bangla");
    expect(families).toContain("Galada");
  });

  it("should have valid metadata and sample texts for each approved font", () => {
    for (const font of APPROVED_BENGALI_FONTS) {
      expect(font.id).toBeTruthy();
      expect(font.family).toBeTruthy();
      expect(font.displayName).toBeTruthy();
      expect(font.weights.length).toBeGreaterThan(0);
      expect(font.cssVariable.startsWith("--font-")).toBe(true);
      expect(font.sampleText).toBeTruthy();
      // Ensure sample text contains Bengali Unicode characters
      expect(/[\u0980-\u09FF]/.test(font.sampleText)).toBe(true);
    }
  });

  it("should designate Hind Siliguri as the default font", () => {
    expect(DEFAULT_BENGALI_FONT.family).toBe("Hind Siliguri");
  });

  it("should correctly identify approved and unapproved font families", () => {
    expect(isApprovedBengaliFont("Hind Siliguri")).toBe(true);
    expect(isApprovedBengaliFont("hind siliguri")).toBe(true);
    expect(isApprovedBengaliFont("Galada")).toBe(true);
    expect(isApprovedBengaliFont("Comic Sans MS")).toBe(false);
    expect(isApprovedBengaliFont("Arial")).toBe(false);
  });

  it("should resolve ensureFontsLoaded cleanly in non-browser/server environment", async () => {
    const result = await ensureFontsLoaded(["Hind Siliguri", "Anek Bangla"]);
    expect(result).toBe(true);
  });
});
