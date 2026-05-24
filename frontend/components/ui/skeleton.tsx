"use client";

import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-md shimmer bg-white/5",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
