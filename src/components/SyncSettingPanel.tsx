import { useEffect, useState } from "react";
import { ref, set, onValue } from "firebase/database";
import { db } from "@/lib/firebase"; // import db จาก config firebase

export default function SyncSettingPanel() {
  const [enabled, setEnabled] = useState(false);
  const [interval, setInterval] = useState(10);

  useEffect(() => {
    // Subscribe ค่าจาก RTDB (อัปเดต real-time)
    const syncRef = ref(db, "setting/sync");
    const unsub = onValue(syncRef, (snap) => {
      const data = snap.val();
      if (data) {
        setEnabled(data.log_enabled);
        setInterval(data.log_interval_minutes);
      }
    });
    return () => unsub();
  }, []);

  async function save() {
    // เขียนค่าใหม่กลับไปที่ RTDB
    await set(ref(db, "setting/sync"), {
      log_enabled: enabled,
      log_interval_minutes: interval,
      updated_at: new Date().toISOString()
    });
    alert("บันทึกเรียบร้อย");
  }

  return (
    <div className="p-4 bg-white rounded-xl shadow w-full max-w-md">
      <label className="flex items-center gap-2 mb-4">
        <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} />
        เปิดระบบเก็บ sensor log อัตโนมัติ
      </label>
      <div className="flex items-center gap-2 mb-4">
        <span>ความถี่:</span>
        <input
          type="number"
          className="border p-1 rounded w-20"
          value={interval}
          min={1}
          max={120}
          onChange={e => setInterval(Number(e.target.value))}
        />
        <span>นาที/ครั้ง</span>
      </div>
      <button onClick={save} className="bg-blue-600 text-white px-4 py-2 rounded">บันทึก</button>
    </div>
  );
}
