import type { ReactNode } from "react";

export function FilterBar({ children }: { children: ReactNode }) {
  return <FiltersForm>{children}</FiltersForm>;
}

export function Filters({ children }: { children: ReactNode }) {
  return <FiltersForm>{children}</FiltersForm>;
}

function FiltersForm({ children }: { children: ReactNode }) {
  return (
    <form className="flex flex-col gap-sm border border-border bg-surface p-md">
      {children}
    </form>
  );
}
