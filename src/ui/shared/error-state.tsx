export function ErrorState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div
      className="rounded-md border border-destructive bg-surface p-lg"
      role="alert"
    >
      <p className="font-medium text-fg">{title}</p>
      <p className="mt-sm text-muted">{message}</p>
    </div>
  );
}
