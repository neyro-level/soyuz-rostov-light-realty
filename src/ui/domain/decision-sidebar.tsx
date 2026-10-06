import type { ReactNode } from "react";

export function DecisionSidebar({ children }: { children: ReactNode }) {
  return (
    <aside className="rounded-md border border-border bg-surface p-md">
      {children}
    </aside>
  );
}
