"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useMemo } from "react";

type MapRestaurant = {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
};

type MapClientProps = {
  headerColor: string;
  headerLogoUrl: string | null;
  restaurants: MapRestaurant[];
};

function isValidCoord(value: number | null) {
  return typeof value === "number" && Number.isFinite(value);
}

export default function MapClient({ headerColor, headerLogoUrl, restaurants }: MapClientProps) {
  const points = useMemo(
    () =>
      restaurants
        .filter((r) => isValidCoord(r.lat) && isValidCoord(r.lng))
        .map((r) => ({ ...r, lat: r.lat as number, lng: r.lng as number })),
    [restaurants]
  );

  if (points.length === 0) {
    return (
      <div className="rounded-2xl border bg-white p-6 text-sm text-neutral-600">
        Nincs megjelenitheto koordinata. Adj meg `lat` es `lng` ertekeket az
        etteremhez.
      </div>
    );
  }

  const bounds = new L.LatLngBounds(points.map((p) => [p.lat, p.lng]));
  const markerIcon = useMemo(
    () =>
      L.divIcon({
        className: "map-pin",
        html: headerLogoUrl
          ? `<span style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:999px;border:2px solid #111;background:#fff;box-shadow:0 4px 10px rgba(0,0,0,0.2);overflow:hidden;"><img src="${headerLogoUrl}" alt="" style="width:20px;height:20px;object-fit:contain;display:block;" /></span>`
          : '<span style="display:block;width:18px;height:18px;border-radius:999px;border:2px solid #111;background:#fff;box-shadow:0 4px 10px rgba(0,0,0,0.2);"></span>',
        iconSize: headerLogoUrl ? [28, 28] : [18, 18],
        iconAnchor: headerLogoUrl ? [14, 14] : [9, 9],
      }),
    [headerLogoUrl]
  );

  return (
    <div className="space-y-4">
      <div
        className="relative overflow-hidden rounded-2xl border shadow-sm"
        style={{ backgroundColor: headerColor }}
      >
        <MapContainer
          bounds={bounds}
          boundsOptions={{ padding: [36, 36] }}
          className="h-[60vh] md:h-[70vh] w-full"
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {points.map((r) => (
            <Marker key={r.id} position={[r.lat, r.lng]} icon={markerIcon}>
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold">{r.name}</div>
                  {r.address && <div className="text-neutral-600">{r.address}</div>}
                  <div className="mt-1 text-xs text-neutral-500">/{r.slug}</div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        <div className="pointer-events-none absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-neutral-700 shadow">
          VisEat Miskolc partnerettermei
        </div>
      </div>
    </div>
  );
}
