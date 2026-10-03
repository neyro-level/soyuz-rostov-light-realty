export function LeadForm({
  nameLabel,
  phoneLabel,
  consentLabel,
  submitLabel,
}: {
  nameLabel: string;
  phoneLabel: string;
  consentLabel: string;
  submitLabel: string;
}) {
  return (
    <form className="flex max-w-xl flex-col gap-md border border-border bg-surface p-md">
      <label className="flex flex-col gap-sm text-fg">
        {nameLabel}
        <input
          className="rounded-sm border border-border bg-bg px-md py-sm text-fg"
          name="name"
          type="text"
        />
      </label>
      <label className="flex flex-col gap-sm text-fg">
        {phoneLabel}
        <input
          className="rounded-sm border border-border bg-bg px-md py-sm text-fg"
          name="phone"
          type="tel"
        />
      </label>
      <label className="flex items-center gap-sm text-muted">
        <input name="consent" type="checkbox" />
        {consentLabel}
      </label>
      <button
        className="rounded-sm bg-accent px-md py-sm text-accent-fg"
        type="submit"
      >
        {submitLabel}
      </button>
    </form>
  );
}
