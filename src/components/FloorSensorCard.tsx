// src/components/FloorSensorCard.tsx
"use client";
import { useEffect, useState } from "react";
import { onValue, ref } from "firebase/database";
import { db } from "@/lib/firebase";
import { Gauge } from '@mui/x-charts/Gauge';
import { Thermometer, Droplets, Waves, FlaskConical, Sun, Zap } from "lucide-react";

const SENSOR_CONFIG: Record<string, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  unit: string;
  color: string;
  min: number;
  max: number;
  optimal?: { min: number; max: number };
  gaugeColor: string;
  gaugeOptimalColor: string;
}> = {
  temp: {
    label: "Temperature",
    icon: Thermometer,
    unit: "°C",
    color: "text-red-600 dark:text-red-300",
    min: 0,
    max: 40,
    optimal: { min: 20, max: 30 },
    gaugeColor: "#ef4444",
    gaugeOptimalColor: "#10b981"
  },
  humid: {
    label: "Humidity",
    icon: Droplets,
    unit: "%",
    color: "text-blue-600 dark:text-blue-300",
    min: 0,
    max: 100,
    optimal: { min: 40, max: 70 },
    gaugeColor: "#3b82f6",
    gaugeOptimalColor: "#06b6d4"
  },
  wt: {
    label: "Water Temperature",
    icon: Waves,
    unit: "°C",
    color: "text-cyan-600 dark:text-cyan-300",
    min: 0,
    max: 40,
    optimal: { min: 18, max: 25 },
    gaugeColor: "#06b6d4",
    gaugeOptimalColor: "#10b981"
  },
  ph: {
    label: "pH Level",
    icon: FlaskConical,
    unit: "",
    color: "text-purple-600 dark:text-purple-300",
    min: 0,
    max: 14,
    optimal: { min: 5.5, max: 7.5 },
    gaugeColor: "#8b5cf6",
    gaugeOptimalColor: "#a855f7"
  },
  lux: {
    label: "Light Intensity",
    icon: Sun,
    unit: "lux",
    color: "text-amber-600 dark:text-amber-300",
    min: 0,
    max: 100000,
    optimal: { min: 0, max: 50000 },
    gaugeColor: "#f59e0b",
    gaugeOptimalColor: "#eab308"
  },
  ec: {
    label: "Conductivity",
    icon: Zap,
    unit: "mS/cm",
    color: "text-emerald-600 dark:text-emerald-300",
    min: 0,
    max: 3000,
    optimal: { min: 0, max: 3000 },
    gaugeColor: "#10b981",
    gaugeOptimalColor: "#059669"
  },
};

function formatValue(value: number, key: string): string {
  if (key === 'lux' && value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  if (typeof value === 'number') {
    return value % 1 === 0 ? value.toString() : value.toFixed(1);
  }
  return String(value);
}

export function FloorSensorCard({ floor }: { floor: string }) {
  const [sensor, setSensor] = useState<Record<string, number | string> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const sensorRef = ref(db, `${floor}/sensor`);
    const unsubscribe = onValue(sensorRef, snap => {
      const val = snap.val() || {};
      Object.keys(val).forEach((k) => {
        if (!val[k] && val[k] !== 0) delete val[k];
      });
      setSensor(val);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [floor]);

  const sensorEntries = sensor ? Object.entries(sensor) : [];
  const hasData = sensorEntries.length > 0;

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-900 dark:to-black p-4 sm:p-6 text-white">
        <div className="flex items-center justify-center">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-wide text-center text-white">
              {floor.toUpperCase()}
            </h3>
            <p className="text-gray-200 dark:text-gray-300 text-sm sm:text-base text-center mt-1">
              Plant Monitoring System
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-800 dark:to-gray-900">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-4 border-blue-600"></div>
            <span className="ml-4 text-gray-800 dark:text-gray-200 text-base sm:text-lg font-bold">Loading...</span>
          </div>
        ) : !hasData ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-700 dark:text-gray-300">
            <span className="text-lg sm:text-xl font-bold">No Data Available</span>
            <span className="text-sm sm:text-base mt-2 font-medium">All sensors are offline</span>
          </div>
        ) : (
          <div className="flex flex-row flex-wrap gap-6 justify-between">
            {sensorEntries.map(([key, value]) => {
              const config = SENSOR_CONFIG[key];
              const numValue = Number(value);

              if (!config) return null;

              const Icon = config.icon;
              const isOptimal = config.optimal &&
                numValue >= config.optimal.min &&
                numValue <= config.optimal.max;

              const gaugeColor = isOptimal ? config.gaugeOptimalColor : config.gaugeColor;

              return (
                <div
                  key={key}
                  className="bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-800/90 dark:to-gray-900/90 backdrop-blur-sm rounded-xl p-3 sm:p-4 border-2 border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 hover:shadow-xl hover:scale-105 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-white/95 dark:hover:bg-gray-800/95 flex-1 min-w-[200px]"
                >
                  {/* Sensor Header */}
                  <div className="flex flex-col items-center text-center mb-3 sm:mb-4 space-y-2 min-h-[80px] sm:min-h-[90px] px-1">
                    <div className={`p-2 sm:p-3 rounded-xl bg-gradient-to-br from-white to-gray-100 dark:from-gray-700 dark:to-gray-800 shadow-lg border border-gray-200 dark:border-gray-600 ${config.color} flex-shrink-0`}>
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 drop-shadow-sm" />
                    </div>

                    {/* Sensor Name */}
                    <h4 className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm leading-tight min-h-[28px] sm:min-h-[32px] flex items-center justify-center text-center px-1 max-w-full">
                      <span className="truncate">
                        {config.label}
                      </span>
                    </h4>

                    {/* Value and Unit */}
                    <div className="flex items-baseline justify-center gap-1 max-w-full overflow-hidden">
                      <span className={`text-base sm:text-lg lg:text-xl font-bold ${config.color} truncate max-w-[80px] sm:max-w-[100px]`}>
                        {formatValue(numValue, key)}
                      </span>
                      {config.unit && (
                        <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 flex-shrink-0">
                          {config.unit}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* MUI Gauge */}
                  <div className="h-24 sm:h-28 lg:h-32 flex items-end justify-center">
                    <Gauge
                      value={numValue}
                      valueMin={config.min}
                      valueMax={config.max}
                      startAngle={-90}
                      endAngle={90}
                      innerRadius="70%"
                      outerRadius="100%"
                      text=""
                      sx={{
                        [`& .MuiGauge-valueArc`]: {
                          fill: gaugeColor,
                          strokeWidth: 8,
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                        },
                        [`& .MuiGauge-referenceArc`]: {
                          fill: '#e5e7eb',
                          strokeWidth: 8,
                        },
                      }}
                      width={window.innerWidth < 640 ? 100 : window.innerWidth < 1024 ? 120 : 140}
                      height={window.innerWidth < 640 ? 60 : window.innerWidth < 1024 ? 70 : 80}
                    />
                  </div>

                  {/* Status Indicator */}
                  <div className="flex justify-center mt-2">
                    <div
                      className="w-2 h-2 sm:w-3 sm:h-3 rounded-full shadow-sm"
                      style={{ backgroundColor: gaugeColor }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
