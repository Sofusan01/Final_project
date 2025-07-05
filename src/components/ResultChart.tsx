// /src/components/ResultChart.tsx
"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid
} from "recharts";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SENSOR_CONFIG: Record<string, { label: string, unit: string, color: string }> = {
  temp: { label: "อุณหภูมิ", unit: "°C", color: "#ef4444" },
  humid: { label: "ความชื้น", unit: "%", color: "#3b82f6" },
  wt: { label: "อุณหภูมิน้ำ", unit: "°C", color: "#06b6d4" },
  ph: { label: "pH", unit: "", color: "#8b5cf6" },
  ec: { label: "EC", unit: "EC", color: "#10b981" },
  lux: { label: "แสง", unit: "lux", color: "#f59e0b" },
};

interface SensorLog {
  id: number;
  floor: string;   // << ใช้ floor แทน tier
  temp?: number;
  humid?: number;
  wt?: number;
  ph?: number;
  ec?: number;
  lux?: number;
  created_at: string;
}

interface ChartRow {
  time: string;
  floor1?: number | null;
  floor2?: number | null;
  floor3?: number | null;
}

export default function ResultChart({
  sensorKey = "ph",  // default: ph
  rangeHours = 24
}: {
  sensorKey?: keyof Omit<SensorLog, "id" | "floor" | "created_at">;
  rangeHours?: number;
}) {
  const [data, setData] = useState<SensorLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const since = new Date(Date.now() - rangeHours * 60 * 60 * 1000).toISOString();
      const { data: logs } = await supabase
        .from("sensor_logs")
        .select("*")
        .gte("created_at", since)
        .order("created_at", { ascending: true });
      setData(logs || []);
      setLoading(false);
    };
    fetchData();
  }, [sensorKey, rangeHours]);

  // แปลงข้อมูลกลุ่มเวลา
  const chartData: ChartRow[] = [];
  if (data.length > 0) {
    const group: Record<string, ChartRow> = {};
    data.forEach(log => {
      // ใช้เวลาแบบชั่วโมง:นาที
      const t = new Date(log.created_at);
      const hhmm = `${t.getHours().toString().padStart(2, "0")}:${t.getMinutes().toString().padStart(2, "0")}`;
      if (!group[hhmm]) group[hhmm] = { time: hhmm };
      // map เข้า floor
      if (["floor1", "floor2", "floor3"].includes(log.floor)) {
        group[hhmm][log.floor as "floor1" | "floor2" | "floor3"] = log[sensorKey] ?? null;
      }
    });
    Object.values(group).forEach(row => chartData.push(row));
  }

  if (loading) return <div className="h-72 flex items-center justify-center text-gray-500">Loading...</div>;
  if (chartData.length === 0) return <div className="h-72 flex items-center justify-center text-gray-400">No data</div>;

  const config = SENSOR_CONFIG[sensorKey as string];

  return (
    <div>
      <h2 className="font-semibold text-lg mb-2">{config.label} ({config.unit})</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" fontSize={12} />
          <YAxis fontSize={12} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="floor1" stroke="#2563eb" name="ชั้น 1" dot={false} />
          <Line type="monotone" dataKey="floor2" stroke="#22c55e" name="ชั้น 2" dot={false} />
          <Line type="monotone" dataKey="floor3" stroke="#eab308" name="ชั้น 3" dot={false} />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-2 text-xs text-gray-500">ช่วง {rangeHours} ชั่วโมงล่าสุด</div>
    </div>
  );
}
