import { describe, it, expect } from "vitest";
import {
  toBengaliNumeral,
  fromBengaliNumeral,
  parseBengaliNumber,
  formatBengaliCurrency,
} from "@/lib/bengali/numbers";

describe("Bengali Numeral Converter", () => {
  describe("toBengaliNumeral", () => {
    it("should convert single digits accurately", () => {
      expect(toBengaliNumeral(0)).toBe("০");
      expect(toBengaliNumeral(1)).toBe("১");
      expect(toBengaliNumeral(5)).toBe("৫");
      expect(toBengaliNumeral(9)).toBe("৯");
    });

    it("should convert multi-digit integers accurately", () => {
      expect(toBengaliNumeral(2026)).toBe("২০২৬");
      expect(toBengaliNumeral(1433)).toBe("১৪৩৩");
      expect(toBengaliNumeral("1234567890")).toBe("১২৩৪৫৬৭৮৯০");
    });

    it("should preserve decimal points, signs, and separators", () => {
      expect(toBengaliNumeral("1,500.50")).toBe("১,৫০০.৫০");
      expect(toBengaliNumeral(-42)).toBe("-৪২");
    });

    it("should handle empty or null values gracefully", () => {
      // @ts-expect-error Testing runtime resilience
      expect(toBengaliNumeral(null)).toBe("");
      // @ts-expect-error Testing runtime resilience
      expect(toBengaliNumeral(undefined)).toBe("");
      expect(toBengaliNumeral("")).toBe("");
    });
  });

  describe("fromBengaliNumeral", () => {
    it("should convert Bengali numerals back to English digits", () => {
      expect(fromBengaliNumeral("০")).toBe("0");
      expect(fromBengaliNumeral("১২৩৪৫")).toBe("12345");
      expect(fromBengaliNumeral("২০২৬")).toBe("2026");
    });

    it("should preserve non-digit characters during conversion", () => {
      expect(fromBengaliNumeral("১,৫০০.৭৫")).toBe("1,500.75");
      expect(fromBengaliNumeral("তারিখ: ১০/১১/২০২৬")).toBe("তারিখ: 10/11/2026");
    });

    it("should return empty string for empty input", () => {
      expect(fromBengaliNumeral("")).toBe("");
    });
  });

  describe("parseBengaliNumber", () => {
    it("should parse Bengali numeric strings into JavaScript numbers", () => {
      expect(parseBengaliNumber("১২৩৪")).toBe(1234);
      expect(parseBengaliNumber("১,৫০০.৫০")).toBe(1500.5);
      expect(parseBengaliNumber("-৫০")).toBe(-50);
    });

    it("should return NaN for non-numeric input", () => {
      expect(parseBengaliNumber("")).toBeNaN();
      expect(parseBengaliNumber("উৎসব")).toBeNaN();
    });
  });

  describe("formatBengaliCurrency", () => {
    it("should format whole currency amounts in BDT", () => {
      const formatted = formatBengaliCurrency(5000);
      expect(formatted).toContain("৳");
      expect(formatted).toContain("৫,০০০");
    });

    it("should format decimal currency amounts when requested", () => {
      const formatted = formatBengaliCurrency(1250.75, true);
      expect(formatted).toContain("৳");
      expect(formatted).toContain("১,২৫০.৭৫");
    });

    it("should handle zero and NaN gracefully", () => {
      expect(formatBengaliCurrency(0)).toBe("৳ ০");
      expect(formatBengaliCurrency(NaN)).toBe("৳ ০");
    });
  });
});
