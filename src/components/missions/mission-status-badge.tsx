import { Badge } from "@/components/ui/badge";
import { missionStatusLabels, type MissionStatus } from "@/types/missions";

const statusTones: Record<MissionStatus, "neutral" | "info" | "success" | "warning" | "danger"> = {
  DRAFT: "neutral", PENDING_TEAM_LEADER: "warning", PENDING_DEPARTMENT_DIRECTOR: "warning", PENDING_DIRECTION: "info", APPROVED: "success", REJECTED: "danger",
};

const statusDotColors: Record<MissionStatus, string> = {
  DRAFT: "var(--text-muted)",
  PENDING_TEAM_LEADER: "var(--warning)",
  PENDING_DEPARTMENT_DIRECTOR: "var(--warning)",
  PENDING_DIRECTION: "var(--info)",
  APPROVED: "var(--success)",
  REJECTED: "var(--danger)",
};

export function MissionStatusBadge({ status, showDot = false }: Readonly<{ status: MissionStatus; showDot?: boolean }>) {
  return (
    <Badge tone={statusTones[status]} className={showDot ? "gap-1.5 pl-2" : undefined}>
      {showDot && <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: statusDotColors[status] }} />}
      {missionStatusLabels[status]}
    </Badge>
  );
}
