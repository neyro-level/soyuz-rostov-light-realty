"use client";

import { MenuIcon } from "lucide-react";
import type { NavGroup, NavItem } from "@/platform/nav";
import { LeadForm } from "@/ui/domain/lead-form";
import { Container } from "@/ui/shared/container";
import { Button } from "@/ui/primitives/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/ui/primitives/dialog";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/ui/primitives/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/ui/primitives/sheet";
export type { NavGroup, NavItem } from "@/platform/nav";

export type LeadFormConfig = {
  actionUrl: string;
  consentHref: string;
  thanksUrl: string;
  nameLabel: string;
  phoneLabel: string;
  consentLabel: string;
  consentLinkLabel: string;
  submitLabel: string;
  retryMessage: string;
  transportDisabledMessage: string;
  pageKey: string;
};

export function Header({
  brand,
  homeHref,
  phoneDisplay,
  phoneTel,
  groups,
  ctaLabel,
  searchHref,
  favoritesHref,
  searchLabel,
  favoritesLabel,
  leadForm,
}: {
  brand: string;
  homeHref: string;
  phoneDisplay?: string;
  phoneTel?: string;
  groups: NavGroup[];
  ctaLabel: string;
  searchHref?: string;
  favoritesHref?: string;
  searchLabel?: string;
  favoritesLabel?: string;
  leadForm: LeadFormConfig;
}) {
  return (
    <header className="border-b border-border bg-[var(--sr-background)]">
      <Container className="px-[var(--sr-container-padding-mobile)] md:px-[var(--sr-container-padding-tablet)] lg:px-[var(--sr-container-padding-desktop)]">
        <div className="flex min-h-11 flex-wrap items-center justify-between gap-[var(--sr-space-md)] py-[var(--sr-space-sm)]">
          <a
            className="inline-flex min-h-11 items-center font-semibold text-[var(--sr-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sr-primary)]"
            href={homeHref}
          >
            {brand}
          </a>
          <div className="flex flex-wrap items-center gap-[var(--sr-space-sm)]">
            {phoneDisplay && phoneTel ? (
              <a
                className="inline-flex min-h-11 items-center px-[var(--sr-space-sm)] text-[var(--sr-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sr-primary)]"
                href={`tel:${phoneTel}`}
              >
                {phoneDisplay}
              </a>
            ) : null}
            {searchHref && searchLabel ? (
              <NavUtilityLink href={searchHref} label={searchLabel} />
            ) : null}
            {favoritesHref && favoritesLabel ? (
              <NavUtilityLink href={favoritesHref} label={favoritesLabel} />
            ) : null}
            <LeadDialog ctaLabel={ctaLabel} leadForm={leadForm} />
          </div>
        </div>
        <div className="hidden border-t border-border pb-[var(--sr-space-sm)] md:block">
          <DesktopNav groups={groups} />
        </div>
        <div className="flex justify-end border-t border-border py-[var(--sr-space-sm)] md:hidden">
          <MobileNav
            brand={brand}
            ctaLabel={ctaLabel}
            groups={groups}
            leadForm={leadForm}
            phoneDisplay={phoneDisplay}
            phoneTel={phoneTel}
          />
        </div>
      </Container>
    </header>
  );
}

function NavUtilityLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      className="inline-flex min-h-11 min-w-11 items-center justify-center px-[var(--sr-space-sm)] text-[var(--sr-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sr-primary)]"
      href={href}
    >
      {label}
    </a>
  );
}

function DesktopNav({ groups }: { groups: NavGroup[] }) {
  return (
    <NavigationMenu aria-label="Main" className="justify-start">
      <NavigationMenuList>
        {groups.map((group) => (
          <NavigationMenuItem key={group.title}>
            <NavigationMenuTrigger className="min-h-11 bg-transparent">
              {group.title}
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid min-w-[12rem] gap-[var(--sr-space-xs)] p-[var(--sr-space-md)]">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <NavigationMenuLink
                      className="block rounded-md px-[var(--sr-space-sm)] py-[var(--sr-space-xs)] hover:bg-[var(--sr-surface-soft)]"
                      href={item.href}
                    >
                      {item.label}
                    </NavigationMenuLink>
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function LeadDialog({
  ctaLabel,
  leadForm,
}: {
  ctaLabel: string;
  leadForm: LeadFormConfig;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="min-h-11" type="button">{ctaLabel}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{ctaLabel}</DialogTitle>
        </DialogHeader>
        <LeadForm {...leadForm} />
      </DialogContent>
    </Dialog>
  );
}

function MobileNav({
  groups,
  brand,
  ctaLabel,
  leadForm,
  phoneDisplay,
  phoneTel,
}: {
  groups: NavGroup[];
  brand: string;
  ctaLabel: string;
  leadForm: LeadFormConfig;
  phoneDisplay?: string;
  phoneTel?: string;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          aria-label="Открыть меню"
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
        <nav aria-label="Mobile" className="flex flex-col gap-[var(--sr-space-lg)]">
          {groups.map((group) => (
            <div key={group.title}>
              <p className="mb-[var(--sr-space-sm)] font-semibold text-[var(--sr-foreground)]">
                {group.title}
              </p>
              <ul className="flex flex-col gap-[var(--sr-space-sm)]">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <a
                      className="inline-flex min-h-11 items-center text-[var(--sr-foreground)]"
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
            <a className="min-h-11 text-[var(--sr-foreground)]" href={`tel:${phoneTel}`}>
              {phoneDisplay}
            </a>
          ) : null}
          <LeadDialog ctaLabel={ctaLabel} leadForm={leadForm} />
        </nav>
      </SheetContent>
    </Sheet>
  );
}
