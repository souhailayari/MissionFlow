"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { getMission, updateMission } from "@/lib/api/missions";
import { MissionForm, missionToFormValues } from "@/components/missions/mission-form";
import { useSession } from "@/lib/auth/session-context";
import { Alert } from "@/components/ui/alert";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import type { CreateMissionPayload, Mission } from "@/types/missions";

const getErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError && error.status === 403) return "Cette mission ne peut pas être modifiée par votre profil ou son statut a changé.";
  if (error instanceof ApiError && error.status === 404) return "Cette mission n'existe pas ou n'est plus disponible.";
  if (error instanceof ApiError) return error.message;
  return "Une erreur est survenue. Vérifiez votre connexion puis réessayez.";
};

export default function EditMissionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, status } = useSession();
  const [mission, setMission] = useState<Mission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadMission = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const response = await getMission(params.id);
      setMission(response.data);
    } catch (error) {
      setLoadError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadMission(), 0);
    return () => window.clearTimeout(timer);
  }, [loadMission]);

  const onSubmit = async (payload: CreateMissionPayload): Promise<void> => {
    setApiError(null);
    setSuccessMessage(null);
    try {
      await updateMission(params.id, payload);
      setSuccessMessage("Les modifications ont été enregistrées. Redirection vers le détail...");
      window.setTimeout(() => router.push(`/missions/${params.id}`), 700);
    } catch (error) {
      setApiError(getErrorMessage(error));
    }
  };

  if (status === "loading" || isLoading) return <div className="space-y-2"><Skeleton className="h-10" /><Skeleton className="h-28" /></div>;
  if (loadError || !mission) return <PageContainer className="max-w-5xl"><Alert tone="danger"><h1 className="text-sm font-semibold">Mission indisponible</h1><p className="mt-1 text-sm">{loadError ?? "Cette mission n'existe pas ou n'est plus disponible."}</p></Alert><Link href={`/missions/${params.id}`} className="inline-flex h-9 items-center rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700">Retour au détail</Link></PageContainer>;
  const isEmployeeOwner = user?.departmentRole === "EMPLOYE" && mission.employeeId === user.id;
  const isTeamLeaderCreator = user?.isActive && user.departmentRole === "CHEF_EQUIPE" && mission.createdById === user.id && mission.employeeId !== user.id && mission.teamId === user.teamId && mission.team?.leaderId === user.id;
  if (!isEmployeeOwner && !isTeamLeaderCreator) return <PageContainer className="max-w-5xl"><Alert tone="danger"><h1 className="text-sm font-semibold">Accès non autorisé</h1><p className="mt-1 text-sm">Seul le créateur autorisé de cette mission brouillon peut la modifier.</p></Alert><Link href={`/missions/${mission.id}`} className="inline-flex h-9 items-center rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700">Retour au détail</Link></PageContainer>;
  if (mission.status !== "DRAFT") return <PageContainer className="max-w-5xl"><Alert tone="warning"><h1 className="text-sm font-semibold">Modification indisponible</h1><p className="mt-1 text-sm">Cette mission est actuellement « {mission.status} » et ne peut plus être modifiée.</p></Alert><Link href={`/missions/${mission.id}`} className="inline-flex h-9 items-center rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700">Retour au détail</Link></PageContainer>;

  return <PageContainer className="max-w-5xl"><Link href={`/missions/${mission.id}`} className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"><ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />Retour au détail</Link><PageHeader eyebrow={`Brouillon · ${mission.reference}`} title="Modifier la mission" description="Seules les missions à l'état brouillon peuvent être modifiées." /><MissionForm initialValues={missionToFormValues(mission)} submitLabel="Enregistrer les modifications" submittingLabel="Enregistrement..." apiError={apiError} successMessage={successMessage} onSubmit={onSubmit} /></PageContainer>;
}
