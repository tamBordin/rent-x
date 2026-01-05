"use client";

import { CreditCard, Upload, X } from "lucide-react";
import { useState } from "react";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true); // เริ่มหมุน

    try {
      const formData = new FormData(e.currentTarget); // ดึงข้อมูลทุกอย่างในฟอร์ม

      // ยิงไปที่ API ที่เราเพิ่งสร้างใน Step 1
      const res = await fetch("/api/notify", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาด");

      alert("✅ แจ้งโอนเงินเรียบร้อย! เดี๋ยวแอดมินทักไปครับ");
      onClose(); // ปิดหน้าต่าง
    } catch (error) {
      console.error(error);
      alert("❌ ส่งข้อมูลไม่สำเร็จ: " + error);
    } finally {
      setIsLoading(false); // หยุดหมุน
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-zinc-800 bg-zinc-900/50">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <CreditCard className="text-green-500" size={20} />
            ยืนยันการเช่า (RTX 4080)
          </h3>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">
              ช่องทางติดต่อ (Line ID / เบอร์โทร)
            </label>
            <input
              required
              name="contact"
              type="text"
              placeholder="เช่น 089xxxxxxx หรือ ID Line"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all placeholder:text-zinc-600"
            />
          </div>

          {/* --- แก้ไขราคาตรงนี้ครับ --- */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">
              เลือกแพ็คเกจ
            </label>
            <select
              name="package"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 appearance-none cursor-pointer"
            >
              <option value="1h">1 ชั่วโมง - 10 บาท</option>
              <option value="2h">2 ชั่วโมง - 20 บาท</option>
              <option value="3h">3 ชั่วโมง - 30 บาท</option>
              <option value="5h">5 ชั่วโมง - 45 บาท (ประหยัด 5฿)</option>
              <option value="7h">7 ชั่วโมง - 55 บาท (คุ้มสุด!)</option>
              <option value="1d">1 วัน - 70 บาท</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">
              หลักฐานการโอนเงิน
            </label>
            <div className="relative group">
              <input
                required
                name="slip"
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="w-full bg-zinc-950 border-2 border-dashed border-zinc-700 rounded-lg p-6 flex flex-col items-center justify-center gap-2 group-hover:border-green-500/50 transition-colors">
                <Upload
                  className={`w-8 h-8 ${
                    file ? "text-green-500" : "text-zinc-500"
                  }`}
                />
                <span className="text-sm text-zinc-400">
                  {file ? file.name : "แตะเพื่ออัปโหลดสลิป"}
                </span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 rounded-lg font-bold transition-all transform mt-4 shadow-lg
    ${
      isLoading
        ? "bg-zinc-700 text-zinc-400 cursor-wait"
        : "bg-green-500 hover:bg-green-400 text-black active:scale-95"
    }`}
          >
            {isLoading ? "กำลังส่งข้อมูล..." : "แจ้งโอนเงิน"}
          </button>

          <p className="text-center text-xs text-zinc-500 mt-2">
            *เป็น Account เปล่า ต้องผูก ID เกมเล่นเองนะครับ
          </p>
        </form>
      </div>
    </div>
  );
}
