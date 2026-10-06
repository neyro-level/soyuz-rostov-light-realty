import type { ReactNode } from "react";
import { StarterPageShell } from "@/ui/layout/starter-page-shell";

export { StarterPageShell, type StarterPageShellProps } from "@/ui/layout/starter-page-shell";

/** @deprecated Prefer StarterPageShell */
export function PageShell({
  heading,
  body,
  children,
}: {
  heading: string;
  body: string;
  children?: ReactNode;
}) {
  return (
    <StarterPageShell lead={body} title={heading}>
      {children}
    </StarterPageShell>
  );
}

/** @deprecated Use StarterPageShell */
export const PageBlock = PageShell;
