import type { Mission } from "@/types/missions";

const beneficiaryName = (mission: Mission): string =>
  mission.employee ? `${mission.employee.firstName} ${mission.employee.lastName}` : "Bénéficiaire non renseigné";

const beneficiaryInitials = (mission: Mission): string => {
  if (!mission.employee) return "?";
  const first = mission.employee.firstName.trim().charAt(0);
  const last = mission.employee.lastName.trim().charAt(0);
  return `${first}${last}`.toLocaleUpperCase("fr-FR") || "?";
};

export function MissionBeneficiary({ mission }: Readonly<{ mission: Mission }>) {
  const createdBy = mission.createdBy
    ? `${mission.createdBy.firstName} ${mission.createdBy.lastName}`
    : "un chef d'équipe";

  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span aria-hidden="true" className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[10px] font-bold tracking-wide text-[var(--brand-strong)] ring-1 ring-[var(--line)]">
        {beneficiaryInitials(mission)}
      </span>
      <div className="min-w-0">
        <p className="truncate text-[13px] font-semibold text-[var(--text)]">{beneficiaryName(mission)}</p>
        {mission.createdById !== mission.employeeId && (
          <p className="mt-0.5 truncate text-[11px] text-[var(--text-muted)]" title={`Créée par ${createdBy}`}>
            Créée par {createdBy}
          </p>
        )}
      </div>
    </div>
  );
}
