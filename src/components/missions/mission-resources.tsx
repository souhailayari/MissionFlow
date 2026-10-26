import type { ReactNode } from "react";
import { CreditCard, Fuel, Hotel, StickyNote, Ticket, type LucideIcon } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { ExpandableTextCard } from "@/components/missions/expandable-text-card";
import type { Mission } from "@/types/missions";

type ResourceTone = "warning" | "info" | "brand";

const iconTones: Record<ResourceTone, string> = {
  warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
  info: "bg-[var(--info-soft)] text-[var(--info)]",
  brand: "bg-[var(--brand-soft)] text-[var(--brand-strong)]",
};

function formatAmount(value: string | null): string {
  if (value === null || value.trim() === "") return "Non renseigné";
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "Non renseigné";
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 3 }).format(amount)} DT`;
}

function ResourceTile({
  label,
  value,
  detail,
  icon: Icon,
  tone,
  className = "",
}: Readonly<{
  label: string;
  value: string;
  detail: ReactNode;
  icon: LucideIcon;
  tone: ResourceTone;
  className?: string;
}>) {
  return (
    <div className={`min-w-0 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 sm:p-4 ${className}`}>
      <div className="flex items-center gap-2.5">
        <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconTones[tone]}`}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <dt className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">{label}</dt>
      </div>
      <dd className="mt-3 break-words text-lg font-bold leading-6 text-slate-900">{value}</dd>
      <div className="mt-1 min-w-0 break-words text-xs leading-5 text-slate-500 [overflow-wrap:anywhere]">{detail}</div>
    </div>
  );
}

export function MissionResources({ mission }: Readonly<{ mission: Mission }>) {
  const resource = mission.resources;
  const destinationStayDetails = (mission.destinations ?? [])
    .filter((destination) => destination.accommodationLocation?.trim())
    .map((destination) => ({
      id: destination.id,
      name: destination.name,
      location: destination.accommodationLocation?.trim() ?? "",
    }));
  const accommodationCount = destinationStayDetails.length;
  const accommodationDetail = accommodationCount
    ? (
      <ul className="grid min-w-0 gap-2 sm:grid-cols-2">
        {destinationStayDetails.map((stay, index) => (
          <li key={stay.id} className="min-w-0">
            <ExpandableTextCard
              title={`Hébergement · Destination ${index + 1}`}
              subtitle={stay.name}
              text={stay.location}
              number={index + 1}
            />
          </li>
        ))}
      </ul>
    )
    : resource?.accommodation
      ? resource.accommodationLocation || "Lieu non renseigné"
      : "Aucun hébergement attribué";

  return (
    <Card className="gap-4 p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-strong)]">
          <CreditCard className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <CardTitle>Ressources Direction</CardTitle>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">Moyens attribués pour cette mission</p>
        </div>
      </div>

      {resource ? (
        <dl className="grid gap-2.5 sm:grid-cols-2">
          <ResourceTile
            label="Carburant"
            value={formatAmount(resource.fuelAmount)}
            detail={resource.fuelCardNumber ? `Carte carburant · ${resource.fuelCardNumber}` : "Carte carburant non renseignée"}
            icon={Fuel}
            tone="warning"
          />
          <ResourceTile
            label="Tickets Pluxee"
            value={resource.pluxeeTicketCount === null ? "Non renseigné" : `${resource.pluxeeTicketCount} ticket${resource.pluxeeTicketCount === 1 ? "" : "s"}`}
            detail={`Montant · ${formatAmount(resource.pluxeeAmount)}`}
            icon={Ticket}
            tone="brand"
          />
          <ResourceTile
            label="Hébergement"
            value={accommodationCount > 0 ? `${accommodationCount} lieu${accommodationCount === 1 ? "" : "x"}` : resource.accommodation ? "Prévu" : "Non prévu"}
            detail={accommodationDetail}
            icon={Hotel}
            tone="info"
            className={accommodationCount > 1 ? "sm:col-span-2" : ""}
          />
          <div className="rounded-xl border border-slate-100 bg-white p-3.5 sm:col-span-2 sm:p-4">
            <dt className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
              <StickyNote className="h-3.5 w-3.5" aria-hidden="true" />
              Notes
            </dt>
            <dd className="mt-2 whitespace-pre-wrap break-words text-sm leading-5 text-slate-700 [overflow-wrap:anywhere]">
              {resource.notes?.trim() || "Aucune note renseignée."}
            </dd>
          </div>
        </dl>
      ) : (
        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-5 text-sm text-slate-500">
          Aucune ressource Direction enregistrée.
        </p>
      )}
    </Card>
  );
}
