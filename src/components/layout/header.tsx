import Link from "next/link";
import { Bell, LogOut, Menu, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function Header({ onLogout, onMenuToggle, onCollapseToggle, sidebarCollapsed = false, menuOpen = false, userName = "Utilisateur", roleName = "Compte actif", unreadCount = 0, breadcrumb = "Espace de travail" }: Readonly<{ onLogout: () => void; onMenuToggle?: () => void; onCollapseToggle?: () => void; sidebarCollapsed?: boolean; menuOpen?: boolean; userName?: string; roleName?: string; unreadCount?: number; breadcrumb?: string }>) {
  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "U";

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[var(--surface)] backdrop-blur-xl">
      <div className="flex min-h-[68px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-9">
        <div className="flex min-w-0 items-center gap-3">
          <Button id="mobile-navigation-toggle" size="icon-sm" variant="outline" onClick={onMenuToggle} aria-label={menuOpen ? "Fermer la navigation" : "Ouvrir la navigation"} aria-expanded={menuOpen} aria-controls="primary-navigation" className="shrink-0 lg:hidden">
            <Menu className="h-4 w-4" />
          </Button>
          <Button size="icon-sm" variant="outline" onClick={onCollapseToggle} aria-label={sidebarCollapsed ? "Développer la navigation" : "Réduire la navigation"} aria-expanded={!sidebarCollapsed} aria-controls="primary-navigation" className="hidden shrink-0 lg:inline-flex">
            <PanelLeft className="h-4 w-4" />
          </Button>
          <div className="hidden lg:block">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--brand-strong)]">{breadcrumb}</p>
          </div>
          <div className="min-w-0 lg:hidden">
            <p className="truncate text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">MissionFlow</p>
            <p className="truncate text-[12px] font-semibold text-[var(--text)]">{breadcrumb}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/notifications" aria-label="Notifications" title="Notifications" className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--text-soft)] transition hover:border-[var(--brand)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand-strong)]">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white ring-2 ring-[var(--surface)]">
                {unreadCount}
              </span>
            )}
          </Link>

          <div className="hidden items-center gap-2.5 border-l border-[var(--line)] pl-3 sm:flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--brand-soft)] bg-[var(--brand-soft)] text-xs font-bold text-[var(--brand-strong)]">
              {initials}
            </div>
            <div className="text-left">
              <p className="max-w-48 truncate text-[13px] font-semibold text-[var(--text)]">{userName}</p>
              <p className="text-[11px] text-[var(--text-muted)]">{roleName}</p>
            </div>
          </div>

          <Button size="sm" variant="ghost" onClick={onLogout} leftIcon={<LogOut className="h-3.5 w-3.5" />} className="hidden sm:inline-flex">
            Déconnexion
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger render={<Button type="button" size="icon-sm" variant="outline" aria-label={`Ouvrir le compte de ${userName}`} title={userName} className="sm:hidden" />}>
              <span className="text-xs font-bold text-[var(--brand-strong)]">{initials}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-52 sm:hidden">
              <div className="px-2 py-1.5">
                <p className="truncate text-sm font-semibold text-[var(--text)]">{userName}</p>
                <p className="truncate text-xs text-[var(--text-muted)]">{roleName}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => void onLogout()}>
                <LogOut className="h-4 w-4" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
