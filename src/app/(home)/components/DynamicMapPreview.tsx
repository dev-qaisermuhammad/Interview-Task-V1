"use client";
import dynamic from "next/dynamic";
import React from "react";

interface DynamicMapPreviewProps {
  onClick: () => void;
}

// Dynamically import MapPreview with SSR disabled
const MapPreview = dynamic(() => import("./MapPreview"), {
  ssr: false,
  loading: () => (
    <div
      className="w-[150px] h-[150px] rounded-lg shadow-md border border-gray-200 overflow-hidden bg-gray-100 animate-pulse"
      style={{ minWidth: "150px", minHeight: "150px" }}
    />
  ),
});

export default function DynamicMapPreview(props: DynamicMapPreviewProps) {
  return <MapPreview {...props} />;
}
