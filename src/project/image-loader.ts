import { buildMediaSrc } from "../platform/media";
import { media } from "./media.config";

export default function imageLoader({
  src,
  width,
}: {
  src: string;
  width: number;
}): string {
  return buildMediaSrc(src, width, media.origin);
}
