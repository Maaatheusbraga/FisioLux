import { cn } from "@/utils/cn";
import type { HTMLAttributes } from "react";

export function Badge({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-border bg-surface px-1.5 py-0.5 text-2xs font-medium text-ink-muted",
        className,
      )}
      {...props}
    />
  );
}
