import type { ReactNode } from "react";

export function CatalogGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-md px-md py-md md:grid-cols-2">{children}</div>
  );
}
