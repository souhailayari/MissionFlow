import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

type NotificationsWelcomeProps = Readonly<{
  unreadCount: number;
  isLoading: boolean;
  isMarkingAllRead: boolean;
  onMarkAllAsRead: () => void;
}>;

export function NotificationsWelcome({ unreadCount, isLoading, isMarkingAllRead, onMarkAllAsRead }: NotificationsWelcomeProps) {
  return (
    <header
      className="relative isolate overflow-hidden rounded-[24px] border border-[var(--line)] px-5 py-5 shadow-[var(--shadow-card)] sm:px-7 sm:py-6"
      style={{ background: "linear-gradient(112deg, var(--brand-soft) 0%, var(--surface) 72%, var(--surface) 100%)" }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-24 h-60 w-60 rounded-full border border-[var(--line)]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-2 -top-16 h-48 w-48 rounded-full border border-[var(--line)] opacity-70" />

      <div className="relative grid items-center gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-8">
        <div className="min-w-0">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)]/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--brand-strong)] shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand)]" aria-hidden="true" />
            Centre de notifications
          </div>
          <h1 className="text-[30px] font-bold leading-tight tracking-[-0.045em] text-[var(--text)] sm:text-[34px]">Vos notifications</h1>
          <p className="mt-1.5 max-w-xl text-sm leading-6 text-[var(--text-soft)]">
            Suivez les étapes importantes de vos missions.
          </p>
        </div>

        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <div className="flex min-h-14 min-w-40 flex-1 items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)]/85 px-4 py-2.5 shadow-sm sm:flex-initial">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-strong)]">
              <Bell className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[11px] font-medium text-[var(--text-muted)]">Non lues</p>
              <p className="text-lg font-bold leading-6 tabular-nums text-[var(--text)]" aria-live="polite" aria-busy={isLoading}>{isLoading ? "—" : unreadCount}</p>
            </div>
          </div>

          {unreadCount > 0 && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isMarkingAllRead}
              isLoading={isMarkingAllRead}
              onClick={onMarkAllAsRead}
              leftIcon={<CheckCheck className="h-4 w-4" aria-hidden="true" />}
              className="w-full bg-[var(--surface)]/85 sm:w-auto"
            >
              Tout marquer comme lu
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
