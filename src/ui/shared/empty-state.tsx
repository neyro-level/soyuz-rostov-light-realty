export function EmptyState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="rounded-md border border-border bg-surface p-lg text-center">
      <p className="font-medium text-fg">{title}</p>
      <p className="mt-sm text-muted">{message}</p>
    </div>
  );
}
