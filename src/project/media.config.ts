import { env } from "@/platform/env";
import { site } from "./site.config";

export const media = {
  origin: env.MEDIA_ORIGIN ?? site.siteUrl,
};
