"use client";

import type { NavGroup } from "@/platform/nav";
import type { LeadFormConfig } from "@/ui/layout/header";
import { MobileNavigation } from "@/ui/layout/mobile-navigation";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/ui/primitives/navigation-menu";
import { LeadDialog } from "@/ui/shared/lead-dialog";

export function HeaderInteractive({
  brand,
  phoneDisplay,
  phoneTel,
  groups,
  ctaLabel,
  searchHref,
  favoritesHref,
  searchLabel,
  favoritesLabel,
  leadForm,
  menuLabel,
}: {
  brand: string;
  phoneDisplay?: string;
  phoneTel?: string;
  groups: NavGroup[];
  ctaLabel: string;
  searchHref?: string;
  favoritesHref?: string;
  searchLabel?: string;
  favoritesLabel?: string;
  leadForm: LeadFormConfig;
  menuLabel: string;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center justify-end gap-sm">
        {phoneDisplay && phoneTel ? (
          <a
            className="inline-flex min-h-11 items-center px-sm text-foreground focus-visible:outline-none focus-visible:shadow-focus"
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
      <div className="hidden w-full border-t border-border pb-sm md:block">
        <DesktopNav groups={groups} />
      </div>
      <div className="flex w-full justify-end border-t border-border py-sm md:hidden">
        <MobileNavigation
          brand={brand}
          ctaLabel={ctaLabel}
          groups={groups}
          leadForm={leadForm}
          menuLabel={menuLabel}
          phoneDisplay={phoneDisplay}
          phoneTel={phoneTel}
        />
      </div>
    </div>
  );
}

function NavUtilityLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      className="inline-flex min-h-11 min-w-11 items-center justify-center px-sm text-primary focus-visible:outline-none focus-visible:shadow-focus"
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
              <ul className="grid min-w-[12rem] gap-xs p-md">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <NavigationMenuLink
                      className="block rounded-md px-sm py-xs hover:bg-surface-soft"
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
