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
    <article className="flex h-full flex-col justify-center rounded-md border border-dashed border-border-strong bg-surface-soft p-lg">
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="mt-sm text-sm text-muted-foreground">{text}</p>
      <div className="mt-md">
        <LeadDialog ctaLabel={ctaLabel} leadForm={leadForm} variant="outline" />
      </div>
    </article>
  );
}
