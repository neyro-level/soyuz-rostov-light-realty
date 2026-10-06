import type { ReactNode } from "react";

export function CatalogToolbar({ children }: { children: ReactNode }) {
  return (
    <div className="mb-md flex flex-wrap items-center justify-between gap-md">
      {children}
    </div>
  );
}
