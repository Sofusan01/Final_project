// /src/app/(dashboard)/setting/page.tsx
"use client";
import { useEffect, useState } from "react";
import { ref, set, onValue } from "firebase/database";
import { db } from "@/lib/firebase";
import {
  Settings, Database, Clock, Save, Loader2, CheckCircle,
  AlertCircle, Activity, Timer
} from "lucide-react";

export default function SettingPage() {
  const [enabled, setEnabled] = useState(false);
  const [interval, setInterval] = useState(10);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  // Page loading state to prevent flickering
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // โหลดค่าปัจจุบันจาก Firebase RTDB
  useEffect(() => {
    const syncRef = ref(db, "setting/sync");
    const unsub = onValue(
      syncRef,
      (snap) => {
        const data = snap.val();
        if (data) {
          setEnabled(data.log_enabled);
          setInterval(data.log_interval_minutes);
        }
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  // Save ค่าใหม่ลง RTDB
  async function save() {
    try {
      setSaving(true);
      setError(null);
      await set(ref(db, "setting/sync"), {
        log_enabled: enabled,
        log_interval_minutes: interval,
        updated_at: new Date().toISOString()
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("เกิดข้อผิดพลาดในการบันทึก");
      }
    }
  }

  if (pageLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6">
        <div className="bg-slate-800 rounded-2xl shadow-lg border border-slate-700 p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
            <span className="ml-3 text-slate-400">Loading settings...</span>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6">
        <div className="bg-slate-800 rounded-2xl shadow-lg border border-slate-700 p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
            <span className="ml-3 text-slate-400">Loading settings...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-800 rounded-2xl shadow-lg border border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-slate-600 p-2 rounded-lg">
            <Settings className="w-6 h-6 text-slate-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              System Settings
            </h1>
            <p className="text-slate-400">
              ตั้งค่าระบบเก็บ Sensor Log
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-300 font-medium">Error</span>
          </div>
          <p className="text-red-300 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {saved && (
        <div className="bg-green-900/30 border border-green-700 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-green-300 font-medium">
              บันทึกเรียบร้อย!
            </span>
          </div>
        </div>
      )}

      {/* Settings Form */}
      <div className="bg-slate-800 rounded-2xl shadow-lg border border-slate-700 p-6 space-y-6">
        {/* Auto Logging Toggle */}
        <div className="flex items-center justify-between p-4 bg-slate-700 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-600 rounded-lg">
              <Database className="w-5 h-5 text-slate-300" />
            </div>
            <div>
              <h3 className="font-semibold text-white">
                เปิดระบบเก็บ Log อัตโนมัติ
              </h3>
              <p className="text-sm text-slate-400">
                เก็บข้อมูลเซ็นเซอร์ลงฐานข้อมูลอัตโนมัติ
              </p>
            </div>
          </div>

          <label className="relative inline-block w-14 h-8 cursor-pointer">
            <input
              type="checkbox"
              checked={enabled}
              onChange={e => setEnabled(e.target.checked)}
              disabled={saving}
              className="sr-only peer"
            />
            <div className={`
              w-14 h-8 rounded-full transition-colors duration-300
              ${enabled
                ? "bg-blue-600"
                : "bg-slate-600"
              }
              ${saving ? "opacity-50 cursor-not-allowed" : ""}
            `}>
              <div className={`
                absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md
                transform transition-transform duration-300
                ${enabled ? "translate-x-6" : "translate-x-0"}
              `} />
            </div>
          </label>
        </div>

        {/* Interval Setting */}
        <div className="p-4 bg-slate-700 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-slate-600 rounded-lg">
              <Timer className="w-5 h-5 text-slate-300" />
            </div>
            <div>
              <h3 className="font-semibold text-white">
                ความถี่ในการเก็บข้อมูล
              </h3>
              <p className="text-sm text-slate-400">
                กำหนดช่วงเวลาในการบันทึกข้อมูลเซ็นเซอร์
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-600 rounded-lg p-3 border border-slate-500">
              <Clock className="w-4 h-4 text-slate-400" />
              <input
                type="number"
                className="bg-transparent border-none outline-none w-16 text-center font-medium text-white"
                value={interval}
                min={1}
                max={120}
                onChange={e => setInterval(Number(e.target.value))}
                disabled={saving}
              />
              <span className="text-slate-400 text-sm">นาที</span>
            </div>

            <div className="text-sm text-slate-400">
              ต่อครั้ง
            </div>
          </div>

          {/* Interval suggestions */}
          <div className="mt-3 flex gap-2">
            {[5, 10, 15, 30, 60].map((minutes) => (
              <button
                key={minutes}
                onClick={() => setInterval(minutes)}
                disabled={saving}
                className={`
                  px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200
                  ${interval === minutes
                    ? "bg-blue-600 text-white"
                    : "bg-slate-600 text-slate-300 hover:bg-slate-500 border border-slate-500"
                  }
                  ${saving ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                {minutes}m
              </button>
            ))}
          </div>
        </div>

        {/* Status Info */}
        <div className="p-4 bg-slate-700 rounded-xl border border-slate-600">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-slate-400" />
            <div>
              <h4 className="font-medium text-white">
                สถานะปัจจุบัน
              </h4>
              <p className="text-sm text-slate-400">
                {enabled
                  ? `เก็บข้อมูลทุก ${interval} นาที`
                  : "ระบบเก็บ Log ปิดอยู่"
                }
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={save}
          disabled={saving}
          className={`
            w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all duration-200
            ${saving
              ? "bg-slate-600 text-slate-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
            }
          `}
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              กำลังบันทึก...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              บันทึกการตั้งค่า
            </>
          )}
        </button>
      </div>
    </div>
  );
}
