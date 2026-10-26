"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/forms/form-field";
import type { DirectionResourcesPayload, Mission } from "@/types/missions";
import { ApiError } from "@/lib/api/client";
import { Alert } from "@/components/ui/alert";
import { getDirectionMonthlyBudget } from "@/lib/api/missions";
import type { DirectionMonthlyBudget } from "@/types/missions";

const resourcesSchema = z.object({
  fuelCardNumber: z.string().trim().min(1, "Le numéro de carte carburant est obligatoire."),
  fuelAmount: z.string().trim().min(1, "Le montant carburant est obligatoire.").refine((value) => Number.isFinite(Number(value)) && Number(value) >= 0, "Le montant carburant doit être positif ou nul."),
  destinations: z.array(z.object({
    id: z.string(),
    name: z.string(),
    accommodation: z.boolean(),
    accommodationLocation: z.string(),
  })),
  pluxeeTicketCount: z.string().trim().min(1, "Le nombre de tickets restaurant est obligatoire.").refine((value) => Number.isInteger(Number(value)) && Number(value) >= 0, "Le nombre de tickets restaurant doit être un entier positif ou nul."),
  pluxeeAmount: z.string().trim().min(1, "Le montant Pluxee est obligatoire.").refine((value) => Number.isFinite(Number(value)) && Number(value) >= 0, "Le montant Pluxee doit être positif ou nul."),
  notes: z.string(),
}).superRefine((values, context) => {
  values.destinations.forEach((destination, index) => {
    if (destination.accommodation && !destination.accommodationLocation.trim()) {
      context.addIssue({ code: "custom", path: ["destinations", index, "accommodationLocation"], message: "Le lieu d'hébergement est obligatoire." });
    }
  });
});

type FormValues = z.infer<typeof resourcesSchema>;

const formValues = (mission: Mission): FormValues => ({
  fuelCardNumber: mission.resources?.fuelCardNumber ?? "",
  fuelAmount: mission.resources?.fuelAmount ?? "",
  destinations: mission.destinations?.length
    ? mission.destinations.map((destination, index) => {
      const accommodationLocation = destination.accommodationLocation
        ?? (index === 0 && mission.resources?.accommodation ? mission.resources.accommodationLocation : null)
        ?? "";
      return {
        id: destination.id,
        name: destination.name,
        accommodation: Boolean(accommodationLocation),
        accommodationLocation,
      };
    })
    : [{
      id: "",
      name: mission.destination ?? "Hébergement de la mission",
      accommodation: mission.resources?.accommodation ?? false,
      accommodationLocation: mission.resources?.accommodationLocation ?? "",
    }],
  pluxeeTicketCount: mission.resources?.pluxeeTicketCount?.toString() ?? "",
  pluxeeAmount: mission.resources?.pluxeeAmount ?? "",
  notes: mission.resources?.notes ?? "",
});

export function MissionResourcesForm({ mission, onSave }: Readonly<{ mission: Mission; onSave: (payload: DirectionResourcesPayload) => Promise<void> }>) {
  const [apiError, setApiError] = useState<string | null>(null);
  const [monthlyBudget, setMonthlyBudget] = useState<DirectionMonthlyBudget | null>(null);
  const [budgetLoadError, setBudgetLoadError] = useState(false);
  const { control, register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(resourcesSchema), defaultValues: formValues(mission) });
  useEffect(() => { reset(formValues(mission)); }, [mission, reset]);
  useEffect(() => {
    let active = true;
    void getDirectionMonthlyBudget().then((response) => {
      if (active) setMonthlyBudget(response.data);
    }).catch(() => {
      if (active) setBudgetLoadError(true);
    });
    return () => { active = false; };
  }, []);

  const watchedFuelAmount = useWatch({ control, name: "fuelAmount" });
  const watchedTicketCount = useWatch({ control, name: "pluxeeTicketCount" });
  const watchedDestinations = useWatch({ control, name: "destinations" });
  const fuelAfterMission = Number(monthlyBudget?.fuelRemaining ?? 0) - Number(watchedFuelAmount || 0);
  const ticketsAfterMission = (monthlyBudget?.pluxeeTicketRemaining ?? 0) - Number(watchedTicketCount || 0);
  const willExceedFuel = monthlyBudget !== null && fuelAfterMission < 0;
  const willExceedTickets = monthlyBudget !== null && ticketsAfterMission < 0;
  const formatAmount = (value: string | number) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 3 }).format(Number(value));

  const submit = async (values: FormValues) => {
    setApiError(null);
    const destinations = values.destinations
      .filter((destination) => destination.accommodation && destination.accommodationLocation.trim())
      .map((destination) => ({
        id: destination.id,
        accommodationLocation: destination.accommodationLocation.trim(),
      }));
    const hasDestinationRows = values.destinations.some((destination) => destination.id);
    const accommodationLocation = destinations[0]?.accommodationLocation
      ?? (values.destinations[0]?.accommodation ? values.destinations[0].accommodationLocation.trim() : "");
    const payload: DirectionResourcesPayload = {
      fuelCardNumber: values.fuelCardNumber.trim(),
      fuelAmount: Number(values.fuelAmount),
      accommodation: destinations.length > 0 || (!hasDestinationRows && values.destinations[0]?.accommodation === true),
      ...(accommodationLocation ? { accommodationLocation } : {}),
      ...(hasDestinationRows ? {
        destinations: values.destinations.map((destination) => ({
          id: destination.id,
          accommodationLocation: destination.accommodation && destination.accommodationLocation.trim()
            ? destination.accommodationLocation.trim()
            : null,
        })),
      } : {}),
      pluxeeTicketCount: Number(values.pluxeeTicketCount),
      pluxeeAmount: Number(values.pluxeeAmount),
      ...(values.notes.trim() ? { notes: values.notes.trim() } : {}),
    };
    try {
      await onSave(payload);
    } catch (error) {
      setApiError(error instanceof ApiError ? error.message : "Une erreur est survenue. Veuillez réessayer.");
    }
  };

  return <Card>
    <CardTitle>Ressources Direction</CardTitle>
    {apiError && <div className="mt-4"><Alert tone="danger" role="alert">{apiError}</Alert></div>}
    {budgetLoadError && <div className="mt-4"><Alert tone="warning">Le solde mensuel n’a pas pu être chargé. L’attribution reste possible ; le serveur affichera un avertissement si le budget est dépassé.</Alert></div>}
    {monthlyBudget && <div className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] px-3 py-2.5 text-xs text-[var(--text-soft)]">
      Disponible ce mois : <strong className="font-semibold text-[var(--text)]">{formatAmount(monthlyBudget.fuelRemaining)} DT</strong> en carburant et <strong className="font-semibold text-[var(--text)]">{monthlyBudget.pluxeeTicketRemaining}</strong> tickets restaurant.
    </div>}
    {(willExceedFuel || willExceedTickets) && <div className="mt-3"><Alert tone="warning">Le solde sera dépassé par cette mission. La Direction peut continuer ; le budget affichera le dépassement après attribution.</Alert></div>}
    <form onSubmit={handleSubmit(submit)} className="mt-3 grid gap-3 md:grid-cols-2" noValidate>
      <FormField id="fuelCardNumber" label="Numéro carte carburant" error={errors.fuelCardNumber?.message}><Input id="fuelCardNumber" {...register("fuelCardNumber")} /></FormField>
      <FormField id="fuelAmount" label="Montant carburant" error={errors.fuelAmount?.message}><Input id="fuelAmount" inputMode="decimal" {...register("fuelAmount")} /></FormField>
      <div className="space-y-2 md:col-span-2">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text)]">Hébergements par destination</h3>
          <p className="mt-0.5 text-xs leading-5 text-[var(--text-muted)]">Précisez un lieu pour chaque étape qui nécessite un hébergement.</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {watchedDestinations.map((destination, index) => {
            const locationId = `destination-accommodation-${index}`;
            const locationError = errors.destinations?.[index]?.accommodationLocation?.message;
            return (
              <div key={destination.id || `mission-${index}`} className="space-y-3 rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] p-3">
                <input type="hidden" {...register(`destinations.${index}.id` as const)} />
                <input type="hidden" {...register(`destinations.${index}.name` as const)} />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">Destination {index + 1}</p>
                    <p className="mt-0.5 truncate text-sm font-semibold text-[var(--text)]">{destination.name}</p>
                  </div>
                  <label htmlFor={`${locationId}-enabled`} className="flex shrink-0 items-center gap-2 text-xs font-medium text-[var(--text-soft)]">
                    <input id={`${locationId}-enabled`} type="checkbox" {...register(`destinations.${index}.accommodation` as const)} className="h-4 w-4 accent-indigo-700" />
                    Hébergement prévu
                  </label>
                </div>
                {destination.accommodation && (
                  <FormField id={locationId} label="Lieu d'hébergement" error={locationError}>
                    <Input id={locationId} placeholder="Hôtel, ville ou adresse" {...register(`destinations.${index}.accommodationLocation` as const)} />
                  </FormField>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <FormField id="pluxeeTicketCount" label="Nombre de tickets restaurant" error={errors.pluxeeTicketCount?.message}><Input id="pluxeeTicketCount" inputMode="numeric" {...register("pluxeeTicketCount")} /></FormField>
      <FormField id="pluxeeAmount" label="Montant Pluxee" error={errors.pluxeeAmount?.message}><Input id="pluxeeAmount" inputMode="decimal" {...register("pluxeeAmount")} /></FormField>
      <FormField id="notes" label="Notes"><Textarea id="notes" rows={3} {...register("notes")} /></FormField>
      <div className="md:col-span-2"><Button type="submit" size="sm" disabled={isSubmitting}>{isSubmitting ? "Enregistrement..." : "Enregistrer les données"}</Button></div>
    </form>
  </Card>;
}
