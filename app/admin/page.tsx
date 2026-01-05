"use client";

import { Lock, PlayCircle, StopCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState<any>(null);

  // รหัสผ่านเข้าหน้า Admin (ตั้งง่ายๆ ไว้ก่อน เพราะรู้กันคนเดียว)
  const SECRET_PASS = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin1234";

  // ฟังก์ชันเช็คว่าตอนนี้มีใครเล่นอยู่ไหม
  const checkCurrentSession = async () => {
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .gt("end_time", new Date().toISOString()) // หาอันที่ยังไม่หมดเวลา
      .order("end_time", { ascending: false })
      .limit(1);

    if (data && data.length > 0) {
      setCurrentSession(data[0]);
    } else {
      setCurrentSession(null);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isAuthenticated) checkCurrentSession();
  }, [isAuthenticated]);

  // ฟังก์ชันเริ่มงาน (ล็อคคิว)
  const startSession = async (hours: number) => {
    if (!confirm(`ยืนยันจะล็อคคิว ${hours} ชั่วโมง?`)) return;
    setLoading(true);

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + hours * 60 * 60 * 1000); // คำนวณเวลาจบ

    const { error } = await supabase.from("bookings").insert({
      contact: "Customer (via Admin)", // ใส่คร่าวๆ
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      status: "active",
    });

    if (error) alert("Error: " + error.message);
    else {
      alert("✅ ล็อคคิวเรียบร้อย!");
      checkCurrentSession();
    }
    setLoading(false);
  };

  // ฟังก์ชันจบงาน (ปลดล็อคทันที)
  const stopSession = async () => {
    if (!currentSession) return;
    if (!confirm("ยืนยันจะเคลียร์คิว (บังคับจบงาน)?")) return;
    setLoading(true);

    // วิธีแก้คือ ปรับเวลาจบให้เป็น "ตอนนี้" เลย
    const { error } = await supabase
      .from("bookings")
      .update({ end_time: new Date().toISOString(), status: "force_stop" })
      .eq("id", currentSession.id);

    if (error) alert("Error: " + error.message);
    else {
      alert("✅ ปลดล็อคคิวแล้ว");
      checkCurrentSession();
    }
    setLoading(false);
  };

  // --- ส่วน Login ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-zinc-900 p-8 rounded-xl border border-zinc-800 w-full max-w-sm">
          <h1 className="text-xl text-white font-bold mb-4 flex items-center gap-2">
            <Lock className="text-red-500" /> Admin Access
          </h1>
          <input
            type="password"
            placeholder="Enter Password"
            className="w-full bg-zinc-950 border border-zinc-700 p-3 rounded text-white mb-4"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            onClick={() =>
              password === SECRET_PASS
                ? setIsAuthenticated(true)
                : alert("รหัสผิด!")
            }
            className="w-full bg-white text-black font-bold py-3 rounded"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  // --- ส่วน Control Panel ---
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-md mx-auto space-y-8">
        <h1 className="text-2xl font-bold text-zinc-400">Control Panel 🎛️</h1>

        {/* Status Monitor */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-sm text-zinc-500 mb-2">สถานะปัจจุบัน</h2>
          {currentSession ? (
            <div>
              <div className="text-3xl font-bold text-red-500 mb-2">
                BUSY 🔴
              </div>
              <p className="text-zinc-400">
                หมดเวลา:{" "}
                {new Date(currentSession.end_time).toLocaleTimeString("th-TH")}
              </p>
              <button
                onClick={stopSession}
                disabled={loading}
                className="mt-4 w-full bg-red-500/10 text-red-500 border border-red-500/50 py-2 rounded flex items-center justify-center gap-2 hover:bg-red-500/20"
              >
                <StopCircle size={18} /> เคลียร์คิว (Force Stop)
              </button>
            </div>
          ) : (
            <div>
              <div className="text-3xl font-bold text-green-500 mb-2">
                AVAILABLE 🟢
              </div>
              <p className="text-zinc-400">พร้อมรับลูกค้าใหม่</p>
            </div>
          )}
        </div>

        {/* Actions */}
        {!currentSession && (
          <div className="space-y-3">
            <h2 className="text-sm text-zinc-500">เปิดบิลใหม่ (Add Queue)</h2>
            <div className="grid grid-cols-2 gap-3">
              <QuickButton
                hours={1}
                onClick={() => startSession(1)}
                loading={loading}
              />
              <QuickButton
                hours={2}
                onClick={() => startSession(2)}
                loading={loading}
              />
              <QuickButton
                hours={3}
                onClick={() => startSession(3)}
                loading={loading}
              />
              <QuickButton
                hours={5}
                onClick={() => startSession(5)}
                loading={loading}
              />
              <QuickButton
                hours={7}
                onClick={() => startSession(7)}
                loading={loading}
              />
              <QuickButton
                hours={24}
                label="1 วัน"
                onClick={() => startSession(24)}
                loading={loading}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ปุ่มกดเลือกเวลา
function QuickButton({ hours, label, onClick, loading }: any) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="bg-zinc-800 hover:bg-zinc-700 text-white py-4 rounded-lg font-medium border border-zinc-700 active:scale-95 transition-all flex flex-col items-center gap-1"
    >
      <PlayCircle size={20} className="text-green-500" />
      {label || `${hours} ชั่วโมง`}
    </button>
  );
}
