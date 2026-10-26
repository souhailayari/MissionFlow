"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap } from "leaflet";
import type { RouteGeometry } from "@/types/missions";

export type RouteMapStop = { name: string; latitude: number; longitude: number };

type MissionRouteMapProps = {
  departureLatitude: number;
  departureLongitude: number;
  destinations: RouteMapStop[];
  geometry: RouteGeometry | null;
};

export function MissionRouteMap({ departureLatitude, departureLongitude, destinations, geometry }: Readonly<MissionRouteMapProps>) {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapKey = JSON.stringify([departureLatitude, departureLongitude, destinations, geometry]);
  const [mapState, setMapState] = useState<{ key: string; status: "ready" | "error" } | null>(null);
  const isReady = mapState?.key === mapKey && mapState.status === "ready";
  const hasError = mapState?.key === mapKey && mapState.status === "error";

  useEffect(() => {
    let cancelled = false;
    let map: LeafletMap | undefined;
    let resizeObserver: ResizeObserver | undefined;
    void import("leaflet").then((leaflet) => {
      const element = mapElement.current;
      if (!element || cancelled) return;

      const departure: [number, number] = [departureLatitude, departureLongitude];
      map = leaflet.map(element, { scrollWheelZoom: false, zoomAnimation: false, markerZoomAnimation: false }).setView(departure, 7);
      leaflet.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      const startIcon = leaflet.divIcon({
        className: "mission-map-marker-icon",
        html: '<span class="mission-map-marker mission-map-marker-start">D</span>',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });
      leaflet.marker(departure, { icon: startIcon, title: "Départ" }).addTo(map).bindTooltip("Départ");

      const boundsPoints: Array<[number, number]> = [departure];
      destinations.forEach((destination, index) => {
        const point: [number, number] = [destination.latitude, destination.longitude];
        const label = String(index + 1);
        const icon = leaflet.divIcon({
          className: "mission-map-marker-icon",
          html: `<span class="mission-map-marker mission-map-marker-${index === destinations.length - 1 ? "end" : "stop"}">${label}</span>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });
        const title = destination.name || `Destination ${label}`;
        leaflet.marker(point, { icon, title }).addTo(map!).bindTooltip(`${label}. ${title}`);
        boundsPoints.push(point);
      });

      if (geometry?.coordinates.length) {
        const routePoints = geometry.coordinates.map(([longitude, latitude]): [number, number] => [latitude, longitude]);
        leaflet.polyline(routePoints, { color: "#4f46e5", weight: 5, opacity: 0.9 }).addTo(map);
        boundsPoints.push(...routePoints);
      }

      if (boundsPoints.every(([latitude, longitude]) => latitude === departure[0] && longitude === departure[1])) {
        map.setView(departure, 14, { animate: false });
      } else {
        map.fitBounds(leaflet.latLngBounds(boundsPoints).pad(0.15), { maxZoom: 15, animate: false });
      }

      resizeObserver = new ResizeObserver(() => {
        if (!cancelled && map) map.invalidateSize();
      });
      resizeObserver.observe(element);
      setMapState({ key: mapKey, status: "ready" });
    }).catch(() => {
      if (!cancelled) setMapState({ key: mapKey, status: "error" });
    });

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      map?.stop();
      map?.remove();
    };
  }, [departureLatitude, departureLongitude, destinations, geometry, mapKey]);

  return (
    <div className="relative h-[320px] w-full bg-slate-100 sm:h-[380px]" role="region" aria-label="Carte de l’itinéraire avec destinations successives">
      <div ref={mapElement} className="h-full w-full" />
      {!isReady && !hasError && <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-sm text-slate-500">Chargement de la carte…</div>}
      {hasError && <div className="absolute inset-0 flex items-center justify-center bg-slate-100 px-6 text-center text-sm text-slate-600">La carte n’a pas pu être chargée. Vérifiez votre connexion puis rechargez la page.</div>}
    </div>
  );
}
