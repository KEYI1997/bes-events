import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { orderEmailHtml } from "@/lib/emailTemplates";
import { getServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const resendApiKey = (process.env.RESEND_API_KEY || '').replace(/[\uFEFF\u200B]/g, '').trim();
const resend = resendApiKey ? new Resend(resendApiKey) : null;

function verifyAdmin(request: NextRequest) {
  const password = request.headers.get("x-admin-password");
  const envPassword = process.env.ADMIN_PASSWORD;
  console.log("Received password:", password);
  console.log("Env password exists:", !!envPassword);
  console.log("Match:", password === envPassword);
  return password === envPassword;
}

export async function POST(request: NextRequest) {
  const password = request.headers.get("x-admin-password");
  const envPassword = process.env.ADMIN_PASSWORD;
  
  if (password !== envPassword) {
    return NextResponse.json({ 
      error: "未授權",
      debug: {
        receivedLength: password?.length || 0,
        envExists: !!envPassword,
        envLength: envPassword?.length || 0
      }
    }, { status: 401 });
  }

  if (!resend) {
    return NextResponse.json({ error: "RESEND_API_KEY 未設定" }, { status: 500 });
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

    // 取得通知收件人
    const supabase = getServiceClient();
    let notifyEmails: string[] = ["Jingyaoactivities@gmail.com"];
    const { data: setting } = await supabase
      .from("site_content")
      .select("value")
      .eq("key", "notification_email")
      .single();
    if (setting?.value) {
      notifyEmails = setting.value.split(",").map((e: string) => e.trim()).filter(Boolean);
    }

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

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: "Email 發送失敗", detail: error }, { status: 500 });
    }

    return NextResponse.json({ success: true, email_id: data?.id });
  } catch (err) {
    console.error("notify-order error:", err);
    return NextResponse.json({ 
      error: "系統錯誤", 
      detail: err instanceof Error ? err.message : String(err)
    }, { status: 500 });
  }
}
