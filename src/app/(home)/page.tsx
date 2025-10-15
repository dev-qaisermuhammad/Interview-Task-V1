"use client";

import { Home } from "@/types/home";
import HomeTable from "./components/HomeTable";
// NOTE: Make sure your path to the JSON file is correct.
import homesData from "@/../public/1000_homes.json";
import DynamicMapModal from "./components/DynamicMapModal";
import { useState, useMemo } from "react";
import DynamicMapPreview from "./components/DynamicMapPreview";
import { useFilterStore } from "../store/filterStore";
import { Button } from "@radix-ui/themes";
import { Filter } from "lucide-react";

export default function Page() {
  const homes = homesData as Home[];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { filteredHomeIds, clearFilter } = useFilterStore();

  // Filter the homes data based on the Zustand store
  const filteredHomes = useMemo(() => {
    if (filteredHomeIds === null) {
      // If null, no filter is active, show all homes
      return homes;
    }
    // If it's an array (even empty), a filter is active
    return homes.filter((home) => filteredHomeIds.includes(home.id));
  }, [homes, filteredHomeIds]);

  return (
    <div className="max-w-7xl h-[90vh] mx-auto py-6">
      <h1 className="mb-4 text-3xl font-bold text-gray-900">
        Expert Frontend Interview Task
      </h1>

      <div className="w-full h-[calc(100%-40px)] flex flex-col">
        {/* Top bar with map preview and filter status */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-800">
              Homes Dashboard
            </h2>
            {filteredHomeIds !== null && (
              <div className="mt-2 flex items-center gap-2 text-sm text-blue-600 font-medium">
                <Filter size={16} />
                Map Filter Active: Showing{" "}
                {filteredHomes.length.toLocaleString()} of{" "}
                {homes.length.toLocaleString()} rows. [cite: 37]
                <Button
                  onClick={clearFilter}
                  size="1"
                  variant="outline"
                  color="red"
                  className="ml-4 cursor-pointer"
                >
                  Clear Map Filter
                </Button>
              </div>
            )}
          </div>
          {/* Map Preview Component, opens the modal on click */}
          <DynamicMapPreview onClick={() => setIsModalOpen(true)} />
        </div>

        {/* AG Grid Table */}
        <div className="flex-1 border border-gray-200 rounded-t-lg overflow-hidden shadow-sm">
          <HomeTable homes={filteredHomes} />
        </div>
        <div className="px-4 py-3 bg-gray-50 border border-gray-200 border-t-0 rounded-b-lg text-sm text-gray-600 font-medium">
          Showing {filteredHomes.length.toLocaleString()} rows (Total:{" "}
          {homes.length.toLocaleString()})
        </div>
      </div>

      {/* Map Filter Modal */}
      {isModalOpen && (
        <DynamicMapModal
          homes={homes}
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
