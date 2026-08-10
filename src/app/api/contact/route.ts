import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Resend } from "resend";
import { contactEmailHtml } from "@/lib/emailTemplates";

export const dynamic = "force-dynamic";

const resendApiKey = (process.env.RESEND_API_KEY || '').replace(/[\uFEFF\u200B]/g, '').trim();
const resend = resendApiKey ? new Resend(resendApiKey) : null;

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

    // 發送品牌通知信
    if (resend) {
      // 取得通知收件人
      let notifyEmails: string[] = ["Jingyaoactivities@gmail.com"];
      const { data: setting } = await supabase
        .from("site_content")
        .select("value")
        .eq("key", "notification_email")
        .single();
      if (setting?.value) {
        notifyEmails = setting.value.split(",").map((e: string) => e.trim()).filter(Boolean);
      }

      await resend.emails.send({
        from: "境曜活動通知 <noreply@besevent.com>",
        to: notifyEmails,
        subject: `【新詢問單】${name}${service_type ? ` — ${service_type}` : ''}`,
        html: contactEmailHtml({ name, phone, email, service_type, event_date, event_end_date, description }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json({ error: "提交失敗" }, { status: 500 });
  }
}
