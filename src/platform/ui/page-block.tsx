import type { ReactNode } from "react";

export function PageBlock({
  heading,
  body,
  children,
}: {
  heading: string;
  body: string;
  children?: ReactNode;
}) {
  return (
    <main className="flex-1 px-md py-lg">
      <h1 className="mb-md text-fg">{heading}</h1>
      <p className="mb-lg text-muted">{body}</p>
      {children}
    </main>
  );
}
