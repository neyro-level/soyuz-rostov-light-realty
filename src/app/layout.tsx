import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { env } from "@/platform/env";
import { buildHref } from "@/platform/grammar";
import { resolveNavGroup } from "@/platform/nav";
import {
  buildRealEstateAgentJsonLd,
  parseSeoRegistryCsv,
} from "@/platform/seo";
import { JsonLdScript } from "@/platform/seo/json-ld-script";
import { Footer, Header } from "@/platform/ui";
import { features } from "@/project/features.config";
import { grammar } from "@/project/grammar.config";
import { navigation } from "@/project/navigation.config";
import { seo } from "@/project/seo.config";
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
  const registry = parseSeoRegistryCsv(
    readFileSync(join(process.cwd(), seo.registryPath), "utf8"),
  );
  const headerGroups = navigation.header
    .map((group) =>
      resolveNavGroup(group, grammar, features, registry, navigation.labels),
    )
    .filter((group) => group.items.length > 0);
  const footerColumns = navigation.footer
    .map((group) =>
      resolveNavGroup(group, grammar, features, registry, navigation.labels),
    )
    .filter((group) => group.items.length > 0);
  const ctaHref =
    buildHref(grammar, features, navigation.ctaPageKey) ??
    buildHref(grammar, features, "home") ??
    "/";
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <JsonLdScript data={agentJsonLd} />
        <Header
          brand={site.brand}
          ctaHref={ctaHref}
          ctaLabel={navigation.ctaLabel}
          groups={headerGroups}
          phone={site.phoneDisplay}
        />
        {children}
        <Footer
          columns={footerColumns}
          copyright={`© ${new Date().getFullYear()} ${site.brand}`}
          legal={`${site.legalName}, ИНН ${site.inn}, ${site.address}, ${site.phoneDisplay}, ${site.email}, ${site.hoursDisplay}`}
        />
      </body>
    </html>
  );
}
