// Bengali Typography Engine & Font Definitions for UTSOB (উৎসব)

export interface BengaliFontMeta {
  id: string;
  family: string;
  displayName: string;
  category: "sans-serif" | "serif" | "display" | "cursive";
  weights: number[];
  cssVariable: string;
  idealUse: string;
  sampleText: string;
}

export const APPROVED_BENGALI_FONTS: readonly BengaliFontMeta[] = [
  {
    id: "hind-siliguri",
    family: "Hind Siliguri",
    displayName: "হিন্দ শিলিগুড়ি (Hind Siliguri)",
    category: "sans-serif",
    weights: [300, 400, 500, 600, 700],
    cssVariable: "--font-hind-siliguri",
    idealUse: "Platform UI, body copy, modern cards, and readable digital invitations",
    sampleText: "উৎসব হোক সকলের সাথে আনন্দময় ও চিরস্মরণীয়",
  },
  {
    id: "noto-serif-bengali",
    family: "Noto Serif Bengali",
    displayName: "নোটো সেরিফ বাংলা (Noto Serif Bengali)",
    category: "serif",
    weights: [400, 500, 600, 700],
    cssVariable: "--font-noto-serif-bengali",
    idealUse: "Formal wedding invitations, traditional cards, and literary quotes",
    sampleText: "পরম করুণাময়ের অশেষ কৃপায় আমাদের শুভ পরিণয়",
  },
  {
    id: "anek-bangla",
    family: "Anek Bangla",
    displayName: "অনেক বাংলা (Anek Bangla)",
    category: "display",
    weights: [400, 600, 700, 800],
    cssVariable: "--font-anek-bangla",
    idealUse: "Bold headlines, festive posters, vibrant Pohela Boishakh greetings",
    sampleText: "শুভ নববর্ষ ১৪৩৩! এসো হে বৈশাখ এসো এসো",
  },
  {
    id: "tiro-bangla",
    family: "Tiro Bangla",
    displayName: "তিরো বাংলা (Tiro Bangla)",
    category: "serif",
    weights: [400],
    cssVariable: "--font-tiro-bangla",
    idealUse: "Formal certificates, poetry stanzas, and traditional Bengali publications",
    sampleText: "চিত্ত যেথা ভয়শূন্য, উচ্চ যেথা শির",
  },
  {
    id: "galada",
    family: "Galada",
    displayName: "গালাদা (Galada)",
    category: "cursive",
    weights: [400],
    cssVariable: "--font-galada",
    idealUse: "Festive calligraphy, Eid greetings, birthday headers, and decorative accents",
    sampleText: "ঈদ মোবারক! আপনার জীবন ভরে উঠুক অনাবিল আনন্দে",
  },
] as const;

export const DEFAULT_BENGALI_FONT = APPROVED_BENGALI_FONTS[0];

/**
 * Checks if a given font family is approved in the Utsob typography whitelist.
 */
export function isApprovedBengaliFont(family: string): boolean {
  return APPROVED_BENGALI_FONTS.some(
    (font) => font.family.toLowerCase() === family.toLowerCase()
  );
}

/**
 * Pre-checks browser FontFace readiness before rendering or exporting Fabric.js canvas.
 * Prevents broken Bengali conjuncts (হসন্ত/যুক্তবর্ণ) caused by fallback font measurements.
 */
export async function ensureFontsLoaded(fontFamilies: string[]): Promise<boolean> {
  if (typeof window === "undefined" || !document?.fonts) {
    return true; // Server-side or non-DOM environment
  }

  try {
    const loadPromises = fontFamilies.map(async (family) => {
      if (document.fonts.check(`16px "${family}"`)) {
        return true;
      }
      await document.fonts.load(`16px "${family}"`);
      return true;
    });

    await Promise.all(loadPromises);
    await document.fonts.ready;
    return true;
  } catch (error) {
    console.warn("Utsob Font Loader: Some web fonts could not be preloaded", error);
    return false;
  }
}
