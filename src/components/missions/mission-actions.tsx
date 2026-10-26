"use client";

import Link from "next/link";
import { useState } from "react";
import { MissionRejectionDialog } from "@/components/missions/mission-rejection-dialog";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { ApiError } from "@/lib/api/client";
import type { User } from "@/types/auth";
import type { Mission } from "@/types/missions";

export function MissionActions({ mission, user, onSubmit, onApprove, onReject }: Readonly<{ mission: Mission; user: User; onSubmit: () => Promise<void>; onApprove: () => Promise<void>; onReject: (reason: string) => Promise<void> }>) {
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [isWorking, setIsWorking] = useState(false);
  const [showRejection, setShowRejection] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const isOwnerEmployee = user.departmentRole === "EMPLOYE" && user.id === mission.employeeId;
  const isCreatorTeamLeader = user.isActive && user.departmentRole === "CHEF_EQUIPE" && user.id === mission.createdById && mission.employeeId !== mission.createdById && mission.departmentId === user.departmentId && mission.teamId === user.teamId && mission.team?.leaderId === user.id;
  const isTeamLeader = user.isActive && user.departmentRole === "CHEF_EQUIPE" && mission.initialApprovalStep === "TEAM_LEADER" && mission.status === "PENDING_TEAM_LEADER" && mission.team?.id === user.teamId && mission.team.leaderId === user.id;
  const isDepartmentDirector = user.departmentRole === "DIRECTEUR_DEPARTEMENT" && mission.departmentId === user.departmentId && ((mission.status === "PENDING_TEAM_LEADER" && mission.initialApprovalStep === "TEAM_LEADER") || (mission.status === "PENDING_DEPARTMENT_DIRECTOR" && mission.initialApprovalStep === "DEPARTMENT_DIRECTOR"));
  const canSubmit = (isOwnerEmployee || isCreatorTeamLeader) && mission.status === "DRAFT";
  const canEdit = canSubmit;
  const canApprove = isTeamLeader || isDepartmentDirector;
  const canReject = isTeamLeader || isDepartmentDirector;

  const runConfirmed = async (action: () => Promise<void>) => {
    setConfirmation(null);
    setIsWorking(true);
    setActionError(null);
    try {
      await action();
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : "Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsWorking(false);
    }
  };

  if (!canEdit && !canApprove && !canReject) return null;

  return (
    <Card>
      <CardTitle>Actions de workflow</CardTitle>
      {actionError && <Alert tone="danger" role="alert">{actionError}</Alert>}
      <div className="flex flex-wrap gap-2">
        {canEdit && <Link href={`/missions/${mission.id}/edit`} className="inline-flex h-9 items-center rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50">Modifier</Link>}
        {canSubmit && <Button size="sm" disabled={isWorking} onClick={() => setConfirmation(isCreatorTeamLeader ? "La mission sera transmise au directeur de département pour approbation avant son passage à la Direction." : "Une fois soumise, la mission entrera dans le processus de validation.")}>Soumettre la mission</Button>}
        {canApprove && <Button size="sm" disabled={isWorking} onClick={() => setConfirmation("Voulez-vous vraiment valider cette mission ?")} aria-busy={isWorking}>Valider la mission</Button>}
        {canReject && <Button size="sm" variant="danger" disabled={isWorking} onClick={() => setShowRejection(true)}>Rejeter la mission</Button>}
      </div>
      {confirmation && (
        <Alert tone="info">
          <p>{confirmation}</p>
          <div className="mt-2 flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setConfirmation(null)}>Annuler</Button>
            <Button size="sm" onClick={() => void runConfirmed(canSubmit ? onSubmit : onApprove)} disabled={isWorking}>{isWorking ? "Validation en cours..." : "Confirmer"}</Button>
          </div>
        </Alert>
      )}
      {showRejection && <MissionRejectionDialog onClose={() => setShowRejection(false)} onConfirm={async (reason) => { try { await onReject(reason); setShowRejection(false); } catch (error) { setActionError(error instanceof ApiError ? error.message : "Une erreur est survenue. Veuillez réessayer."); } }} />}
    </Card>
  );
}
