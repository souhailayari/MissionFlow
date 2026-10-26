import type { ReactNode } from "react";
import { cn } from "cn";

export function FilterToolbar({ children, className, label }: Readonly<{ children: ReactNode; className?: string; label?: string }>) {
  return (
    <section aria-label={label} className={cn("rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)] sm:p-5", className)}>
      {children}
    </section>
  );
}
