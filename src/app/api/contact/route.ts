import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Resend } from "resend";
import { contactEmailHtml } from "@/lib/emailTemplates";
import { pushAdminLineNotification } from "@/lib/adminLineNotifications";
import { productSelectionSummary } from '@/lib/productSelectionSummary';

export const dynamic = "force-dynamic";

const resendApiKey = (process.env.RESEND_API_KEY || '').replace(/[\uFEFF\u200B]/g, '').trim();
const resend = resendApiKey ? new Resend(resendApiKey) : null;

function normalizePhone(phone: string) {
  let normalized = phone.replace(/[\s\-()]/g, '');
  if (normalized.startsWith('+886')) normalized = `0${normalized.slice(4)}`;
  if (normalized.startsWith('886')) normalized = `0${normalized.slice(3)}`;
  return normalized;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email, service_type, event_end_date, event_date, event_location } = body;
    let description = typeof body.description === 'string' ? body.description : '';
    const location = typeof event_location === 'string' ? event_location.trim() : '';

    if (!name || !phone || !location) {
      return NextResponse.json(
        { error: "姓名、電話和活動地點為必填欄位" },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePhone(phone);

    // Rebuild the product snapshot from current catalog data; never accept client prices.
    if (body.product_selection !== undefined) {
      const productId = body.product_selection?.productId;
      if (typeof productId !== 'string' || productId.length > 100) return NextResponse.json({ error: '商品選擇格式錯誤' }, { status: 400 });
      const { data: product, error: productError } = await supabase.from('products').select('name,description,price_note').eq('id', productId).eq('visible', true).maybeSingle();
      if (productError || !product) return NextResponse.json({ error: '商品已變更或無法讀取，請重新整理後再試。' }, { status: 400 });
      try {
        description = [productSelectionSummary(product, body.product_selection), description ? `【其他需求】\n${description}` : ''].filter(Boolean).join('\n');
      } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : '商品選擇格式錯誤' }, { status: 400 });
      }
    }

    // 寫入 Supabase
    const { error } = await supabase.from("contacts").insert({
      name,
      phone: normalizedPhone,
      email: email || null,
      service_type: service_type || null,
      description: description || null,
      event_end_date: event_end_date || null,
      event_date: event_date || null,
      event_location: location || null,
      status: "pending",
      read: false,
    });

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "提交失敗" }, { status: 500 });
    }

    // 發送品牌通知信
    let emailStatus: 'completed' | 'failed' | 'not_configured' = resend ? 'completed' : 'not_configured';
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

      try {
        const { error: emailError } = await resend.emails.send({
          from: "境曜活動通知 <noreply@besevent.com>",
          to: notifyEmails,
          subject: `【新詢問單】${name}${service_type ? ` — ${service_type}` : ''}`,
          html: contactEmailHtml({ name, phone: normalizedPhone, email, service_type, event_date, event_end_date, event_location: location, description }),
        });
        if (emailError) {
          emailStatus = 'failed';
          console.error('Contact email error:', emailError);
        }
      } catch (emailError) {
        emailStatus = 'failed';
        console.error('Contact email error:', emailError);
      }
    }

    const lineMessage = [
      '💬 新詢問單通知',
      `姓名：${name}`,
      `電話：${normalizedPhone}`,
      email ? `Email：${email}` : '',
      service_type ? `服務：${service_type}` : '',
      event_date ? `活動日期：${event_date}` : '',
      event_end_date ? `結束日期：${event_end_date}` : '',
      location ? `活動地點：${location}` : '',
      description ? `需求：${String(description).slice(0, 2500)}` : '',
      '請至官網後臺查看完整詢問紀錄。',
    ].filter(Boolean).join('\n');
    const lineResult = await pushAdminLineNotification(lineMessage);

    return NextResponse.json({
      success: true,
      email_status: emailStatus,
      line_sent: lineResult.sent,
      line_failed: lineResult.failed,
      line_status: lineResult.status,
    });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json({ error: "提交失敗" }, { status: 500 });
  }
}
