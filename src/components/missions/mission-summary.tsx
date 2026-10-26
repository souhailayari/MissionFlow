import { Card, CardTitle } from "@/components/ui/card";
import { ExpandableTextCard } from "@/components/missions/expandable-text-card";
import type { Mission } from "@/types/missions";

function Field({ label, value }: Readonly<{ label: string; value: string | number | null | undefined }>) {
  const displayValue = value === null || value === undefined || value === "" ? "Non renseigné" : String(value);
  return (
    <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
      <dt className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">{label}</dt>
      <dd className="mt-1.5 min-w-0 text-sm font-semibold leading-5 text-slate-800">
        <span className="block break-words [overflow-wrap:anywhere]">{displayValue}</span>
      </dd>
    </div>
  );
}

function DestinationsField({ destinations }: Readonly<{ destinations: NonNullable<Mission["destinations"]> }>) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50/70 p-3 sm:col-span-2 lg:col-span-3">
      <dt className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
        {destinations.length > 1 ? "Destinations · ordre du trajet" : "Destination"}
      </dt>
      <dd className="mt-2 min-w-0">
        <ol className="grid min-w-0 gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {destinations.map((destination, index) => (
            <li key={destination.id} className="min-w-0">
              <ExpandableTextCard title={`Destination ${index + 1}`} text={destination.name} number={index + 1} />
            </li>
          ))}
        </ol>
      </dd>
    </div>
  );
}

export function MissionSummary({ mission }: Readonly<{ mission: Mission }>) {
  const employee = mission.employee;
  const creator = mission.createdBy;
  const departureDate = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(mission.departureDate));
  const returnDate = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(mission.returnDate));

  return (
    <div className="space-y-3">
      <Card className="gap-3 p-4 sm:p-5">
        <CardTitle>Identification</CardTitle>
        <dl className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Référence" value={mission.reference} />
          <Field label="Objet de la mission" value={mission.title} />
          <Field label="Bénéficiaire" value={employee ? `${employee.firstName} ${employee.lastName}` : null} />
          {mission.createdById !== mission.employeeId && <Field label="Créée par" value={creator ? `${creator.firstName} ${creator.lastName}` : null} />}
          <Field label="Matricule" value={employee?.matricule} />
          <Field label="Fonction" value={employee?.function} />
          <Field label="Département" value={mission.department?.name} />
          <Field label="Équipe" value={mission.team?.name} />
        </dl>
      </Card>
      <Card className="gap-3 p-4 sm:p-5">
        <CardTitle>Déplacement</CardTitle>
        <dl className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Numéro intervention" value={mission.interventionNumber} />
          <Field label="Date intervention" value={mission.interventionDate ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(mission.interventionDate)) : null} />
          <Field label="Lieu" value={mission.location} />
          {mission.destinations?.length
            ? <DestinationsField destinations={mission.destinations} />
            : <Field label="Destination" value={mission.destination} />}
          <Field label="Client" value={mission.client} />
          <Field label="Motif" value={mission.purpose} />
          <Field label="Donneur d'ordre" value={mission.orderGiver} />
          <Field label="Accompagné de" value={mission.companion} />
          <Field label="Véhicule immatriculé" value={mission.vehicleRegistration} />
          <Field label="Transport" value={mission.transportType} />
          <Field label="Hébergement demandé" value={mission.accommodationRequested ? "Oui" : "Non"} />
        </dl>
      </Card>
      <Card className="gap-3 p-4 sm:p-5">
        <CardTitle>Dates et durée</CardTitle>
        <dl className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Date de départ" value={departureDate} />
          <Field label="Date de retour" value={returnDate} />
          <Field label="Nombre de jours calculé" value={`${mission.numberOfDays} jour${mission.numberOfDays > 1 ? "s" : ""}`} />
        </dl>
      </Card>
    </div>
  );
}
