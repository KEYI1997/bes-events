import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email, service_type, description, event_end_date, event_date } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: "姓名和電話為必填欄位" },
        { status: 400 }
      );
    }

    // 寫入 Supabase
    const { error } = await supabase.from("contacts").insert({
      name,
      phone,
      email: email || null,
      service_type: service_type || null,
      description: description || null,
      event_end_date: event_end_date || null,
      event_date: event_date || null,
    });

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "提交失敗" }, { status: 500 });
    }

    // 發送通知信
    if (resend) {
      let notifyEmail = "Jingyaoactivities@gmail.com";
      const { data: setting } = await supabase
        .from("site_content")
        .select("value")
        .eq("key", "notification_email")
        .single();
      if (setting?.value) notifyEmail = setting.value;

      await resend.emails.send({
        from: "境曜活動通知 <onboarding@resend.dev>",
        to: notifyEmail,
        subject: `【新諮詢】${name} - ${service_type || "一般諮詢"}`,
        html: `
          <h2>📋 新的客戶諮詢</h2>
          <table style="border-collapse:collapse;width:100%">
            <tr><td style="padding:8px;border:1px solid #ddd"><b>姓名</b></td><td style="padding:8px;border:1px solid #ddd">${name}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd"><b>電話</b></td><td style="padding:8px;border:1px solid #ddd">${phone}</td></tr>
            ${email ? `<tr><td style="padding:8px;border:1px solid #ddd"><b>Email</b></td><td style="padding:8px;border:1px solid #ddd">${email}</td></tr>` : ""}
            ${service_type ? `<tr><td style="padding:8px;border:1px solid #ddd"><b>服務類型</b></td><td style="padding:8px;border:1px solid #ddd">${service_type}</td></tr>` : ""}
            ${event_date ? `<tr><td style="padding:8px;border:1px solid #ddd"><b>活動起日</b></td><td style="padding:8px;border:1px solid #ddd">${event_date}</td></tr>` : ""}
            ${event_end_date ? `<tr><td style="padding:8px;border:1px solid #ddd"><b>活動迄日</b></td><td style="padding:8px;border:1px solid #ddd">${event_end_date}</td></tr>` : ""}
            ${description ? `<tr><td style="padding:8px;border:1px solid #ddd"><b>需求說明</b></td><td style="padding:8px;border:1px solid #ddd">${description}</td></tr>` : ""}
          </table>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json({ error: "提交失敗" }, { status: 500 });
  }
}
