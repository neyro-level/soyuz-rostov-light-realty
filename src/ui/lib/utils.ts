import { cn as cnMerge } from "cn";

export function cn(...inputs: Parameters<typeof cnMerge>) {
  return cnMerge(...inputs);
}
