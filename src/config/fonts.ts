import {
  Hind_Siliguri,
  Noto_Serif_Bengali,
  Anek_Bangla,
  Tiro_Bangla,
  Galada,
} from "next/font/google";

export const fontHindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-hind-siliguri",
  display: "swap",
});

export const fontNotoSerifBengali = Noto_Serif_Bengali({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-serif-bengali",
  display: "swap",
});

export const fontAnekBangla = Anek_Bangla({
  subsets: ["bengali", "latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-anek-bangla",
  display: "swap",
});

export const fontTiroBangla = Tiro_Bangla({
  subsets: ["bengali", "latin"],
  weight: ["400"],
  variable: "--font-tiro-bangla",
  display: "swap",
});

export const fontGalada = Galada({
  subsets: ["bengali", "latin"],
  weight: ["400"],
  variable: "--font-galada",
  display: "swap",
});

export const fontVariables = [
  fontHindSiliguri.variable,
  fontNotoSerifBengali.variable,
  fontAnekBangla.variable,
  fontTiroBangla.variable,
  fontGalada.variable,
].join(" ");

