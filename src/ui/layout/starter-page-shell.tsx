import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "@/ui/layout/breadcrumbs";
import { Container } from "@/ui/shared/container";
import { Section } from "@/ui/shared/section";

export type StarterPageShellProps = {
  breadcrumbs?: Crumb[];
  title: string;
  lead: string;
  cta?: ReactNode;
  children?: ReactNode;
};

/**
 * Starter layout for routes before full marketing design (max two meaning blocks).
 */
export function StarterPageShell({
  breadcrumbs,
  title,
  lead,
  cta,
  children,
}: StarterPageShellProps) {
  return (
    <main className="flex-1">
      <Section>
        <Container>
          {breadcrumbs && breadcrumbs.length > 0 ? (
            <Breadcrumbs className="mb-md py-0" items={breadcrumbs} />
          ) : null}
          <header className="max-w-3xl">
            <h1 className="mb-md font-semibold text-h1 leading-heading text-foreground">
              {title}
            </h1>
            <p className="mb-lg text-body-lg leading-relaxed text-muted-foreground">
              {lead}
            </p>
            {cta ? <div className="mb-md">{cta}</div> : null}
          </header>
        </Container>
      </Section>
      {children ? (
        <Section tone="soft">
          <Container>{children}</Container>
        </Section>
      ) : null}
    </main>
  );
}
