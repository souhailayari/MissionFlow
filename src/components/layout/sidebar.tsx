import Link from "next/link";
import { Bell, BriefcaseBusiness, Building2, ChartNoAxesCombined, CreditCard, FolderKanban, LayoutGrid, MapPinned, ShieldCheck, Users, WalletCards, X, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GlobalRole, DepartmentRole } from "@/types/auth";

export type NavigationItem = { label: string; href: string; roles: Array<GlobalRole | DepartmentRole>; available: boolean; icon: LucideIcon };

export const navigation: NavigationItem[] = [
  { label: "Tableau de bord", href: "/dashboard", roles: ["ADMIN", "RH", "DIRECTION", "DIRECTEUR_DEPARTEMENT", "CHEF_EQUIPE", "EMPLOYE"], available: true, icon: LayoutGrid },
  { label: "Missions", href: "/missions", roles: ["ADMIN", "RH", "DIRECTION", "DIRECTEUR_DEPARTEMENT", "CHEF_EQUIPE", "EMPLOYE"], available: true, icon: BriefcaseBusiness },
  { label: "Rapport carburant & tickets", href: "/direction/history", roles: ["DIRECTION"], available: true, icon: CreditCard },
  { label: "Budget mensuel", href: "/direction/budget", roles: ["DIRECTION"], available: true, icon: WalletCards },
  { label: "Notifications", href: "/notifications", roles: ["ADMIN", "RH", "DIRECTION", "DIRECTEUR_DEPARTEMENT", "CHEF_EQUIPE", "EMPLOYE"], available: true, icon: Bell },
  { label: "Administration", href: "/admin", roles: ["ADMIN"], available: true, icon: ShieldCheck },
  { label: "Utilisateurs", href: "/admin/users", roles: ["ADMIN"], available: true, icon: Users },
  { label: "Départements", href: "/admin/departments", roles: ["ADMIN"], available: true, icon: Building2 },
  { label: "Équipes", href: "/admin/teams", roles: ["ADMIN"], available: true, icon: FolderKanban },
  { label: "Sites de l’entreprise", href: "/admin/company-sites", roles: ["ADMIN"], available: true, icon: MapPinned },
  { label: "Rapports", href: "/admin/reports", roles: ["ADMIN"], available: true, icon: ChartNoAxesCombined },
];

export function Sidebar({ pathname, currentRole, unreadCount = 0, collapsed = false, onClose, id }: Readonly<{ pathname: string; currentRole: GlobalRole | DepartmentRole | null | undefined; unreadCount?: number; collapsed?: boolean; onClose?: () => void; id?: string }>) {
  const items = navigation.filter((item) => currentRole && item.roles.includes(currentRole));
  const workspaceItems = items.filter((item) => !item.href.startsWith("/admin"));
  const adminItems = items.filter((item) => item.href.startsWith("/admin"));

  const renderItem = (item: NavigationItem) => {
    const Icon = item.icon;
    const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

    return item.available ? (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? "page" : undefined}
        title={collapsed ? item.label : undefined}
        onClick={onClose}
        className={`group relative flex min-h-11 items-center justify-between gap-3 rounded-xl px-2.5 py-2 text-[13px] font-medium transition-colors ${collapsed ? "lg:justify-center lg:px-1.5" : ""} ${active ? "bg-indigo-300/12 text-white shadow-[inset_0_0_0_1px_rgba(165,180,252,0.14)] before:absolute before:inset-y-2.5 before:left-0 before:w-[3px] before:rounded-r-full before:bg-indigo-300" : "text-slate-300 hover:bg-white/[0.06] hover:text-white"}`}
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${active ? "bg-indigo-300/10 text-indigo-200" : "text-slate-400 group-hover:bg-white/[0.06] group-hover:text-slate-100"}`}>
            <Icon className="h-4 w-4" />
          </span>
          <span className={`truncate ${collapsed ? "lg:hidden" : ""}`}>{item.label}</span>
        </span>
        {item.href === "/notifications" && unreadCount > 0 ? (
          <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-rose-400/15 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-rose-200" aria-label={`${unreadCount} notifications non lues`}>
            {unreadCount}
          </span>
        ) : null}
      </Link>
    ) : (
      <span key={item.href} className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-2.5 py-2 text-[13px] text-slate-400" title="Cette rubrique sera disponible prochainement">
        <span className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5"><Icon className="h-4 w-4" /></span>{item.label}</span>
        <span className="text-[9px] uppercase tracking-[0.14em] text-slate-500">Bientôt</span>
      </span>
    );
  };

  return (
    <aside className="flex h-full min-h-0 w-full flex-col border-r border-white/[0.06] bg-[linear-gradient(180deg,#151f3c_0%,#101a33_45%,#0e172e_100%)] text-slate-100 shadow-[inset_-1px_0_0_rgba(255,255,255,0.04)]">
      <div className={`sidebar-brand border-b border-white/[0.08] px-4 py-5 ${collapsed ? "lg:px-2" : ""}`}>
        <div className="flex items-center justify-between gap-3">
          <div className={`flex min-w-0 items-center gap-3 ${collapsed ? "lg:justify-center" : ""}`}>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-indigo-200/20 bg-gradient-to-br from-indigo-300/20 to-sky-300/10 text-sm font-extrabold tracking-tight text-indigo-100 shadow-[0_6px_18px_rgba(79,70,229,0.18)]">
              MF
            </div>
            <div className={collapsed ? "lg:hidden" : ""}>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white">MissionFlow</p>
              <p className="mt-1 text-[11px] text-slate-400">Gestion des missions</p>
            </div>
          </div>
          {onClose && <Button type="button" size="icon-sm" variant="ghost" onClick={onClose} aria-label="Fermer la navigation" className="text-slate-200 hover:bg-white/10 hover:text-white lg:hidden"><X className="h-4 w-4" /></Button>}
        </div>

      </div>

      <nav id={id} aria-label="Navigation principale" className="sidebar-navigation-scroll flex-1 space-y-1 overflow-y-auto px-3 py-5">
        <p className={`sidebar-workspace-label mb-2 px-2.5 text-[9px] font-bold uppercase tracking-[0.17em] text-slate-500 ${collapsed ? "lg:hidden" : ""}`}>Espace de travail</p>
        {workspaceItems.map(renderItem)}
        {adminItems.length > 0 && <>
          <p className={`sidebar-admin-label mb-2 mt-6 border-t border-white/[0.08] px-2.5 pt-5 text-[9px] font-bold uppercase tracking-[0.17em] text-slate-500 ${collapsed ? "lg:hidden" : ""}`}>Administration</p>
          {adminItems.map(renderItem)}
        </>}
      </nav>

    </aside>
  );
}
