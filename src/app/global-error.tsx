"use client";

import { useEffect } from "react";
import { uiText } from "@/project/ui-text.config";

export default function GlobalError({
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
    <html lang="ru">
      <body>
        <main>
          <h1>{uiText.appShell.errorTitle}</h1>
          <p>{uiText.appShell.errorLead}</p>
          <button onClick={() => reset()} type="button">
            {uiText.appShell.retryLabel}
          </button>
        </main>
      </body>
    </html>
  );
}
