// src/app/(dashboard)/console/page.tsx
"use client";
import { useState, useEffect } from "react";
import RelayConsole from "@/components/RelayConsole";

export default function ConsolePage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate a brief loading state to prevent flickering
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="text-slate-600">Loading console...</span>
        </div>
      </div>
    );
  }

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
