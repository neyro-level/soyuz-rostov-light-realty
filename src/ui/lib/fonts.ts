import localFont from "next/font/local";

export const manrope = localFont({
  src: [
    {
      path: "./fonts/Manrope-latin.woff2",
      weight: "200 800",
      style: "normal",
    },
    {
      path: "./fonts/Manrope-cyrillic.woff2",
      weight: "200 800",
      style: "normal",
    },
  ],
  display: "swap",
  preload: true,
  variable: "--font-manrope",
  fallback: [
    "ui-sans-serif",
    "system-ui",
    "Segoe UI",
    "Roboto",
    "Helvetica Neue",
    "Arial",
    "sans-serif",
  ],
  adjustFontFallback: "Arial",
});
