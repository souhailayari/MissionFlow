import { Check, MessageSquareText, X } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MissionStatusBadge } from "@/components/missions/mission-status-badge";
import { missionStatusLabels } from "@/types/missions";
import type { ApprovalStep, Mission, MissionApproval, MissionStatus } from "@/types/missions";

const statusMarkerTones: Record<MissionStatus, string> = {
  DRAFT: "bg-[var(--text-muted)]",
  PENDING_TEAM_LEADER: "bg-[var(--warning)]",
  PENDING_DEPARTMENT_DIRECTOR: "bg-[var(--warning)]",
  PENDING_DIRECTION: "bg-[var(--info)]",
  APPROVED: "bg-[var(--success)]",
  REJECTED: "bg-[var(--danger)]",
};

const approvalStepLabels: Record<ApprovalStep, string> = {
  TEAM_LEADER: "Chef d'équipe",
  DEPARTMENT_DIRECTOR: "Directeur de département",
  DIRECTION: "Direction",
};

const formatDateTime = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date inconnue";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(date);
};

export function MissionHistory({ mission }: Readonly<{ mission: Mission }>) {
  const history = [...(mission.statusHistory ?? [])].sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime());
  const approvals = [...(mission.approvals ?? [])].sort((left, right) => new Date(left.decidedAt).getTime() - new Date(right.decidedAt).getTime());

  return (
    <div className="space-y-3">
      <Card className="gap-4 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Historique des statuts</CardTitle>
            <p className="mt-1 text-xs text-[var(--text-muted)]">Les changements de statut, du plus ancien au plus récent.</p>
          </div>
          <Badge tone="neutral">{history.length} événement{history.length === 1 ? "" : "s"}</Badge>
        </div>
        {history.length ? (
          <ol className="space-y-0">
            {history.map((item, index) => {
              const latest = index === history.length - 1;
              return (
                <li key={item.id} className="relative border-l border-[var(--line)] pb-3 pl-5 last:border-l-0 last:pb-0">
                  <span className={`absolute -left-[5px] top-4 h-2.5 w-2.5 rounded-full ring-4 ring-[var(--surface)] ${statusMarkerTones[item.toStatus]}`} aria-hidden="true" />
                  <article className={`rounded-xl border p-3.5 sm:p-4 ${latest ? "border-[var(--brand)]/20 bg-[var(--brand-soft)]" : "border-[var(--line)] bg-[var(--surface)]"}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <MissionStatusBadge status={item.toStatus} showDot />
                      <time dateTime={item.createdAt} className="text-xs tabular-nums text-[var(--text-muted)]">{formatDateTime(item.createdAt)}</time>
                    </div>
                    <p className="mt-2 text-xs text-[var(--text-soft)]">
                      {item.fromStatus ? `Depuis · ${missionStatusLabels[item.fromStatus]}` : "Création de la mission"}
                      {item.changedBy && <> · Par {item.changedBy.firstName} {item.changedBy.lastName}</>}
                      {latest && <span className="ml-1.5 font-semibold text-[var(--brand-strong)]">· Dernière mise à jour</span>}
                    </p>
                    {item.comment && (
                      <div className="mt-3 flex items-start gap-2 border-t border-[var(--line)] pt-3">
                        <MessageSquareText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
                        <p className="break-words text-sm leading-5 text-[var(--text-soft)]">{item.comment}</p>
                      </div>
                    )}
                  </article>
                </li>
              );
            })}
          </ol>
        ) : <p className="rounded-xl border border-dashed border-[var(--line)] bg-[var(--surface-muted)] px-4 py-5 text-sm text-[var(--text-muted)]">Aucun historique disponible.</p>}
      </Card>
      <Card className="gap-4 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Décisions de validation</CardTitle>
            <p className="mt-1 text-xs text-[var(--text-muted)]">Qui a validé la mission et à quelle étape.</p>
          </div>
          <Badge tone="neutral">{approvals.length} décision{approvals.length === 1 ? "" : "s"}</Badge>
        </div>
        {approvals.length ? (
          <ul className="space-y-2.5">
            {approvals.map((item: MissionApproval, index) => {
              const approved = item.decision === "APPROVED";
              const DecisionIcon = approved ? Check : X;
              const latest = index === approvals.length - 1;
              return (
                <li key={item.id}>
                  <article className={`rounded-xl border p-3.5 sm:p-4 ${latest ? "border-[var(--brand)]/20 bg-[var(--brand-soft)]" : "border-[var(--line)] bg-[var(--surface)]"}`}>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${approved ? "bg-[var(--success-soft)] text-[var(--success)]" : "bg-[var(--danger-soft)] text-[var(--danger)]"}`}>
                        <DecisionIcon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[var(--text)]">
                          {item.validator ? `${item.validator.firstName} ${item.validator.lastName}` : "Validateur non renseigné"}
                        </p>
                        <p className="mt-1 text-xs text-[var(--text-muted)]">{approvalStepLabels[item.step]}</p>
                      </div>
                      <div className="ml-auto flex flex-col items-end gap-1.5">
                        <Badge tone={approved ? "success" : "danger"}>{approved ? "Approuvée" : "Rejetée"}</Badge>
                        <time dateTime={item.decidedAt} className="text-right text-xs tabular-nums text-[var(--text-muted)]">{formatDateTime(item.decidedAt)}</time>
                      </div>
                    </div>
                    {item.comment && (
                      <div className="mt-3 flex items-start gap-2 border-t border-[var(--line)] pt-3">
                        <MessageSquareText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
                        <p className="break-words text-sm leading-5 text-[var(--text-soft)]">{item.comment}</p>
                      </div>
                    )}
                  </article>
                </li>
              );
            })}
          </ul>
        ) : <p className="rounded-xl border border-dashed border-[var(--line)] bg-[var(--surface-muted)] px-4 py-5 text-sm text-[var(--text-muted)]">Aucune décision disponible.</p>}
      </Card>
    </div>
  );
}
