"use client";

import { useState } from "react";

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
            consent: data.get("consent") === "on",
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
      <label className="flex flex-col gap-sm text-fg">
        {nameLabel}
        <input
          className="rounded-sm border border-border bg-bg px-md py-sm text-fg"
          name="name"
          required
          type="text"
        />
      </label>
      <label className="flex flex-col gap-sm text-fg">
        {phoneLabel}
        <input
          className="rounded-sm border border-border bg-bg px-md py-sm text-fg"
          name="phone"
          required
          type="tel"
        />
      </label>
      <input
        aria-hidden="true"
        autoComplete="off"
        className="absolute -left-[9999px] h-px w-px overflow-hidden"
        name="website"
        tabIndex={-1}
      />
      <label className="flex items-center gap-sm text-muted">
        <input name="consent" required type="checkbox" />
        <span>
          {consentLabel}{" "}
          <a className="text-fg underline" href={consentHref}>
            {consentLinkLabel}
          </a>
        </span>
      </label>
      {error === "transport" ? (
        <p className="text-muted">{transportDisabledMessage}</p>
      ) : null}
      {error === "retry" ? <p className="text-muted">{retryMessage}</p> : null}
      <button
        className="rounded-sm bg-accent px-md py-sm text-accent-fg"
        type="submit"
      >
        {submitLabel}
      </button>
    </form>
  );
}
