import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { cn } from "cn";

type StatTone = "brand" | "info" | "success" | "warning" | "danger";

const toneStyles: Record<StatTone, { accent: string; icon: string }> = {
  brand: { accent: "before:bg-[var(--brand)]", icon: "bg-[var(--brand-soft)] text-[var(--brand-strong)]" },
  info: { accent: "before:bg-[var(--info)]", icon: "bg-[var(--info-soft)] text-[var(--info)]" },
  success: { accent: "before:bg-[var(--success)]", icon: "bg-[var(--success-soft)] text-[var(--success)]" },
  warning: { accent: "before:bg-[var(--warning)]", icon: "bg-[var(--warning-soft)] text-[var(--warning)]" },
  danger: { accent: "before:bg-[var(--danger)]", icon: "bg-[var(--danger-soft)] text-[var(--danger)]" },
};

export function StatCard({ label, value, description, icon, loading = false, className, tone = "brand" }: Readonly<{ label: string; value: string | number | undefined; description?: string; icon?: ReactNode; loading?: boolean; className?: string; tone?: StatTone }>) {
  return (
    <Card className={cn("relative min-h-[138px] justify-between gap-4 overflow-hidden rounded-2xl p-4 sm:p-5 before:absolute before:inset-y-4 before:left-0 before:w-1 before:rounded-r-full", toneStyles[tone].accent, "hover:-translate-y-0.5 hover:shadow-[var(--shadow-hover)]", className)}>
      <div className="flex min-w-0 items-center justify-between gap-2">
        {icon && <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", toneStyles[tone].icon)}>{icon}</div>}
        <p className="truncate text-[11px] font-semibold tracking-[0.01em] text-[var(--text-muted)]">{label}</p>
      </div>
      {loading ? <Skeleton className="h-9 w-16 rounded-lg" /> : <p className="font-editorial text-[36px] leading-none tabular-nums text-[var(--text)]">{value ?? 0}</p>}
      {description && <p className="truncate text-xs text-[var(--text-muted)]">{description}</p>}
    </Card>
  );
}
