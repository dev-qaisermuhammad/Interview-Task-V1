"use client";
import dynamic from "next/dynamic";
import { Home } from "@/types/home";
import { Dialog, Box, Flex, Button } from "@radix-ui/themes";
import { X, Trash2 } from "lucide-react";

// Dynamically import MapFilterModal with SSR disabled
const MapFilterModal = dynamic(() => import("../components/MapFilterModal"), {
  // This is the crucial line: it ensures the component only renders client-side.
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full bg-white">
      Loading Map...
    </div>
  ),
});

interface DynamicMapModalProps {
  homes: Home[];
  open: boolean;
  onClose: () => void;
}

export default function DynamicMapModal(props: DynamicMapModalProps) {
  // We just pass the props down to the dynamically loaded component
  return <MapFilterModal {...props} />;
}
