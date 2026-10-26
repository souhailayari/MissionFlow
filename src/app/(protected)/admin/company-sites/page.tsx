"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, Building2, MapPin, MapPinned, Pencil, Plus, ToggleLeft, ToggleRight } from "lucide-react";
import { MissionDestinationPicker } from "@/components/missions/mission-destination-picker";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { PageContainer } from "@/components/ui/page-container";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api/client";
import { createAdminCompanySite, listAdminCompanySites, updateAdminCompanySite, updateAdminCompanySiteStatus } from "@/lib/api/admin";
import type { CompanySite, CompanySitePayload } from "@/types/company-site";

type SiteForm = { name: string; address: string; latitude: string; longitude: string };
const emptyForm: SiteForm = { name: "", address: "", latitude: "", longitude: "" };

const parseCoordinate = (value: string, min: number, max: number) => {
  if (!value.trim()) return null;
  const coordinate = Number(value.replace(",", "."));
  return Number.isFinite(coordinate) && coordinate >= min && coordinate <= max ? coordinate : null;
};

const coordinatesLabel = (site: CompanySite) => `${Number(site.latitude).toFixed(6)}, ${Number(site.longitude).toFixed(6)}`;

export default function AdminCompanySitesPage() {
  const [sites, setSites] = useState<CompanySite[]>([]);
  const [editing, setEditing] = useState<CompanySite | null>(null);
  const [form, setForm] = useState<SiteForm>(emptyForm);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [changingSiteId, setChangingSiteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setSites(await listAdminCompanySites());
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : "Impossible de charger les sites de l’entreprise.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const startNewSite = () => {
    setEditing(null);
    setForm(emptyForm);
    setActionError(null);
    setFeedback(null);
    setFormOpen(true);
  };

  const editSite = (site: CompanySite) => {
    setEditing(site);
    setForm({ name: site.name, address: site.address ?? "", latitude: site.latitude, longitude: site.longitude });
    setActionError(null);
    setFeedback(null);
    setFormOpen(true);
    requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setActionError(null);
    setFeedback(null);
    const latitude = parseCoordinate(form.latitude, -90, 90);
    const longitude = parseCoordinate(form.longitude, -180, 180);
    if (!form.name.trim()) {
      setActionError("Donnez un nom à ce site, par exemple « Siège social ».");
      return;
    }
    if (latitude === null || longitude === null) {
      setActionError("Choisissez le point sur la carte ou vérifiez les coordonnées GPS.");
      return;
    }

    const payload: CompanySitePayload = { name: form.name.trim(), address: form.address.trim() || null, latitude, longitude };
    setSubmitting(true);
    try {
      if (editing) await updateAdminCompanySite(editing.id, payload);
      else await createAdminCompanySite(payload);
      setFeedback(editing ? "Le site a été modifié." : "Le site a été ajouté à la carte.");
      setFormOpen(false);
      setEditing(null);
      setForm(emptyForm);
      await load();
    } catch (requestError) {
      setActionError(requestError instanceof ApiError ? requestError.message : "L’enregistrement du site a échoué.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSite = async (site: CompanySite) => {
    setChangingSiteId(site.id);
    setActionError(null);
    setFeedback(null);
    try {
      await updateAdminCompanySiteStatus(site.id, !site.isActive);
      setFeedback(site.isActive ? "Le site a été désactivé. Il ne sera plus proposé pour les nouveaux itinéraires." : "Le site est de nouveau disponible pour la Direction.");
      await load();
    } catch (requestError) {
      setActionError(requestError instanceof ApiError ? requestError.message : "Impossible de modifier le statut du site.");
    } finally {
      setChangingSiteId(null);
    }
  };

  const activeSitesCount = sites.filter((site) => site.isActive).length;

  return (
    <PageContainer className="max-w-7xl">
      <header
        className="relative isolate flex flex-col gap-5 overflow-hidden rounded-[24px] border border-[var(--line)] px-5 py-5 shadow-[var(--shadow-card)] sm:px-7 sm:py-6 lg:flex-row lg:items-center lg:justify-between"
        style={{ background: "linear-gradient(112deg, var(--brand-soft) 0%, var(--surface) 70%, var(--surface) 100%)" }}
      >
        <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-24 h-60 w-60 rounded-full border border-[var(--line)]" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-2 -top-16 h-48 w-48 rounded-full border border-[var(--line)] opacity-70" />
        <div className="relative min-w-0">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)]/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--brand-strong)] shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand)]" aria-hidden="true" />
            Administration · Organisation
          </div>
          <h1 className="text-[30px] font-bold leading-tight tracking-[-0.045em] text-[var(--text)] sm:text-[34px]">Sites de l’entreprise</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[var(--text-soft)]">
            Enregistrez les bureaux et agences sur la carte. La Direction pourra choisir un site comme point de départ d’une mission.
          </p>
        </div>
        <div className="relative flex flex-wrap items-center gap-3 lg:shrink-0">
          <div className="flex min-h-14 min-w-44 items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)]/85 px-4 py-2.5 shadow-sm">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--success-soft)] text-[var(--success)]">
              <MapPinned className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[11px] font-medium text-[var(--text-muted)]">Sites actifs</p>
              <p className="text-lg font-bold leading-6 tabular-nums text-[var(--text)]" aria-live="polite" aria-busy={loading}>
                {loading || error ? <span className="text-[var(--text-muted)]">—</span> : activeSitesCount}
              </p>
            </div>
          </div>
          <Button type="button" size="lg" className="min-h-14" onClick={startNewSite} disabled={loading || Boolean(error)} leftIcon={<Plus className="h-4 w-4" aria-hidden="true" />} rightIcon={<ArrowUpRight className="h-4 w-4" aria-hidden="true" />}>
            Ajouter un site
          </Button>
        </div>
      </header>

      {feedback && <Alert tone="success" className="py-2 text-sm">{feedback}</Alert>}
      {error && <div className="space-y-2"><ErrorState title="Impossible de charger les sites." message={error} /><Button type="button" variant="outline" size="sm" onClick={() => void load()}>Réessayer</Button></div>}
      {actionError && !formOpen && <Alert tone="danger">{actionError}</Alert>}

      {formOpen && (
        <div ref={formRef} className="scroll-mt-6">
          <Card className="space-y-5 rounded-2xl p-4 md:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-strong)]">
                  <MapPinned className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--brand-strong)]">Gestion des sites</p>
                  <CardTitle className="mt-0.5 truncate">{editing ? "Modifier le site" : "Ajouter un site"}</CardTitle>
                </div>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => { setFormOpen(false); setEditing(null); setActionError(null); }}>Annuler</Button>
            </div>

            <form onSubmit={(event) => void save(event)} className="space-y-4">
              <div className="grid items-start gap-5 lg:grid-cols-[minmax(250px,0.72fr)_minmax(0,1.28fr)]">
                <section className="space-y-4 rounded-2xl border border-[var(--line)] bg-[var(--surface-alt)]/70 p-4" aria-labelledby="company-site-details-title">
                  <div className="flex items-start gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface)] text-[var(--brand-strong)] shadow-sm">
                      <Building2 className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--brand-strong)]">Étape 1</p>
                      <h3 id="company-site-details-title" className="mt-0.5 text-sm font-semibold text-[var(--text)]">Informations du site</h3>
                      <p className="mt-0.5 text-xs leading-5 text-[var(--text-muted)]">Indiquez le nom et l’adresse du bureau.</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="block space-y-1.5 text-sm font-medium text-[var(--text-soft)]" htmlFor="company-site-name">Nom du site<Input id="company-site-name" maxLength={120} required value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Siège social" /></label>
                    <label className="block space-y-1.5 text-sm font-medium text-[var(--text-soft)]" htmlFor="company-site-address">Adresse ou repère<Input id="company-site-address" maxLength={250} value={form.address} onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} placeholder="Adresse du bureau (facultatif)" /></label>
                  </div>
                </section>

                <div className="min-w-0 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3 sm:p-4">
                  <MissionDestinationPicker
                    latitude={form.latitude}
                    longitude={form.longitude}
                    placeName={form.address}
                    title="Emplacement du site"
                    description="Recherchez une adresse ou sélectionnez un point sur la carte."
                    eyebrow="Étape 2 · Localisation du site"
                    markerLabel="D"
                    additionalPoints={sites.filter((site) => site.id !== editing?.id).map((site) => ({ id: site.id, latitude: site.latitude, longitude: site.longitude, name: site.name }))}
                    onSelect={(latitude, longitude, address) => setForm((current) => ({
                      ...current,
                      latitude: latitude === null ? "" : latitude.toFixed(6),
                      longitude: longitude === null ? "" : longitude.toFixed(6),
                      ...(address === undefined ? {} : { address: (address ?? "").slice(0, 250) }),
                    }))}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface-alt)] px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${form.latitude && form.longitude ? "bg-[var(--success-soft)] text-[var(--success)]" : "bg-[var(--surface-muted)] text-[var(--text-muted)]"}`}>
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">Point sélectionné</p>
                    <p className="truncate text-xs font-medium tabular-nums text-[var(--text-soft)]" aria-live="polite">
                      {form.latitude && form.longitude ? `${Number(form.latitude).toFixed(6)}, ${Number(form.longitude).toFixed(6)}` : "Choisissez un emplacement sur la carte"}
                    </p>
                  </div>
                </div>
                <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={submitting} isLoading={submitting} leftIcon={<MapPin className="h-4 w-4" aria-hidden="true" />}>
                  {editing ? "Enregistrer les modifications" : "Ajouter sur la carte"}
                </Button>
              </div>
              {actionError && <Alert tone="danger">{actionError}</Alert>}
            </form>
          </Card>
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-card)]" aria-labelledby="company-sites-list-title">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-strong)]">
              <MapPin className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 id="company-sites-list-title" className="truncate text-sm font-semibold text-[var(--text)]">Lieux enregistrés</h2>
              <p className="truncate text-xs text-[var(--text-muted)]">Sites disponibles comme point de départ des missions.</p>
            </div>
          </div>
          {!loading && !error && <span className="shrink-0 rounded-full border border-[var(--line)] bg-[var(--surface-alt)] px-3 py-1.5 text-xs font-medium text-[var(--text-soft)]">{sites.length} site{sites.length > 1 ? "s" : ""} · {activeSitesCount} actif{activeSitesCount > 1 ? "s" : ""}</span>}
        </div>
        <div className="p-3 sm:p-4">
          {loading && <div className="grid gap-3 md:grid-cols-2"><Skeleton className="h-44 rounded-2xl" /><Skeleton className="h-44 rounded-2xl" /></div>}
          {!loading && !error && sites.length === 0 && <EmptyState title="Aucun site enregistré" description="Ajoutez le siège ou une agence pour que la Direction puisse la choisir comme départ." action={<Button type="button" size="sm" onClick={startNewSite} leftIcon={<Plus className="h-3.5 w-3.5" aria-hidden="true" />}>Ajouter un site</Button>} />}
          {!loading && !error && sites.length > 0 && (
            <div className="grid gap-3 md:grid-cols-2">
              {sites.map((site) => (
                <Card key={site.id} className={`group/site rounded-2xl p-4 transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-[var(--shadow-hover)] md:p-5 ${site.isActive ? "" : "bg-[var(--surface-alt)]"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${site.isActive ? "bg-[var(--success-soft)] text-[var(--success)]" : "bg-[var(--surface-muted)] text-[var(--text-muted)]"}`}><MapPin className="h-4 w-4" aria-hidden="true" /></span>
                      <div className="min-w-0"><h3 className="truncate text-sm font-semibold text-[var(--text)]">{site.name}</h3><p className="mt-0.5 line-clamp-2 text-xs leading-5 text-[var(--text-soft)]">{site.address || coordinatesLabel(site)}</p><p className="mt-1 text-[11px] tabular-nums text-[var(--text-muted)]">{coordinatesLabel(site)}</p></div>
                    </div>
                    <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${site.isActive ? "border-[var(--success-soft)] bg-[var(--success-soft)] text-[var(--success)]" : "border-[var(--line)] bg-[var(--surface-muted)] text-[var(--text-muted)]"}`}>{site.isActive ? "Actif" : "Désactivé"}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap justify-end gap-2 border-t border-[var(--line)] pt-3">
                    <Button type="button" variant="outline" size="xs" onClick={() => editSite(site)} leftIcon={<Pencil aria-hidden="true" />}>Modifier</Button>
                    <Button type="button" variant="ghost" size="xs" className={site.isActive ? "text-[var(--text-soft)]" : "text-[var(--success)]"} disabled={changingSiteId === site.id} onClick={() => void toggleSite(site)} leftIcon={site.isActive ? <ToggleRight aria-hidden="true" /> : <ToggleLeft aria-hidden="true" />}>
                      {site.isActive ? "Désactiver" : "Activer"}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </PageContainer>
  );
}
