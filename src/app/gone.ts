export const GONE_DIGEST = "NEXT_HTTP_ERROR_FALLBACK;410";

export function gone(): never {
  const error = new Error("Gone");
  (error as Error & { digest?: string }).digest = GONE_DIGEST;
  throw error;
}
