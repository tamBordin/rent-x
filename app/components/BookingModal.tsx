"use client";

import { CreditCard, MessageCircle, X } from "lucide-react";
import { useState } from "react";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingModal({ isOpen, onClose }: BookingModalProps) {
  // ไม่ต้องใช้ state file/loading แล้ว เพราะเราแค่ดีดลูกค้าไป Facebook
  const [selectedPkg, setSelectedPkg] = useState("1h");

  if (!isOpen) return null;

  const handleOpenFacebook = () => {
    // 1. เตรียมข้อความที่จะให้ลูกค้าส่งหาเรา
    // แปลงรหัสแพ็คเกจเป็นคำพูดสวยๆ
    const pkgName =
      {
        "1h": "1 ชั่วโมง (10 บาท)",
        "2h": "2 ชั่วโมง (20 บาท)",
        "3h": "3 ชั่วโมง (30 บาท)",
        "5h": "5 ชั่วโมง (45 บาท)",
        "7h": "7 ชั่วโมง (55 บาท)",
        "1d": "1 วัน (70 บาท)",
      }[selectedPkg] || selectedPkg;

    const message = `สวัสดีครับ สนใจเช่า Geforce Now แพ็คเกจ ${pkgName} ครับ สะดวกโอนเลยครับ`;

    // 2. สร้างลิงก์ m.me (Facebook Messenger Deep Link)
    // ⚠️ เปลี่ยน 'YOUR_FB_USERNAME' เป็น ID ของคุณ (เช่น RentX_Shop)
    const fbUsername = "61585993505168";
    const url = `https://m.me/${fbUsername}?text=${encodeURIComponent(
      message
    )}`;

    // 3. เปิดแท็บใหม่ไปที่ Messenger
    window.open(url, "_blank");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
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
          {/* เลือกเวลา */}
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

          {/* คำอธิบาย */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-sm text-blue-200">
            <p className="mb-2">
              💡 <strong>ขั้นตอนง่ายๆ:</strong>
            </p>
            <ol className="list-decimal list-inside space-y-1 text-blue-200/80">
              <li>กดปุ่มด้านล่างเพื่อไปที่แชท Facebook</li>
              <li>ระบบจะพิมพ์ข้อความให้อัตโนมัติ</li>
              <li>แนบสลิปโอนเงินในแชทได้เลย!</li>
            </ol>
          </div>

          {/* ปุ่มไป Facebook */}
          <button
            onClick={handleOpenFacebook}
            className="w-full bg-[#0084FF] hover:bg-[#0074E4] text-white font-bold py-3.5 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2"
          >
            <MessageCircle size={20} fill="white" className="text-white" />
            ทักแชทส่งสลิป (Messenger)
          </button>

          <p className="text-center text-xs text-zinc-600">
            แอดมินจะส่งรหัสเกมให้ทางแชททันทีที่ตรวจสอบยอดครับ
          </p>
        </div>
      </div>
    </div>
  );
}
