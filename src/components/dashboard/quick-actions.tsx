import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";

export type QuickActionTone = "brand" | "info" | "success" | "warning";
export type QuickAction = { label: string; href: string; available?: boolean; icon?: LucideIcon; tone?: QuickActionTone };

const actionKey = (action: QuickAction) => `${action.href}:${action.label}`;
const toneStyles: Record<QuickActionTone, { surface: string; icon: string }> = {
  brand: { surface: "bg-[var(--brand-soft)]", icon: "text-[var(--brand-strong)]" },
  info: { surface: "bg-[var(--info-soft)]", icon: "text-[var(--info)]" },
  success: { surface: "bg-[var(--success-soft)]", icon: "text-[var(--success)]" },
  warning: { surface: "bg-[var(--warning-soft)]", icon: "text-[var(--warning)]" },
};

export function QuickActions({ actions }: Readonly<{ actions: QuickAction[] }>) {
  if (actions.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
      {actions.map((action) => {
        const Icon = action.icon;
        const tone = toneStyles[action.tone ?? "brand"];
        const content = (
          <>
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/75 ${tone.icon}`}>
              {Icon ? <Icon className="h-4 w-4" aria-hidden="true" /> : <ArrowUpRight className="h-4 w-4" aria-hidden="true" />}
            </span>
            <span className="line-clamp-2 min-w-0 flex-1 text-left text-xs font-semibold leading-4">{action.label}</span>
            {action.available === false ? (
              <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">Bientôt</span>
            ) : (
              <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--brand)]" aria-hidden="true" />
            )}
          </>
        );

        return action.available === false ? (
          <span key={actionKey(action)} aria-disabled="true" className={`flex min-h-[66px] cursor-not-allowed items-center gap-2.5 rounded-xl border border-transparent px-3 py-2.5 text-[var(--text-muted)] ${tone.surface}`}>
            {content}
          </span>
        ) : (
          <Link
            key={actionKey(action)}
            href={action.href}
            className={`group flex min-h-[66px] min-w-0 items-center gap-2.5 rounded-xl border border-transparent px-3 py-2.5 text-[var(--text)] transition hover:-translate-y-0.5 hover:border-[var(--line)] hover:shadow-[var(--shadow-card)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] ${tone.surface}`}
          >
            {content}
          </Link>
        );
      })}
    </div>
  );
}
