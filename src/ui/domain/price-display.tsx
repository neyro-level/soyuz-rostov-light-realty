export function PriceDisplay({
  value,
  hidden,
}: {
  value?: string;
  hidden?: boolean;
}) {
  if (hidden || !value) {
    return <span className="text-muted">Price on request</span>;
  }
  return <span className="font-medium text-fg">{value}</span>;
}
