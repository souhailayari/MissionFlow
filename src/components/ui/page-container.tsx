import type { ReactNode } from "react";
import { cn } from "cn";

export function PageContainer({ children, className }: Readonly<{ children: ReactNode; className?: string }>) {
  return <div className={cn("mx-auto w-full max-w-[1440px] min-w-0 space-y-6 sm:space-y-7", className)}>{children}</div>;
}
