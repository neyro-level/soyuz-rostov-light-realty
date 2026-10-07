"use client";

import { LeadForm } from "@/ui/domain/lead-form";
import type { LeadFormConfig } from "@/ui/layout/header";
import { Button } from "@/ui/primitives/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/ui/primitives/dialog";

export function LeadDialog({
  ctaLabel,
  leadForm,
  variant = "default",
  className,
}: {
  ctaLabel: string;
  leadForm: LeadFormConfig;
  variant?: "default" | "outline" | "secondary";
  className?: string;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className={className ?? "min-h-11"}
          type="button"
          variant={variant}
        >
          {ctaLabel}
        </Button>
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
