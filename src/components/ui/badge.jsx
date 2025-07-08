import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export function Badge({ variant = "default", className, ...props }) {
  let base = "inline-flex items-center px-3 py-1 rounded-full font-medium text-sm shadow-sm transition-all";
  let variants = {
    default: "bg-[#7ed6a7]/80 text-[#222] border border-[#7ed6a7]/30 backdrop-blur-[2px]",
    secondary: "bg-[#b8b5ff]/80 text-[#222] border border-[#b8b5ff]/30 backdrop-blur-[2px]",
    destructive: "bg-[#ffb3ab]/80 text-[#222] border border-[#ffb3ab]/30 backdrop-blur-[2px]",
  };
  return (
    <span className={cn(base, variants[variant] || variants.default, className)} {...props} />
  );
}
