// src/app/api/notify/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        // 1. รับข้อมูลจากหน้าบ้าน
        const formData = await request.formData();
        const contact = formData.get('contact');
        const pkg = formData.get('package');
        const file = formData.get('slip') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // 2. เตรียมข้อมูลส่งเข้า Discord
        // Discord Webhook รับ FormData ได้เลย ง่ายมาก
        const discordFormData = new FormData();

        // content = ข้อความที่เราจะพิมพ์
        const message = `
🚨 **มีรายการสั่งซื้อใหม่! (Rent-X)**
👤 **ลูกค้า:** ${contact}
📦 **แพ็คเกจ:** ${pkg}
----------------------------------
👇 **หลักฐานการโอนเงิน**
`;
        discordFormData.append('content', message);

        // แนบไฟล์ (Discord ใช้ชื่อ field ว่า 'file' หรือ 'file[0]')
        discordFormData.append('file', file);

        // 3. ยิงไปที่ Discord Webhook
        // ⚠️ เอา URL ที่ Copy มาใส่ตรงนี้
        const DISCORD_WEBHOOK_URL = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL || '';

        const response = await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            body: discordFormData,
        });

        if (!response.ok) {
            throw new Error('Failed to send to Discord');
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Error sending notification' }, { status: 500 });
    }
}