"use client";

import { MenuIcon } from "lucide-react";
import type { NavGroup } from "@/platform/nav";
import type { LeadFormConfig } from "@/ui/layout/header";
import { Button } from "@/ui/primitives/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/ui/primitives/sheet";
import { LeadDialog } from "@/ui/shared/lead-dialog";

export function MobileNavigation({
  groups,
  brand,
  ctaLabel,
  leadForm,
  phoneDisplay,
  phoneTel,
  menuLabel,
}: {
  groups: NavGroup[];
  brand: string;
  ctaLabel: string;
  leadForm: LeadFormConfig;
  phoneDisplay?: string;
  phoneTel?: string;
  menuLabel: string;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          aria-label={menuLabel}
          className="min-h-11 min-w-11"
          size="icon"
          type="button"
          variant="outline"
        >
          <MenuIcon aria-hidden />
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>{brand}</SheetTitle>
        </SheetHeader>
        <nav aria-label="Mobile" className="flex flex-col gap-lg">
          {groups.map((group) => (
            <div key={group.title}>
              <p className="mb-sm font-semibold text-foreground">
                {group.title}
              </p>
              <ul className="flex flex-col gap-sm">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <a
                      className="inline-flex min-h-11 items-center text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      href={item.href}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {phoneDisplay && phoneTel ? (
            <a
              className="inline-flex min-h-11 items-center text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              href={`tel:${phoneTel}`}
            >
              {phoneDisplay}
            </a>
          ) : null}
          <LeadDialog ctaLabel={ctaLabel} leadForm={leadForm} />
        </nav>
      </SheetContent>
    </Sheet>
  );
}
