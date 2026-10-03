import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  loadFixtureInventory,
  loadFixtureJson,
} from "@/platform/catalog/local";
import { buildHref } from "@/platform/grammar";
import { fillSeoTemplate, parseSeoRegistryCsv } from "@/platform/seo";
import {
  CatalogGrid,
  DevelopmentCard,
  LeadForm,
  PageBlock,
  PropertyCard,
} from "@/platform/ui";
import { data } from "@/project/data.config";
import { features } from "@/project/features.config";
import { grammar } from "@/project/grammar.config";
import { seo } from "@/project/seo.config";

const root = process.cwd();

function registryRows() {
  return parseSeoRegistryCsv(
    readFileSync(join(root, seo.registryPath), "utf8"),
  );
}

export function SitePage({
  pageKey,
  params = {},
}: {
  pageKey: string;
  params?: Record<string, string>;
}) {
  const row = registryRows().find((item) => item.pageKey === pageKey);
  if (!row) {
    return <PageBlock body="Missing registry row." heading={pageKey} />;
  }
  const vars: Record<string, string | undefined> = {
    ...params,
    Застройщик: params.slug,
    Название: params.slug,
    N: "1",
    S: "32",
    "ЖК|район": params.slug,
    semantic: params.semantic,
    id: params.id,
  };
  const heading = fillSeoTemplate(row.h1, vars);
  const body = fillSeoTemplate(row.description, vars);
  const consentHref = buildHref(grammar, features, "consent") ?? "/";
  const thanksUrl = buildHref(grammar, features, "thanks") ?? "/";
  return (
    <PageBlock body={body} heading={heading}>
      <CatalogSlot pageKey={pageKey} />
      {pageKey === "contacts" ? (
        <LeadForm
          actionUrl="/api/public/leads/"
          consentHref={consentHref}
          consentLabel="Согласен на обработку"
          nameLabel="Имя"
          pageKey={pageKey}
          phoneLabel="Телефон"
          submitLabel="Отправить"
          thanksUrl={thanksUrl}
        />
      ) : null}
    </PageBlock>
  );
}

function CatalogSlot({ pageKey }: { pageKey: string }) {
  if (
    pageKey !== "catNovostroyki" &&
    pageKey !== "catKvartiry" &&
    pageKey !== "facetVtorichka" &&
    !pageKey.startsWith("dist")
  ) {
    if (pageKey === "developers") {
      const developers = loadFixtureJson<Array<{ uid: string; name: string }>>(
        root,
        data.fixtureDir,
        "developers.json",
      ).slice(0, 12);
      return (
        <CatalogGrid>
          {developers.map((item) => {
            const href = buildHref(grammar, features, "developer", {
              slug: item.uid,
            });
            return href ? (
              <DevelopmentCard
                href={href}
                key={item.uid}
                meta={item.uid}
                title={item.name}
              />
            ) : null;
          })}
        </CatalogGrid>
      );
    }
    return null;
  }
  const listings = loadFixtureInventory(root, data.fixtureDir).slice(0, 12);
  return (
    <CatalogGrid>
      {listings.map((item) => {
        const rooms =
          "rooms" in item.facts && typeof item.facts.rooms === "number"
            ? item.facts.rooms
            : 1;
        const href = buildHref(grammar, features, "property", {
          semantic: `${rooms}k`,
          id: item.publicUrlId,
        });
        return href ? (
          <PropertyCard
            href={href}
            key={item.uid}
            meta={item.addressPublic}
            title={item.addressPublic}
          />
        ) : null;
      })}
    </CatalogGrid>
  );
}
