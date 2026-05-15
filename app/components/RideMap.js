"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import L from "leaflet";
import { useEffect } from "react";

// ✅ FIX LEAFLET DEFAULT ICONS
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ✅ AUTO FIT MAP TO ROUTE
function FitBounds({ points }) {

  const map = useMap();

  useEffect(() => {

    if (!points || points.length === 0)
      return;

    // ✅ ONLY FIRST TIME
    if (!map._fitDone) {

      map.fitBounds(points, {
        padding: [50, 50],
      });

      map._fitDone = true;
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 300);

  }, [map, points]);

  return null;
}

export default function RideMap({
  driverLat,
  driverLon,
  pickupLat,
  pickupLon,
  dropLat,
  dropLon,
  otpVerified,
}) {

  // ✅ FIX INVALID VALUES
  if (
    driverLat == null ||
    driverLon == null ||
    pickupLat == null ||
    pickupLon == null
  ) {
    return (
      <div className="h-[320px] bg-black rounded-3xl flex items-center justify-center text-white">
        Loading map...
      </div>
    );
  }

  // ✅ CONVERT TO NUMBER
  const dLat = Number(driverLat);
  const dLon = Number(driverLon);

  const pLat = Number(pickupLat);
  const pLon = Number(pickupLon);

  const dropLatNum =
    dropLat != null ? Number(dropLat) : null;

  const dropLonNum =
    dropLon != null ? Number(dropLon) : null;

  // ✅ ROUTE
  const route = otpVerified
    ? [
        [dLat, dLon],
        [dropLatNum, dropLonNum],
      ]
    : [
        [dLat, dLon],
        [pLat, pLon],
      ];

  return (
    <div className="overflow-hidden rounded-3xl h-[320px] w-full">

      <MapContainer
        center={[dLat, dLon]}
        zoom={15}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
      >

        {/* ✅ DARK MAP */}
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* DRIVER */}
        <Marker position={[dLat, dLon]} />

        {/* PICKUP */}
        {!otpVerified && (
          <Marker position={[pLat, pLon]} />
        )}

        {/* DROP */}
        {otpVerified &&
          dropLatNum != null &&
          dropLonNum != null && (
            <Marker
              position={[
                dropLatNum,
                dropLonNum,
              ]}
            />
          )}

        {/* ROUTE LINE */}
        <Polyline
          positions={route}
          pathOptions={{
            color: "#22c55e",
            weight: 6,
          }}
        />

        {/* AUTO FIT */}
        <FitBounds points={route} />

      </MapContainer>

    </div>
  );
}