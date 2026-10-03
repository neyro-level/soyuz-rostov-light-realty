import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { env } from "@/platform/env";
import { buildHref } from "@/platform/grammar";
import { buildRealEstateAgentJsonLd } from "@/platform/seo";
import { JsonLdScript } from "@/platform/seo/json-ld-script";
import { Footer, Header } from "@/platform/ui";
import { features } from "@/project/features.config";
import { grammar } from "@/project/grammar.config";
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
  const headerItems = (
    [
      { pageKey: "catNovostroyki", label: "Catalog A" },
      { pageKey: "catKvartiry", label: "Catalog B" },
      { pageKey: "ipoteka", label: "Service" },
      { pageKey: "contacts", label: "Contacts" },
    ] as const
  ).flatMap((item) => {
    const href = buildHref(grammar, features, item.pageKey);
    return href ? [{ label: item.label, href }] : [];
  });
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <JsonLdScript data={agentJsonLd} />
        <Header
          brand={site.brand}
          ctaLabel="Lead"
          items={headerItems}
          phone={site.phoneDisplay}
        />
        {children}
        <Footer
          columns={[]}
          copyright={`© ${new Date().getFullYear()} ${site.brand}`}
          legal={site.legalName}
        />
      </body>
    </html>
  );
}
