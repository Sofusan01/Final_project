// src/app/(dashboard)/console/page.tsx
"use client";
import RelayConsole from "@/components/RelayConsole";

export default function ConsolePage() {
  return (
    <div className="w-full">
      {/* Mobile: Stack vertically, Desktop: Horizontal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        <RelayConsole floor="floor1" />
        <RelayConsole floor="floor2" />
        <RelayConsole floor="floor3" />
      </div>
    </div>
  );
}
