"use client";

import { useEffect, useState } from "react";
import { useFilterStore } from "@/app/store/filterStore";
import {
  MapContainer,
  TileLayer,
  Polygon as LeafletPolygon,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons for Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapPreviewProps {
  readonly onClick: () => void;
}

export default function MapPreview({ onClick }: MapPreviewProps) {
  const { polygonFeature } = useFilterStore();
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  // Convert GeoJSON polygon to Leaflet format
  const getPolygonCoordinates = () => {
    if (!polygonFeature?.geometry) return [];

    // Convert from [lng, lat] (GeoJSON) to [lat, lng] (Leaflet)
    const coordinates = polygonFeature.geometry.coordinates[0].map(
      ([lng, lat]) => [lat, lng] as [number, number]
    );

    return coordinates;
  };

  if (!isClient) {
    return (
      <div
        className="relative w-[120px] h-[120px] rounded-lg shadow-md border border-gray-200 overflow-hidden bg-gray-100 animate-pulse"
        style={{ minWidth: "120px", minHeight: "120px" }}
      />
    );
  }

  return (
    <button
      id="mini-map-container"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className="relative w-[120px] h-[120px] rounded-lg shadow-md border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:scale-105"
      style={{ minWidth: "120px", minHeight: "120px" }}
      type="button"
    >
      {/* Real Map Preview */}
      <div className="w-full h-full relative">
        <MapContainer
          center={[59.9139, 10.7522]} // Oslo coordinates
          zoom={10}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
          attributionControl={false}
          dragging={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          touchZoom={false}
          className="pointer-events-none"
        >
          <TileLayer
            attribution=""
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Show selected polygon if filter is active */}
          {polygonFeature && (
            <LeafletPolygon
              positions={getPolygonCoordinates()}
              pathOptions={{
                color: "#dc2626",
                weight: 4,
                opacity: 1,
                fillColor: "#dc2626",
                fillOpacity: 0.5,
              }}
            />
          )}
        </MapContainer>

        {/* Overlay with filter status */}
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
          {polygonFeature ? (
            <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
              ✓ Filter Active
            </div>
          ) : (
            <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
              🗺️ Map
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
