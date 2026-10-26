import { Inbox } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({ title, description, action }: Readonly<{ title: string; description?: string; action?: ReactNode }>) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--line-strong)] bg-[var(--surface)] px-4 py-7 text-center">
      <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand-strong)]">
        <Inbox className="h-4 w-4" />
      </div>
      <p className="mt-2 text-sm font-semibold text-[var(--text)]">{title}</p>
      {description && <p className="mt-1 text-xs leading-5 text-[var(--text-soft)]">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
