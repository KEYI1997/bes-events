import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { getServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET || "";
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || "";

// 驗證 LINE 簽名
function verifySignature(body: string, signature: string): boolean {
  if (!LINE_CHANNEL_SECRET) return false;
  const hash = createHmac("sha256", LINE_CHANNEL_SECRET)
    .update(body)
    .digest("base64");
  return hash === signature;
}

// 回覆 LINE 訊息
async function replyMessage(replyToken: string, messages: object[]) {
  if (!LINE_CHANNEL_ACCESS_TOKEN) return;
  await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ replyToken, messages }),
  });
}

// 取得 LINE 用戶資料
async function getLineProfile(userId: string) {
  if (!LINE_CHANNEL_ACCESS_TOKEN) return null;
  const res = await fetch(`https://api.line.me/v2/bot/profile/${userId}`, {
    headers: { Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}` },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("x-line-signature") || "";

  // 驗證簽名
  if (!verifySignature(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const data = JSON.parse(body);
  const events = data.events || [];

  for (const event of events) {
    // 只處理文字訊息
    if (event.type !== "message" || event.message?.type !== "text") continue;

    const userId = event.source?.userId;
    const replyToken = event.replyToken;
    const text = event.message.text.trim().toUpperCase();

    // 判斷是否為訂單碼格式：BES-YYYYMMDD-XXX
    const orderCodePattern = /^BES-\d{8}-\d{3}$/;

    if (!orderCodePattern.test(text)) {
      // 不是訂單碼，回覆提示
      await replyMessage(replyToken, [
        {
          type: "text",
          text: "您好！請輸入您的訂單碼（格式：BES-YYYYMMDD-XXX）來綁定您的 LINE 帳號，以便接收訂單通知。\n\n例如：BES-20260811-001",
        },
      ]);
      continue;
    }

    // 查詢訂單
    const supabase = getServiceClient();
    const { data: order, error } = await supabase
      .from("orders")
      .select("id, customer_name, order_code, line_user_id")
      .eq("order_code", text)
      .single();

    if (error || !order) {
      // 找不到訂單
      await replyMessage(replyToken, [
        {
          type: "text",
          text: `找不到訂單碼「${text}」，請確認後再試。\n\n如有疑問請聯繫我們。`,
        },
      ]);
      continue;
    }

    if (order.line_user_id && order.line_user_id !== userId) {
      // 已被其他帳號綁定
      await replyMessage(replyToken, [
        {
          type: "text",
          text: `此訂單碼已被綁定，請確認是否為您的訂單。\n\n如有疑問請聯繫我們。`,
        },
      ]);
      continue;
    }

    // 取得 LINE 用戶資料
    const profile = await getLineProfile(userId);
    const displayName = profile?.displayName || "客戶";

    // 更新訂單的 LINE 資訊
    await supabase
      .from("orders")
      .update({
        line_user_id: userId,
        line_display_name: displayName,
      })
      .eq("id", order.id);

    // 回覆成功訊息
    await replyMessage(replyToken, [
      {
        type: "text",
        text: `✅ 綁定成功！\n\n您好，${order.customer_name}！\n您的訂單（${text}）已成功綁定 LINE 帳號。\n\n之後訂單的狀態更新將會透過此管道通知您。`,
      },
    ]);
  }

  return NextResponse.json({ status: "ok" });
}

// LINE Webhook 驗證用（GET 請求）
export async function GET() {
  return NextResponse.json({ status: "LINE Webhook is running" });
}
