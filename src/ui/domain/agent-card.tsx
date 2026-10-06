export function AgentCard({
  name,
  role,
  href,
}: {
  name: string;
  role?: string;
  href: string;
}) {
  return (
    <article className="rounded-md border border-border bg-surface p-md shadow-card">
      <h2 className="text-fg">
        <a className="text-fg" href={href}>
          {name}
        </a>
      </h2>
      {role ? <p className="mt-sm text-muted">{role}</p> : null}
    </article>
  );
}
