"use client";

import type { LeadFormConfig } from "@/ui/layout/header";
import { LeadDialog } from "@/ui/shared/lead-dialog";

export function SelectionServiceCard({
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
      className="flex h-full flex-col justify-between rounded-md border border-[var(--sr-border-strong)] bg-[var(--sr-surface-primary)] p-[var(--sr-space-lg)]"
    >
      <div>
        <h3 className="font-semibold text-[var(--sr-foreground)]">{title}</h3>
        <p className="mt-[var(--sr-space-sm)] text-sm text-[var(--sr-muted-foreground)]">
          {text}
        </p>
      </div>
      <div className="mt-[var(--sr-space-lg)]">
        <LeadDialog ctaLabel={ctaLabel} leadForm={leadForm} />
      </div>
    </article>
  );
}
