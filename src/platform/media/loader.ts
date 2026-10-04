export function buildMediaSrc(
  src: string,
  width: number,
  origin: string,
): string {
  if (!origin) {
    return src;
  }
  if (src.startsWith("/")) {
    const base = origin.replace(/\/$/, "");
    const joiner = src.includes("?") ? "&" : "?";
    return `${base}${src}${joiner}w=${width}`;
  }
  try {
    const url = new URL(src);
    const allowed = new URL(origin);
    if (url.origin !== allowed.origin) {
      return src;
    }
    url.searchParams.set("w", String(width));
    return url.href;
  } catch {
    return src;
  }
}
