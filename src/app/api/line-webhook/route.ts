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
  const response = await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ replyToken, messages }),
  });
  if (!response.ok) {
    console.error("LINE reply error:", response.status, await response.text());
  }
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

type LineOrder = {
  id: string;
  order_code?: string | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  quantity?: number | null;
  borrow_date?: string | null;
  return_date?: string | null;
  event_name?: string | null;
  status?: string | null;
  created_at?: string | null;
  products?: { name?: string | null } | Array<{ name?: string | null }> | null;
};

function isOrderStatusCommand(text: string): boolean {
  const command = text.trim().toLowerCase();
  return [
    "目前訂單",
    "目前訂單狀態",
    "我的訂單",
    "訂單狀態",
    "查詢訂單",
    "order_status",
    "action=order_status",
  ].includes(command);
}

function getCustomerOrderStatus(order: LineOrder) {
  if (order.status === "已取消" || order.status === "已解除") {
    return { label: "已解除", textColor: "#6B7280", backgroundColor: "#F1F3F5" };
  }

  const todayInTaipei = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Taipei" }).format(new Date());
  if (order.status === "已歸還" || order.status === "已完成" || (order.return_date && order.return_date < todayInTaipei)) {
    return { label: "已完成", textColor: "#237A3B", backgroundColor: "#E9F7EE" };
  }
  return { label: "接案中", textColor: "#A35D16", backgroundColor: "#FFF2E2" };
}

function formatOrderDate(value?: string | null) {
  if (!value) return "尚未設定";
  return value.replace(/-/g, "/");
}

function getProductName(order: LineOrder) {
  if (Array.isArray(order.products)) return order.products[0]?.name || "活動服務";
  return order.products?.name || "活動服務";
}

function buildOrderCard(order: LineOrder, index: number) {
  const status = getCustomerOrderStatus(order);
  const title = order.event_name || getProductName(order);
  const dateRange = order.borrow_date === order.return_date
    ? formatOrderDate(order.borrow_date)
    : `${formatOrderDate(order.borrow_date)}－${formatOrderDate(order.return_date)}`;

  return {
    type: "bubble",
    size: "kilo",
    header: {
      type: "box",
      layout: "vertical",
      backgroundColor: "#4A4947",
      paddingAll: "18px",
      contents: [
        {
          type: "box",
          layout: "horizontal",
          alignItems: "center",
          contents: [
            {
              type: "text",
              text: index === 0 ? "最新訂單" : "近期訂單",
              color: "#FFFFFF",
              size: "xs",
              weight: "bold",
              flex: 1,
            },
            {
              type: "text",
              text: order.order_code || `訂單 ${index + 1}`,
              color: "#FFFFFFAA",
              size: "xxs",
              align: "end",
              flex: 3,
            },
          ],
        },
        {
          type: "text",
          text: title,
          color: "#FFFFFF",
          size: "lg",
          weight: "bold",
          wrap: true,
          margin: "md",
          maxLines: 2,
        },
      ],
    },
    body: {
      type: "box",
      layout: "vertical",
      paddingAll: "18px",
      spacing: "md",
      contents: [
        {
          type: "box",
          layout: "horizontal",
          alignItems: "center",
          contents: [
            { type: "text", text: "目前狀態", color: "#8A8A8A", size: "sm", flex: 2 },
            {
              type: "box",
              layout: "vertical",
              backgroundColor: status.backgroundColor,
              cornerRadius: "12px",
              paddingAll: "6px",
              flex: 2,
              contents: [
                {
                  type: "text",
                  text: status.label,
                  color: status.textColor,
                  size: "sm",
                  weight: "bold",
                  align: "center",
                },
              ],
            },
          ],
        },
        { type: "separator", color: "#EEEEEE" },
        {
          type: "box",
          layout: "horizontal",
          contents: [
            { type: "text", text: "服務項目", color: "#8A8A8A", size: "sm", flex: 2 },
            { type: "text", text: getProductName(order), color: "#4A4947", size: "sm", wrap: true, align: "end", flex: 4 },
          ],
        },
        {
          type: "box",
          layout: "horizontal",
          contents: [
            { type: "text", text: "服務日期", color: "#8A8A8A", size: "sm", flex: 2 },
            { type: "text", text: dateRange, color: "#4A4947", size: "sm", wrap: true, align: "end", flex: 4 },
          ],
        },
        {
          type: "box",
          layout: "horizontal",
          contents: [
            { type: "text", text: "數量", color: "#8A8A8A", size: "sm", flex: 2 },
            { type: "text", text: String(order.quantity || 1), color: "#4A4947", size: "sm", align: "end", flex: 4 },
          ],
        },
      ],
    },
  };
}

function getPhoneVariants(phone: string) {
  const normalized = normalizePhone(phone);
  const variants = new Set([normalized, phone]);
  if (/^09\d{8}$/.test(normalized)) {
    variants.add(`${normalized.slice(0, 4)}-${normalized.slice(4, 7)}-${normalized.slice(7)}`);
    variants.add(`${normalized.slice(0, 4)}-${normalized.slice(4)}`);
    variants.add(`${normalized.slice(0, 4)} ${normalized.slice(4, 7)} ${normalized.slice(7)}`);
    variants.add(`+886${normalized.slice(1)}`);
    variants.add(`886${normalized.slice(1)}`);
  }
  return [...variants];
}

async function replyRecentOrders(replyToken: string, userId?: string) {
  if (!userId) {
    await replyMessage(replyToken, [{ type: "text", text: "無法取得您的 LINE 帳號資訊，請稍後再試。" }]);
    return;
  }

  const supabase = getServiceClient();
  const { data: customer } = await supabase
    .from("customers")
    .select("phone, name")
    .eq("line_user_id", userId)
    .maybeSingle();

  if (!customer?.phone) {
    await replyMessage(replyToken, [
      {
        type: "text",
        text: "尚未完成手機綁定。\n\n請直接傳送您填寫表單或訂單時使用的手機號碼，例如：0912345678",
      },
    ]);
    return;
  }

  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, order_code, customer_name, customer_phone, quantity, borrow_date, return_date, event_name, status, created_at, products(name)")
    .in("customer_phone", getPhoneVariants(customer.phone))
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("LINE order status query error:", error.message);
    await replyMessage(replyToken, [{ type: "text", text: "訂單資料暫時無法讀取，請稍後再試或直接聯繫我們。" }]);
    return;
  }

  const recentOrders = (orders || []) as LineOrder[];
  if (recentOrders.length === 0) {
    await replyMessage(replyToken, [
      {
        type: "text",
        text: `${customer.name ? `${customer.name} 您好，` : ""}目前查不到此手機號碼的訂單。\n\n若您剛完成表單，請稍候工作人員建立訂單後再查詢。`,
      },
    ]);
    return;
  }

  const cards = recentOrders.map((order, index) => buildOrderCard(order, index));
  await replyMessage(replyToken, [
    {
      type: "flex",
      altText: `近期訂單狀況（共 ${recentOrders.length} 筆）`,
      contents: cards.length === 1 ? cards[0] : { type: "carousel", contents: cards },
    },
  ]);
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

    // 支援 Rich Menu 的文字訊息與 postback 指令
    const isTextMessage = event.type === "message" && event.message?.type === "text";
    const isPostback = event.type === "postback";
    if (!isTextMessage && !isPostback) continue;

    const userId = event.source?.userId;
    const replyToken = event.replyToken;
    const text = isTextMessage
      ? event.message.text.trim()
      : String(event.postback?.data || "").trim();

    // ── 查詢近期訂單狀態 ──
    if (isOrderStatusCommand(text)) {
      await replyRecentOrders(replyToken, userId);
      continue;
    }

    // 其他 postback 不進入電話綁定流程
    if (!isTextMessage) continue;

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
      .maybeSingle();

    if (existingByLine && normalizePhone(existingByLine.phone || "") === phone) {
      await replyMessage(replyToken, [
        {
          type: "text",
          text: `您的 LINE 帳號已綁定電話 ${existingByLine.phone}。\n\n可直接點選「目前訂單」查看近期訂單狀態；如需更換，請傳送新的手機號碼。`,
        },
      ]);
      continue;
    }

    // 在 orders 和 contacts 裡找這個電話
    const phoneVariants = getPhoneVariants(phone);
    const [ordersRes, contactsRes] = await Promise.all([
      supabase.from("orders").select("id, customer_name").in("customer_phone", phoneVariants).limit(1),
      supabase.from("contacts").select("id, name").in("phone", phoneVariants).limit(1),
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
      .in("phone", phoneVariants)
      .limit(1)
      .maybeSingle();

    let bindingError: { message: string } | null = null;
    if (existingByLine && existingByPhone && existingByLine.id !== existingByPhone.id) {
      // 新電話已有客戶紀錄：先解除舊紀錄，再把 LINE 資料移到新紀錄。
      const { error: detachError } = await supabase
        .from("customers")
        .update({
          line_user_id: null,
          line_display_name: null,
          line_picture_url: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingByLine.id);
      bindingError = detachError;
      if (!bindingError) {
        const { error: updateError } = await supabase
        .from("customers")
        .update({
          name: existingByPhone.name || customerName,
          line_user_id: userId,
          line_display_name: displayName,
          line_picture_url: pictureUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingByPhone.id);
        bindingError = updateError;
      }
      if (bindingError) {
        // 移轉失敗時盡量還原舊綁定，避免客戶失去查詢能力。
        await supabase
          .from("customers")
          .update({
            line_user_id: userId,
            line_display_name: existingByLine.line_display_name,
            line_picture_url: existingByLine.line_picture_url,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingByLine.id);
      }
    } else if (existingByLine) {
      // 已綁定的 LINE 帳號更換成通過核對的新電話。
      const { error } = await supabase
        .from("customers")
        .update({
          phone,
          name: existingByLine.name || customerName,
          line_display_name: displayName,
          line_picture_url: pictureUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingByLine.id);
      bindingError = error;
    } else if (existingByPhone) {
      // 新 LINE 帳號綁定到已有的電話紀錄。
      const { error } = await supabase
        .from("customers")
        .update({
          name: existingByPhone.name || customerName,
          line_user_id: userId,
          line_display_name: displayName,
          line_picture_url: pictureUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingByPhone.id);
      bindingError = error;
    } else {
      // 新增記錄
      const { error } = await supabase.from("customers").insert({
        phone,
        name: customerName,
        line_user_id: userId,
        line_display_name: displayName,
        line_picture_url: pictureUrl,
      });
      bindingError = error;
    }

    if (bindingError) {
      console.error("LINE customer binding error:", bindingError.message);
      await replyMessage(replyToken, [
        {
          type: "text",
          text: "電話綁定時發生問題，請稍後再試；若仍無法綁定，請直接留言由工作人員協助。",
        },
      ]);
      continue;
    }

    const nameText = customerName ? `您好，${customerName}！\n` : "";
    const bindingAction = existingByLine ? "換綁" : "綁定";
    await replyMessage(replyToken, [
      {
        type: "text",
        text: `✅ 電話${bindingAction}成功！\n\n${nameText}目前綁定電話為 ${phone}。現在可直接點選「目前訂單」查看近期訂單狀態。`,
      },
    ]);
  }

  return NextResponse.json({ status: "ok" });
}

// LINE Webhook 驗證用
export async function GET() {
  return NextResponse.json({ status: "LINE Webhook is running" });
}
