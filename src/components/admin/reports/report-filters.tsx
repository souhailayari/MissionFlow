"use client";

import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { BriefcaseBusiness, Download, Users } from "lucide-react";
import type { AdminDepartment, AdminTeam } from "@/types/admin";
import type { MissionReportFilters, UserReportFilters } from "@/lib/api/admin";

export function ReportFilters({ departments, teams, missionFilters, userFilters, onMissionChange, onUserChange, onExportMissions, onExportUsers }: Readonly<{
  departments: AdminDepartment[];
  teams: AdminTeam[];
  missionFilters: MissionReportFilters;
  userFilters: UserReportFilters;
  onMissionChange: (filters: MissionReportFilters) => void;
  onUserChange: (filters: UserReportFilters) => void;
  onExportMissions: () => void;
  onExportUsers: () => void;
}>) {
  const fieldClass = "h-10 rounded-xl border-[var(--line)] bg-[var(--surface)] text-sm text-[var(--text)] shadow-sm focus-visible:ring-[var(--focus)]";
  const labelClass = "space-y-1.5 text-xs font-semibold text-[var(--text-soft)]";

  return (
    <div className="grid gap-3 xl:grid-cols-2">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-strong)]"><BriefcaseBusiness className="h-[18px] w-[18px]" aria-hidden="true" /></span>
            <div><CardTitle>Export des missions</CardTitle><p className="mt-1 text-xs text-[var(--text-muted)]">Choisissez le périmètre à inclure dans le fichier.</p></div>
          </div>
          <Button size="sm" onClick={onExportMissions} leftIcon={<Download className="h-3.5 w-3.5" aria-hidden="true" />}>Exporter CSV</Button>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <label className={labelClass}>Statut
            <Select className={fieldClass} value={missionFilters.status ?? ""} onChange={(event) => onMissionChange({ ...missionFilters, status: event.target.value || undefined })}>
              <option value="">Tous les statuts</option>
              <option value="DRAFT">Brouillon</option>
              <option value="PENDING_TEAM_LEADER">En attente du chef d&apos;équipe</option>
              <option value="PENDING_DEPARTMENT_DIRECTOR">En attente du directeur de département</option>
              <option value="PENDING_DIRECTION">En attente de la direction</option>
              <option value="APPROVED">Approuvée</option>
              <option value="REJECTED">Rejetée</option>
            </Select>
          </label>
          <label className={labelClass}>Département
            <Select className={fieldClass} value={missionFilters.departmentId ?? ""} onChange={(event) => onMissionChange({ ...missionFilters, departmentId: event.target.value || undefined })}>
              <option value="">Tous les départements</option>
              {departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
            </Select>
          </label>
          <label className={labelClass}>Équipe
            <Select className={fieldClass} value={missionFilters.teamId ?? ""} onChange={(event) => onMissionChange({ ...missionFilters, teamId: event.target.value || undefined })}>
              <option value="">Toutes les équipes</option>
              {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
            </Select>
          </label>
          <label className={labelClass}>Départ à partir du
            <Input className={fieldClass} type="date" value={missionFilters.from ?? ""} onChange={(event) => onMissionChange({ ...missionFilters, from: event.target.value || undefined })} />
          </label>
          <label className={labelClass}>Départ jusqu&apos;au
            <Input className={fieldClass} type="date" value={missionFilters.to ?? ""} onChange={(event) => onMissionChange({ ...missionFilters, to: event.target.value || undefined })} />
          </label>
        </div>
      </Card>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--info-soft)] text-[var(--info)]"><Users className="h-[18px] w-[18px]" aria-hidden="true" /></span>
            <div><CardTitle>Export des utilisateurs</CardTitle><p className="mt-1 text-xs text-[var(--text-muted)]">Filtrez les comptes à exporter.</p></div>
          </div>
          <Button size="sm" onClick={onExportUsers} leftIcon={<Download className="h-3.5 w-3.5" aria-hidden="true" />}>Exporter CSV</Button>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <label className={labelClass}>Département
            <Select className={fieldClass} value={userFilters.departmentId ?? ""} onChange={(event) => onUserChange({ ...userFilters, departmentId: event.target.value || undefined })}>
              <option value="">Tous les départements</option>
              {departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
            </Select>
          </label>
          <label className={labelClass}>Équipe
            <Select className={fieldClass} value={userFilters.teamId ?? ""} onChange={(event) => onUserChange({ ...userFilters, teamId: event.target.value || undefined })}>
              <option value="">Toutes les équipes</option>
              {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
            </Select>
          </label>
          <label className={labelClass}>Rôle global
            <Select className={fieldClass} value={userFilters.role ?? ""} onChange={(event) => onUserChange({ ...userFilters, role: event.target.value || undefined })}>
              <option value="">Tous les rôles</option>
              <option value="ADMIN">Administrateur</option>
              <option value="RH">Ressources humaines</option>
              <option value="DIRECTION">Direction</option>
            </Select>
          </label>
          <label className={labelClass}>Statut
            <Select className={fieldClass} value={userFilters.active === undefined ? "" : userFilters.active ? "active" : "inactive"} onChange={(event) => onUserChange({ ...userFilters, active: event.target.value === "" ? undefined : event.target.value === "active" })}>
              <option value="">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </Select>
          </label>
        </div>
      </Card>
    </div>
  );
}
