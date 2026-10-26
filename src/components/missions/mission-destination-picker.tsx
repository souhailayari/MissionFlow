"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import { LocateFixed, LoaderCircle, MapPin, Minus, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

type MissionDestinationPickerProps = {
  latitude: string;
  longitude: string;
  placeName: string;
  title?: string;
  description?: string;
  eyebrow?: string;
  markerLabel?: "D" | "A";
  otherPoint?: { latitude: string; longitude: string; label: "D" | "A"; name?: string };
  additionalPoints?: Array<{ id: string; latitude: string; longitude: string; name: string; label?: string }>;
  error?: string;
  onSelect: (latitude: number | null, longitude: number | null, destination?: string | null) => void;
};

type NominatimPlace = {
  lat: string;
  lon: string;
  display_name: string;
};

const DEFAULT_CENTER: [number, number] = [36.8065, 10.1815];
const reverseGeocodeCache = new Map<string, string | null>();
const placeSearchCache = new Map<string, NominatimPlace[]>();
let nominatimQueue: Promise<void> = Promise.resolve();
let lastNominatimRequestAt = 0;

async function nominatimRequest<T>(url: string): Promise<T> {
  const request = nominatimQueue.then(async () => {
    const waitMilliseconds = Math.max(0, 1000 - (Date.now() - lastNominatimRequestAt));
    if (waitMilliseconds) await new Promise((resolve) => setTimeout(resolve, waitMilliseconds));
    lastNominatimRequestAt = Date.now();

    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      referrerPolicy: "strict-origin-when-cross-origin",
    });
    if (!response.ok) throw new Error("Impossible de contacter le service de localisation.");
    return await response.json() as T;
  });

  nominatimQueue = request.then(() => undefined, () => undefined);
  return request;
}

function reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
  const cacheKey = `${latitude.toFixed(5)},${longitude.toFixed(5)}`;
  if (reverseGeocodeCache.has(cacheKey)) return Promise.resolve(reverseGeocodeCache.get(cacheKey) ?? null);

  const parameters = new URLSearchParams({
    format: "jsonv2",
    lat: latitude.toString(),
    lon: longitude.toString(),
    zoom: "18",
    addressdetails: "1",
  });
  return nominatimRequest<{ display_name?: unknown }>(`https://nominatim.openstreetmap.org/reverse?${parameters}`).then((result) => {
    const name = typeof result.display_name === "string" && result.display_name.trim() ? result.display_name.trim() : null;
    reverseGeocodeCache.set(cacheKey, name);
    return name;
  });
}

function searchPlaces(query: string): Promise<NominatimPlace[]> {
  const cacheKey = query.trim().toLocaleLowerCase();
  const cached = placeSearchCache.get(cacheKey);
  if (cached) return Promise.resolve(cached);

  const parameters = new URLSearchParams({ format: "jsonv2", q: query, limit: "5", addressdetails: "1" });
  return nominatimRequest<NominatimPlace[]>(`https://nominatim.openstreetmap.org/search?${parameters}`).then((places) => {
    const results = places.filter((place) => place.display_name && Number.isFinite(Number(place.lat)) && Number.isFinite(Number(place.lon)));
    placeSearchCache.set(cacheKey, results);
    return results;
  });
}

export function MissionDestinationPicker({ latitude, longitude, placeName, title = "Choisissez votre point d’arrivée", description = "Recherchez un lieu, utilisez votre position ou cliquez directement sur la carte.", eyebrow = "Point d’itinéraire", markerLabel = "A", otherPoint, additionalPoints, error, onSelect }: Readonly<MissionDestinationPickerProps>) {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const otherMarkerRef = useRef<LeafletMarker | null>(null);
  const additionalMarkersRef = useRef<Map<string, LeafletMarker>>(new Map());
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const onSelectRef = useRef(onSelect);
  const selectPointRef = useRef<(latitude: number, longitude: number) => void>(() => undefined);
  const mountedRef = useRef(true);
  const selectionIdRef = useRef(0);
  const searchIdRef = useRef(0);
  const initialCenter = useRef<[number, number] | null>(latitude.trim() && longitude.trim()
    ? [Number(latitude), Number(longitude)]
    : otherPoint?.latitude.trim() && otherPoint.longitude.trim()
      ? [Number(otherPoint.latitude), Number(otherPoint.longitude)]
      : additionalPoints?.[0]
        ? [Number(additionalPoints[0].latitude), Number(additionalPoints[0].longitude)]
        : null);
  const [isReady, setIsReady] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [lookupStatus, setLookupStatus] = useState<"idle" | "loading" | "resolved" | "coordinates" | "failed">("idle");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<NominatimPlace[]>([]);
  const [searchStatus, setSearchStatus] = useState<"idle" | "loading" | "results" | "empty" | "failed">("idle");
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState(false);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  const selectPoint = useCallback((selectedLatitude: number, selectedLongitude: number) => {
    if (!mountedRef.current) return;
    const selectionId = ++selectionIdRef.current;
    searchIdRef.current += 1;
    setSearchResults([]);
    setSearchStatus("idle");
    setLocationError(false);
    onSelectRef.current(selectedLatitude, selectedLongitude);
    setLookupStatus("loading");

    void reverseGeocode(selectedLatitude, selectedLongitude).then((name) => {
      if (!mountedRef.current || selectionId !== selectionIdRef.current) return;
      onSelectRef.current(selectedLatitude, selectedLongitude, name ?? `${selectedLatitude.toFixed(6)}, ${selectedLongitude.toFixed(6)}`);
      setLookupStatus(name ? "resolved" : "coordinates");
    }).catch(() => {
      if (!mountedRef.current || selectionId !== selectionIdRef.current) return;
      onSelectRef.current(selectedLatitude, selectedLongitude, `${selectedLatitude.toFixed(6)}, ${selectedLongitude.toFixed(6)}`);
      setLookupStatus("failed");
    });
  }, []);
  useEffect(() => {
    selectPointRef.current = selectPoint;
  }, [selectPoint]);

  useEffect(() => {
    mountedRef.current = true;
    let cancelled = false;
    let resizeObserver: ResizeObserver | undefined;
    const additionalMarkers = additionalMarkersRef.current;

    void import("leaflet").then((leaflet) => {
      const element = mapElement.current;
      if (!element || cancelled) return;

      leafletRef.current = leaflet;
      const map = leaflet.map(element, { scrollWheelZoom: false, zoomControl: false, zoomAnimation: false, markerZoomAnimation: false }).setView(initialCenter.current ?? DEFAULT_CENTER, initialCenter.current ? 13 : 6);
      mapRef.current = map;
      leaflet.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);
      map.on("click", (event) => selectPointRef.current(event.latlng.lat, event.latlng.lng));
      resizeObserver = new ResizeObserver(() => {
        if (!cancelled && mapRef.current === map) map.invalidateSize();
      });
      resizeObserver.observe(element);
      setIsReady(true);
    }).catch(() => {
      if (!cancelled) setMapError(true);
    });

    return () => {
      cancelled = true;
      mountedRef.current = false;
      selectionIdRef.current += 1;
      searchIdRef.current += 1;
      resizeObserver?.disconnect();
      markerRef.current?.remove();
      otherMarkerRef.current?.remove();
      additionalMarkers.forEach((marker) => marker.remove());
      additionalMarkers.clear();
      mapRef.current?.stop();
      mapRef.current?.remove();
      markerRef.current = null;
      otherMarkerRef.current = null;
      mapRef.current = null;
      leafletRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const leaflet = leafletRef.current;
    if (!map || !leaflet || !isReady) return;

    const hasCoordinates = latitude.trim() !== "" && longitude.trim() !== "";
    if (!hasCoordinates) {
      markerRef.current?.remove();
      markerRef.current = null;
      if (otherPoint?.latitude.trim() && otherPoint.longitude.trim()) {
        map.setView([Number(otherPoint.latitude), Number(otherPoint.longitude)], Math.max(map.getZoom(), 13), { animate: false });
      }
      return;
    }

    const point: [number, number] = [Number(latitude), Number(longitude)];
    const icon = leaflet.divIcon({
      className: "mission-map-marker-icon",
      html: `<span class="mission-map-marker mission-map-marker-${markerLabel === "D" ? "start" : "end"}">${markerLabel}</span>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
    if (markerRef.current) {
      markerRef.current.setLatLng(point).setIcon(icon).bindTooltip(markerLabel === "D" ? "Départ" : "Destination");
      map.setView(point, Math.max(map.getZoom(), 13), { animate: false });
      return;
    }

    markerRef.current = leaflet.marker(point, { icon, title: markerLabel === "D" ? "Départ" : "Destination" }).addTo(map)
      .bindTooltip(markerLabel === "D" ? "Départ" : "Destination");
    map.setView(point, Math.max(map.getZoom(), 13), { animate: false });
  }, [latitude, longitude, isReady, markerLabel, otherPoint?.latitude, otherPoint?.longitude]);

  useEffect(() => {
    const map = mapRef.current;
    const leaflet = leafletRef.current;
    if (!map || !leaflet || !isReady) return;

    if (!otherPoint?.latitude.trim() || !otherPoint.longitude.trim()) {
      otherMarkerRef.current?.remove();
      otherMarkerRef.current = null;
      return;
    }

    const point: [number, number] = [Number(otherPoint.latitude), Number(otherPoint.longitude)];
    const icon = leaflet.divIcon({
      className: "mission-map-marker-icon",
      html: `<span class="mission-map-marker mission-map-marker-${otherPoint.label === "D" ? "start" : "end"}">${otherPoint.label}</span>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
    const tooltip = otherPoint.name || (otherPoint.label === "D" ? "Départ" : "Destination");
    if (otherMarkerRef.current) {
      otherMarkerRef.current.setLatLng(point).setIcon(icon).bindTooltip(tooltip);
      return;
    }
    otherMarkerRef.current = leaflet.marker(point, { icon, title: tooltip }).addTo(map).bindTooltip(tooltip);
  }, [otherPoint?.latitude, otherPoint?.longitude, otherPoint?.label, otherPoint?.name, isReady]);

  useEffect(() => {
    const leaflet = leafletRef.current;
    const map = mapRef.current;
    if (!leaflet || !map || !isReady) return;

    const points = additionalPoints ?? [];
    const activeIds = new Set(points.map((point) => point.id));
    additionalMarkersRef.current.forEach((marker, id) => {
      if (!activeIds.has(id)) {
        marker.remove();
        additionalMarkersRef.current.delete(id);
      }
    });

    for (const point of points) {
      const coordinates: [number, number] = [Number(point.latitude), Number(point.longitude)];
      if (!coordinates.every(Number.isFinite)) continue;
      const icon = leaflet.divIcon({
        className: "mission-map-marker-icon",
        html: `<span class="mission-map-marker ${point.label ? "mission-map-marker-stop" : "mission-map-marker-site"}">${point.label ?? "S"}</span>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });
      const marker = additionalMarkersRef.current.get(point.id);
      if (marker) marker.setLatLng(coordinates).setIcon(icon).bindTooltip(point.name);
      else additionalMarkersRef.current.set(point.id, leaflet.marker(coordinates, { icon, title: point.name }).addTo(map).bindTooltip(point.name));
    }
  }, [additionalPoints, isReady]);

  const handleSearch = async () => {
    const query = searchQuery.trim();
    const searchId = ++searchIdRef.current;
    if (query.length < 2) {
      setSearchResults([]);
      setSearchStatus("idle");
      return;
    }

    setSearchStatus("loading");
    try {
      const results = await searchPlaces(query);
      if (searchId !== searchIdRef.current) return;
      setSearchResults(results);
      setSearchStatus(results.length ? "results" : "empty");
    } catch {
      if (searchId !== searchIdRef.current) return;
      setSearchResults([]);
      setSearchStatus("failed");
    }
  };

  const chooseSearchResult = (place: NominatimPlace) => {
    const selectedLatitude = Number(place.lat);
    const selectedLongitude = Number(place.lon);
    selectionIdRef.current += 1;
    setLocationError(false);
    mapRef.current?.setView([selectedLatitude, selectedLongitude], 15, { animate: false });
    onSelectRef.current(selectedLatitude, selectedLongitude, place.display_name);
    setLookupStatus("resolved");
    setSearchQuery(place.display_name);
    setSearchResults([]);
    setSearchStatus("idle");
  };

  const locateMe = () => {
    if (!navigator.geolocation) {
      setLocationError(true);
      return;
    }

    setLocationError(false);
    setLocating(true);
    navigator.geolocation.getCurrentPosition((position) => {
      if (!mountedRef.current) return;
      const selectedLatitude = position.coords.latitude;
      const selectedLongitude = position.coords.longitude;
      mapRef.current?.setView([selectedLatitude, selectedLongitude], 15, { animate: false });
      selectPointRef.current(selectedLatitude, selectedLongitude);
      setLocating(false);
    }, () => {
      if (!mountedRef.current) return;
      setLocating(false);
      setLocationError(true);
    }, { enableHighAccuracy: true, timeout: 12000 });
  };

  const hasCoordinates = latitude.trim() !== "" && longitude.trim() !== "";
  const selectedPointLabel = placeName || (hasCoordinates ? `${Number(latitude).toFixed(6)}, ${Number(longitude).toFixed(6)}` : "Cliquez sur la carte ou recherchez un lieu");

  return (
    <section className="space-y-2.5" aria-labelledby="mission-destination-map-title">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-700">{eyebrow}</p>
          <h3 id="mission-destination-map-title" className="mt-0.5 text-base font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
        </div>
        {hasCoordinates && <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Point sélectionné</span>}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="relative h-[360px] w-full bg-slate-100 sm:h-[420px]">
          <div ref={mapElement} className="h-full w-full" role="region" aria-label={`Carte pour ${title.toLocaleLowerCase()}`} />

          <div className="absolute left-3 right-[4.25rem] top-3 z-[1000] sm:w-[min(25rem,calc(100%-6rem))]" role="search">
            <div className="flex h-11 items-center gap-2 rounded-xl border border-white/80 bg-white/95 px-3 shadow-lg shadow-slate-900/10 backdrop-blur">
              <Search className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
              <input
                value={searchQuery}
                onChange={(event) => {
                  searchIdRef.current += 1;
                  setSearchQuery(event.target.value);
                  setSearchResults([]);
                  setSearchStatus("idle");
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void handleSearch();
                  }
                }}
                placeholder="Rechercher une adresse ou une ville"
                aria-label="Rechercher une adresse ou une ville"
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />
              <button type="button" onClick={() => void handleSearch()} disabled={searchStatus === "loading"} aria-label="Lancer la recherche" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-700 text-white transition hover:bg-indigo-800 disabled:opacity-60">
                {searchStatus === "loading" ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Search className="h-4 w-4" aria-hidden="true" />}
              </button>
            </div>
            {(searchStatus === "results" || searchStatus === "empty" || searchStatus === "failed") && (
              <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                {searchStatus === "empty" && <p className="px-3 py-3 text-sm text-slate-500">Aucun lieu trouvé. Essayez une recherche plus précise.</p>}
                {searchStatus === "failed" && <p className="px-3 py-3 text-sm text-red-600">La recherche a échoué. Réessayez dans un instant.</p>}
                {searchResults.map((place) => (
                  <button key={`${place.lat},${place.lon}`} type="button" onClick={() => chooseSearchResult(place)} className="flex w-full items-start gap-2.5 border-b border-slate-100 px-3 py-2.5 text-left last:border-0 hover:bg-indigo-50">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-indigo-700" aria-hidden="true" />
                    <span className="line-clamp-2 text-xs leading-5 text-slate-700">{place.display_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="absolute right-3 top-3 z-[1000] flex flex-col gap-2">
            <Button type="button" variant="secondary" size="icon" aria-label="Utiliser ma position" title="Utiliser ma position" disabled={!isReady || locating} onClick={locateMe} className="h-10 w-10 rounded-xl border border-white/80 bg-white/95 text-slate-700 shadow-lg shadow-slate-900/10 backdrop-blur hover:bg-white">
              {locating ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <LocateFixed className="h-4 w-4" aria-hidden="true" />}
            </Button>
            <div className="overflow-hidden rounded-xl border border-white/80 bg-white/95 shadow-lg shadow-slate-900/10 backdrop-blur">
              <button type="button" aria-label="Zoom avant" title="Zoom avant" disabled={!isReady} onClick={() => mapRef.current?.zoomIn()} className="flex h-9 w-10 items-center justify-center text-slate-700 hover:bg-slate-50 disabled:opacity-50"><Plus className="h-4 w-4" aria-hidden="true" /></button>
              <div className="mx-2 border-t border-slate-200" />
              <button type="button" aria-label="Zoom arrière" title="Zoom arrière" disabled={!isReady} onClick={() => mapRef.current?.zoomOut()} className="flex h-9 w-10 items-center justify-center text-slate-700 hover:bg-slate-50 disabled:opacity-50"><Minus className="h-4 w-4" aria-hidden="true" /></button>
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-7 left-3 z-[900] max-w-[calc(100%-5rem)] sm:max-w-md">
            <div className="flex items-center gap-3 rounded-xl border border-white/80 bg-white/95 px-3 py-2.5 shadow-lg shadow-slate-900/10 backdrop-blur">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700"><MapPin className="h-4 w-4" aria-hidden="true" /></span>
              <span className="min-w-0">
                <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Point sélectionné</span>
                <span className="mt-0.5 line-clamp-2 block text-xs font-medium leading-4 text-slate-800" aria-live="polite">{lookupStatus === "loading" ? "Recherche du nom du lieu…" : selectedPointLabel}</span>
              </span>
            </div>
          </div>

          {!isReady && !mapError && <div className="absolute inset-0 z-[1100] flex items-center justify-center bg-slate-100/90 text-sm text-slate-500">Chargement de la carte…</div>}
          {mapError && <div className="absolute inset-0 z-[1100] flex items-center justify-center bg-slate-100 px-6 text-center text-sm text-slate-600">La carte n’a pas pu être chargée. Vérifiez votre connexion puis rechargez la page.</div>}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-white px-3.5 py-2.5">
          <p className={`text-xs ${error ? "text-red-600" : "text-slate-600"}`} aria-live="polite">
            {error ?? (locationError ? "Position indisponible : autorisez la géolocalisation ou choisissez un point sur la carte." : lookupStatus === "resolved" ? "Emplacement renseigné automatiquement." : lookupStatus === "coordinates" ? "Nom introuvable : les coordonnées ont été ajoutées." : lookupStatus === "failed" ? "Nom indisponible : les coordonnées ont été ajoutées." : hasCoordinates ? `${Number(latitude).toFixed(6)}, ${Number(longitude).toFixed(6)}` : "La carte est prête : cliquez sur le point à choisir.")}
          </p>
          {hasCoordinates && <Button type="button" variant="ghost" size="xs" onClick={() => {
            selectionIdRef.current += 1;
            setLookupStatus("idle");
            onSelect(null, null, null);
          }}>Effacer le point</Button>}
        </div>
      </div>
      <p className="text-xs text-slate-500">Recherche de lieu par <a className="underline underline-offset-2" href="https://nominatim.openstreetmap.org/" target="_blank" rel="noreferrer">Nominatim</a> · Données © OpenStreetMap contributors.</p>
    </section>
  );
}
