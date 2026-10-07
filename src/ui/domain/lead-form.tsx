"use client";

import { useState } from "react";
import { Button } from "@/ui/primitives/button";
import { Checkbox } from "@/ui/primitives/checkbox";
import { Input } from "@/ui/primitives/input";
import { Label } from "@/ui/primitives/label";

export function LeadForm({
  actionUrl,
  consentHref,
  thanksUrl,
  nameLabel,
  phoneLabel,
  consentLabel,
  consentLinkLabel,
  submitLabel,
  retryMessage,
  transportDisabledMessage,
  pageKey,
}: {
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
}) {
  const [error, setError] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  return (
    <form
      className="flex max-w-xl flex-col gap-md border border-border bg-surface p-md"
      onSubmit={async (event) => {
        event.preventDefault();
        setError(null);
        const form = event.currentTarget;
        const data = new FormData(form);
        const response = await fetch(actionUrl, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            name: String(data.get("name") ?? ""),
            phone: String(data.get("phone") ?? ""),
            consent,
            website: String(data.get("website") ?? ""),
            pageKey,
          }),
        });
        if (response.status === 503) {
          const payload = (await response.json().catch(() => null)) as {
            code?: string;
          } | null;
          if (payload?.code === "lead_transport_disabled") {
            setError("transport");
            return;
          }
        }
        if (!response.ok) {
          setError("retry");
          return;
        }
        window.location.assign(thanksUrl);
      }}
    >
      <Label className="flex flex-col gap-sm text-fg">
        {nameLabel}
        <Input name="name" required type="text" />
      </Label>
      <Label className="flex flex-col gap-sm text-fg">
        {phoneLabel}
        <Input name="phone" required type="tel" />
      </Label>
      <Input
        aria-hidden="true"
        autoComplete="off"
        className="absolute -left-[9999px] h-px w-px overflow-hidden"
        name="website"
        tabIndex={-1}
      />
      <Label className="flex items-center gap-sm text-muted">
        <Checkbox
          checked={consent}
          onCheckedChange={(value) => setConsent(value === true)}
          required
        />
        <span>
          {consentLabel}{" "}
          <a className="text-fg underline" href={consentHref}>
            {consentLinkLabel}
          </a>
        </span>
      </Label>
      {error === "transport" ? (
        <p className="text-muted">{transportDisabledMessage}</p>
      ) : null}
      {error === "retry" ? <p className="text-muted">{retryMessage}</p> : null}
      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}
