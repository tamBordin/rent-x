// src/app/api/hold/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// สร้าง Supabase Client สำหรับฝั่ง Server
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST() {
    try {
        const now = new Date().toISOString();

        // ---------------------------------------------------------
        // ✅ Step 0: ภารโรงทำความสะอาด (Lazy Cleanup) 🧹
        // ลบรายการที่ "จองกั๊กไว้" (pending) แต่ "หมดเวลาแล้ว" (end_time < now) ทิ้งไป
        // เพื่อเปิดทางให้คนใหม่จองได้ทันที โดยไม่ต้องรอ Admin มาลบ
        // ---------------------------------------------------------
        const { error: deleteError } = await supabase
            .from('bookings')
            .delete()
            .eq('status', 'pending') // ลบเฉพาะคนที่ยังไม่จ่ายเงิน
            .lt('end_time', now);    // และหมดเวลาล็อค 5 นาทีแล้ว

        if (deleteError) {
            console.error('Cleanup Error (ปล่อยผ่านได้):', deleteError);
            // ไม่ต้อง return error เพราะไม่ใช่เรื่องคอขาดบาดตาย ระบบยังทำงานต่อได้
        }

        // ---------------------------------------------------------
        // ✅ Step 1: ตรวจสอบความว่าง (Race Condition Check) 🏁
        // เช็คว่ามีใครจองค้างอยู่ไหม (ทั้งที่เล่นอยู่ และที่กำลังรอโอน)
        // ---------------------------------------------------------
        const { data: existing, error: checkError } = await supabase
            .from('bookings')
            .select('id')
            .gt('end_time', now) // ดูอันที่ยังไม่หมดเวลา
            .limit(1);

        if (checkError) {
            throw new Error(checkError.message);
        }

        // ถ้าเจอข้อมูล แสดงว่า "ไม่ว่าง" (โดนตัดหน้า)
        if (existing && existing.length > 0) {
            return NextResponse.json(
                { success: false, message: 'ช้าไปนิดเดียว! มีคนกดจองตัดหน้าไปเมื่อกี้ครับ 😅' },
                { status: 409 } // 409 Conflict
            );
        }

        // ---------------------------------------------------------
        // ✅ Step 2: ทำการล็อคคิว (Locking) 🔒
        // ถ้าว่างจริง -> ล็อคให้ 5 นาที
        // ---------------------------------------------------------
        const lockMinutes = 5;
        const endTime = new Date(Date.now() + lockMinutes * 60 * 1000).toISOString();

        const { error: insertError } = await supabase.from('bookings').insert({
            contact: 'Pending User', // ยังไม่รู้ชื่อ ใส่ไว้ก่อน
            status: 'pending',       // สถานะ: รอโอน
            start_time: now,
            end_time: endTime,       // ล็อคแค่ 5 นาที
        });

        if (insertError) {
            throw new Error(insertError.message);
        }

        // ✅ จองสำเร็จ
        return NextResponse.json({ success: true });

    } catch (error