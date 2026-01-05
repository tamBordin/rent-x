import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rent-X | เช่า Geforce Now รายชั่วโมง",
  description:
    "บริการเช่า ID Geforce Now Ultimate (RTX 4080) เซิร์ฟไทย ราคาเริ่ม 10 บาท",
  openGraph: {
    title: "Rent-X | เช่าจอแรง RTX 4080",
    description: "ไม่ต้องต่อคิว ภาพชัด 4K เล่นได้ทันที เริ่มต้น 10 บาท",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
