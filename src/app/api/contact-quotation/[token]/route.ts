import { NextRequest, NextResponse } from 'next/server';
import { buildContactQuotationPdf, loadContactQuotationSource } from '@/lib/contactQuotation';
import { loadContactIdByQuotationToken } from '@/lib/contactQuotationStorage';
import { getServiceClient } from '@/lib/supabase';

export const runtime = 'nodejs';

function filenamePart(value: string) {
  return value.replace(/[\\/:*?"<>|\r\n]/g, '_').trim().slice(0, 40) || '客戶';
}

export async function GET(_request: NextRequest, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(token)) return NextResponse.json({ error: '報價單連結無效' }, { status: 404 });
  try {
    const supabase = getServiceClient();
    const contactId = await loadContactIdByQuotationToken(supabase, token);
    if (!contactId) return NextResponse.json({ error: '找不到此報價單' }, { status: 404 });
    const { contact, stored } = await loadContactQuotationSource(contactId);
    if (!stored?.publicProductId || !stored.publicItems) return NextResponse.json({ error: '此報價單尚未公開' }, { status: 404 });
    const { product } = await loadContactQuotationSource(contactId, stored.publicProductId);
    if (!product) return NextResponse.json({ error: '找不到報價商品' }, { status: 404 });
    const pdf = await buildContactQuotationPdf(contact, product, stored, true);
    const filename = `報價單-${filenamePart(contact.name)}-${filenamePart(product.name)}.pdf`;
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="quotation.pdf"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        'Cache-Control': 'private, no-store, max-age=0',
        'X-Robots-Tag': 'noindex, nofollow, noarchive',
      },
    });
  } catch {
    return NextResponse.json({ error: '產生 PDF 報價單失敗' }, { status: 500 });
  }
}
