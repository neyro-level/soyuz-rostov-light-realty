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
    <article className="flex h-full flex-col justify-between rounded-md border border-border-strong bg-surface-primary p-lg">
      <div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="mt-sm text-sm text-muted-foreground">{text}</p>
      </div>
      <div className="mt-lg">
        <LeadDialog ctaLabel={ctaLabel} leadForm={leadForm} />
      </div>
    </article>
  );
}
