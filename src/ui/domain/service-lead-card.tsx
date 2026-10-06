"use client";

import type { LeadFormConfig } from "@/ui/layout/header";
import { LeadDialog } from "@/ui/shared/lead-dialog";

export function ServiceLeadCard({
  title,
  text,
  ctaLabel,
  leadForm,
}: {
  title: string;
  text: string;
  ctaLabel: string;
  leadForm: LeadFormConfig;
}) {
  return (
    <article
      className="flex h-full flex-col justify-center rounded-md border border-dashed border-[var(--sr-border-strong)] bg-[var(--sr-surface-soft)] p-[var(--sr-space-lg)]"
    >
      <h3 className="font-semibold text-[var(--sr-foreground)]">{title}</h3>
      <p className="mt-[var(--sr-space-sm)] text-sm text-[var(--sr-muted-foreground)]">
        {text}
      </p>
      <div className="mt-[var(--sr-space-md)]">
        <LeadDialog ctaLabel={ctaLabel} leadForm={leadForm} variant="outline" />
      </div>
    </article>
  );
}
