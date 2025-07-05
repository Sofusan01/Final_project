///src/app/(dashboard)/result/page.tsx
"use client";
import { useState } from "react";
import ResultChart from "@/components/ResultChart";
import {
  Thermometer,
  Droplets,
  Waves,
  FlaskConical,
  Sun,
  Zap,
  BarChart3,
  Grid3X3,
  List,
  Layers
} from "lucide-react";

const SENSORS = [
  { key: "ph", label: "pH", icon: FlaskConical },
  { key: "ec", label: "EC", icon: Zap },
  { key: "temp", label: "อุณหภูมิ", icon: Thermometer },
  { key: "humid", label: "ความชื้น", icon: Droplets },
  { key: "wt", label: "อุณหภูมิน้ำ", icon: Waves },
  { key: "lux", label: "แสง", icon: Sun },
] as const;

const VIEW_MODES = [
  { key: "single", label: "Single", icon: BarChart3 },
  { key: "grid", label: "Grid", icon: Grid3X3 },
  { key: "list", label: "List", icon: List },
  { key: "compare", label: "Compare", icon: Layers },
] as const;

interface SingleViewProps {
  sensor: (typeof SENSORS)[number]["key"];
  currentSensor: (typeof SENSORS)[number] | undefined;
  CurrentIcon: React.ComponentType<{ className?: string }>;
}

export default function ResultPage() {
  const [sensor, setSensor] = useState<(typeof SENSORS)[number]["key"]>("ph");
  const [viewMode, setViewMode] = useState<(typeof VIEW_MODES)[number]["key"]>("single");

  const currentSensor = SENSORS.find(s => s.key === sensor);
  const CurrentIcon = currentSensor?.icon || BarChart3;

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-800 rounded-xl p-1">
          {VIEW_MODES.map((mode) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.key}
                onClick={() => setViewMode(mode.key)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${viewMode === mode.key
                    ? "bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {mode.label}
              </button>
            );
          })}
        </div>

        {/* Sensor Selector (for single view) */}
        {viewMode === "single" && (
          <div className="flex flex-wrap gap-2">
            {SENSORS.map((s) => {
              const Icon = s.icon;
              const isActive = sensor === s.key;
              return (
                <button
                  key={s.key}
                  onClick={() => setSensor(s.key)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive
                      ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                      : "bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-600"
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {s.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Content based on view mode */}
      {viewMode === "single" && (
        <SingleView sensor={sensor} currentSensor={currentSensor} CurrentIcon={CurrentIcon} />
      )}

      {viewMode === "grid" && (
        <GridView />
      )}

      {viewMode === "list" && (
        <ListView />
      )}

      {viewMode === "compare" && (
        <CompareView />
      )}
    </div>
  );
}

// Single Chart View
function SingleView({ sensor, currentSensor, CurrentIcon }: SingleViewProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-50 dark:bg-slate-800 rounded-lg">
            <CurrentIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {currentSensor?.label}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              เปรียบเทียบข้อมูล 3 ชั้น
            </p>
          </div>
        </div>
      </div>
      <div className="p-6">
        <ResultChart sensorKey={sensor} />
      </div>
    </div>
  );
}

// Grid View - All sensors in grid
function GridView() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {SENSORS.map((sensor) => {
        const Icon = sensor.icon;
        return (
          <div
            key={sensor.key}
            className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                  {sensor.label}
                </h3>
              </div>
            </div>
            <div className="p-4">
              <div className="h-48">
                <ResultChart sensorKey={sensor.key} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// List View - Vertical stack
function ListView() {
  return (
    <div className="space-y-6">
      {SENSORS.map((sensor) => {
        const Icon = sensor.icon;
        return (
          <div
            key={sensor.key}
            className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 dark:bg-slate-800 rounded-lg">
                  <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {sensor.label}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Real-time monitoring
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="h-64">
                <ResultChart sensorKey={sensor.key} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Compare View - Side by side comparison
function CompareView() {
  const [selectedSensors, setSelectedSensors] = useState<(typeof SENSORS)[number]["key"][]>(["ph", "temp"]);

  const toggleSensor = (sensorKey: (typeof SENSORS)[number]["key"]) => {
    setSelectedSensors(prev => {
      if (prev.includes(sensorKey)) {
        return prev.filter(s => s !== sensorKey);
      } else if (prev.length < 4) {
        return [...prev, sensorKey];
      }
      return prev;
    });
  };

  return (
    <div className="space-y-6">
      {/* Sensor Selection */}
      <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          เลือกเซ็นเซอร์เพื่อเปรียบเทียบ (สูงสุด 4 อัน)
        </h3>
        <div className="flex flex-wrap gap-2">
          {SENSORS.map((sensor) => {
            const Icon = sensor.icon;
            const isSelected = selectedSensors.includes(sensor.key);
            return (
              <button
                key={sensor.key}
                onClick={() => toggleSensor(sensor.key)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${isSelected
                    ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                    : "bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-600"
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {sensor.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {selectedSensors.map((sensorKey) => {
          const sensor = SENSORS.find(s => s.key === sensorKey);
          const Icon = sensor?.icon || BarChart3;
          return (
            <div
              key={sensorKey}
              className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {sensor?.label}
                  </h3>
                </div>
              </div>
              <div className="p-4">
                <div className="h-56">
                  <ResultChart sensorKey={sensorKey} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
