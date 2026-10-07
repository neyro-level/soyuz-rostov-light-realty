import { notFound, permanentRedirect } from "next/navigation";
import type { LifecycleDecision } from "@/platform/lifecycle";
import { gone } from "./gone";

export function applyLifecycleDecision(decision: LifecycleDecision | null) {
  if (!decision) {
    return;
  }
  if (decision.status === 404) {
    notFound();
  }
  if (decision.status === 410) {
    gone();
  }
  if (decision.status === 308 && decision.location) {
    permanentRedirect(decision.location);
  }
}
