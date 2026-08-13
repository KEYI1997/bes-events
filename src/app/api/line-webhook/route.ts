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

// 標準化電話號碼（去除空白、dash、+886 等）
function normalizePhone(phone: string): string {
  let p = phone.replace(/[\s\-\(\)]/g, '');
  if (p.startsWith('+886')) p = '0' + p.slice(4);
  if (p.startsWith('886')) p = '0' + p.slice(3);
  return p;
}

function parseAdminPhones(value?: string | null): string[] {
  if (!value) return [normalizePhone("0911247541")];

  let rawPhones: string[];
  try {
    const parsed = JSON.parse(value);
    rawPhones = Array.isArray(parsed) ? parsed : [value];
  } catch {
    rawPhones = value.split(/[,;\n]/);
  }

  return [...new Set(rawPhones.map(phone => normalizePhone(String(phone))).filter(Boolean))];
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
    // 處理加入好友事件
    if (event.type === "follow") {
      const replyToken = event.replyToken;
      await replyMessage(replyToken, [
        {
          type: "text",
          text: "您好！歡迎加入境曜有限公司 🎉\n\n請傳送您的手機號碼，讓我們為您綁定帳號，方便接收訂單通知。\n\n例如：0912345678",
        },
      ]);
      continue;
    }

    // 只處理文字訊息
    if (event.type !== "message" || event.message?.type !== "text") continue;

    const userId = event.source?.userId;
    const replyToken = event.replyToken;
    const text = event.message.text.trim();

    // ── 管理員認證：「管理者：電話號碼」──
    const adminPattern = /^管理者[：:]\s*(.+)$/;
    const adminMatch = text.match(adminPattern);
    if (adminMatch) {
      const inputPhone = normalizePhone(adminMatch[1].trim());
      const supabase = getServiceClient();

      // 從 site_content 取得設定的管理員電話清單（相容既有單一電話格式）
      const { data: adminPhoneSetting } = await supabase
        .from("site_content")
        .select("value")
        .eq("key", "admin_line_phone")
        .single();

      const adminPhones = parseAdminPhones(adminPhoneSetting?.value);

      if (adminPhones.includes(inputPhone)) {
        // 取得 LINE 用戶資料
        const profile = await getLineProfile(userId);
        const displayName = profile?.displayName || "管理員";

        // 儲存多位管理員的 LINE 綁定資料
        const { data: adminUsersSetting } = await supabase
          .from("site_content")
          .select("value")
          .eq("key", "admin_line_users")
          .single();

        let adminUsers: Array<{ phone: string; lineUserId: string; displayName: string }> = [];
        try {
          const parsed = JSON.parse(adminUsersSetting?.value || "[]");
          if (Array.isArray(parsed)) adminUsers = parsed;
        } catch {
          adminUsers = [];
        }

        const updatedAdminUsers = [
          ...adminUsers.filter(admin => admin.phone !== inputPhone && admin.lineUserId !== userId),
          { phone: inputPhone, lineUserId: userId, displayName },
        ];

        await supabase.from("site_content").upsert(
          {
            key: "admin_line_users",
            value: JSON.stringify(updatedAdminUsers),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "key" }
        );

        // 保留舊欄位，讓既有通知程式仍可取得最近認證的管理員
        await supabase.from("site_content").upsert(
          {
            key: "admin_line_user_id",
            value: userId,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "key" }
        );

        await replyMessage(replyToken, [
          {
            type: "text",
            text: `✅ 管理員身份認證成功！\n\n${displayName}，您的 LINE 帳號已設定為管理員。\n\n之後有新訂單或詢問單，系統將主動通知您。`,
          },
        ]);
      } else {
        await replyMessage(replyToken, [
          {
            type: "text",
            text: "❌ 認證失敗，電話號碼不符合。",
          },
        ]);
      }
      continue;
    }

    // 判斷是否為電話號碼格式
    const phonePattern = /^[\d\s\-\+\(\)]{8,15}$/;
    if (!phonePattern.test(text)) {
      await replyMessage(replyToken, [
        {
          type: "text",
          text: "請傳送您的手機號碼來綁定帳號。\n\n例如：0912345678\n\n如有其他問題請直接留言，我們會盡快回覆您。",
        },
      ]);
      continue;
    }

    const phone = normalizePhone(text);
    const supabase = getServiceClient();

    // 檢查是否已有此 LINE 帳號綁定
    const { data: existingByLine } = await supabase
      .from("customers")
      .select("*")
      .eq("line_user_id", userId)
      .single();

    if (existingByLine) {
      await replyMessage(replyToken, [
        {
          type: "text",
          text: `您的 LINE 帳號已綁定電話 ${existingByLine.phone}。\n\n如需更換，請傳送新的手機號碼。`,
        },
      ]);
      continue;
    }

    // 在 orders 和 contacts 裡找這個電話
    const [ordersRes, contactsRes] = await Promise.all([
      supabase.from("orders").select("id, customer_name").eq("customer_phone", phone).limit(1),
      supabase.from("contacts").select("id, name").eq("phone", phone).limit(1),
    ]);

    const orderMatch = ordersRes.data?.[0];
    const contactMatch = contactsRes.data?.[0];
    const customerName = orderMatch?.customer_name || contactMatch?.name || null;

    if (!orderMatch && !contactMatch) {
      await replyMessage(replyToken, [
        {
          type: "text",
          text: `找不到電話號碼「${phone}」的記錄。\n\n請確認電話號碼是否正確，或聯繫我們確認。\n📞 0912-727-596`,
        },
      ]);
      continue;
    }

    // 取得 LINE 用戶資料
    const profile = await getLineProfile(userId);
    const displayName = profile?.displayName || "客戶";
    const pictureUrl = profile?.pictureUrl || null;

    // 檢查此電話是否已有記錄
    const { data: existingByPhone } = await supabase
      .from("customers")
      .select("*")
      .eq("phone", phone)
      .single();

    if (existingByPhone) {
      // 更新已有記錄
      await supabase
        .from("customers")
        .update({
          name: existingByPhone.name || customerName,
          line_user_id: userId,
          line_display_name: displayName,
          line_picture_url: pictureUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("phone", phone);
    } else {
      // 新增記錄
      await supabase.from("customers").insert({
        phone,
        name: customerName,
        line_user_id: userId,
        line_display_name: displayName,
        line_picture_url: pictureUrl,
      });
    }

    const nameText = customerName ? `您好，${customerName}！\n` : "";
    await replyMessage(replyToken, [
      {
        type: "text",
        text: `✅ 綁定成功！\n\n${nameText}您的 LINE 帳號已成功綁定，之後訂單狀態更新將透過此管道通知您。\n\n感謝您的支持！`,
      },
    ]);
  }

  return NextResponse.json({ status: "ok" });
}

// LINE Webhook 驗證用
export async function GET() {
  return NextResponse.json({ status: "LINE Webhook is running" });
}
