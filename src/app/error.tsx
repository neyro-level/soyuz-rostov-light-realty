"use client";

import Link from "next/link";
import { useEffect } from "react";
import { homeHref } from "@/project/home-href";
import { uiText } from "@/project/ui-text.config";
import { Button } from "@/ui/primitives/button";
import { ErrorState } from "@/ui/shared/error-state";

/** Next.js App Router error boundary — export name must be `Error`. */
// biome-ignore lint/suspicious/noShadowRestrictedNames: required by Next.js error.tsx convention
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
    <div className="flex flex-1 flex-col items-center justify-center p-lg">
      <div className="flex w-full max-w-xl flex-col gap-md">
        <ErrorState
          message={uiText.appShell.errorLead}
          title={uiText.appShell.errorTitle}
        />
        <Button onClick={() => reset()} type="button">
          {uiText.appShell.retryLabel}
        </Button>
        <Button asChild variant="link">
          <Link href={homeHref}>{uiText.appShell.homeLinkLabel}</Link>
        </Button>
      </div>
    </div>
  );
}
