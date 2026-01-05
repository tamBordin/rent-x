"use client";

import { useState } from "react";
import { X, MessageCircle, CreditCard, Loader2 } from "lucide-react";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const [selectedPkg, setSelectedPkg] = useState("1h");
  const [isLoading, setIsLoading] = useState(false); // เพิ่ม state หมุนๆ

  if (!isOpen) return null;

  const handleOpenFacebook = async () => {
    setIsLoading(true); // เริ่มหมุนติ้วๆ

    try {
      // -------------------------------------------------------
      // 1. วิ่งไปจองคิวก่อน (Race Condition Check) 🏁
      // -------------------------------------------------------
      const res = await fetch("/api/hold", { method: "POST" });
      const data = await res.json();

      if (!data.success) {
        // ❌ ไม่ทันเพื่อน! โดนแย่ง
        alert(`เสียใจด้วยครับ 😅 ${data.message}`);
        onClose(); // ปิดหน้านี้ เพื่อให้เห็นสถานะสีเหลือง/แดงที่หน้าหลัก
        return;
      }

      // -------------------------------------------------------
      // 2. จองทัน! (ได้โควต้า 5 นาที) -> ค่อยเปิด Facebook
      // -------------------------------------------------------
      const pkgName =
        {
          "1h": "1 ชั่วโมง (10 บาท)",
          "2h": "2 ชั่วโมง (20 บาท)",
          "3h": "3 ชั่วโมง (30 บาท)",
          "5h": "5 ชั่วโมง (45 บาท)",
          "7h": "7 ชั่วโมง (55 บาท)",
          "1d": "1 วัน (70 บาท)",
        }[selectedPkg] || selectedPkg;

      // เตรียมข้อความ (ระบุด้วยว่าจองคิวไว้แล้ว)
      const message = `(จองคิวไว้แล้ว) สนใจเช่า Geforce Now แพ็คเกจ ${pkgName} ครับ`;

      // ⚠️ อย่าลืมใส่ Page Username ของคุณ
      const pageUsername = "61585993505168";
      const url = `https://m.me/${pageUsername}?text=${encodeURIComponent(
        message
      )}`;

      window.open(url, "_blank");
      onClose();
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่");
    } finally {
      setIsLoading(false);
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
            เลือกแพ็คเกจ
          </h3>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">
              ต้องการเล่นนานแค่ไหน?
            </label>
            <select
              value={selectedPkg}
              onChange={(e) => setSelectedPkg(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 cursor-pointer"
            >
              <option value="1h">1 ชั่วโมง - 10 บาท</option>
              <option value="2h">2 ชั่วโมง - 20 บาท</option>
              <option value="3h">3 ชั่วโมง - 30 บาท</option>
              <option value="5h">5 ชั่วโมง - 45 บาท (ประหยัด 5฿)</option>
              <option value="7h">7 ชั่วโมง - 55 บาท (คุ้มสุด!)</option>
              <option value="1d">1 วัน - 70 บาท</option>
            </select>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-sm text-blue-200">
            <p className="mb-2">
              💡 <strong>ขั้นตอนการเช่า:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-blue-200/80">
              <li>กดปุ่มสีฟ้า (ระบบจะล็อคคิวให้ 5 นาที)</li>
              <li>ระบบจะพาไปที่ Messenger ของร้าน</li>
              <li>กดส่งข้อความ แล้วส่งสลิปได้เลย!</li>
            </ul>
          </div>

          {/* ปุ่มกด Action */}
          <button
            onClick={handleOpenFacebook}
            disabled={isLoading}
            className={`w-full py-3.5 rounded-lg font-bold transition-all transform shadow-lg flex items-center justify-center gap-2
              ${
                isLoading
                  ? "bg-zinc-700 text-zinc-400 cursor-wait"
                  : "bg-[#0084FF] hover:bg-[#0074E4] text-white hover:scale-[1.02]"
              }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={20} /> กำลังล็อคคิว...
              </>
            ) : (
              <>
                <MessageCircle size={20} fill="white" className="text-white" />{" "}
                ไปที่แชท Facebook
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
