import type { Metadata } from "next";
import { OptInAnalytics } from "@/platform/analytics";
import { buildHref } from "@/platform/grammar";
import { resolveNavGroup } from "@/platform/nav";
import { buildRealEstateAgentJsonLd } from "@/platform/seo";
import { JsonLdScript } from "@/platform/seo/json-ld-script";
import { Footer, Header } from "@/platform/ui";
import { analytics } from "@/project/analytics.config";
import { features } from "@/project/features.config";
import { grammar } from "@/project/grammar.config";
import { navigation } from "@/project/navigation.config";
import { loadRegistry } from "@/project/runtime";
import { site } from "@/project/site.config";
import { copyrightLine, legalLine, uiText } from "@/project/ui-text.config";
import { manrope } from "@/ui/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.siteUrl),
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
  const registry = loadRegistry();
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
    <html lang="ru" className={`${manrope.variable} h-full antialiased`}>
      <body className={`${manrope.className} min-h-full flex flex-col`}>
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
          copyright={copyrightLine(new Date().getFullYear())}
          legal={legalLine()}
        />
        <OptInAnalytics
          acceptLabel={uiText.analytics.acceptLabel}
          counterId={analytics.counterId}
          declineLabel={uiText.analytics.declineLabel}
          prompt={uiText.analytics.prompt}
        />
      </body>
    </html>
  );
}
