import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";
import type { ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition duration-150 ease-out disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-fg hover:brightness-110 active:brightness-95",
        secondary:
          "border border-border bg-surface-raised text-ink hover:bg-surface",
        ghost: "text-ink-muted hover:bg-surface hover:text-ink",
        danger: "bg-danger text-white hover:brightness-110",
      },
      size: {
        sm: "min-h-10 h-10 px-3.5 text-sm md:h-8 md:min-h-8 md:px-3 md:text-xs",
        md: "min-h-11 h-11 px-4 md:h-10 md:min-h-10",
        lg: "min-h-12 h-12 px-5 md:h-11 md:min-h-11",
        icon: "h-11 w-11 md:h-9 md:w-9",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({
  className,
  variant,
  size,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
