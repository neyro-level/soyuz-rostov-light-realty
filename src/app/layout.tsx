import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { env } from "@/platform/env";
import { buildRealEstateAgentJsonLd } from "@/platform/seo";
import { JsonLdScript } from "@/platform/seo/json-ld-script";
import { site } from "@/project/site.config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Realty Lite",
  description: "Lite catalog foundation",
  robots:
    env.INDEXING_MODE === "staging"
      ? { index: false, follow: false }
      : { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const agentJsonLd = buildRealEstateAgentJsonLd({
    name: site.brand,
    url: site.siteUrl,
    telephone: site.phoneTel,
    email: site.email,
    address: site.address,
    openingHours: site.hoursSchema,
  });
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <JsonLdScript data={agentJsonLd} />
        {children}
      </body>
    </html>
  );
}
