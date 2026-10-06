import { Button } from "@/ui/primitives/button";

export function CTA({ href, label }: { href: string; label: string }) {
  return (
    <Button asChild>
      <a href={href}>{label}</a>
    </Button>
  );
}
