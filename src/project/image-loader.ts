import { buildMediaSrc } from "@/platform/media";
import { media } from "@/project/media.config";

export default function imageLoader({
  src,
  width,
}: {
  src: string;
  width: number;
}): string {
  return buildMediaSrc(src, width, media.origin);
}
