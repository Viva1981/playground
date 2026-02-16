"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import { useMemo } from "react";

type MapPickerProps = {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
  className?: string;
};

const DEFAULT_CENTER: [number, number] = [48.1035, 20.7784];

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

export default function MapPicker({ lat, lng, onChange, className }: MapPickerProps) {
  const hasCoords = typeof lat === "number" && typeof lng === "number";
  const center: [number, number] = hasCoords ? [lat as number, lng as number] : DEFAULT_CENTER;

  const markerIcon = useMemo(
    () =>
      L.divIcon({
        className: "map-pin",
        html:
          '<span style="display:block;width:18px;height:18px;border-radius:999px;border:2px solid #111;background:#fff;box-shadow:0 4px 10px rgba(0,0,0,0.2);"></span>',
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      }),
    []
  );

  return (
    <div className={className}>
      <div className="overflow-hidden rounded-xl border">
        <MapContainer center={center} zoom={15} className="h-64 w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onPick={onChange} />
          {hasCoords && <Marker position={[lat as number, lng as number]} icon={markerIcon} />}
        </MapContainer>
      </div>
      <p className="mt-2 text-xs text-neutral-500">
        Kattints a terkepen a pont valasztasahoz. A marker automatikusan a kivalasztott
        helyre ugrik.
      </p>
    </div>
  );
}
