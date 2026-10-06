import { buildHref } from "@/platform/grammar";
import { features } from "./features.config";
import { grammar } from "./grammar.config";

export const homeHref = buildHref(grammar, features, "home") ?? "/";
