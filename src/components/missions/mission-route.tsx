"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState, type FormEvent } from "react";
import { Clock3, Compass, MapPin, Pencil, Route as RouteIcon } from "lucide-react";
import { ApiError } from "@/lib/api/client";
import { calculateMissionRoute } from "@/lib/api/missions";
import { listActiveCompanySites } from "@/lib/api/company-sites";
import { useSession } from "@/lib/auth/session-context";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { CompanySite } from "@/types/company-site";
import type { Mission, MissionDestination, RouteGeometry } from "@/types/missions";
import { MissionRouteMap } from "@/components/missions/mission-route-map";
import { MissionDestinationPicker } from "@/components/missions/mission-destination-picker";

type RouteDestination = { id: string; sequence: number; name: string; latitude: string; longitude: string };

type RouteSummary = {
  departureLatitude: string | null;
  departureLongitude: string | null;
  destinationLatitude: string | null;
  destinationLongitude: string | null;
  destinations: RouteDestination[];
  distanceKm: string | null;
  durationMinutes: number | null;
  calculatedAt: string | null;
  provider: string | null;
  routeGeometry: RouteGeometry | null;
  departureCompanySiteId: string | null;
  departureSiteName: string | null;
};

type ActiveEndpoint = { kind: "departure" } | { kind: "destination"; id: string };

const numberOrNull = (value: string | null): number | null => {
  if (value === null || value.trim() === "") return null;
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
};

const parseCoordinate = (value: string, minimum: number, maximum: number): number | null => {
  const parsed = numberOrNull(value);
  return parsed !== null && parsed >= minimum && parsed <= maximum ? parsed : null;
};

const destinationState = (destinations: MissionDestination[] | undefined, mission: Mission): RouteDestination[] => {
  const stops = destinations?.length
    ? destinations
    : mission.destination
      ? [{ id: "legacy-destination", sequence: 1, name: mission.destination, latitude: mission.destinationLatitude, longitude: mission.destinationLongitude }]
      : [];
  return stops.map((stop, index) => ({
    id: stop.id || `destination-${index + 1}`,
    sequence: index + 1,
    name: stop.name,
    latitude: stop.latitude ?? "",
    longitude: stop.longitude ?? "",
  }));
};

const formatDistance = (value: string | null): string => {
  const distance = numberOrNull(value);
  return distance === null ? "Non renseignée" : `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(distance)} km`;
};

const formatDuration = (minutes: number | null): string => {
  if (minutes === null || !Number.isFinite(minutes)) return "Non renseignée";
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0) return `${minutes} min`;
  if (remainingMinutes === 0) return `${hours} h`;
  return `${hours} h ${remainingMinutes} min`;
};

const formatCoordinates = (latitude: string | null, longitude: string | null): string => {
  if (latitude === null || longitude === null) return "Coordonnées non renseignées";
  return `${Number(latitude).toFixed(5)}, ${Number(longitude).toFixed(5)}`;
};

const formatDateTime = (value: string | null): string => {
  if (!value) return "Non calculé";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Non calculé";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(date);
};

const routeErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError && error.status === 400) {
    return "Aucun itinéraire routier n’a été trouvé. Vérifiez le départ et toutes les destinations.";
  }
  if (error instanceof ApiError) return error.message;
  return "Le calcul de l’itinéraire a échoué. Vérifiez votre connexion et réessayez.";
};

const toRouteDestination = (destination: MissionDestination): RouteDestination => ({
  id: destination.id,
  sequence: destination.sequence,
  name: destination.name,
  latitude: destination.latitude ?? "",
  longitude: destination.longitude ?? "",
});

export function MissionRoute({ mission }: Readonly<{ mission: Mission }>) {
  const { user } = useSession();
  const canCalculate = user?.globalRole === "DIRECTION" && mission.status === "PENDING_DIRECTION";
  const initialDestinations = destinationState(mission.destinations, mission);
  const [route, setRoute] = useState<RouteSummary>(() => ({
    departureLatitude: mission.departureLatitude,
    departureLongitude: mission.departureLongitude,
    destinationLatitude: mission.destinationLatitude,
    destinationLongitude: mission.destinationLongitude,
    destinations: initialDestinations,
    distanceKm: mission.routeDistanceKm,
    durationMinutes: mission.routeDurationMinutes,
    calculatedAt: mission.routeCalculatedAt,
    provider: mission.routeProvider,
    routeGeometry: mission.routeGeometry ?? null,
    departureCompanySiteId: mission.departureCompanySiteId,
    departureSiteName: mission.departureSiteName,
  }));
  const [departureCoordinates, setDepartureCoordinates] = useState({
    latitude: mission.departureLatitude ?? "",
    longitude: mission.departureLongitude ?? "",
  });
  const [destinationStops, setDestinationStops] = useState<RouteDestination[]>(initialDestinations);
  const [activeEndpoint, setActiveEndpoint] = useState<ActiveEndpoint>({ kind: "departure" });
  const [departurePlaceName, setDeparturePlaceName] = useState(mission.departureSiteName ?? mission.location);
  const [departureCompanySiteId, setDepartureCompanySiteId] = useState<string | null>(mission.departureCompanySiteId);
  const [companySites, setCompanySites] = useState<CompanySite[]>([]);
  const [companySitesLoading, setCompanySitesLoading] = useState(false);
  const [companySitesError, setCompanySitesError] = useState(false);
  const [isEditing, setIsEditing] = useState(!mission.routeProvider);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const hasRoute = Boolean(route.provider);
  const fieldPrefix = `route-${mission.id.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
  const activeIndex = activeEndpoint.kind === "destination" ? destinationStops.findIndex((stop) => stop.id === activeEndpoint.id) : -1;
  const activeStop = activeIndex >= 0 ? destinationStops[activeIndex] : null;

  useEffect(() => {
    if (!canCalculate) return;
    let cancelled = false;
    setCompanySitesLoading(true);
    void listActiveCompanySites()
      .then((sites) => {
        if (cancelled) return;
        setCompanySites(sites);
        setCompanySitesError(false);
        if (mission.departureCompanySiteId && !sites.some((site) => site.id === mission.departureCompanySiteId)) setDepartureCompanySiteId(null);
      })
      .catch(() => { if (!cancelled) setCompanySitesError(true); })
      .finally(() => { if (!cancelled) setCompanySitesLoading(false); });
    return () => { cancelled = true; };
  }, [canCalculate, mission.departureCompanySiteId]);

  const calculateRoute = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setFeedback(null);

    const departureLatitude = parseCoordinate(departureCoordinates.latitude, -90, 90);
    const departureLongitude = parseCoordinate(departureCoordinates.longitude, -180, 180);
    const routeStops = destinationStops.map((stop) => ({
      ...stop,
      latitude: parseCoordinate(stop.latitude, -90, 90),
      longitude: parseCoordinate(stop.longitude, -180, 180),
    }));

    if (departureLatitude === null || departureLongitude === null) {
      setError("Choisissez un point de départ valide sur la carte.");
      setActiveEndpoint({ kind: "departure" });
      return;
    }
    if (!routeStops.length) {
      setError("La mission doit contenir au moins une destination.");
      return;
    }
    const invalidStop = routeStops.find((stop) => stop.latitude === null || stop.longitude === null);
    if (invalidStop) {
      setError(`Choisissez le point GPS de « ${invalidStop.name} » sur la carte.`);
      setActiveEndpoint({ kind: "destination", id: invalidStop.id });
      return;
    }
    const points = [{ latitude: departureLatitude, longitude: departureLongitude }, ...routeStops.map((stop) => ({ latitude: stop.latitude!, longitude: stop.longitude! }))];
    if (points.some((point, index) => index > 0 && point.latitude === points[index - 1].latitude && point.longitude === points[index - 1].longitude)) {
      setError("Deux points consécutifs de l’itinéraire sont identiques. Modifiez leur emplacement.");
      return;
    }

    setIsCalculating(true);
    try {
      const response = await calculateMissionRoute({
        missionId: mission.id,
        departureLatitude,
        departureLongitude,
        departureCompanySiteId,
        destinationLatitude: routeStops[0].latitude!,
        destinationLongitude: routeStops[0].longitude!,
        destinations: routeStops.map((stop) => ({ name: stop.name, latitude: stop.latitude!, longitude: stop.longitude! })),
      });
      const savedDestinations = response.data.destinations.map(toRouteDestination);
      const nextRoute: RouteSummary = {
        departureLatitude: response.data.departureLatitude,
        departureLongitude: response.data.departureLongitude,
        destinationLatitude: response.data.destinationLatitude,
        destinationLongitude: response.data.destinationLongitude,
        destinations: savedDestinations,
        distanceKm: response.data.distanceKm,
        durationMinutes: response.data.durationMinutes,
        calculatedAt: response.data.calculatedAt,
        provider: response.data.provider,
        routeGeometry: response.data.routeGeometry,
        departureCompanySiteId: response.data.departureCompanySiteId,
        departureSiteName: response.data.departureSiteName,
      };
      setRoute(nextRoute);
      setDepartureCoordinates({ latitude: nextRoute.departureLatitude ?? "", longitude: nextRoute.departureLongitude ?? "" });
      setDestinationStops(savedDestinations);
      setDepartureCompanySiteId(nextRoute.departureCompanySiteId);
      setDeparturePlaceName(nextRoute.departureSiteName ?? mission.location);
      setIsEditing(false);
      setFeedback("L’itinéraire avec ses destinations a été calculé et enregistré.");
      window.dispatchEvent(new CustomEvent("mission:updated"));
    } catch (requestError) {
      setError(routeErrorMessage(requestError));
    } finally {
      setIsCalculating(false);
    }
  };

  const setStopCoordinates = (stopId: string, latitude: string, longitude: string, name?: string | null) => {
    setDestinationStops((current) => current.map((stop) => stop.id === stopId
      ? { ...stop, latitude, longitude, ...(!stop.name.trim() && name ? { name } : {}) }
      : stop));
  };

  const activeLatitude = activeEndpoint.kind === "departure" ? departureCoordinates.latitude : activeStop?.latitude ?? "";
  const activeLongitude = activeEndpoint.kind === "departure" ? departureCoordinates.longitude : activeStop?.longitude ?? "";
  const activePlaceName = activeEndpoint.kind === "departure" ? departurePlaceName : activeStop?.name ?? "";
  const activeMarkerLabel = activeEndpoint.kind === "departure" ? "D" : "A";
  const mapStops = destinationStops
    .map((stop, index) => ({ stop, index }))
    .filter(({ stop }) => stop.id !== (activeEndpoint.kind === "destination" ? activeEndpoint.id : ""))
    .filter(({ stop }) => stop.latitude && stop.longitude)
    .map(({ stop, index }) => ({ id: stop.id, latitude: stop.latitude, longitude: stop.longitude, name: stop.name, label: String(index + 1) }));
  const displayedDestinations = isEditing ? destinationStops : route.destinations;
  const destinationNames = displayedDestinations.map((stop) => stop.name).filter(Boolean).join(" → ") || mission.destination || "Non renseignée";
  const routeHasCoordinates = Boolean(route.departureLatitude && route.departureLongitude && route.destinations.length && route.destinations.every((stop) => stop.latitude && stop.longitude));

  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <CardTitle className="flex items-center gap-2"><RouteIcon className="h-4 w-4 text-indigo-700" aria-hidden="true" />Itinéraire</CardTitle>
        {canCalculate && hasRoute && !isEditing && (
          <Button type="button" variant="outline" size="xs" onClick={() => { setError(null); setFeedback(null); setIsEditing(true); }} leftIcon={<Pencil aria-hidden="true" />}>
            Modifier
          </Button>
        )}
      </div>

      <div className="mt-2 space-y-4">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center">
          <div className="flex min-w-0 items-start gap-2.5">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-700"><MapPin className="h-3.5 w-3.5" aria-hidden="true" /></span>
            <div className="min-w-0"><p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Départ</p><p className="mt-0.5 truncate text-sm font-semibold text-slate-900" title={route.departureSiteName ?? mission.location}>{route.departureSiteName ?? mission.location}</p><p className="mt-0.5 text-xs text-slate-500">{formatCoordinates(route.departureLatitude, route.departureLongitude)}</p></div>
          </div>
          <div className="hidden items-center gap-1.5 text-slate-300 sm:flex" aria-hidden="true"><span className="h-px w-5 bg-indigo-200" /><RouteIcon className="h-4 w-4 text-indigo-600" /><span className="h-px w-5 bg-indigo-200" /></div>
          <div className="flex min-w-0 items-start gap-2.5">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700"><MapPin className="h-3.5 w-3.5" aria-hidden="true" /></span>
            <div className="min-w-0"><p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{displayedDestinations.length > 1 ? `${displayedDestinations.length} destinations` : "Destination"}</p><p className="mt-0.5 line-clamp-2 text-sm font-semibold text-slate-900" title={destinationNames}>{destinationNames}</p><p className="mt-0.5 text-xs text-slate-500">{formatCoordinates(route.destinationLatitude, route.destinationLongitude)}</p></div>
          </div>
        </div>

        {hasRoute ? (
          <>
            <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3"><dt className="flex items-center gap-1.5 text-xs text-slate-500"><RouteIcon className="h-3.5 w-3.5" aria-hidden="true" />Distance totale</dt><dd className="mt-1 text-base font-semibold tabular-nums text-slate-900">{formatDistance(route.distanceKm)}</dd></div>
              <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3"><dt className="flex items-center gap-1.5 text-xs text-slate-500"><Clock3 className="h-3.5 w-3.5" aria-hidden="true" />Durée estimée</dt><dd className="mt-1 text-base font-semibold tabular-nums text-slate-900">{formatDuration(route.durationMinutes)}</dd></div>
              <div className="col-span-2 rounded-lg border border-slate-200 bg-slate-50/70 p-3 sm:col-span-1"><dt className="flex items-center gap-1.5 text-xs text-slate-500"><Compass className="h-3.5 w-3.5" aria-hidden="true" />Calculé le</dt><dd className="mt-1 text-sm font-medium text-slate-800">{formatDateTime(route.calculatedAt)}</dd></div>
            </dl>
            {routeHasCoordinates && !isEditing && (
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <MissionRouteMap
                  departureLatitude={Number(route.departureLatitude)}
                  departureLongitude={Number(route.departureLongitude)}
                  destinations={route.destinations.map((stop) => ({ name: stop.name, latitude: Number(stop.latitude), longitude: Number(stop.longitude) }))}
                  geometry={route.routeGeometry}
                />
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-600">
                  <span className="inline-flex items-center gap-2"><span className="mission-map-legend-dot mission-map-legend-start" />Départ</span>
                  {route.destinations.map((stop) => <span key={stop.id} className="inline-flex items-center gap-2"><span className="mission-map-legend-dot mission-map-legend-end" />{stop.sequence}. {stop.name}</span>)}
                  {route.routeGeometry && <span className="inline-flex items-center gap-2"><span className="mission-map-legend-line" />Trajet routier OSRM</span>}
                  {!route.routeGeometry && <span className="text-slate-500">Tracé détaillé indisponible pour cet itinéraire.</span>}
                </div>
              </div>
            )}
          </>
        ) : !canCalculate ? (
          <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2.5 text-xs leading-5 text-slate-500">Aucun itinéraire calculé pour cette mission.</p>
        ) : null}

        {canCalculate && isEditing && (
          <form onSubmit={(event) => void calculateRoute(event)} className="space-y-3 border-t border-slate-100 pt-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">Définir le trajet sur la carte</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">Choisissez le départ ou une destination, puis placez chaque point sur la carte. L’ordre des arrêts est respecté pour le calcul.</p>
              <p className="mt-1 text-xs font-medium text-indigo-800">Le trajet inclura {destinationStops.length} destination{destinationStops.length === 1 ? "" : "s"}.</p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2" role="group" aria-label="Point à choisir sur la carte">
              <button type="button" aria-pressed={activeEndpoint.kind === "departure"} onClick={() => setActiveEndpoint({ kind: "departure" })} className={`flex min-w-0 items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition ${activeEndpoint.kind === "departure" ? "border-indigo-300 bg-indigo-50 ring-2 ring-indigo-100" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-700 text-xs font-bold text-white">D</span>
                <span className="min-w-0"><span className="block text-xs font-semibold text-slate-900">Départ</span><span className="mt-0.5 block truncate text-[11px] text-slate-500">{departureCoordinates.latitude && departureCoordinates.longitude ? departurePlaceName || mission.location : "Point à choisir"}</span></span>
              </button>
              {destinationStops.map((stop, index) => {
                const selected = activeEndpoint.kind === "destination" && activeEndpoint.id === stop.id;
                return (
                  <button key={stop.id} type="button" aria-pressed={selected} onClick={() => setActiveEndpoint({ kind: "destination", id: stop.id })} className={`flex min-w-0 items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition ${selected ? "border-violet-300 bg-violet-50 ring-2 ring-violet-100" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-700 text-xs font-bold text-white">{index + 1}</span>
                    <span className="min-w-0"><span className="block text-xs font-semibold text-slate-900">Destination {index + 1}</span><span className="mt-0.5 block truncate text-[11px] text-slate-500">{stop.latitude && stop.longitude ? stop.name : "Point à choisir"}</span></span>
                  </button>
                );
              })}
            </div>

            {activeEndpoint.kind === "departure" && (
              <div className="space-y-1.5 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3">
                <label htmlFor={`${fieldPrefix}-company-site`} className="text-xs font-semibold text-slate-800">Point de départ enregistré</label>
                <select
                  id={`${fieldPrefix}-company-site`}
                  value={departureCompanySiteId ?? ""}
                  disabled={companySitesLoading || companySites.length === 0}
                  onChange={(event) => {
                    const selectedSite = companySites.find((site) => site.id === event.target.value);
                    if (!selectedSite) { setDepartureCompanySiteId(null); return; }
                    setDepartureCompanySiteId(selectedSite.id);
                    setDeparturePlaceName(selectedSite.name);
                    setDepartureCoordinates({ latitude: Number(selectedSite.latitude).toFixed(6), longitude: Number(selectedSite.longitude).toFixed(6) });
                  }}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus-visible:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-600/20 disabled:bg-slate-100"
                >
                  <option value="">Choisir une agence ou un bureau…</option>
                  {companySites.map((site) => <option key={site.id} value={site.id}>{site.name}{site.address ? ` · ${site.address}` : ""}</option>)}
                </select>
                <p className="text-[11px] leading-4 text-slate-500">
                  {companySitesLoading ? "Chargement des sites…" : companySitesError ? "Les sites enregistrés n’ont pas pu être chargés. Vous pouvez toujours choisir le départ sur la carte." : companySites.length ? "Le site choisi sera enregistré comme origine de l’itinéraire." : "Aucun site actif. Vous pouvez définir le départ directement sur la carte."}
                </p>
              </div>
            )}

            <MissionDestinationPicker
              key={activeEndpoint.kind === "departure" ? "departure" : activeEndpoint.id}
              latitude={activeLatitude}
              longitude={activeLongitude}
              placeName={activePlaceName}
              title={activeEndpoint.kind === "departure" ? "Choisir le point de départ" : `Choisir la destination ${activeIndex + 1}`}
              description="Le marqueur actif suit le point sélectionné. Les autres étapes restent visibles sur la carte."
              markerLabel={activeMarkerLabel}
              additionalPoints={mapStops}
              onSelect={(latitude, longitude, placeName) => {
                const nextLatitude = latitude === null ? "" : latitude.toFixed(6);
                const nextLongitude = longitude === null ? "" : longitude.toFixed(6);
                if (activeEndpoint.kind === "departure") {
                  setDepartureCoordinates({ latitude: nextLatitude, longitude: nextLongitude });
                  setDepartureCompanySiteId(null);
                  if (placeName !== undefined) setDeparturePlaceName(placeName ?? "");
                } else {
                  setStopCoordinates(activeEndpoint.id, nextLatitude, nextLongitude, placeName);
                }
              }}
            />

            <details className="rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2">
              <summary className="cursor-pointer text-xs font-semibold text-slate-700">Saisir les coordonnées manuellement</summary>
              <p className="mt-2 text-xs leading-5 text-slate-500">Utilisez un point ou une virgule pour les décimales.</p>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <fieldset className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
                  <legend className="px-1 text-xs font-semibold text-slate-700">Départ · {mission.location}</legend>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="space-y-1 text-[11px] text-slate-500" htmlFor={`${fieldPrefix}-departure-latitude`}>Latitude<Input id={`${fieldPrefix}-departure-latitude`} type="text" inputMode="decimal" maxLength={18} value={departureCoordinates.latitude} onChange={(event) => { setDepartureCompanySiteId(null); setDeparturePlaceName(mission.location); setDepartureCoordinates((current) => ({ ...current, latitude: event.target.value })); }} placeholder="36.8065" /></label>
                    <label className="space-y-1 text-[11px] text-slate-500" htmlFor={`${fieldPrefix}-departure-longitude`}>Longitude<Input id={`${fieldPrefix}-departure-longitude`} type="text" inputMode="decimal" maxLength={18} value={departureCoordinates.longitude} onChange={(event) => { setDepartureCompanySiteId(null); setDeparturePlaceName(mission.location); setDepartureCoordinates((current) => ({ ...current, longitude: event.target.value })); }} placeholder="10.1815" /></label>
                  </div>
                </fieldset>
                {destinationStops.map((stop, index) => (
                  <fieldset key={stop.id} className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
                    <legend className="px-1 text-xs font-semibold text-slate-700">Destination {index + 1} · {stop.name}</legend>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="space-y-1 text-[11px] text-slate-500" htmlFor={`${fieldPrefix}-${stop.id}-latitude`}>Latitude<Input id={`${fieldPrefix}-${stop.id}-latitude`} type="text" inputMode="decimal" maxLength={18} value={stop.latitude} onChange={(event) => setStopCoordinates(stop.id, event.target.value, stop.longitude)} placeholder="36.8000" /></label>
                      <label className="space-y-1 text-[11px] text-slate-500" htmlFor={`${fieldPrefix}-${stop.id}-longitude`}>Longitude<Input id={`${fieldPrefix}-${stop.id}-longitude`} type="text" inputMode="decimal" maxLength={18} value={stop.longitude} onChange={(event) => setStopCoordinates(stop.id, stop.latitude, event.target.value)} placeholder="10.1800" /></label>
                    </div>
                  </fieldset>
                ))}
              </div>
            </details>
            {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
            {feedback && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{feedback}</p>}
            <div className="flex justify-end"><Button type="submit" disabled={isCalculating} isLoading={isCalculating} leftIcon={<RouteIcon aria-hidden="true" />}>Calculer et enregistrer l’itinéraire</Button></div>
          </form>
        )}
      </div>
    </Card>
  );
}
