export function Pagination({
  prevHref,
  nextHref,
  prevLabel,
  nextLabel,
}: {
  prevHref?: string | null;
  nextHref?: string | null;
  prevLabel: string;
  nextLabel: string;
}) {
  return (
    <nav aria-label="Pagination" className="flex gap-md px-md py-md">
      {prevHref ? (
        <a
          className="rounded-sm border border-border px-md py-sm text-fg"
          href={prevHref}
        >
          {prevLabel}
        </a>
      ) : (
        <span className="text-muted">{prevLabel}</span>
      )}
      {nextHref ? (
        <a
          className="rounded-sm border border-border px-md py-sm text-fg"
          href={nextHref}
        >
          {nextLabel}
        </a>
      ) : (
        <span className="text-muted">{nextLabel}</span>
      )}
    </nav>
  );
}
