// src/app/(dashboard)/dashboard/page.tsx
import { FloorSensorCard } from "@/components/FloorSensorCard";

export default function DashboardPage() {
  return (
    <div className="w-full">
      {/* Mobile: Stack vertically, Desktop: Horizontal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        <FloorSensorCard floor="floor1" />
        <FloorSensorCard floor="floor2" />
        <FloorSensorCard floor="floor3" />
      </div>
    </div>
  );
}
