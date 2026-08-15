import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { orderEmailHtml } from "@/lib/emailTemplates";
import { getServiceClient } from "@/lib/supabase";
import { pushAdminLineNotification } from "@/lib/adminLineNotifications";

export const dynamic = "force-dynamic";

const resendApiKey = (process.env.RESEND_API_KEY || '').replace(/[\uFEFF\u200B]/g, '').trim();
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// 取得目前有效密碼（優先從 Supabase 讀取，沒有則用環境變數）
async function getCurrentPassword() {
  try {
    const supabase = getServiceClient();
    const { data } = await supabase
      .from("site_content")
      .select("value")
      .eq("key", "admin_password")
      .single();
    
    if (data?.value) {
      return data.value;
    }
  } catch {
    // 忽略錯誤，fallback 到環境變數
  }
  return process.env.ADMIN_PASSWORD || '';
}

async function verifyAdmin(request: NextRequest) {
  const password = request.headers.get("x-admin-password");
  const currentPassword = await getCurrentPassword();
  return password === currentPassword;
}

export async function POST(request: NextRequest) {
  if (!await verifyAdmin(request)) {
    return NextResponse.json({ error: "未授權" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      customer_name,
      customer_phone,
      product_id,
      quantity,
      borrow_date,
      return_date,
      event_name,
      status,
      note,
    } = body;

    // 查詢商品名稱
    let product_name = '';
    if (product_id) {
      const supabase = getServiceClient();
      const { data: product } = await supabase
        .from('products')
        .select('name')
        .eq('id', product_id)
        .single();
      product_name = product?.name || '';
    }

    // 取得 Email 管理者設定
    const supabase = getServiceClient();
    let notifyEmails: string[] = ["Jingyaoactivities@gmail.com"];
    const { data: setting } = await supabase
      .from("site_content")
      .select("value")
      .eq("key", "notification_email")
      .maybeSingle();
    if (setting?.value) {
      notifyEmails = setting.value.split(",").map((e: string) => e.trim()).filter(Boolean);
    }

    let emailId: string | undefined;
    let emailError: unknown = null;
    if (!resend) {
      emailError = "RESEND_API_KEY 未設定";
    } else {
      const { data, error } = await resend.emails.send({
        from: "境曜活動通知 <noreply@besevent.com>",
        to: notifyEmails,
        subject: `【新訂單】${customer_name}${product_name ? ` — ${product_name}` : ''}`,
        html: orderEmailHtml({
          customer_name,
          customer_phone,
          product_name,
          quantity,
          borrow_date,
          return_date,
          event_name,
          status,
          note,
        }),
      });
      emailId = data?.id;
      emailError = error;
    }

    const lineMessage = [
      '📦 新訂單通知',
      '',
      `客戶：${customer_name || '未填寫'}`,
      `電話：${customer_phone || '未填寫'}`,
      product_name ? `品項：${product_name}` : '',
      quantity ? `數量：${quantity}` : '',
      event_name ? `活動：${event_name}` : '',
      borrow_date ? `開始：${borrow_date}` : '',
      return_date ? `結束：${return_date}` : '',
      status ? `狀態：${status}` : '',
      note ? `備註：${note}` : '',
      '',
      '請至官網後臺查看完整訂單。',
    ].filter(line => line !== '').join('\n');

    const lineResult = await pushAdminLineNotification(lineMessage);

    if (emailError) {
      console.error("Resend error:", emailError);
      return NextResponse.json({
        error: "Email 發送失敗",
        detail: emailError,
        line_sent: lineResult.sent,
        line_failed: lineResult.failed,
        line_status: lineResult.status,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      email_id: emailId,
      line_sent: lineResult.sent,
      line_failed: lineResult.failed,
      line_status: lineResult.status,
    });
  } catch (err) {
    console.error("notify-order error:", err);
    return NextResponse.json({ error: "系統錯誤" }, { status: 500 });
  }
}
