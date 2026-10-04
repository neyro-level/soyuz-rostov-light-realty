import type { ReactNode } from "react";

export function Filters({ children }: { children: ReactNode }) {
  return (
    <form className="flex flex-col gap-sm border border-border bg-surface p-md">
      {children}
    </form>
  );
}
