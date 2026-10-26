import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness } from "lucide-react";

type MissionsPageHeaderProps = Readonly<{
  missionCount: number | null;
  isLoading: boolean;
  canCreateMission: boolean;
  createMissionLabel: string;
}>;

export function MissionsPageHeader({ missionCount, isLoading, canCreateMission, createMissionLabel }: MissionsPageHeaderProps) {
  return (
    <header
      className="relative isolate flex flex-col gap-5 overflow-hidden rounded-[24px] border border-[var(--line)] px-5 py-5 shadow-[var(--shadow-card)] sm:px-7 sm:py-6 lg:flex-row lg:items-center lg:justify-between"
      style={{ background: "linear-gradient(112deg, var(--brand-soft) 0%, var(--surface) 70%, var(--surface) 100%)" }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-24 h-60 w-60 rounded-full border border-[var(--line)]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-2 -top-16 h-48 w-48 rounded-full border border-[var(--line)] opacity-70" />

      <div className="relative min-w-0">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)]/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--brand-strong)] shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand)]" aria-hidden="true" />
          Suivi opérationnel
        </div>
        <h1 className="text-[30px] font-bold leading-tight tracking-[-0.045em] text-[var(--text)] sm:text-[34px]">Missions</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[var(--text-soft)]">
          Retrouvez les demandes de votre périmètre et suivez leur validation.
        </p>
      </div>

      <div className="relative flex flex-wrap items-center gap-3 lg:shrink-0">
        <div className="flex min-h-14 min-w-44 items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)]/85 px-4 py-2.5 shadow-sm">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-strong)]">
            <BriefcaseBusiness className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[11px] font-medium text-[var(--text-muted)]">Missions trouvées</p>
            <p className="text-lg font-bold leading-6 tabular-nums text-[var(--text)]" aria-live="polite" aria-busy={isLoading}>
              {isLoading || missionCount === null ? <span className="text-[var(--text-muted)]">—</span> : missionCount}
            </p>
          </div>
        </div>

        {canCreateMission && (
          <Link
            href="/missions/new"
            className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-4 text-sm font-semibold text-white shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:bg-[var(--brand-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2"
          >
            {createMissionLabel}
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        )}
      </div>
    </header>
  );
}
