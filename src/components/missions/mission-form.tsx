"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useFieldArray, useForm, useWatch, type SubmitHandler, type UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { CreateMissionPayload, Mission } from "@/types/missions";
import { FormField } from "@/components/forms/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useSession } from "@/lib/auth/session-context";
import { listDepartmentDirectors } from "@/lib/api/missions";
import { MissionDestinationPicker } from "@/components/missions/mission-destination-picker";
import { ArrowDown, ArrowUp, BriefcaseBusiness, CalendarDays, MapPinned, Plus, Trash2 } from "lucide-react";

export const missionFormSchema = z.object({
  title: z.string().trim().min(3, "L'objet doit contenir au moins 3 caractères."),
  initialApprovalStep: z.enum(["TEAM_LEADER", "DEPARTMENT_DIRECTOR"]).optional(),
  beneficiaryId: z.string(),
  interventionNumber: z.string(),
  interventionDate: z.string(),
  location: z.string().trim().min(2, "Le lieu doit contenir au moins 2 caractères."),
  destinations: z.array(z.object({ name: z.string(), latitude: z.string(), longitude: z.string() })).max(10, "Une mission peut contenir jusqu’à 10 destinations."),
  client: z.string(),
  purpose: z.string(),
  orderGiver: z.string(),
  companion: z.string(),
  vehicleRegistration: z.string(),
  transportType: z.string(),
  departureDate: z.string().min(1, "La date de départ est obligatoire."),
  returnDate: z.string().min(1, "La date de retour est obligatoire."),
  accommodationRequested: z.boolean(),
}).superRefine((values, context) => {
  if (!values.initialApprovalStep) context.addIssue({ code: "custom", path: ["initialApprovalStep"], message: "Choisissez le premier validateur." });
  values.destinations.forEach((destination, index) => {
    const hasName = destination.name.trim() !== "";
    const hasLatitude = destination.latitude.trim() !== "";
    const hasLongitude = destination.longitude.trim() !== "";
    if (!hasName && (hasLatitude || hasLongitude)) context.addIssue({ code: "custom", path: ["destinations", index, "name"], message: "Donnez un nom à cette destination." });
    if (hasLatitude !== hasLongitude) {
      context.addIssue({ code: "custom", path: ["destinations", index, hasLatitude ? "longitude" : "latitude"], message: "Sélectionnez le point complet sur la carte." });
    } else if (hasLatitude && hasLongitude) {
      const latitude = Number(destination.latitude);
      const longitude = Number(destination.longitude);
      if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) context.addIssue({ code: "custom", path: ["destinations", index, "latitude"], message: "La latitude doit être comprise entre −90 et 90." });
      if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) context.addIssue({ code: "custom", path: ["destinations", index, "longitude"], message: "La longitude doit être comprise entre −180 et 180." });
    }
  });
  if (values.departureDate && values.returnDate && new Date(values.returnDate) <= new Date(values.departureDate)) {
    context.addIssue({ code: "custom", path: ["returnDate"], message: "La date de retour doit être postérieure au départ." });
  }
});

export type MissionFormValues = z.infer<typeof missionFormSchema>;

export const emptyMissionFormValues: MissionFormValues = {
  title: "", beneficiaryId: "", interventionNumber: "", interventionDate: "", location: "", destinations: [{ name: "", latitude: "", longitude: "" }], client: "", purpose: "", orderGiver: "", companion: "", vehicleRegistration: "", transportType: "", departureDate: "", returnDate: "", accommodationRequested: false,
};

const optionalFields: Array<keyof Omit<CreateMissionPayload, "title" | "initialApprovalStep" | "location" | "departureDate" | "returnDate" | "accommodationRequested" | "destination" | "destinationLatitude" | "destinationLongitude" | "destinations">> = ["interventionNumber", "interventionDate", "client", "purpose", "orderGiver", "companion", "vehicleRegistration", "transportType"];

export const missionToFormValues = (mission: Mission): MissionFormValues => ({
  title: mission.title,
  initialApprovalStep: mission.initialApprovalStep,
  beneficiaryId: mission.createdById !== mission.employeeId ? mission.employeeId : "",
  interventionNumber: mission.interventionNumber ?? "",
  interventionDate: mission.interventionDate?.slice(0, 10) ?? "",
  location: mission.location,
  destinations: mission.destinations?.length
    ? mission.destinations.map((destination) => ({ name: destination.name, latitude: destination.latitude ?? "", longitude: destination.longitude ?? "" }))
    : mission.destination
      ? [{ name: mission.destination, latitude: mission.destinationLatitude ?? "", longitude: mission.destinationLongitude ?? "" }]
      : [{ name: "", latitude: "", longitude: "" }],
  client: mission.client ?? "",
  purpose: mission.purpose ?? "",
  orderGiver: mission.orderGiver ?? "",
  companion: mission.companion ?? "",
  vehicleRegistration: mission.vehicleRegistration ?? "",
  transportType: mission.transportType ?? "",
  departureDate: mission.departureDate.slice(0, 10),
  returnDate: mission.returnDate.slice(0, 10),
  accommodationRequested: mission.accommodationRequested,
});

export const missionFormToPayload = (values: MissionFormValues): CreateMissionPayload => {
  const payload: CreateMissionPayload = {
    title: values.title.trim(),
    initialApprovalStep: values.initialApprovalStep!,
    location: values.location.trim(),
    departureDate: values.departureDate,
    returnDate: values.returnDate,
    accommodationRequested: values.accommodationRequested,
  };
  payload.destinations = values.destinations
    .filter((destination) => destination.name.trim() || destination.latitude.trim() || destination.longitude.trim())
    .map((destination) => ({
      name: destination.name.trim(),
      ...(destination.latitude.trim() ? { latitude: Number(destination.latitude) } : {}),
      ...(destination.longitude.trim() ? { longitude: Number(destination.longitude) } : {}),
    }));
  const firstDestination = payload.destinations[0];
  if (firstDestination) {
    payload.destination = firstDestination.name;
    payload.destinationLatitude = firstDestination.latitude ?? null;
    payload.destinationLongitude = firstDestination.longitude ?? null;
  } else {
    payload.destination = undefined;
    payload.destinationLatitude = null;
    payload.destinationLongitude = null;
  }
  if (values.beneficiaryId.trim()) payload.beneficiaryId = values.beneficiaryId;
  optionalFields.forEach((field) => {
    const value = values[field];
    if (typeof value === "string" && value.trim()) Object.assign(payload, { [field]: value.trim() });
  });
  return payload;
};

type FieldProps = { name: keyof MissionFormValues; label: string; register: UseFormRegister<MissionFormValues>; error?: string; type?: "text" | "date"; required?: boolean };

function TextField({ name, label, register, error, type = "text", required = false }: FieldProps) {
  return <FormField id={name} label={label} required={required} error={error}><Input id={name} type={type} {...register(name)} aria-invalid={Boolean(error)} /></FormField>;
}

type MissionFormProps = { initialValues?: MissionFormValues; submitLabel: string; submittingLabel: string; apiError: string | null; successMessage: string | null; onSubmit: (payload: CreateMissionPayload) => Promise<void> };

export function MissionForm({ initialValues = emptyMissionFormValues, submitLabel, submittingLabel, apiError, successMessage, onSubmit }: MissionFormProps) {
  const { user } = useSession();
  const isTeamLeader = user?.departmentRole === "CHEF_EQUIPE";
  const [directors, setDirectors] = useState<Array<{ id: string; firstName: string; lastName: string; matricule: string | null }>>([]);
  const [directorsError, setDirectorsError] = useState<string | null>(null);
  const [hasLoadedDirectors, setHasLoadedDirectors] = useState(false);
  const isLoadingDirectors = isTeamLeader && !hasLoadedDirectors;
  const { register, handleSubmit, reset, setValue, getValues, control, setError, formState: { errors, isSubmitting } } = useForm<MissionFormValues>({ resolver: zodResolver(missionFormSchema), defaultValues: isTeamLeader ? { ...initialValues, initialApprovalStep: "DEPARTMENT_DIRECTOR" } : initialValues });
  const { fields: destinationFields, append: appendDestination, remove: removeDestination, move: moveDestination } = useFieldArray({ control, name: "destinations" });
  const destinationValues = useWatch({ control, name: "destinations" });
  const [openDestinationMapId, setOpenDestinationMapId] = useState<string | null>(null);
  useEffect(() => {
    reset(isTeamLeader ? { ...initialValues, initialApprovalStep: "DEPARTMENT_DIRECTOR" } : initialValues);
  }, [initialValues, isTeamLeader, reset]);
  useEffect(() => {
    if (!isTeamLeader) return;
    let active = true;
    void listDepartmentDirectors().then(({ data }) => {
      if (!active) return;
      setDirectors(data);
      if (data.length === 1 && !getValues("beneficiaryId")) setValue("beneficiaryId", data[0].id, { shouldValidate: true });
    }).catch((error: unknown) => {
      if (active) setDirectorsError(error instanceof Error ? error.message : "Impossible de charger les directeurs du département.");
    }).finally(() => {
      if (active) setHasLoadedDirectors(true);
    });
    return () => { active = false; };
  }, [getValues, isTeamLeader, setValue]);
  const submit: SubmitHandler<MissionFormValues> = async (values) => {
    if (isTeamLeader && !values.beneficiaryId) {
      setError("beneficiaryId", { type: "required", message: "Sélectionnez le directeur bénéficiaire." });
      return;
    }
    await onSubmit(missionFormToPayload(values));
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="mt-3 space-y-3" noValidate>
      <Card className="gap-0 rounded-[var(--radius-card)] border-[var(--line)] bg-[var(--surface)] p-0 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-3 border-b border-[var(--line)] px-4 py-3.5">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-strong)]">
            <BriefcaseBusiness className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <CardTitle>Mission</CardTitle>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">Informations générales, validation et déplacement.</p>
          </div>
        </div>
        <div className="space-y-4 p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="md:col-span-2"><TextField name="title" label="Objet de la mission" register={register} error={errors.title?.message} required /></div>
            {isTeamLeader ? (
              <fieldset className="md:col-span-2">
                <legend className="text-sm font-semibold text-[var(--text)]">Bénéficiaire · Directeur de département <span aria-hidden="true">*</span></legend>
                <p className="mt-1 text-xs leading-5 text-[var(--text-soft)]">Cette mission sera créée pour un directeur de votre département. Après votre soumission, le directeur devra l&apos;approuver avant sa transmission à la Direction.</p>
                <FormField id="beneficiaryId" label="Directeur bénéficiaire" required error={errors.beneficiaryId?.message ?? directorsError ?? undefined}>
                  <Select id="beneficiaryId" {...register("beneficiaryId")} aria-invalid={Boolean(errors.beneficiaryId || directorsError)} disabled={isLoadingDirectors || directors.length === 0}>
                    <option value="">{isLoadingDirectors ? "Chargement des directeurs..." : directors.length ? "Sélectionner un directeur" : "Aucun directeur actif disponible"}</option>
                    {directors.map((director) => <option key={director.id} value={director.id}>{director.firstName} {director.lastName}{director.matricule ? ` · ${director.matricule}` : ""}</option>)}
                  </Select>
                </FormField>
              </fieldset>
            ) : (
            <fieldset className="md:col-span-2">
              <legend className="text-sm font-semibold text-[var(--text)]">Premier validateur <span aria-hidden="true">*</span></legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface-alt)] p-3 transition hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]">
                  <input type="radio" value="TEAM_LEADER" {...register("initialApprovalStep")} className="mt-1 h-4 w-4 accent-indigo-600" />
                  <span><span className="block text-sm font-semibold text-[var(--text)]">Chef d&apos;équipe</span><span className="mt-1 block text-xs leading-5 text-[var(--text-muted)]">{user?.team?.name ? `Équipe : ${user.team.name}. La demande ira d'abord à son chef d'équipe.` : "La demande ira d'abord au chef de l'équipe associée à votre profil."}</span></span>
                </label>
                <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface-alt)] p-3 transition hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]">
                  <input type="radio" value="DEPARTMENT_DIRECTOR" {...register("initialApprovalStep")} className="mt-1 h-4 w-4 accent-indigo-600" />
                  <span><span className="block text-sm font-semibold text-[var(--text)]">Directeur de département</span><span className="mt-1 block text-xs leading-5 text-[var(--text-muted)]">La demande ira directement au directeur de votre département.</span></span>
                </label>
              </div>
              {errors.initialApprovalStep?.message && <p className="mt-2 text-xs text-red-600">{errors.initialApprovalStep.message}</p>}
            </fieldset>
            )}
            <TextField name="interventionNumber" label="Numéro d'intervention" register={register} error={errors.interventionNumber?.message} />
            <TextField name="interventionDate" label="Date d'intervention" register={register} error={errors.interventionDate?.message} type="date" />
            <TextField name="location" label="Lieu de la mission" register={register} error={errors.location?.message} required />
            <div className="space-y-3 md:col-span-2">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text)]">Destinations <span className="ml-1 rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-[11px] font-medium text-[var(--text-soft)]">{destinationFields.length}/10</span></h3>
                  <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">Ajoutez les arrêts dans l’ordre du déplacement. Vous pourrez les réordonner et choisir chaque point sur la carte.</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={destinationFields.length >= 10}
                  onClick={() => appendDestination({ name: "", latitude: "", longitude: "" })}
                  leftIcon={<Plus className="h-4 w-4" aria-hidden="true" />}
                >Ajouter une destination</Button>
              </div>

              <div className="space-y-2.5">
                {destinationFields.map((field, index) => {
                  const destination = destinationValues?.[index] ?? field;
                  const destinationError = errors.destinations?.[index];
                  const isMapOpen = openDestinationMapId === field.id;
                  return (
                    <div key={field.id} className="rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface-alt)] p-3">
                      <div className="flex items-start gap-2.5">
                        <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--brand-soft)] text-xs font-bold tabular-nums text-[var(--brand-strong)]">{index + 1}</span>
                        <div className="min-w-0 flex-1">
                          <FormField id={`destinations-${field.id}-name`} label={`Destination ${index + 1}`} error={destinationError?.name?.message}>
                            <Input id={`destinations-${field.id}-name`} {...register(`destinations.${index}.name` as const)} placeholder="Ville, client ou lieu d’intervention" aria-invalid={Boolean(destinationError?.name)} />
                          </FormField>
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[var(--text-muted)]">
                            {destination.latitude && destination.longitude
                              ? <span className="tabular-nums">{Number(destination.latitude).toFixed(5)}, {Number(destination.longitude).toFixed(5)}</span>
                              : <span>Point GPS à choisir sur la carte (facultatif)</span>}
                            {destinationError?.latitude?.message && <span className="text-red-600">{destinationError.latitude.message}</span>}
                            {destinationError?.longitude?.message && <span className="text-red-600">{destinationError.longitude.message}</span>}
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <Button type="button" variant={isMapOpen ? "secondary" : "outline"} size="icon-sm" aria-label={`${isMapOpen ? "Fermer" : "Choisir"} la carte de la destination ${index + 1}`} aria-expanded={isMapOpen} onClick={() => setOpenDestinationMapId(isMapOpen ? null : field.id)}>
                            <MapPinned className="h-4 w-4" aria-hidden="true" />
                          </Button>
                          <Button type="button" variant="ghost" size="icon-sm" aria-label={`Déplacer la destination ${index + 1} vers le haut`} title="Monter" disabled={index === 0} onClick={() => moveDestination(index, index - 1)}><ArrowUp className="h-4 w-4" aria-hidden="true" /></Button>
                          <Button type="button" variant="ghost" size="icon-sm" aria-label={`Déplacer la destination ${index + 1} vers le bas`} title="Descendre" disabled={index === destinationFields.length - 1} onClick={() => moveDestination(index, index + 1)}><ArrowDown className="h-4 w-4" aria-hidden="true" /></Button>
                          <Button type="button" variant="ghost" size="icon-sm" aria-label={`Supprimer la destination ${index + 1}`} title="Supprimer" disabled={destinationFields.length === 1} onClick={() => { removeDestination(index); if (isMapOpen) setOpenDestinationMapId(null); }}><Trash2 className="h-4 w-4 text-slate-500" aria-hidden="true" /></Button>
                        </div>
                      </div>
                      {isMapOpen && (
                        <div className="mt-3 border-t border-[var(--line)] pt-3">
                          <input type="hidden" {...register(`destinations.${index}.latitude` as const)} />
                          <input type="hidden" {...register(`destinations.${index}.longitude` as const)} />
                          <MissionDestinationPicker
                            key={field.id}
                            latitude={destination.latitude}
                            longitude={destination.longitude}
                            placeName={destination.name}
                            title={`Destination ${index + 1}`}
                            description="Recherchez un lieu ou cliquez directement sur la carte."
                            markerLabel="A"
                            error={destinationError?.latitude?.message ?? destinationError?.longitude?.message}
                            onSelect={(latitude, longitude, name) => {
                              setValue(`destinations.${index}.latitude`, latitude === null ? "" : latitude.toFixed(6), { shouldDirty: true, shouldValidate: true });
                              setValue(`destinations.${index}.longitude`, longitude === null ? "" : longitude.toFixed(6), { shouldDirty: true, shouldValidate: true });
                              if (name !== undefined) setValue(`destinations.${index}.name`, name ?? "", { shouldDirty: true, shouldValidate: true });
                            }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {errors.destinations?.message && <p className="text-xs text-red-600">{errors.destinations.message}</p>}
            </div>
            <TextField name="client" label="Client" register={register} error={errors.client?.message} />
            <TextField name="orderGiver" label="Donneur d'ordre" register={register} error={errors.orderGiver?.message} />
            <TextField name="companion" label="Accompagné de" register={register} error={errors.companion?.message} />
            <TextField name="vehicleRegistration" label="Véhicule immatriculé" register={register} error={errors.vehicleRegistration?.message} />
            <TextField name="transportType" label="Transport" register={register} error={errors.transportType?.message} />
            <div className="md:col-span-2">
              <FormField id="purpose" label="Motif" error={errors.purpose?.message}><Textarea id="purpose" rows={4} {...register("purpose")} /></FormField>
            </div>
          </div>
        </div>
      </Card>

      <Card className="gap-0 rounded-[var(--radius-card)] border-[var(--line)] bg-[var(--surface)] p-0 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-3 border-b border-[var(--line)] px-4 py-3.5">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--info-soft)] text-[var(--info)]">
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <CardTitle>Période et hébergement</CardTitle>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">Dates et besoins liés au séjour.</p>
          </div>
        </div>
        <div className="space-y-3 p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <TextField name="departureDate" label="Date de départ" register={register} error={errors.departureDate?.message} type="date" required />
            <TextField name="returnDate" label="Date de retour" register={register} error={errors.returnDate?.message} type="date" required />
          </div>
          <label className="flex items-start gap-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface-alt)] p-3 text-sm text-[var(--text-soft)]">
            <input type="checkbox" {...register("accommodationRequested")} className="mt-0.5 h-4 w-4 accent-indigo-600" />
            <span>
              <strong className="block font-semibold text-[var(--text)]">Hébergement demandé</strong>
              <span className="mt-1 block text-xs leading-5 text-[var(--text-muted)]">Cette demande sera transmise avec la mission. Les ressources d&apos;hébergement seront gérées ultérieurement selon le workflow backend.</span>
            </span>
          </label>
        </div>
      </Card>

      {apiError && <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{apiError}</div>}
      {successMessage && <div role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMessage}</div>}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Link href="/missions" className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">Annuler</Link>
        <Button type="submit" size="sm" disabled={isSubmitting || Boolean(successMessage)}>{isSubmitting ? submittingLabel : submitLabel}</Button>
      </div>
    </form>
  );
}
