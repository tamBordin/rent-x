"use client";

import {
  AlertTriangle,
  Clock,
  Monitor,
  RefreshCcw,
  User,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import BookingModal from "./components/BookingModal";
import { supabase } from "./lib/supabase"; // เรียกใช้ตัวเชื่อมที่เราเพิ่งสร้าง

// --- Interfaces ---
interface StatusState {
  isBusy: boolean;
  nextAvailable: string; // เก็บข้อความเวลาที่จะว่าง (เช่น "14:30 น.")
  loading: boolean; // เอาไว้หมุนๆ ตอนกำลังโหลดข้อมูล
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

interface PriceRowProps {
  hours: string;
  price: string;
  best?: string;
}

export default function Home() {
  // เริ่มต้นมา ให้ loading: true ไว้ก่อน
  const [status, setStatus] = useState<StatusState>({
    isBusy: false,
    nextAvailable: "-",
    loading: true,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  // ฟังก์ชันเช็คสถานะจาก Supabase
  const checkStatus = async () => {
    setStatus((prev) => ({ ...prev, loading: true }));

    try {
      // 1. ถาม Supabase: "ขอรายการจองที่เวลายังไม่หมด (end_time > ตอนนี้)"
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("bookings")
        .select("end_time")
        .gt("end_time", now) // gt = greater than (มากกว่า)
        .order("end_time", { ascending: false }) // เอาคนที่จบช้าสุดมา
        .limit(1);

      if (error) throw error;

      // 2. วิเคราะห์ผลลัพธ์
      if (data && data.length > 0) {
        // เจอคนเล่นอยู่! -> ไม่ว่าง
        const endTime = new Date(data[0].end_time);

        // จัดรูปแบบเวลาให้สวยๆ (เช่น 14:30 น.)
        const timeString =
          endTime.toLocaleTimeString("th-TH", {
            hour: "2-digit",
            minute: "2-digit",
          }) + " น.";

        setStatus({
          isBusy: true,
          nextAvailable: timeString,
          loading: false,
        });
      } else {
        // ไม่เจอใครเลย -> ว่าง
        setStatus({
          isBusy: false,
          nextAvailable: "-",
          loading: false,
        });
      }
    } catch (err) {
      console.error("Error fetching status:", err);
      // ถ้า Error ให้สมมติว่าว่างไว้ก่อน ลูกค้าจะได้ไม่ติดขัด
      setStatus((prev) => ({ ...prev, loading: false }));
    }
  };

  // สั่งให้ทำงานตอนเปิดเว็บครั้งแรก + เฝ้าระวัง Realtime
  useEffect(() => {
    // 1. เช็คสถานะครั้งแรกตอนโหลดหน้าเว็บ
    checkStatus();

    // 2. สร้าง "หูทิพย์" ฟังการเปลี่ยนแปลงจาก Supabase
    const channel = supabase
      .channel("bookings-realtime")
      .on(
        "postgres_changes",
        {
          event: "*", // ฟังทุกอย่าง (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "bookings",
        },
        (payload) => {
          console.log("มีการเปลี่ยนแปลงใน Database!", payload);
          checkStatus(); // ถ้ามีการเปลี่ยนแปลง ให้เช็คสถานะใหม่ทันที
        }
      )
      .subscribe();

    // 3. เมื่อปิดหน้าเว็บ ให้เลิกฟัง (Cleanup)
    return () => {
      supabase.removeChannel(channel);
    };
  }, []); // [] แปลว่าทำครั้งเดียวตอนเปิดเว็บ

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-green-500 selection:text-black">
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Background Effect */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <main className="max-w-md mx-auto min-h-screen flex flex-col p-6">
        {/* Header */}
        <header className="py-8 text-center space-y-2">
          <div
            onClick={checkStatus} // แอบใส่ปุ่ม refresh ตรงนี้ได้
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 cursor-pointer hover:bg-zinc-800 transition-colors"
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  status.isBusy ? "bg-red-400" : "bg-green-400"
                }`}
              ></span>
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  status.isBusy ? "bg-red-500" : "bg-green-500"
                }`}
              ></span>
            </span>
            {status.loading ? "Updating..." : "System Online"}
          </div>
          <h1 className="text-4xl font-bold tracking-tighter bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
            RENT-X
          </h1>
          <p className="text-green-400 text-sm font-medium">
            Ultimate RTX 4080 (Server TH)
          </p>
        </header>

        {/* Status Card (The Brain) */}
        <div
          className={`relative group rounded-2xl p-1 transition-all duration-500 ${
            status.isBusy
              ? "bg-gradient-to-b from-red-500/20 to-zinc-900"
              : "bg-gradient-to-b from-green-500/20 to-zinc-900"
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-current to-transparent opacity-10 blur-xl transition-all duration-500 group-hover:opacity-20" />

          <div className="relative bg-zinc-900/90 backdrop-blur-xl border border-white/5 rounded-xl p-8 text-center overflow-hidden min-h-[200px] flex flex-col justify-center">
            {status.loading ? (
              // Loading State Display
              <div className="flex flex-col items-center gap-3 animate-pulse">
                <RefreshCcw className="animate-spin text-zinc-600" />
                <p className="text-zinc-500 text-sm">กำลังเช็คคิว...</p>
              </div>
            ) : (
              // Active State Display
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                <h2 className="text-zinc-400 text-sm uppercase tracking-widest font-medium">
                  Current Status
                </h2>

                {status.isBusy ? (
                  <>
                    <div className="text-4xl font-bold text-red-500">BUSY</div>
                    <p className="text-zinc-400 text-sm">
                      ติดคิวอยู่... จะว่างตอน{" "}
                      <span className="text-white font-mono bg-zinc-800 px-2 py-1 rounded">
                        {status.nextAvailable}
                      </span>
                    </p>
                    <button
                      disabled
                      className="w-full mt-4 bg-zinc-800 text-zinc-500 py-3 rounded-lg font-medium cursor-not-allowed"
                    >
                      จองล่วงหน้า (เร็วๆ นี้)
                    </button>
                  </>
                ) : (
                  <>
                    <div className="text-4xl font-bold text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]">
                      AVAILABLE
                    </div>
                    <p className="text-zinc-400 text-sm">
                      ว่างครับ! RTX 4080 รอคุณอยู่
                    </p>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="w-full mt-6 bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02] shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                    >
                      เช่าเลย (เริ่ม 10฿)
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Features Box */}
        <div className="mt-8 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FeatureCard
              icon={<Zap size={18} />}
              title="RTX 4080"
              desc="ปรับสุดทุกเกม"
            />
            <FeatureCard
              icon={<Clock size={18} />}
              title="ราคาชิลๆ"
              desc="เริ่มแค่ 10 บาท"
            />
            <FeatureCard
              icon={<User size={18} />}
              title="Empty Acc"
              desc="ผูก ID ตัวเองเล่น"
            />
            <FeatureCard
              icon={<Monitor size={18} />}
              title="Server TH"
              desc="ลื่นๆ ปิงน้อย"
            />
          </div>

          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 flex items-start gap-3">
            <AlertTriangle className="text-orange-500 shrink-0" size={18} />
            <p className="text-xs text-orange-200/80">
              <strong className="text-orange-400">สำคัญ:</strong> เป็น Account
              เปล่า ต้องผูก ID เกมเล่นเองและ Log out หลังเล่นเสร็จนะครับ
            </p>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 mt-2">
            <h3 className="text-zinc-300 font-medium mb-3 flex items-center gap-2">
              อัตราค่าบริการ{" "}
              <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
                Bro.Game
              </span>
            </h3>
            <div className="space-y-2">
              <PriceRow hours="1 ชั่วโมง" price="10 บาท" />
              <PriceRow hours="2 ชั่วโมง" price="20 บาท" />
              <PriceRow hours="3 ชั่วโมง" price="30 บาท" />
              <PriceRow hours="5 ชั่วโมง" price="45 บาท" best="-5฿" />
              <PriceRow hours="7 ชั่วโมง" price="55 บาท" best="คุ้ม!" />
              <PriceRow hours="1 วัน" price="70 บาท" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-auto pt-12 pb-6 text-center text-zinc-600 text-xs">
          <p>© 2026 Rent-X | Bro.Game Community</p>
        </footer>
      </main>
    </div>
  );
}

// Sub Components
function FeatureCard({ icon, title, desc }: FeatureCardProps) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl flex flex-col items-center text-center gap-2 hover:bg-zinc-800/50 transition-colors">
      <div className="text-green-500">{icon}</div>
      <div>
        <h4 className="font-bold text-sm text-zinc-200">{title}</h4>
        <p className="text-[10px] text-zinc-500">{desc}</p>
      </div>
    </div>
  );
}

function PriceRow({ hours, price, best }: PriceRowProps) {
  return (
    <div className="flex justify-between items-center p-3 rounded-lg bg-zinc-950/50 border border-zinc-800/50">
      <span className="text-zinc-300 text-sm flex items-center gap-2">
        {hours}
        {best && (
          <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded border border-green-500/20">
            {best}
          </span>
        )}
      </span>
      <span className="font-mono text-white font-bold">{price}</span>
    </div>
  );
}
