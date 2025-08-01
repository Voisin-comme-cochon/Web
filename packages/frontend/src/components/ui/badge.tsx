import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow",
        outline: "text-foreground",
      },
      hover: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "default",
        hover: true,
        class: "hover:bg-primary/80",
      },
      {
        variant: "secondary",
        hover: true,
        class: "hover:bg-secondary/80",
      },
      {
        variant: "destructive",
        hover: true,
        class: "hover:bg-destructive/80",
      },
    ],
    defaultVariants: {
      variant: "default",
      hover: true,
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  hover?: boolean;
}

function Badge({ className, variant, hover = true, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, hover }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
