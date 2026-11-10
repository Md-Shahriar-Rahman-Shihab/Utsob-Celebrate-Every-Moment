import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Utsob Cultural Bengali Palette
        utsob: {
          crimson: "#DC2626",      // আলপনা লাল (Alpona Red)
          mustard: "#F59E0B",      // বৈশাখী হলুদ (Boishakhi Yellow)
          emerald: "#059669",      // জামদানি সবুজ (Jamdani Green)
          gold: "#D97706",         // উৎসব সোনালী (Festive Gold)
          terracotta: "#B45309",   // পোড়ামাটি রঙ (Terracotta Clay)
          night: "#1E1B4B",        // উৎসবী রাত (Festive Midnight Blue)
          cream: "#FFFBEB",        // আলপনা জমিন (Alpona Ivory)
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-hind-siliguri)", "system-ui", "sans-serif"],
        serif: ["var(--font-noto-serif-bengali)", "serif"],
        anek: ["var(--font-anek-bangla)", "sans-serif"],
        tiro: ["var(--font-tiro-bangla)", "serif"],
        galada: ["var(--font-galada)", "cursive"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
