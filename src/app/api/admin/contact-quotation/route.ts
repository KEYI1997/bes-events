import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { buildContactQuotationPdf, contactQuotationItems, loadContactQuotationSource } from '@/lib/contactQuotation';
import { pushCustomerQuotationLineMessage } from '@/lib/customerLineNotifications';
import { saveContactQuotationToken, saveStoredContactQuotationDraft } from '@/lib/contactQuotationStorage';
import { getTaiwanPhoneVariants, normalizeTaiwanPhone } from '@/lib/phone';

export const runtime = 'nodejs';

function filenamePart(value: string) {
  return value.replace(/[\\/:*?"<>|\r\n]/g, '_').trim().slice(0, 40) || '客戶';
}

function quotationFilename(customerName: string, productName: string) {
  return `報價單-${filenamePart(customerName)}-${filenamePart(productName)}.pdf`;
}

export async function GET(request: NextRequest) {
  if (!await verifyAdminRequest(request)) return NextResponse.json({ error: '未授權' }, { status: 401 });
  const id = request.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: '缺少諮詢 id' }, { status: 400 });
  try {
    const { contact, product, stored } = await loadContactQuotationSource(id);
    if (!product || !stored) return NextResponse.json({ error: '請先編輯並儲存報價單' }, { status: 400 });
    const pdf = await buildContactQuotationPdf(contact, product, stored);
    const filename = quotationFilename(contact.name, product.name);
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="quotation.pdf"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : '產生報價單失敗' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!await verifyAdminRequest(request)) return NextResponse.json({ error: '未授權' }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const id = typeof body.id === 'string' ? body.id : '';
  if (!id) return NextResponse.json({ error: '缺少諮詢 id' }, { status: 400 });

  try {
    const { contact, product, stored, supabase } = await loadContactQuotationSource(id);
    if (!product || !stored) return NextResponse.json({ error: '請先編輯並儲存報價單' }, { status: 400 });
    if (contact.status === 'converted') return NextResponse.json({ error: '此諮詢已轉為正式訂單' }, { status: 400 });
    const pdf = await buildContactQuotationPdf(contact, product, stored);
    const filename = quotationFilename(contact.name, product.name);
    const normalizedPhone = normalizeTaiwanPhone(contact.phone);
    let lineUserId = '';
    if (normalizedPhone) {
      const { data: customer } = await supabase
        .from('customers')
        .select('line_user_id')
        .in('phone', getTaiwanPhoneVariants(normalizedPhone))
        .not('line_user_id', 'is', null)
        .limit(1)
        .maybeSingle();
      lineUserId = customer?.line_user_id || '';
    }
    const hasEmail = Boolean(contact.email?.trim());
    const hasLine = Boolean(lineUserId);
    if (!hasEmail && !hasLine) {
      return NextResponse.json({ error: '此諮詢沒有 Email，也沒有綁定官方 LINE；請下載 PDF 後自行寄送。' }, { status: 400 });
    }

    const emailResult: { available: boolean; sent: boolean; error?: string } = { available: hasEmail, sent: false };
    const lineResult: { available: boolean; sent: boolean; error?: string } = { available: hasLine, sent: false };
    const now = new Date().toISOString();
    const token = stored.token || randomUUID();

    if (hasEmail) {
      const resendKey = (process.env.RESEND_API_KEY || '').trim();
      if (!resendKey) emailResult.error = 'RESEND_API_KEY 未設定';
      else {
        const resend = new Resend(resendKey);
        const { error } = await resend.emails.send({
          from: '境曜活動通知 <noreply@besevent.com>',
          replyTo: 'Jingyaoactivities@gmail.com',
          to: [contact.email!.trim()],
          subject: '【境曜有限公司】活動服務報價單｜敬請確認並簽回',
          html: `<p>${contact.name} 您好：</p><p>感謝您對境曜有限公司的詢問與信任。</p><p>附件為本次活動之<strong>服務報價單</strong>，報價內容已依目前確認之活動需求、日期及服務項目製作，敬請查收。</p><p>若報價內容確認無誤，<strong>請於報價單簽名／用印後回傳予本公司</strong>。本公司收到簽回之報價單並確認後，始視為訂單正式成立，並進行後續檔期保留及相關作業安排。</p><p>後續如需確認活動內容、執行細節或掌握活動相關訊息，也歡迎加入我們的 <strong>LINE 官方帳號</strong>。<br><strong>LINE 官方帳號：@040kolkv</strong>【<a href="https://lin.ee/q9CrPsv">加入 BES LINE 官方帳號</a>】</p><p>如對報價內容有任何疑問，歡迎隨時與我們聯繫。</p><br><p>境曜有限公司 | <strong>Bright Events Services</strong></p>`,
          attachments: [{ filename, content: pdf }],
        });
        if (error) emailResult.error = error.message;
        else emailResult.sent = true;
      }
    }

    if (hasLine) {
      await saveContactQuotationToken(supabase, token, id);
      const origin = (process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin).replace(/\/$/, '');
      const result = await pushCustomerQuotationLineMessage(lineUserId, contact.name, product.name, `${origin}/api/contact-quotation/${token}`);
      lineResult.sent = result.ok;
      if (!result.ok) lineResult.error = result.error;
    }

    const sent = emailResult.sent || lineResult.sent;
    if (sent) {
      const items = contactQuotationItems(contact, product, stored);
      await saveStoredContactQuotationDraft(supabase, id, {
        ...stored,
        token,
        sentAt: now,
        sentRevision: stored.revision,
        publicProductId: product.id,
        publicItems: items,
        publicCustomTotal: stored.customTotal ?? null,
        publicCustomerTaxId: stored.customerTaxId || '',
        publicCustomerAddress: stored.customerAddress || '',
        publicRevision: stored.revision,
      });
    }
    return NextResponse.json({ sent, email: emailResult, line: lineResult, sentAt: sent ? now : null }, { status: sent ? 200 : 502 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : '傳送報價單失敗' }, { status: 500 });
  }
}
