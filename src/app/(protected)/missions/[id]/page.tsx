"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { MissionHistory } from "@/components/missions/mission-history";
import { MissionDocuments } from "@/components/missions/mission-documents";
import { MissionActions } from "@/components/missions/mission-actions";
import { MissionPdfActions } from "@/components/missions/mission-pdf-actions";
import { MissionResourcesForm } from "@/components/missions/mission-resources-form";
import { MissionResources } from "@/components/missions/mission-resources";
import { MissionRoute } from "@/components/missions/mission-route";
import { MissionStatusBadge } from "@/components/missions/mission-status-badge";
import { MissionSummary } from "@/components/missions/mission-summary";
import { MissionWorkflow } from "@/components/missions/mission-workflow";
import { ApiError } from "@/lib/api/client";
import {
  approveAsDepartmentDirector,
  approveAsTeamLeader,
  getMission,
  rejectAsDepartmentDirector,
  rejectAsTeamLeader,
  submitMission,
  updateDirectionResources,
} from "@/lib/api/missions";
import { useSession } from "@/lib/auth/session-context";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/ui/page-container";
import type { Mission } from "@/types/missions";

export default function MissionDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useSession();
  const [mission, setMission] = useState<Mission | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ tone: "success" | "danger" | "warning"; message: string } | null>(null);

  const loadMission = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getMission(params.id);
      setMission(response.data);
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 404) setError("Cette mission n'existe pas ou n'est plus disponible.");
      else if (requestError instanceof ApiError && requestError.status === 403) setError("Vous n'êtes pas autorisé à consulter cette mission.");
      else if (requestError instanceof ApiError) setError(requestError.message);
      else setError("Veuillez réessayer dans quelques instants.");
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  const refreshAfterAction = async (action: () => Promise<unknown>, successMessage: string) => {
    setFeedback(null);
    await action();
    window.dispatchEvent(new CustomEvent("mission:updated"));
    setFeedback({ tone: "success", message: successMessage });
    await loadMission();
  };

  const handleSubmitMission = () => refreshAfterAction(() => submitMission(params.id), "La mission a été soumise au workflow de validation.");

  const handleApprove = () => {
    if (!user) return Promise.resolve();
    if (user.departmentRole === "CHEF_EQUIPE") return refreshAfterAction(() => approveAsTeamLeader(params.id), "La mission a été approuvée par le chef d'équipe.");
    if (user.departmentRole === "DIRECTEUR_DEPARTEMENT") return refreshAfterAction(() => approveAsDepartmentDirector(params.id), "La mission a été approuvée par le directeur de département.");
    return Promise.resolve();
  };

  const handleReject = (reason: string) => {
    if (!user) return Promise.resolve();
    if (user.departmentRole === "CHEF_EQUIPE") return refreshAfterAction(() => rejectAsTeamLeader(params.id, { reason }), "La mission a été rejetée.");
    if (user.departmentRole === "DIRECTEUR_DEPARTEMENT") return refreshAfterAction(() => rejectAsDepartmentDirector(params.id, { reason }), "La mission a été rejetée.");
    return Promise.resolve();
  };

  const handleResources = async (payload: Parameters<typeof updateDirectionResources>[1]) => {
    setFeedback(null);
    const response = await updateDirectionResources(params.id, payload);
    setMission(response.data);
    setFeedback(response.warnings.length
      ? { tone: "warning", message: `La mission est approuvée. ${response.warnings.join(" ")}` }
      : { tone: "success", message: "Les données Direction ont été enregistrées. La mission est approuvée." });
    window.dispatchEvent(new CustomEvent("mission:updated"));
  };

  useEffect(() => {
    const timer = window.setTimeout(() => void loadMission(), 0);
    return () => window.clearTimeout(timer);
  }, [loadMission]);

  const directionNeedsData = user?.globalRole === "DIRECTION" && mission?.status === "PENDING_DIRECTION";

  return (
    <PageContainer className="max-w-6xl">
      <Link href="/missions" className="group inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] py-1 pl-1 pr-3.5 text-xs font-semibold text-[var(--text-soft)] shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:border-[var(--brand)] hover:text-[var(--brand-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--brand-soft)] text-[var(--brand-strong)] transition group-hover:bg-[var(--brand)] group-hover:text-white">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
        Retour aux missions
      </Link>
      {isLoading && (
        <div className="space-y-3" aria-label="Chargement de la mission">
          <Skeleton className="h-10" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      )}
      {!isLoading && error && (
        <div className="space-y-3">
          <ErrorState title="Mission indisponible" message={error} />
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => void loadMission()}>Réessayer</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => router.push("/missions")}>Retour à la liste</Button>
          </div>
        </div>
      )}
      {!isLoading && !error && mission && (
        <>
          <header
            className="relative isolate flex flex-col gap-5 overflow-hidden rounded-[24px] border border-[var(--line)] px-5 py-5 shadow-[var(--shadow-card)] sm:px-7 sm:py-6 lg:flex-row lg:items-center lg:justify-between"
            style={{ background: "linear-gradient(112deg, var(--brand-soft) 0%, var(--surface) 70%, var(--surface) 100%)" }}
          >
            <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-24 h-60 w-60 rounded-full border border-[var(--line)]" />
            <div aria-hidden="true" className="pointer-events-none absolute -right-2 -top-16 h-48 w-48 rounded-full border border-[var(--line)] opacity-70" />

            <div className="relative min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)]/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--brand-strong)] shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand)]" aria-hidden="true" />
                  Mission · {mission.reference}
                </span>
                <MissionStatusBadge status={mission.status} showDot />
              </div>
              <h1 className="break-words text-[30px] font-bold leading-tight tracking-[-0.045em] text-[var(--text)] sm:text-[34px]">{mission.title}</h1>
              <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[var(--text-soft)]">Détails et suivi du circuit de validation.</p>
            </div>

            <div className="relative flex flex-wrap items-center gap-2.5 lg:shrink-0">
              <MissionPdfActions mission={mission} />
              {user?.departmentRole === "EMPLOYE" && user.id === mission.employeeId && mission.status === "DRAFT" && (
                <Link href={`/missions/${mission.id}/edit`} className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[var(--brand)] px-4 text-sm font-semibold text-white shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:bg-[var(--brand-strong)]">
                  Modifier la mission
                </Link>
              )}
            </div>
          </header>
          <div className="space-y-3">
            {feedback && <Alert tone={feedback.tone}>{feedback.message}</Alert>}
            {directionNeedsData && <MissionRoute key={mission.id} mission={mission} />}
            {directionNeedsData && <MissionResourcesForm mission={mission} onSave={handleResources} />}
            {user && !directionNeedsData && <MissionActions mission={mission} user={user} onSubmit={handleSubmitMission} onApprove={handleApprove} onReject={handleReject} />}
            <div className="grid items-start gap-3 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,1fr)]">
              <div className="space-y-3">
                <MissionSummary mission={mission} />
                <MissionResources mission={mission} />
                {!directionNeedsData && <MissionRoute key={mission.id} mission={mission} />}
                <MissionDocuments mission={mission} />
              </div>
              <div className="space-y-3">
                <MissionWorkflow mission={mission} />
                <MissionHistory mission={mission} />
              </div>
            </div>
          </div>
        </>
      )}
    </PageContainer>
  );
}
