const LINE_ACCESS_TOKEN = (process.env.LINE_CHANNEL_ACCESS_TOKEN || '').replace(/[\uFEFF\u200B]/g, '').trim();

export async function pushCustomerQuotationLineMessage(
  userId: string,
  customerName: string,
  productName: string,
  downloadUrl: string,
) {
  if (!LINE_ACCESS_TOKEN) {
    return { ok: false, error: 'LINE_CHANNEL_ACCESS_TOKEN 未設定' };
  }

  const response = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${LINE_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      to: userId,
      messages: [{
        type: 'text',
        text: `${customerName} 您好，\n您預約「${productName}」的 PDF 報價單已完成。\n\n請點選以下連結查看或下載：\n${downloadUrl}\n\n若內容需要調整，歡迎直接回覆官方 LINE 與我們聯繫。`,
      }],
    }),
  });

  if (response.ok) return { ok: true as const };
  const detail = await response.text();
  console.error('Customer LINE quotation push failed:', response.status, detail);
  return { ok: false as const, error: `LINE 傳送失敗（${response.status}）` };
}
