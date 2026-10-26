"use client";

import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError } from "@/lib/api/client";
import { createMission } from "@/lib/api/missions";
import { MissionForm } from "@/components/missions/mission-form";
import { Alert } from "@/components/ui/alert";
import { PageContainer } from "@/components/ui/page-container";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/auth/session-context";
import type { CreateMissionPayload } from "@/types/missions";

const getErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError && error.status === 403) return "Votre profil n'est pas autorisé à créer cette demande de mission.";
  if (error instanceof ApiError) return error.message;
  return "Une erreur est survenue. Vérifiez votre connexion puis réessayez.";
};

export default function NewMissionPage() {
  const router = useRouter();
  const { user, status } = useSession();
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const onSubmit = async (payload: CreateMissionPayload): Promise<void> => {
    setApiError(null);
    setSuccessMessage(null);
    try {
      const response = await createMission(payload);
      setSuccessMessage("La mission a été enregistrée comme brouillon. Redirection vers le détail...");
      window.setTimeout(() => router.push(`/missions/${response.data.id}`), 700);
    } catch (error) {
      setApiError(getErrorMessage(error));
    }
  };

  if (status === "loading") return <div className="space-y-2"><Skeleton className="h-10" /><Skeleton className="h-28" /></div>;
  const canCreate = user?.departmentRole === "EMPLOYE" || (user?.isActive && user.departmentRole === "CHEF_EQUIPE" && Boolean(user.departmentId && user.teamId));
  if (!canCreate) return <PageContainer className="max-w-5xl"><Alert tone="danger"><h1 className="text-sm font-semibold">Création indisponible</h1><p className="mt-1 text-sm">Votre profil n&apos;est pas autorisé à créer une demande de mission.</p></Alert><Link href="/missions" className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700">Retour aux missions</Link></PageContainer>;

  const description = user?.departmentRole === "CHEF_EQUIPE"
    ? "Créez un ordre de mission au bénéfice d'un directeur de votre département. Le nombre de jours sera calculé par le serveur."
    : "Les informations seront enregistrées pour votre profil connecté. Le nombre de jours sera calculé par le serveur.";

  return (
    <PageContainer className="max-w-5xl">
      <Link href="/missions" className="group inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] py-1 pl-1 pr-3.5 text-xs font-semibold text-[var(--text-soft)] shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:border-[var(--brand)] hover:text-[var(--brand-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--brand-soft)] text-[var(--brand-strong)] transition group-hover:bg-[var(--brand)] group-hover:text-white">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
        Retour aux missions
      </Link>

      <header
        className="relative isolate flex flex-col gap-5 overflow-hidden rounded-[24px] border border-[var(--line)] px-5 py-5 shadow-[var(--shadow-card)] sm:px-7 sm:py-6 lg:flex-row lg:items-center lg:justify-between"
        style={{ background: "linear-gradient(112deg, var(--brand-soft) 0%, var(--surface) 70%, var(--surface) 100%)" }}
      >
        <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-24 h-60 w-60 rounded-full border border-[var(--line)]" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-2 -top-16 h-48 w-48 rounded-full border border-[var(--line)] opacity-70" />

        <div className="relative min-w-0">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)]/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--brand-strong)] shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand)]" aria-hidden="true" />
            Nouvelle demande
          </div>
          <h1 className="text-[30px] font-bold leading-tight tracking-[-0.045em] text-[var(--text)] sm:text-[34px]">Créer une mission</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[var(--text-soft)]">{description}</p>
        </div>

        <div className="relative flex min-h-14 items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)]/85 px-4 py-2.5 shadow-sm lg:shrink-0">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-strong)]">
            <FileText className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[11px] font-medium text-[var(--text-muted)]">Statut après enregistrement</p>
            <p className="text-lg font-bold leading-6 text-[var(--text)]">Brouillon</p>
          </div>
        </div>
      </header>

      <MissionForm submitLabel="Enregistrer comme brouillon" submittingLabel="Enregistrement..." apiError={apiError} successMessage={successMessage} onSubmit={onSubmit} />
    </PageContainer>
  );
}
