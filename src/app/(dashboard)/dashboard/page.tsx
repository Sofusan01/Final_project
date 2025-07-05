// src/app/(dashboard)/dashboard/page.tsx
"use client";
import { useState, useEffect } from "react";
import { FloorSensorCard } from "@/components/FloorSensorCard";

export default function DashboardPage() {
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
          <span className="text-slate-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <FloorSensorCard floor="floor1" />
      <FloorSensorCard floor="floor2" />
      <FloorSensorCard floor="floor3" />
    </div>
  );
}
