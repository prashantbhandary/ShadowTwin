"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border transition-colors",
  {
    variants: {
      variant: {
        default: "bg-cyan-400/10 border-cyan-400/30 text-cyan-400",
        low: "bg-emerald-400/10 border-emerald-400/30 text-emerald-400",
        medium: "bg-amber-400/10 border-amber-400/30 text-amber-400",
        high: "bg-orange-400/10 border-orange-400/30 text-orange-400",
        critical: "bg-red-400/10 border-red-400/30 text-red-400",
        info: "bg-blue-400/10 border-blue-400/30 text-blue-400",
        purple: "bg-purple-400/10 border-purple-400/30 text-purple-400",
        ghost: "bg-white/5 border-white/10 text-slate-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
