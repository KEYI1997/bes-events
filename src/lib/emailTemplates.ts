/**
 * 境曜有限公司 BES Events — 共用 Email HTML 模板
 */

/** 品牌色 */
const PRIMARY = '#2C3E6B';   // 深藍
const CTA     = '#AA7452';   // 金棕
const BG      = '#F5F4F0';   // 米白背景
const WHITE   = '#FFFFFF';

/** 共用頁首 */
function emailHeader(title: string) {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="background:${PRIMARY};padding:28px 40px;">
      <tr>
        <td>
          <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.5);letter-spacing:2px;text-transform:uppercase;">BES EVENTS</p>
          <p style="margin:6px 0 0;font-size:22px;font-weight:700;color:${WHITE};">${title}</p>
        </td>
        <td align="right">
          <div style="width:42px;height:42px;background:${CTA};border-radius:4px;display:inline-flex;align-items:center;justify-content:center;">
            <span style="color:${WHITE};font-weight:900;font-size:18px;line-height:42px;display:block;text-align:center;">B</span>
          </div>
        </td>
      </tr>
    </table>
  `;
}

/** 共用頁尾 */
function emailFooter() {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="background:${PRIMARY};padding:24px 40px;">
      <tr>
        <td>
          <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.7);">境曜有限公司 BES Events</p>
          <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.45);">
            📞 0912-727-596　✉️ Jingyaoactivities@gmail.com
          </p>
          <p style="margin:12px 0 0;font-size:11px;color:rgba(255,255,255,0.3);">
            此為系統自動發送通知，請勿直接回覆此信件。
          </p>
        </td>
      </tr>
    </table>
  `;
}

/** 單一資訊列（label + value） */
function infoRow(label: string, value: string, shade = false) {
  const bg = shade ? '#F0EDE6' : WHITE;
  return `
    <tr style="background:${bg};">
      <td style="padding:12px 20px;font-size:13px;color:#888;font-weight:500;width:130px;white-space:nowrap;border-bottom:1px solid #EEE;">
        ${label}
      </td>
      <td style="padding:12px 20px;font-size:14px;color:${PRIMARY};border-bottom:1px solid #EEE;">
        ${value || '—'}
      </td>
    </tr>
  `;
}

/** ── 詢問單通知 Email ── */
export function contactEmailHtml(data: {
  name: string;
  phone: string;
  email?: string;
  service_type?: string;
  event_date?: string;
  event_end_date?: string;
  description?: string;
}) {
  const rows = [
    infoRow('姓名', data.name, false),
    infoRow('電話', data.phone, true),
    ...(data.email         ? [infoRow('Email',    data.email,         false)] : []),
    ...(data.service_type  ? [infoRow('服務類型', data.service_type,  true)]  : []),
    ...(data.event_date    ? [infoRow('活動起日', data.event_date,    false)] : []),
    ...(data.event_end_date? [infoRow('活動迄日', data.event_end_date,true)]  : []),
    ...(data.description   ? [infoRow('需求說明', data.description.replace(/\n/g,'<br>'), false)] : []),
  ].join('');

  return `<!DOCTYPE html>
<html lang="zh-TW">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${BG};font-family:'Helvetica Neue',Arial,'PingFang TC',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${WHITE};border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr><td>${emailHeader('新詢問單通知')}</td></tr>

        <!-- 提示文字 -->
        <tr><td style="padding:28px 40px 16px;background:${WHITE};">
          <p style="margin:0;font-size:15px;color:${PRIMARY};font-weight:600;">
            收到一筆新的客戶諮詢，請盡快回覆。
          </p>
          <div style="margin-top:12px;height:3px;background:${CTA};width:40px;border-radius:2px;"></div>
        </td></tr>

        <!-- 資訊表格 -->
        <tr><td style="padding:0 40px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #EEE;border-radius:6px;overflow:hidden;">
            ${rows}
          </table>
        </td></tr>

        <!-- CTA 按鈕 -->
        <tr><td style="padding:0 40px 36px;text-align:center;">
          <a href="https://besevent.com/admin/contacts"
             style="display:inline-block;padding:13px 36px;background:${CTA};color:${WHITE};text-decoration:none;border-radius:50px;font-size:14px;font-weight:600;letter-spacing:0.5px;">
            前往後台查看詢問單
          </a>
        </td></tr>

        <!-- Footer -->
        <tr><td>${emailFooter()}</td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/** ── 訂單通知 Email ── */
export function orderEmailHtml(data: {
  customer_name: string;
  customer_phone: string;
  product_name?: string;
  quantity?: number;
  borrow_date?: string;
  return_date?: string;
  event_name?: string;
  status?: string;
  note?: string;
}) {
  const rows = [
    infoRow('客戶姓名', data.customer_name, false),
    infoRow('聯絡電話', data.customer_phone, true),
    ...(data.product_name ? [infoRow('租借商品', data.product_name, false)] : []),
    ...(data.borrow_date  ? [infoRow('借出日期', data.borrow_date,  true)] : []),
    ...(data.return_date  ? [infoRow('歸還日期', data.return_date,  false)]  : []),
    ...(data.event_name   ? [infoRow('活動名稱', data.event_name,   true)] : []),
    ...(data.status       ? [infoRow('訂單狀態', data.status,       false)]  : []),
    ...(data.note         ? [infoRow('備註',     data.note.replace(/\n/g,'<br>'), true)] : []),
  ].join('');

  return `<!DOCTYPE html>
<html lang="zh-TW">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${BG};font-family:'Helvetica Neue',Arial,'PingFang TC',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${WHITE};border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr><td>${emailHeader('新訂單通知')}</td></tr>

        <!-- 提示文字 -->
        <tr><td style="padding:28px 40px 16px;background:${WHITE};">
          <p style="margin:0;font-size:15px;color:${PRIMARY};font-weight:600;">
            後台已新增一筆訂單，請確認並安排後續處理。
          </p>
          <div style="margin-top:12px;height:3px;background:${CTA};width:40px;border-radius:2px;"></div>
        </td></tr>

        <!-- 資訊表格 -->
        <tr><td style="padding:0 40px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #EEE;border-radius:6px;overflow:hidden;">
            ${rows}
          </table>
        </td></tr>

        <!-- CTA 按鈕 -->
        <tr><td style="padding:0 40px 36px;text-align:center;">
          <a href="https://besevent.com/admin/orders"
             style="display:inline-block;padding:13px 36px;background:${CTA};color:${WHITE};text-decoration:none;border-radius:50px;font-size:14px;font-weight:600;letter-spacing:0.5px;">
            前往後台查看訂單
          </a>
        </td></tr>

        <!-- Footer -->
        <tr><td>${emailFooter()}</td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
