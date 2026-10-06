import type { Metadata } from "next";
import { toNextMetadata } from "@/platform/seo";
import { resolveAppMetadata } from "@/project/runtime";
import { SitePage } from "./site-page";

export function generateMetadata(): Metadata {
  return toNextMetadata(resolveAppMetadata("home"));
}

export default function Home() {
  return <SitePage pageKey="home" />;
}
