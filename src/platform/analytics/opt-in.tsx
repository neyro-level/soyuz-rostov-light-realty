"use client";

import { useEffect, useState } from "react";

const COOKIE_YES = "analytics_consent=1";
const COOKIE_NO = "analytics_consent=0";

export function OptInAnalytics({
  counterId,
  acceptLabel,
  declineLabel,
  prompt,
}: {
  counterId: string;
  acceptLabel: string;
  declineLabel: string;
  prompt: string;
}) {
  const [consent, setConsent] = useState<"unknown" | "yes" | "no">("unknown");
  useEffect(() => {
    const cookies = document.cookie;
    if (cookies.includes(COOKIE_YES)) {
      setConsent("yes");
      return;
    }
    if (cookies.includes(COOKIE_NO)) {
      setConsent("no");
      return;
    }
    setConsent("unknown");
  }, []);
  useEffect(() => {
    if (consent !== "yes" || !counterId) {
      return;
    }
    if (document.getElementById("ym-tag")) {
      return;
    }
    const script = document.createElement("script");
    script.id = "ym-tag";
    script.async = true;
    script.src = "https://mc.yandex.ru/metrika/tag.js";
    document.head.appendChild(script);
  }, [consent, counterId]);
  if (!counterId) {
    return null;
  }
  if (consent !== "unknown") {
    return null;
  }
  return (
    <div className="border-t border-border bg-surface px-md py-sm text-muted">
      <p>{prompt}</p>
      <div className="mt-sm flex gap-sm">
        <button
          className="rounded-sm bg-accent px-md py-sm text-accent-fg"
          onClick={() => {
            // biome-ignore lint/suspicious/noDocumentCookie: consent flag is non-PII and Cookie Store is not assumed
            document.cookie = `${COOKIE_YES}; path=/; max-age=31536000; samesite=lax`;
            setConsent("yes");
          }}
          type="button"
        >
          {acceptLabel}
        </button>
        <button
          className="rounded-sm border border-border px-md py-sm text-fg"
          onClick={() => {
            // biome-ignore lint/suspicious/noDocumentCookie: consent flag is non-PII and Cookie Store is not assumed
            document.cookie = `${COOKIE_NO}; path=/; max-age=31536000; samesite=lax`;
            setConsent("no");
          }}
          type="button"
        >
          {declineLabel}
        </button>
      </div>
    </div>
  );
}
