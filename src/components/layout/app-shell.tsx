"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useSession } from "@/lib/auth/session-context";
import type { DepartmentRole, GlobalRole } from "@/types/auth";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { useIsMobile } from "@/components/ui/use-mobile";
import { getUnreadNotificationCount } from "@/lib/api/notifications";

const roleLabel = (globalRole: GlobalRole | null, departmentRole: DepartmentRole | null): string => {
  if (globalRole === "ADMIN") return "Administrateur";
  if (globalRole === "RH") return "Ressources humaines";
  if (globalRole === "DIRECTION") return "Direction";
  if (departmentRole === "DIRECTEUR_DEPARTEMENT") return "Directeur de département";
  if (departmentRole === "CHEF_EQUIPE") return "Chef d'équipe";
  return "Employé";
};

const pageBreadcrumb = (pathname: string): string => {
  if (pathname.startsWith("/admin")) return "Administration";
  if (pathname.startsWith("/missions")) return "Missions";
  if (pathname.startsWith("/notifications")) return "Notifications";
  if (pathname.startsWith("/dashboard")) return "Tableau de bord";
  return "Espace de travail";
};

export function AppShell({ children }: Readonly<{ children: ReactNode }>) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useSession();
  const isMobile = useIsMobile();
  const currentRole = user?.globalRole ?? user?.departmentRole;
  const userId = user?.id;
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const mobileDrawerRef = useRef<HTMLDivElement>(null);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
    if (isMobile) {
      window.requestAnimationFrame(() => document.getElementById("mobile-navigation-toggle")?.focus());
    }
  }, [isMobile]);

  useEffect(() => {
    if (!isMobile || !isMobileMenuOpen) return;

    const drawer = mobileDrawerRef.current;
    const focusableItems = Array.from(drawer?.querySelectorAll<HTMLElement>('a[href], button:not(:disabled), [tabindex]:not([tabindex="-1"])') ?? []);
    focusableItems[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMobileMenu();
        return;
      }
      if (event.key !== "Tab" || focusableItems.length === 0) return;

      const first = focusableItems[0];
      const last = focusableItems[focusableItems.length - 1];
      if (event.shiftKey && (document.activeElement === first || !drawer?.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !drawer?.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeMobileMenu, isMobile, isMobileMenuOpen]);

  const refreshUnreadCount = useCallback(async () => {
    if (!userId) {
      setUnreadCount(0);
      return;
    }
    try {
      const response = await getUnreadNotificationCount();
      setUnreadCount(response.data.count);
    } catch {
      setUnreadCount(0);
    }
  }, [userId]);

  useEffect(() => {
    const timer = window.setTimeout(() => void refreshUnreadCount(), 0);
    window.addEventListener("notifications:updated", refreshUnreadCount);
    window.addEventListener("mission:updated", refreshUnreadCount);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("notifications:updated", refreshUnreadCount);
      window.removeEventListener("mission:updated", refreshUnreadCount);
    };
  }, [refreshUnreadCount]);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <div className="min-h-dvh bg-[var(--background-soft)] text-[var(--text)] lg:h-dvh lg:min-h-0 lg:overflow-hidden">
      <a href="#main-content" className="sr-only z-50 rounded-xl bg-[var(--surface)] px-4 py-3 font-semibold text-[var(--text)] shadow-[var(--shadow-soft)] focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:outline-none focus:ring-2 focus:ring-[var(--focus)]">
        Aller au contenu principal
      </a>
      <div className="lg:flex lg:h-full lg:min-h-0">
        <div
          ref={mobileDrawerRef}
          id="mobile-navigation-drawer"
          role={isMobile && isMobileMenuOpen ? "dialog" : undefined}
          aria-modal={isMobile && isMobileMenuOpen ? true : undefined}
          aria-label={isMobile && isMobileMenuOpen ? "Navigation principale" : undefined}
          aria-hidden={isMobile && !isMobileMenuOpen}
          inert={isMobile && !isMobileMenuOpen}
          className={`fixed inset-y-0 left-0 z-40 w-[280px] transform transition-[width,transform] duration-200 lg:fixed lg:inset-y-0 lg:left-0 lg:h-dvh lg:translate-x-0 ${isSidebarCollapsed ? "lg:w-[84px]" : "lg:w-[264px]"} ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        >
          <Sidebar
            id="primary-navigation"
            pathname={pathname}
            currentRole={currentRole}
            unreadCount={unreadCount}
            collapsed={isSidebarCollapsed}
            onClose={closeMobileMenu}
          />
        </div>

        <div aria-hidden="true" className={`hidden shrink-0 transition-[width] duration-200 lg:block ${isSidebarCollapsed ? "lg:w-[84px]" : "lg:w-[264px]"}`} />

        {isMobileMenuOpen && <button type="button" tabIndex={-1} aria-label="Fermer le menu" onClick={closeMobileMenu} className="fixed inset-0 z-30 bg-slate-950/45 backdrop-blur-[2px] lg:hidden" />}

        <div className="min-w-0 flex-1 lg:flex lg:h-dvh lg:min-h-0 lg:flex-col" inert={isMobile && isMobileMenuOpen}>
          <Header
            onLogout={() => void handleLogout()}
            onMenuToggle={() => setIsMobileMenuOpen((open) => !open)}
            onCollapseToggle={() => setIsSidebarCollapsed((collapsed) => !collapsed)}
            sidebarCollapsed={isSidebarCollapsed}
            menuOpen={isMobileMenuOpen}
            userName={`${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "Utilisateur"}
            roleName={user ? roleLabel(user.globalRole, user.departmentRole) : ""}
            unreadCount={unreadCount}
            breadcrumb={pageBreadcrumb(pathname)}
          />
          <main id="main-content" tabIndex={-1} className="min-h-[calc(100dvh-69px)] min-w-0 px-4 py-6 sm:px-6 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:overscroll-y-contain lg:px-9 lg:py-9 xl:px-10">
            <div className="mx-auto min-w-0 max-w-[1440px]">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
