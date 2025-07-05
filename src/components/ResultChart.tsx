"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid
} from "recharts";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SENSOR_CONFIG: Record<string, { label: string, unit: string, colors: string[] }> = {
  temp: { label: "อุณหภูมิ", unit: "°C", colors: ["#ef4444", "#dc2626", "#b91c1c"] },
  humid: { label: "ความชื้น", unit: "%", colors: ["#3b82f6", "#2563eb", "#1d4ed8"] },
  wt: { label: "อุณหภูมิน้ำ", unit: "°C", colors: ["#06b6d4", "#0891b2", "#0e7490"] },
  ph: { label: "pH", unit: "", colors: ["#8b5cf6", "#7c3aed", "#6d28d9"] },
  ec: { label: "EC", unit: "EC", colors: ["#10b981", "#059669", "#047857"] },
  lux: { label: "แสง", unit: "lux", colors: ["#f59e0b", "#d97706", "#b45309"] },
};

interface SensorLog {
  id: number;
  floor: number;
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

// Cache สำหรับเก็บข้อมูล
const dataCache = new Map<string, { data: SensorLog[], timestamp: number }>();
const CACHE_DURATION = 30000; // 30 วินาที

// Custom Tooltip Component
function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{
    color: string;
    name?: string;
    value?: number;
  }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg shadow-lg p-3">
      <p className="font-medium text-white mb-2">{`เวลา: ${label ?? ''}`}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-300">
            {entry.name}: <span className="font-medium text-white">{typeof entry.value === 'number' ? entry.value.toFixed(2) : 'N/A'}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

export default function ResultChart({
  sensorKey = "ph",
  rangeHours = 24,
  height = 400,
  showHeader = true,
  compact = false
}: {
  sensorKey?: keyof Omit<SensorLog, "id" | "floor" | "created_at">;
  rangeHours?: number;
  height?: number;
  showHeader?: boolean;
  compact?: boolean;
}) {
  const [data, setData] = useState<SensorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // สร้าง cache key
  const cacheKey = useMemo(() => `${sensorKey}-${rangeHours}`, [sensorKey, rangeHours]);

  // ฟังก์ชัน fetch ข้อมูล
  const fetchData = useCallback(async () => {
    try {
      setError(null);
      
      // ตรวจสอบ cache ก่อน
      const cached = dataCache.get(cacheKey);
      const now = Date.now();
      
      if (cached && (now - cached.timestamp) < CACHE_DURATION) {
        setData(cached.data);
        setLoading(false);
        return;
      }

      setLoading(true);
      
      const since = new Date(Date.now() - rangeHours * 60 * 60 * 1000).toISOString();
      const { data: logs, error: fetchError } = await supabase
        .from("sensor_logs")
        .select("*")
        .gte("created_at", since)
        .order("created_at", { ascending: true });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      const newData = logs || [];
      
      // เก็บใน cache
      dataCache.set(cacheKey, { data: newData, timestamp: now });
      
      setData(newData);
      setLoading(false);
      
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  }, [cacheKey, rangeHours]);

  useEffect(() => {
    let mounted = true;
    
    const loadData = async () => {
      if (mounted) {
        await fetchData();
      }
    };
    
    loadData();
    
    return () => {
      mounted = false;
    };
  }, [fetchData]);

  // แปลงข้อมูลและจัดกลุ่มตามเวลา
  const chartData = useMemo(() => {
    if (data.length === 0) return [];
    
    const grouped: Record<string, ChartRow> = {};
    
    data.forEach(log => {
      const t = new Date(log.created_at);
      const timeKey = `${t.getHours().toString().padStart(2, "0")}:${t.getMinutes().toString().padStart(2, "0")}`;
      
      if (!grouped[timeKey]) {
        grouped[timeKey] = { time: timeKey, floor1: null, floor2: null, floor3: null };
      }
      
      // ใช้ตัวเลข floor จากฐานข้อมูล
      if (log.floor === 1) {
        grouped[timeKey].floor1 = log[sensorKey] ?? null;
      } else if (log.floor === 2) {
        grouped[timeKey].floor2 = log[sensorKey] ?? null;
      } else if (log.floor === 3) {
        grouped[timeKey].floor3 = log[sensorKey] ?? null;
      }
    });
    
    return Object.values(grouped)
      .sort((a, b) => a.time.localeCompare(b.time))
      .filter(item => item.floor1 !== null || item.floor2 !== null || item.floor3 !== null);
  }, [data, sensorKey]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${compact ? 'bg-transparent' : 'bg-slate-900 rounded-2xl'}`} style={{ height }}>
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          <p className="text-gray-400 text-sm">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center text-red-400 ${compact ? 'bg-transparent' : 'bg-slate-900 rounded-2xl'}`} style={{ height }}>
        <div className="text-center">
          <div className="text-4xl mb-2">⚠️</div>
          <div className="text-white mb-2">เกิดข้อผิดพลาด</div>
          <div className="text-sm">{error}</div>
          <button 
            onClick={fetchData}
            className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className={`flex items-center justify-center text-gray-400 ${compact ? 'bg-transparent' : 'bg-slate-900 rounded-2xl'}`} style={{ height }}>
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <div className="text-white mb-2">ไม่มีข้อมูล</div>
          <div className="text-sm">ช่วง {rangeHours} ชั่วโมงล่าสุด</div>
          <button 
            onClick={fetchData}
            className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            รีเฟรช
          </button>
        </div>
      </div>
    );
  }

  const config = SENSOR_CONFIG[sensorKey as string];

  return (
    <div className={`w-full ${compact ? 'bg-transparent' : 'bg-slate-900 rounded-2xl p-6 border border-slate-700'}`}>
      {/* Conditional Header */}
      {showHeader && (
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h2 className={`${compact ? 'text-lg' : 'text-2xl'} font-bold text-white mb-1`}>
              {config.label}
            </h2>
            <p className="text-sm text-gray-400">
              หน่วย: {config.unit || 'ไม่มีหน่วย'} • ช่วง {rangeHours} ชั่วโมงล่าสุด
            </p>
          </div>
          <button 
            onClick={fetchData}
            className="px-3 py-1 text-xs bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600 transition-colors"
            disabled={loading}
          >
            {loading ? 'กำลังโหลด...' : 'รีเฟรช'}
          </button>
        </div>
      )}

      {/* Chart */}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart 
          data={chartData} 
          margin={{ 
            top: compact ? 10 : 20, 
            right: compact ? 15 : 30, 
            left: compact ? 10 : 20, 
            bottom: compact ? 10 : 20 
          }}
        >
          <defs>
            <linearGradient id={`floor1Gradient-${sensorKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={config.colors[0]} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={config.colors[0]} stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id={`floor2Gradient-${sensorKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={config.colors[1]} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={config.colors[1]} stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id={`floor3Gradient-${sensorKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={config.colors[2]} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={config.colors[2]} stopOpacity={0.1}/>
            </linearGradient>
          </defs>

          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#374151" 
            opacity={0.7}
            horizontal={true}
            vertical={true}
          />

          <XAxis 
            dataKey="time" 
            fontSize={compact ? 10 : 12}
            tick={{ fill: '#9ca3af', fontWeight: 500 }}
            axisLine={{ stroke: '#4b5563' }}
            tickLine={{ stroke: '#4b5563' }}
            minTickGap={compact ? 10 : 20}
          />

          <YAxis 
            fontSize={compact ? 10 : 12}
            tick={{ fill: '#9ca3af', fontWeight: 500 }}
            axisLine={{ stroke: '#4b5563' }}
            tickLine={{ stroke: '#4b5563' }}
            domain={sensorKey === 'ph' ? [0, 8] : ['auto', 'auto']}
            width={compact ? 30 : 40}
          />

          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ fill: '#1e293b', opacity: 0.2 }} 
          />

          {!compact && (
            <Legend 
              wrapperStyle={{ paddingTop: 20 }}
              iconType="circle"
              align="center"
              verticalAlign="top"
            />
          )}

          <Area
            type="monotone"
            dataKey="floor1"
            stroke={config.colors[0]}
            strokeWidth={2}
            fill={`url(#floor1Gradient-${sensorKey})`}
            name="ชั้น 1"
            connectNulls={false}
            dot={compact ? false : { fill: config.colors[0], strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: config.colors[0] }}
          />

          <Area
            type="monotone"
            dataKey="floor2"
            stroke={config.colors[1]}
            strokeWidth={2}
            fill={`url(#floor2Gradient-${sensorKey})`}
            name="ชั้น 2"
            connectNulls={false}
            dot={compact ? false : { fill: config.colors[1], strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: config.colors[1] }}
          />

          <Area
            type="monotone"
            dataKey="floor3"
            stroke={config.colors[2]}
            strokeWidth={2}
            fill={`url(#floor3Gradient-${sensorKey})`}
            name="ชั้น 3"
            connectNulls={false}
            dot={compact ? false : { fill: config.colors[2], strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: config.colors[2] }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Conditional Legend */}
      {!compact && (
        <div className="mt-6 flex justify-center">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: config.colors[0] }}></div>
              <span className="text-gray-300">ชั้น 1</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: config.colors[1] }}></div>
              <span className="text-gray-300">ชั้น 2</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: config.colors[2] }}></div>
              <span className="text-gray-300">ชั้น 3</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
