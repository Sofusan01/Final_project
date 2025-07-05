"use client";
import { useState, useEffect } from "react";
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate a brief loading state to prevent flickering
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const currentSensor = SENSORS.find(s => s.key === sensor);
  const CurrentIcon = currentSensor?.icon || BarChart3;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 p-4 md:p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <span className="text-slate-400 text-lg">Loading results...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-6">
      <div className="w-full max-w-7xl mx-auto space-y-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-slate-800 rounded-xl p-1">
            {VIEW_MODES.map((mode) => {
              const Icon = mode.icon;
              return (
                <button
                  key={mode.key}
                  onClick={() => setViewMode(mode.key)}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${viewMode === mode.key
                      ? "bg-slate-700 text-white shadow-sm"
                      : "text-gray-400 hover:text-white"
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{mode.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sensor Selector */}
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
                      flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                      ${isActive
                        ? "bg-purple-600 text-white"
                        : "bg-slate-800 text-gray-300 hover:bg-slate-700 border border-slate-600"
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{s.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Content */}
        {viewMode === "single" && (
          <SingleView sensor={sensor} currentSensor={currentSensor} CurrentIcon={CurrentIcon} />
        )}

        {viewMode === "grid" && <GridView />}
        {viewMode === "list" && <ListView />}
        {viewMode === "compare" && <CompareView />}
      </div>
    </div>
  );
}

// Single Chart View
function SingleView({ sensor, currentSensor, CurrentIcon }: SingleViewProps) {
  return (
    <div className="bg-slate-900 rounded-2xl shadow-lg border border-slate-700 overflow-hidden">
      <div className="px-4 md:px-6 py-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-800 rounded-lg">
            <CurrentIcon className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              {currentSensor?.label}
            </h2>
            <p className="text-gray-400 text-sm">
              เปรียบเทียบข้อมูล 3 ชั้น
            </p>
          </div>
        </div>
      </div>
      <div className="p-4 md:p-6">
        <ResultChart sensorKey={sensor} />
      </div>
    </div>
  );
}

// Grid View
function GridView() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {SENSORS.map((sensor) => {
        const Icon = sensor.icon;
        return (
          <div
            key={sensor.key}
            className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden min-h-[300px]"
          >
            <div className="px-4 py-3 border-b border-slate-700 bg-slate-800">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-purple-400" />
                <h3 className="font-medium text-white text-sm truncate">
                  {sensor.label}
                </h3>
              </div>
            </div>
            <div className="p-3">
              <ResultChart 
                sensorKey={sensor.key} 
                height={220}
                showHeader={false}
                compact={true}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// List View
function ListView() {
  return (
    <div className="space-y-4">
      {SENSORS.map((sensor) => {
        const Icon = sensor.icon;
        return (
          <div
            key={sensor.key}
            className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden"
          >
            <div className="px-4 md:px-6 py-4 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-800 rounded-lg">
                  <Icon className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">
                    {sensor.label}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Real-time monitoring
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4">
              <ResultChart 
                sensorKey={sensor.key} 
                height={280}
                showHeader={false}
                compact={false}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Compare View
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
      <div className="bg-slate-800 rounded-xl p-4">
        <h3 className="text-sm font-medium text-white mb-3">
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
                    ? "bg-purple-600 text-white"
                    : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{sensor.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Charts */}
      <div className={`grid gap-4 ${
        selectedSensors.length === 1 ? 'grid-cols-1' :
        selectedSensors.length === 2 ? 'grid-cols-1 lg:grid-cols-2' :
        selectedSensors.length === 3 ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' :
        'grid-cols-1 md:grid-cols-2'
      }`}>
        {selectedSensors.map((sensorKey) => {
          const sensor = SENSORS.find(s => s.key === sensorKey);
          const Icon = sensor?.icon || BarChart3;
          return (
            <div
              key={sensorKey}
              className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden min-h-[320px]"
            >
              <div className="px-4 py-3 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-purple-400" />
                  <h3 className="font-medium text-white">
                    {sensor?.label}
                  </h3>
                </div>
              </div>
              <div className="p-4">
                <ResultChart 
                  sensorKey={sensorKey} 
                  height={240}
                  showHeader={false}
                  compact={true}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
