import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Feature, Polygon } from "geojson";

export type PolygonFilterFeature = Feature<Polygon> | null;

interface FilterState {
  // Array of Home IDs that are within the drawn polygon
  filteredHomeIds: number[] | null; // null means no filter is active
  // The GeoJSON Polygon feature drawn by the user
  polygonFeature: PolygonFilterFeature;
  // Function to set the filtered data
  setFilteredData: (ids: number[], polygon: PolygonFilterFeature) => void;
  // Function to clear the filter
  clearFilter: () => void;
}

// Custom storage to handle potential client/server errors
const customStorage = {
  getItem: (name: string) => {
    if (typeof window !== "undefined") {
      try {
        const item = localStorage.getItem(name);
        return item ? JSON.parse(item) : null;
      } catch (error) {
        console.error("Error reading from localStorage:", error);
        return null;
      }
    }
    return null;
  },
  setItem: (name: string, value: string) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(name, value);
      } catch (error) {
        console.error("Error writing to localStorage:", error);
      }
    }
  },
  removeItem: (name: string) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(name);
      } catch (error) {
        console.error("Error removing from localStorage:", error);
      }
    }
  },
};

export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      filteredHomeIds: null,
      polygonFeature: null,

      setFilteredData: (ids: number[], polygon: PolygonFilterFeature) =>
        set({
          filteredHomeIds: ids.length > 0 ? ids : [],
          polygonFeature: polygon,
        }),

      clearFilter: () => set({ filteredHomeIds: null, polygonFeature: null }),
    }),
    {
      name: "map-filter-storage",
      storage: createJSONStorage(() => customStorage as any),
      // Only persist the necessary state
      partialize: (state) => ({
        polygonFeature: state.polygonFeature,
        filteredHomeIds: state.filteredHomeIds,
      }),
    }
  )
);
