// src/app/(dashboard)/dashboard/page.tsx
import { FloorSensorCard } from "@/components/FloorSensorCard";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <FloorSensorCard floor="floor1" />
      <FloorSensorCard floor="floor2" />
      <FloorSensorCard floor="floor3" />
    </div>
  );
}
