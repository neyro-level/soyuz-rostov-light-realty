"use client";

import Link from "next/link";
import { useEffect } from "react";
import { StarterPageShell } from "@/platform/ui";
import { homeHref } from "@/project/home-href";
import { uiText } from "@/project/ui-text.config";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StarterPageShell
      lead={uiText.appShell.errorLead}
      title={uiText.appShell.errorTitle}
    >
      <div className="flex flex-col gap-[var(--sr-space-md)]">
        <button
          className="inline-flex min-h-11 w-fit items-center rounded-lg bg-[var(--sr-primary)] px-[var(--sr-space-md)] text-[var(--sr-primary-foreground)]"
          onClick={() => reset()}
          type="button"
        >
          {uiText.appShell.retryLabel}
        </button>
        <Link
          className="text-[var(--sr-primary)] underline-offset-4 hover:underline"
          href={homeHref}
        >
          {uiText.appShell.homeLinkLabel}
        </Link>
      </div>
    </StarterPageShell>
  );
}
