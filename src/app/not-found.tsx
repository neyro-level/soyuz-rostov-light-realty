import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fillSeoTemplate, parseSeoRegistryCsv } from "@/platform/seo";
import { PageBlock } from "@/platform/ui";
import { seo } from "@/project/seo.config";

export default function NotFound() {
  const rows = parseSeoRegistryCsv(
    readFileSync(join(process.cwd(), seo.registryPath), "utf8"),
  );
  const row = rows.find((item) => item.pageKey === "notFound");
  return (
    <PageBlock
      body={fillSeoTemplate(row?.description ?? "", {})}
      heading={fillSeoTemplate(row?.h1 ?? "Not found", {})}
    />
  );
}
