import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { orderEmailHtml } from "@/lib/emailTemplates";
import { getServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const resendApiKey = (process.env.RESEND_API_KEY || '').replace(/[\uFEFF\u200B]/g, '').trim();
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const lineAccessToken = (process.env.LINE_CHANNEL_ACCESS_TOKEN || '').replace(/[\uFEFF\u200B]/g, '').trim();
const DEFAULT_ADMIN_PHONE = '0911247541';

type AdminLineUser = {
  phone?: string;
  lineUserId?: string;
  line_user_id?: string;
};

function normalizePhone(phone: string) {
  let normalized = phone.replace(/[\s\-()]/g, '');
  if (normalized.startsWith('+886')) normalized = `0${normalized.slice(4)}`;
  if (normalized.startsWith('886')) normalized = `0${normalized.slice(3)}`;
  return normalized;
}

function parseAdminPhones(value?: string | null): string[] {
  if (!value) return [DEFAULT_ADMIN_PHONE];

  let rawPhones: string[];
  try {
    const parsed = JSON.parse(value);
    rawPhones = Array.isArray(parsed) ? parsed.map(String) : [value];
  } catch {
    rawPhones = value.split(/[,;\n]/);
  }

  return [...new Set(rawPhones.map(normalizePhone).filter(phone => /^09\d{8}$/.test(phone)))];
}

function parseAdminLineUsers(value?: string | null): AdminLineUser[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function pushLineMessage(userId: string, text: string) {
  const response = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${lineAccessToken}`,
    },
    body: JSON.stringify({ to: userId, messages: [{ type: 'text', text }] }),
  });

  if (!response.ok) {
    console.error('LINE push error:', response.status, await response.text());
  }
  return response.ok;
}

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

    // 取得 Email 與 LINE 管理者設定
    const supabase = getServiceClient();
    let notifyEmails: string[] = ["Jingyaoactivities@gmail.com"];
    const { data: settings } = await supabase
      .from("site_content")
      .select("key,value")
      .in("key", ["notification_email", "admin_line_phone", "admin_line_users", "admin_line_user_id"]);
    const getSetting = (key: string) => settings?.find(setting => setting.key === key)?.value;
    const emailSetting = getSetting("notification_email");
    if (emailSetting) {
      notifyEmails = emailSetting.split(",").map((e: string) => e.trim()).filter(Boolean);
    }

    const adminPhones = parseAdminPhones(getSetting("admin_line_phone"));
    const adminLineUsers = parseAdminLineUsers(getSetting("admin_line_users"));
    const lineUserIds = adminLineUsers
      .filter(admin => admin.phone && adminPhones.includes(normalizePhone(admin.phone)))
      .map(admin => admin.lineUserId || admin.line_user_id || '')
      .filter(Boolean);
    const legacyLineUserId = getSetting("admin_line_user_id");
    if (adminLineUsers.length === 0 && adminPhones.length > 0 && legacyLineUserId) {
      lineUserIds.push(legacyLineUserId);
    }
    const uniqueLineUserIds = [...new Set(lineUserIds)];

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

    let lineSent = 0;
    let lineFailed = 0;
    if (lineAccessToken && uniqueLineUserIds.length > 0) {
      const lineResults = await Promise.all(uniqueLineUserIds.map(userId => pushLineMessage(userId, lineMessage)));
      lineSent = lineResults.filter(Boolean).length;
      lineFailed = lineResults.length - lineSent;
    }

    if (emailError) {
      console.error("Resend error:", emailError);
      return NextResponse.json({
        error: "Email 發送失敗",
        detail: emailError,
        line_sent: lineSent,
        line_failed: lineFailed,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      email_id: emailId,
      line_sent: lineSent,
      line_failed: lineFailed,
      line_status: !lineAccessToken
        ? 'LINE_CHANNEL_ACCESS_TOKEN 未設定'
        : uniqueLineUserIds.length === 0
          ? '尚無已認證的 LINE 管理者'
          : 'completed',
    });
  } catch (err) {
    console.error("notify-order error:", err);
    return NextResponse.json({ error: "系統錯誤" }, { status: 500 });
  }
}
