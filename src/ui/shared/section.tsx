import type { ReactNode } from "react";
import { cn } from "@/ui/lib/utils";

const tones = {
  default: "bg-background",
  soft: "bg-surface-soft",
  primary: "bg-surface-primary",
} as const;

const sizes = {
  sm: "py-section-sm md:py-section-sm-desktop",
  md: "py-section-md md:py-section-md-desktop",
  lg: "py-section-lg md:py-section-lg-desktop",
  hero: "py-section-hero md:py-section-hero-desktop",
} as const;

export function Section({
  children,
  className,
  tone = "default",
  size = "md",
}: {
  children: ReactNode;
  className?: string;
  tone?: keyof typeof tones;
  size?: keyof typeof sizes;
}) {
  return (
    <section className={cn(tones[tone], sizes[size], className)}>
      {children}
    </section>
  );
}
