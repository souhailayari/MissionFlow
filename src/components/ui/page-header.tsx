import type { ReactNode } from "react";

export function PageHeader({ eyebrow, title, description, actions }: Readonly<{ eyebrow?: string; title: string; description?: string; actions?: ReactNode }>) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-5 border-b border-[var(--line)] pb-6 sm:pb-7">
      <div className="min-w-0">
        {eyebrow && <div className="mb-2.5 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--brand-soft)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--brand-strong)]"><span className="h-1.5 w-1.5 rounded-full bg-[var(--brand)]" aria-hidden="true" />{eyebrow}</div>}
        <h1 className="text-[30px] font-bold leading-tight tracking-[-0.04em] text-[var(--text)] sm:text-[34px]">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-soft)]">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2.5">{actions}</div>}
    </header>
  );
}
