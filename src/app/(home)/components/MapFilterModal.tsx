"use client";

import { Home } from "@/types/home";
import { Dialog, Button } from "@radix-ui/themes";
import { X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { point, booleanPointInPolygon } from "@turf/turf";
import { Feature, Polygon } from "geojson";
import { useFilterStore, PolygonFilterFeature } from "@/app/store/filterStore";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
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

interface MapFilterModalProps {
  readonly homes: Home[];
  readonly open: boolean;
  readonly onClose: () => void;
}

// Real 2D Map with OpenStreetMap tiles
const RealMapDrawer = ({
  homes,
  onFilterComplete,
}: {
  readonly homes: Home[];
  readonly onFilterComplete: (
    ids: number[],
    polygon: PolygonFilterFeature
  ) => void;
}) => {
  const [polygon, setPolygon] = useState<[number, number][]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const { clearFilter } = useFilterStore();
  const mapRef = useRef<L.Map>(null);

  // Spatial Filtering Logic using Turf.js
  const applySpatialFilter = (drawnPolygon: Feature<Polygon>): number[] => {
    const idsInPolygon: number[] = [];

    homes.forEach((home) => {
      const pt = point([home.lng, home.lat]);
      if (booleanPointInPolygon(pt, drawnPolygon)) {
        idsInPolygon.push(home.id);
      }
    });

    return idsInPolygon;
  };

  const finishDrawing = () => {
    if (polygon.length >= 3) {
      // Convert from [lat, lng] (Leaflet format) to [lng, lat] (GeoJSON format)
      const geoJsonCoordinates = polygon.map(([lat, lng]) => [lng, lat]);

      const polygonFeature: Feature<Polygon> = {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [[...geoJsonCoordinates, geoJsonCoordinates[0]]], // Close the polygon
        },
        properties: {},
      };

      const ids = applySpatialFilter(polygonFeature);
      onFilterComplete(ids, polygonFeature);
      setIsDrawing(false);
    }
  };

  const clearDrawing = () => {
    setPolygon([]);
    setIsDrawing(false);
    clearFilter();
  };

  const removeLastPoint = () => {
    if (polygon.length > 0) {
      setPolygon((prev) => prev.slice(0, -1));
    }
  };

  return (
    <div className="w-full h-full relative">
      {/* Enhanced Control Panel */}
      <div className="absolute top-2 left-2 z-[1000] flex flex-col gap-1.5">
        <div className="bg-white/95 backdrop-blur-sm p-2 rounded-lg shadow-lg border border-gray-200">
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-semibold text-gray-700">Tools</span>
          </div>

          <div className="flex gap-1.5 flex-wrap">
            <Button
              onClick={() => setIsDrawing(!isDrawing)}
              variant={isDrawing ? "solid" : "outline"}
              color={isDrawing ? "blue" : "gray"}
              size="1"
              className="transition-all duration-200"
            >
              {isDrawing ? "🖊️ Drawing..." : "✏️ Draw"}
            </Button>

            {polygon.length > 0 && (
              <>
                <Button
                  onClick={finishDrawing}
                  variant="solid"
                  color="green"
                  size="1"
                  disabled={polygon.length < 3}
                >
                  ✅ Finish ({polygon.length})
                </Button>

                <Button
                  onClick={removeLastPoint}
                  variant="outline"
                  color="orange"
                  size="1"
                >
                  ↶ Undo
                </Button>
              </>
            )}

            <Button
              onClick={clearDrawing}
              variant="outline"
              color="red"
              size="1"
            >
              🗑️ Clear
            </Button>
          </div>
        </div>

        {/* Status Panel */}
        {polygon.length > 0 && (
          <div className="bg-white/95 backdrop-blur-sm p-2 rounded-lg shadow-lg border border-gray-200">
            <div className="text-xs text-gray-600 mb-1">Selection</div>
            <div className="text-xs font-medium text-gray-800">
              {polygon.length} point{polygon.length !== 1 ? "s" : ""}
            </div>
            {polygon.length < 3 && (
              <div className="text-xs text-orange-600 mt-1">
                Need {3 - polygon.length} more
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Instructions */}
      {isDrawing && (
        <div className="absolute top-2 right-2 z-[1000] bg-blue-500 text-white p-2 rounded-lg shadow-lg max-w-[200px]">
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
            <span className="text-xs font-semibold">Drawing</span>
          </div>
          <div className="text-xs space-y-0.5">
            <div>• Click to add points</div>
            <div>• Need 3+ points</div>
            <div>• Use Undo to remove</div>
          </div>
        </div>
      )}

      {/* Real 2D Map */}
      <MapContainer
        center={[59.9139, 10.7522]} // Oslo coordinates
        zoom={10}
        style={{ height: "100%", width: "100%" }}
        ref={mapRef}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Drawing functionality */}
        <MapClickHandler
          isDrawing={isDrawing}
          onPointAdd={(lat, lng) => setPolygon((prev) => [...prev, [lat, lng]])}
        />

        {/* Display drawn polygon */}
        {polygon.length > 0 && (
          <LeafletPolygon
            positions={polygon}
            pathOptions={{
              color: "#2563eb",
              weight: 3,
              opacity: 0.8,
              fillColor: "#2563eb",
              fillOpacity: 0.2,
            }}
          />
        )}

        {/* Display polygon points */}
        {polygon.map(([lat, lng], index) => (
          <Marker
            key={`point-${lat}-${lng}-${index}`}
            position={[lat, lng]}
            icon={L.divIcon({
              className: "custom-polygon-point",
              html: `
                <div style="
                  width: 20px;
                  height: 20px;
                  background: ${
                    index === polygon.length - 1 && isDrawing
                      ? "#f59e0b"
                      : "#2563eb"
                  };
                  border: 3px solid white;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-weight: bold;
                  font-size: 12px;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                ">
                  ${index + 1}
                </div>
              `,
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            })}
          />
        ))}

        {/* Display home markers */}
        <HomeMarkers homes={homes} />
      </MapContainer>
    </div>
  );
};

// Component to handle map clicks for drawing
const MapClickHandler = ({
  isDrawing,
  onPointAdd,
}: {
  readonly isDrawing: boolean;
  readonly onPointAdd: (lat: number, lng: number) => void;
}) => {
  const map = useMap();

  useEffect(() => {
    if (!isDrawing) return;

    const handleClick = (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      onPointAdd(lat, lng);
    };

    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
    };
  }, [isDrawing, onPointAdd, map]);

  return null;
};

// Home markers for the real map
const HomeMarkers = ({ homes }: { readonly homes: Home[] }) => {
  return (
    <>
      {homes.map((home) => (
        <Marker
          key={home.id}
          position={[home.lat, home.lng]}
          icon={L.divIcon({
            className: "custom-home-marker",
            html: `
              <div style="
                width: 12px;
                height: 12px;
                background: #ef4444;
                border: 2px solid white;
                border-radius: 50%;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                cursor: pointer;
                transition: transform 0.2s ease;
              " title="Home ${home.id}">
              </div>
            `,
            iconSize: [12, 12],
            iconAnchor: [6, 6],
          })}
        />
      ))}
    </>
  );
};

// Enhanced Main Modal Component
export default function MapFilterModal({
  homes,
  open,
  onClose,
}: MapFilterModalProps) {
  const { setFilteredData } = useFilterStore();

  const handleFilterComplete = (
    ids: number[],
    polygon: PolygonFilterFeature
  ) => {
    setFilteredData(ids, polygon);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Content
        className="!p-0 !m-0 !max-w-none !w-screen !h-screen !bg-transparent"
        style={{
          maxWidth: "100vw",
          maxHeight: "100vh",
          width: "100vw",
          height: "100vh",
          padding: 0,
          margin: 0,
          borderRadius: 0,
          backgroundColor: "transparent",
        }}
      >
        {/* Full-screen overlay */}
        <button
          type="button"
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 border-0 p-0 cursor-default"
          onClick={onClose}
          aria-label="Close modal"
        />

        {/* Modal content */}
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl shadow-2xl overflow-hidden w-[800px] h-[600px] max-w-[90vw] max-h-[90vh]">
          {/* Enhanced Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🗺️</span>
                </div>
                <div>
                  <Dialog.Title className="text-lg font-bold text-white">
                    Map Filter
                  </Dialog.Title>
                  <p className="text-blue-100 text-xs mt-1">
                    Draw area to filter homes
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-sm text-blue-100">
                  {homes.length} homes available
                </div>
                <Button
                  onClick={onClose}
                  variant="ghost"
                  color="gray"
                  className="text-white hover:bg-white/20"
                  size="3"
                >
                  <X size={20} />
                </Button>
              </div>
            </div>
          </div>

          {/* Map Container */}
          <div
            className="flex-1 h-full relative"
            style={{ height: "calc(100% - 120px)" }}
          >
            <RealMapDrawer
              homes={homes}
              onFilterComplete={handleFilterComplete}
            />
          </div>

          {/* Enhanced Footer */}
          <div className="bg-gray-50 border-t border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-gray-600">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Homes</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Area</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={onClose}
                  variant="outline"
                  color="gray"
                  size="1"
                >
                  Cancel
                </Button>
                <Button onClick={onClose} variant="solid" color="blue" size="1">
                  Apply Filter
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
