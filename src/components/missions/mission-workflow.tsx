import { Check, Clock3, X } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { MissionStatusBadge } from "@/components/missions/mission-status-badge";
import type { Mission } from "@/types/missions";

type StepState = "complete" | "current" | "upcoming" | "rejected";

const stepStyles: Record<StepState, string> = {
  complete: "border-[var(--success)]/25 bg-[var(--success-soft)]",
  current: "border-[var(--brand)]/25 bg-[var(--brand-soft)]",
  upcoming: "border-[var(--line)] bg-[var(--surface)]",
  rejected: "border-[var(--danger)]/25 bg-[var(--danger-soft)]",
};

const stepLabels: Record<StepState, string> = {
  complete: "Terminée",
  current: "En cours",
  upcoming: "À venir",
  rejected: "Rejetée",
};

const formatDateTime = (value: string | null): string => {
  if (!value) return "Non renseignée";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Non renseignée";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(date);
};

export function MissionWorkflow({ mission }: Readonly<{ mission: Mission }>) {
  const createdForDirector = mission.createdById !== mission.employeeId;
  const firstReviewer = createdForDirector
    ? "Directeur de département"
    : mission.initialApprovalStep === "TEAM_LEADER"
      ? "Chef d'équipe ou Directeur de département"
      : "Directeur de département";
  const steps = [
    { title: "Validation initiale", detail: firstReviewer },
    { title: "Direction", detail: "Attribution des ressources et clôture de la demande" },
  ];

  const rejectedApprovals = (mission.approvals ?? [])
    .filter((approval) => approval.decision === "REJECTED")
    .sort((left, right) => new Date(left.decidedAt).getTime() - new Date(right.decidedAt).getTime());
  const rejectedApproval = rejectedApprovals[rejectedApprovals.length - 1];
  const rejectedStepIndex = rejectedApproval ? (rejectedApproval.step === "DIRECTION" ? 1 : 0) : null;
  const currentStepIndex = mission.status === "PENDING_TEAM_LEADER" || mission.status === "PENDING_DEPARTMENT_DIRECTOR"
    ? 0
    : mission.status === "PENDING_DIRECTION"
      ? 1
      : null;
  const rejectedByName = mission.rejectedBy
    ? `${mission.rejectedBy.firstName} ${mission.rejectedBy.lastName}`
    : mission.rejectedById
      ? "Nom indisponible"
      : "Non renseigné";

  const getStepState = (index: number): StepState => {
    if (mission.status === "APPROVED") return "complete";
    if (mission.status === "REJECTED") {
      if (index === rejectedStepIndex) return "rejected";
      return rejectedStepIndex !== null && index < rejectedStepIndex ? "complete" : "upcoming";
    }
    if (currentStepIndex === null) return "upcoming";
    if (index < currentStepIndex) return "complete";
    return index === currentStepIndex ? "current" : "upcoming";
  };

  return (
    <Card className="gap-4 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>État du workflow</CardTitle>
          <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">Deux validations mènent à la clôture de la mission.</p>
        </div>
        <MissionStatusBadge status={mission.status} showDot />
      </div>

      {createdForDirector && (
        <p className="rounded-lg border border-[var(--info)]/20 bg-[var(--info-soft)] px-3 py-2 text-xs leading-5 text-[var(--text-soft)]">
          Cette mission a été créée par un chef d&apos;équipe pour le directeur bénéficiaire.
        </p>
      )}

      <ol className="grid gap-2.5 sm:grid-cols-2">
        {steps.map((step, index) => {
          const state = getStepState(index);
          return (
            <li
              key={step.title}
              className={`min-w-0 rounded-xl border p-3.5 transition-colors sm:p-4 ${stepStyles[state]}`}
              aria-current={state === "current" ? "step" : undefined}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">Étape {index + 1}</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--text-soft)]">
                  {state === "complete" && <Check className="h-3.5 w-3.5 text-[var(--success)]" aria-hidden="true" />}
                  {state === "current" && <Clock3 className="h-3.5 w-3.5 text-[var(--brand-strong)]" aria-hidden="true" />}
                  {state === "rejected" && <X className="h-3.5 w-3.5 text-[var(--danger)]" aria-hidden="true" />}
                  {stateLabelsForMission(state, mission.status)}
                </span>
              </div>
              <p className="mt-3 text-sm font-semibold text-[var(--text)]">{step.title}</p>
              <p className="mt-1 min-h-5 text-xs leading-5 text-[var(--text-soft)]">{step.detail}</p>
            </li>
          );
        })}
      </ol>

      {mission.status === "APPROVED" && (
        <div className="flex items-start gap-2.5 rounded-xl border border-[var(--success)]/25 bg-[var(--success-soft)] px-3.5 py-3 text-sm text-[var(--success)]">
          <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p><span className="font-semibold">Circuit terminé.</span> Les validations sont terminées et la mission est approuvée.</p>
        </div>
      )}

      {mission.status === "DRAFT" && (
        <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] px-3.5 py-3 text-sm text-[var(--text-soft)]">
          La mission doit être soumise avant le démarrage des validations.
        </div>
      )}

      {currentStepIndex !== null && (
        <div className="flex items-start gap-2.5 rounded-xl border border-[var(--brand)]/20 bg-[var(--brand-soft)] px-3.5 py-3">
          <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-strong)]" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--brand-strong)]">Étape actuelle</p>
            <p className="mt-1 text-sm font-semibold text-[var(--text)]">{steps[currentStepIndex].title} · {steps[currentStepIndex].detail}</p>
          </div>
        </div>
      )}

      {mission.status === "REJECTED" && (
        <div className="space-y-3 rounded-xl border border-[var(--danger)]/25 bg-[var(--danger-soft)] p-3.5 sm:p-4">
          <div className="flex items-start gap-2.5">
            <X className="mt-0.5 h-4 w-4 shrink-0 text-[var(--danger)]" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--danger)]">Motif du rejet</p>
              <p className="mt-1 break-words text-sm leading-5 text-[var(--text)]">{mission.rejectionReason || "Aucun motif renseigné."}</p>
            </div>
          </div>
          <dl className="grid gap-2 border-t border-[var(--danger)]/15 pt-3 sm:grid-cols-2">
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">Rejetée par</dt>
              <dd className="mt-1 break-words text-sm font-medium text-[var(--text)]">{rejectedByName}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">Date du rejet</dt>
              <dd className="mt-1 text-sm font-medium text-[var(--text)]">{formatDateTime(mission.rejectedAt)}</dd>
            </div>
          </dl>
        </div>
      )}
    </Card>
  );
}

function stateLabelsForMission(state: StepState, status: Mission["status"]): string {
  if (state === "upcoming" && status === "REJECTED") return "Non démarrée";
  if (state === "upcoming" && status === "DRAFT") return "Après soumission";
  return stepLabels[state];
}
