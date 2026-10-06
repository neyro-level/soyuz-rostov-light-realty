"use client";

import { useEffect } from "react";
import { StarterPageShell } from "@/platform/ui";
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
      lead="Произошла ошибка при загрузке страницы. Попробуйте обновить или вернитесь на главную."
      title="Что-то пошло не так"
    >
      <div className="flex flex-col gap-[var(--sr-space-md)]">
        <button
          className="inline-flex min-h-11 w-fit items-center rounded-lg bg-[var(--sr-primary)] px-[var(--sr-space-md)] text-[var(--sr-primary-foreground)]"
          onClick={() => reset()}
          type="button"
        >
          Повторить
        </button>
        <a
          className="text-[var(--sr-primary)] underline-offset-4 hover:underline"
          href="/"
        >
          На главную
        </a>
      </div>
    </StarterPageShell>
  );
}
