import { ArrowUpRight, BadgeCheck, CalendarDays, FileText, MapPinned, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type DashboardWelcomeProps = Readonly<{
  displayName: string;
  role: string;
  today: string;
  canCreateMission: boolean;
  isLoading: boolean;
  onRefresh: () => void;
}>;

export function DashboardWelcome({ displayName, role, today, canCreateMission, isLoading, onRefresh }: DashboardWelcomeProps) {
  const greetingName = displayName ? `${displayName.charAt(0).toLocaleUpperCase("fr-FR")}${displayName.slice(1)}` : "";

  return (
    <header
      className="relative isolate overflow-hidden rounded-[28px] border border-[var(--line)] px-5 py-6 shadow-[var(--shadow-card)] sm:px-7 sm:py-7 lg:px-9 lg:py-8"
      style={{ background: "linear-gradient(118deg, var(--brand-soft) 0%, var(--surface) 66%, var(--surface) 100%)" }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute -right-14 -top-24 h-64 w-64 rounded-full border border-[var(--line)]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-2 -top-14 h-52 w-52 rounded-full border border-[var(--line)] opacity-70" />

      <div className="relative grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_minmax(240px,0.72fr)] lg:gap-8">
        <div className="min-w-0">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)]/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--brand-strong)] shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand)]" aria-hidden="true" />
            Espace de pilotage · {role}
          </div>
          <h1 className="text-[30px] font-bold leading-tight tracking-[-0.045em] text-[var(--text)] sm:text-4xl lg:text-[40px]">
            Bonjour{greetingName ? `, ${greetingName}` : ""}
            <span className="ml-2 inline-block text-[0.8em] align-[0.04em]" aria-hidden="true">👋</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--text-soft)] sm:text-[15px]">
            Suivez les demandes et validations de votre périmètre en un seul endroit.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <Link
              href={canCreateMission ? "/missions/new" : "/missions"}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-4 text-sm font-semibold text-white shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:bg-[var(--brand-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2"
            >
              {canCreateMission ? "Créer une mission" : "Consulter les missions"}
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isLoading}
              onClick={onRefresh}
              leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />}
            >
              Actualiser
            </Button>
            <span className="inline-flex min-h-9 items-center gap-1.5 px-1 text-xs font-medium text-[var(--text-muted)]">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              {today}
            </span>
          </div>
        </div>

        <div className="relative hidden h-44 items-center justify-center md:flex" aria-hidden="true">
          <div className="absolute right-8 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full border border-[var(--line)]" />
          <div className="absolute right-12 top-4 h-32 w-40 rotate-[-8deg] rounded-2xl border border-[var(--line)] bg-[var(--surface)] opacity-55" />

          <div className="relative z-10 w-52 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-strong)]">
                <FileText className="h-5 w-5" />
              </span>
              <span className="h-2 w-10 rounded-full bg-[var(--surface-muted)]" />
            </div>
            <div className="mt-4 flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--surface-muted)] text-[var(--text-soft)]">
                <MapPinned className="h-4 w-4" />
              </span>
              <div className="flex-1 space-y-2">
                <span className="block h-2 w-4/5 rounded-full bg-[var(--surface-muted)]" />
                <span className="block h-1.5 w-3/5 rounded-full bg-[var(--line)]" />
              </div>
            </div>
            <div className="mt-4 flex gap-1.5">
              <span className="h-1.5 w-10 rounded-full bg-[var(--brand)]" />
              <span className="h-1.5 w-6 rounded-full bg-[var(--surface-muted)]" />
              <span className="h-1.5 w-6 rounded-full bg-[var(--surface-muted)]" />
            </div>
          </div>

          <span className="absolute right-3 top-5 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--surface)] text-[var(--brand-strong)] shadow-[var(--shadow-card)]">
            <MapPinned className="h-5 w-5" />
          </span>
          <span className="absolute bottom-1 left-8 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--surface)] text-[var(--success)] shadow-[var(--shadow-card)]">
            <BadgeCheck className="h-5 w-5" />
          </span>
        </div>
      </div>
    </header>
  );
}
