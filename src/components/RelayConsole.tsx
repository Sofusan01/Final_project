// /src/components/RelayConsole.tsx
"use client";
import { useEffect, useState } from "react";
import { ref, onValue, set, update } from "firebase/database";
import { db } from "@/lib/firebase";
import {
  Lightbulb, Fan, Droplets, FlaskConical,
  Settings, Power, CheckCircle,
  AlertCircle, Loader2, Timer, Activity,
  Clock, Plus, Minus, RotateCcw
} from "lucide-react";

type RelayKey = "light" | "fan" | "pump" | "fertA" | "fertB";
type RelayStatus = Record<RelayKey, boolean>;
type RelayTime = {
  [key in RelayKey]?: {
    [period: string]: { start: string; end: string }
  }
};

interface DeviceConfig {
  key: RelayKey;
  name: string;
  periods: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  description: string;
  presets?: { name: string; periods: { start: string; end: string }[] }[];
}

const DEVICES: DeviceConfig[] = [
  {
    key: "light", name: "Light System", periods: 2, icon: Lightbulb,
    color: "text-yellow-600", bgColor: "bg-yellow-50", description: "LED grow lights",
    presets: [
      { name: "Morning & Evening", periods: [{ start: "06:00", end: "12:00" }, { start: "18:00", end: "22:00" }] },
      { name: "Full Day", periods: [{ start: "06:00", end: "18:00" }, { start: "", end: "" }] },
      { name: "Night Only", periods: [{ start: "20:00", end: "23:59" }, { start: "00:00", end: "06:00" }] }
    ]
  },
  {
    key: "fan", name: "Ventilation Fan", periods: 2, icon: Fan,
    color: "text-blue-600", bgColor: "bg-blue-50", description: "Air circulation",
    presets: [
      { name: "Day & Night", periods: [{ start: "08:00", end: "20:00" }, { start: "22:00", end: "06:00" }] },
      { name: "Hot Hours", periods: [{ start: "10:00", end: "16:00" }, { start: "19:00", end: "21:00" }] },
      { name: "Continuous", periods: [{ start: "00:00", end: "23:59" }, { start: "", end: "" }] }
    ]
  },
  {
    key: "pump", name: "Water Pump", periods: 1, icon: Droplets,
    color: "text-cyan-600", bgColor: "bg-cyan-50", description: "Nutrient circulation",
    presets: [
      { name: "Every 4 Hours", periods: [{ start: "06:00", end: "06:15" }] },
      { name: "Morning Only", periods: [{ start: "07:00", end: "07:30" }] },
      { name: "Twice Daily", periods: [{ start: "08:00", end: "08:15" }] }
    ]
  },
  {
    key: "fertA", name: "Fertilizer A", periods: 0, icon: FlaskConical,
    color: "text-green-600", bgColor: "bg-green-50", description: "Primary nutrients"
  },
  {
    key: "fertB", name: "Fertilizer B", periods: 0, icon: FlaskConical,
    color: "text-purple-600", bgColor: "bg-purple-50", description: "Secondary nutrients"
  },
];

// Quick time presets
const QUICK_TIMES = [
  { label: "6 AM", value: "06:00" },
  { label: "8 AM", value: "08:00" },
  { label: "12 PM", value: "12:00" },
  { label: "6 PM", value: "18:00" },
  { label: "8 PM", value: "20:00" },
  { label: "10 PM", value: "22:00" }
];

export default function RelayConsole({
  floor = "floor1",
  className = "",
}: { floor?: string; className?: string }) {
  const [relayMode, setRelayMode] = useState<"auto" | "manual">("manual");
  const [relayStatus, setRelayStatus] = useState<RelayStatus>({
    light: false, fan: false, pump: false, fertA: false, fertB: false
  });
  const [relayTime, setRelayTime] = useState<RelayTime>({});
  const [loading, setLoading] = useState(true);
  const [expandedDevice, setExpandedDevice] = useState<RelayKey | null>(null);

  // โหลดค่าเริ่มต้น
  useEffect(() => {
    const unsub1 = onValue(ref(db, `${floor}/relay_mode`), (snap) => {
      setRelayMode(snap.val() ?? "manual");
    });
    const unsub2 = onValue(ref(db, `${floor}/relay_status`), (snap) => {
      setRelayStatus(snap.val() ?? { light: false, fan: false, pump: false, fertA: false, fertB: false });
    });
    const unsub3 = onValue(ref(db, `${floor}/relay_time`), (snap) => {
      setRelayTime(snap.val() ?? {});
      setLoading(false);
    });
    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, [floor]);

  // Manual Toggle
  const toggleRelay = async (key: RelayKey) => {
    if (relayMode !== "manual") return;

    try {
      const newValue = !relayStatus[key];
      setRelayStatus(prev => ({ ...prev, [key]: newValue }));
      await update(ref(db, `${floor}/relay_status`), { [key]: newValue });
    } catch (error) {
      console.error('Toggle failed:', error);
      const revertValue = relayStatus[key];
      setRelayStatus(prev => ({ ...prev, [key]: revertValue }));
    }
  };

  // เปลี่ยนโหมด
  const handleModeChange = async (mode: "auto" | "manual") => {
    setRelayMode(mode);
    await set(ref(db, `${floor}/relay_mode`), mode);
    if (mode === "manual") {
      await set(ref(db, `${floor}/relay_status`), {
        light: false, fan: false, pump: false, fertA: false, fertB: false
      });
    }
  };

  // อัปเดตช่วงเวลา - ปรับปรุงให้ง่ายขึ้น
  const setPeriod = async (
    key: RelayKey,
    period: string,
    field: "start" | "end",
    value: string
  ) => {
    await update(ref(db, `${floor}/relay_time/${key}/${period}`), { [field]: value });
  };

  // ใช้ preset
  const applyPreset = async (key: RelayKey, preset: { name: string; periods: { start: string; end: string }[] }) => {
    const newTimeData: Record<string, { start: string; end: string }> = {};

    preset.periods.forEach((period, index) => {
      if (period.start || period.end) {
        newTimeData[`period${index + 1}`] = period;
      }
    });
    await set(ref(db, `${floor}/relay_time/${key}`), newTimeData);
  };

  // เพิ่ม/ลด เวลา 30 นาที
  const adjustTime = (timeStr: string, minutes: number): string => {
    if (!timeStr) return "";
    const [hours, mins] = timeStr.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMins = totalMinutes % 60;
    return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
  };

  // ล้างเวลาทั้งหมด
  const clearAllTimes = async (key: RelayKey) => {
    await set(ref(db, `${floor}/relay_time/${key}`), {});
  };

  const activeDevicesCount = Object.values(relayStatus).filter(Boolean).length;

  return (
    <div className={`w-full bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-900 dark:to-black p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            <div>
              <h2 className="text-lg font-bold">Control Console</h2>
              <p className="text-slate-300 text-xs">{floor.toUpperCase()}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-slate-300">
            <Activity className="w-4 h-4" />
            <span className="text-sm">{activeDevicesCount}</span>
          </div>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-600">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleModeChange("manual")}
            className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${relayMode === "manual"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
              }`}
          >
            <div className="flex items-center gap-2">
              <Power className="w-4 h-4" />
              <span>Manual</span>
            </div>
          </button>

          <button
            onClick={() => handleModeChange("auto")}
            className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${relayMode === "auto"
              ? "bg-green-500 text-white"
              : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
              }`}
          >
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4" />
              <span>Auto</span>
            </div>
          </button>
        </div>
      </div>

      {/* Status Info */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-slate-800">
        <div className="flex items-center gap-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${relayMode === "auto" ? "bg-green-500 animate-pulse" : "bg-gray-500"}`} />
          <span className="text-gray-600 dark:text-gray-400">
            {relayMode === "auto"
              ? "ESP32 controlling automatically"
              : "Manual control mode"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-slate-600" />
            <span className="ml-2 text-sm text-gray-500">Loading...</span>
          </div>
        ) : (
          <div className="space-y-3">
            {DEVICES.map(device => {
              const Icon = device.icon;
              const isActive = relayStatus[device.key];
              const isExpanded = expandedDevice === device.key;

              return (
                <div
                  key={device.key}
                  className={`
                    p-3 rounded-lg border transition-all duration-200
                    ${isActive
                      ? "border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-700"
                      : "border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50"
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${device.bgColor} ${device.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                          {device.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {device.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Status */}
                      <div className="flex items-center gap-1">
                        {isActive ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="text-xs font-medium">
                          {isActive ? "ON" : "OFF"}
                        </span>
                      </div>

                      {/* Toggle Switch for Manual Mode */}
                      {relayMode === "manual" && (
                        <label className="relative inline-block w-11 h-6 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isActive}
                            onChange={() => toggleRelay(device.key)}
                            className="sr-only peer"
                            aria-label={`Toggle ${device.name}`}
                          />
                          <div className={`
                            w-11 h-6 rounded-full transition-colors duration-300 ease-in-out
                            peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-opacity-20
                            ${isActive
                              ? "bg-green-500 peer-focus:ring-green-300"
                              : "bg-gray-300 dark:bg-gray-600 peer-focus:ring-gray-300"
                            }
                          `}>
                            <div className={`
                              absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md
                              transform transition-transform duration-300 ease-in-out
                              ${isActive ? "translate-x-5" : "translate-x-0"}
                            `} />
                          </div>
                        </label>
                      )}

                      {/* Expand Button for Auto Mode */}
                      {relayMode === "auto" && device.periods > 0 && (
                        <button
                          onClick={() => setExpandedDevice(isExpanded ? null : device.key)}
                          className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                        >
                          <Clock className="w-4 h-4 text-indigo-600" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Enhanced Schedule Settings */}
                  {relayMode === "auto" && device.periods > 0 && isExpanded && (
                    <div className="mt-4 p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600">
                      {/* Preset Buttons */}
                      {device.presets && (
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <RotateCcw className="w-4 h-4 text-indigo-600" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Presets</span>
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            {device.presets.map((preset, index) => (
                              <button
                                key={index}
                                onClick={() => applyPreset(device.key, preset)}
                                className="p-2 text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors text-left"
                              >
                                <div className="font-medium">{preset.name}</div>
                                <div className="text-indigo-600 dark:text-indigo-400">
                                  {preset.periods.filter(p => p.start || p.end).map(p => `${p.start}-${p.end}`).join(', ')}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Time Controls */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Timer className="w-4 h-4 text-indigo-600" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Schedule Settings</span>
                        </div>
                        <button
                          onClick={() => clearAllTimes(device.key)}
                          className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Clear All
                        </button>
                      </div>

                      <div className="space-y-3">
                        {Array.from({ length: device.periods }, (_, i) => {
                          const periodKey = `period${i + 1}`;
                          const currentPeriod = relayTime?.[device.key]?.[periodKey];

                          return (
                            <div key={i} className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3">
                              <div className="text-xs text-indigo-600 dark:text-indigo-400 mb-2 font-medium">
                                Period {i + 1}
                              </div>

                              {/* Start Time */}
                              <div className="mb-3">
                                <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Start Time</label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="time"
                                    className="text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-500 bg-white dark:bg-slate-600 flex-1 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    value={currentPeriod?.start || ""}
                                    onChange={e => setPeriod(device.key, periodKey, "start", e.target.value)}
                                  />
                                  <button
                                    onClick={() => {
                                      const newTime = adjustTime(currentPeriod?.start || "00:00", -30);
                                      setPeriod(device.key, periodKey, "start", newTime);
                                    }}
                                    className="p-2 bg-gray-200 dark:bg-slate-600 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-500"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      const newTime = adjustTime(currentPeriod?.start || "00:00", 30);
                                      setPeriod(device.key, periodKey, "start", newTime);
                                    }}
                                    className="p-2 bg-gray-200 dark:bg-slate-600 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-500"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>

                                {/* Quick Time Buttons */}
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {QUICK_TIMES.map(time => (
                                    <button
                                      key={time.value}
                                      onClick={() => setPeriod(device.key, periodKey, "start", time.value)}
                                      className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50"
                                    >
                                      {time.label}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* End Time */}
                              <div>
                                <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">End Time</label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="time"
                                    className="text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-500 bg-white dark:bg-slate-600 flex-1 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    value={currentPeriod?.end || ""}
                                    onChange={e => setPeriod(device.key, periodKey, "end", e.target.value)}
                                  />
                                  <button
                                    onClick={() => {
                                      const newTime = adjustTime(currentPeriod?.end || "00:00", -30);
                                      setPeriod(device.key, periodKey, "end", newTime);
                                    }}
                                    className="p-2 bg-gray-200 dark:bg-slate-600 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-500"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      const newTime = adjustTime(currentPeriod?.end || "00:00", 30);
                                      setPeriod(device.key, periodKey, "end", newTime);
                                    }}
                                    className="p-2 bg-gray-200 dark:bg-slate-600 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-500"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>

                                {/* Quick Time Buttons */}
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {QUICK_TIMES.map(time => (
                                    <button
                                      key={time.value}
                                      onClick={() => setPeriod(device.key, periodKey, "end", time.value)}
                                      className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50"
                                    >
                                      {time.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-slate-600">
          <div className="text-center text-xs text-gray-500 dark:text-gray-400">
            {relayMode === "auto"
              ? "ESP32 reads schedule and controls automatically"
              : "Manual real-time control"}
          </div>
        </div>
      </div>
    </div>
  );
}
