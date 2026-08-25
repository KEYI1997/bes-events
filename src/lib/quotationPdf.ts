import fs from 'node:fs';
import path from 'node:path';
import PDFDocument from 'pdfkit';
import { type QuotationOrderData } from '@/lib/quotationWorkbook';
import { calculateQuotationTotals, createDefaultQuotationItems, normalizeQuotationItems } from '@/lib/quotationDraft';
import type { QuotationLineItem } from '@/lib/types';

const PAGE_WIDTH = 595.28;
const MARGIN = 34;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const BRAND = '#8E5F43';
const INK = '#373432';
const MUTED = '#756F6A';
const BORDER = '#CFC7C0';
const SOFT = '#F7F2EE';

function formatDate(value: string) { return value ? value.replace(/-/g, '/') : ''; }
function formatPhone(value?: string | null) {
  if (!value) return '';
  const digits = value.replace(/\D/g, '');
  return /^09\d{8}$/.test(digits) ? `${digits.slice(0, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}` : value;
}
function money(value: number) { return `NT$ ${Math.round(value).toLocaleString('en-US')}`; }
type CellOptions = PDFKit.Mixins.TextOptions & { background?: string; fillColor?: string; fontSize?: number };
function drawCell(doc: PDFKit.PDFDocument, value: string, x: number, y: number, width: number, height: number, options: CellOptions = {}) {
  const { background, fillColor = INK, fontSize = 8, ...textOptions } = options;
  if (background) doc.rect(x, y, width, height).fill(background);
  doc.rect(x, y, width, height).lineWidth(0.5).strokeColor(BORDER).stroke();
  doc.fontSize(fontSize).fillColor(fillColor);
  const textHeight = doc.heightOfString(value || ' ', { width: width - 8, ...textOptions });
  doc.text(value, x + 4, y + Math.max(2, (height - textHeight) / 2), { width: width - 8, height: height - 3, ellipsis: true, lineBreak: true, ...textOptions });
}
export type QuotationPdfData = QuotationOrderData & { customerEmail?: string | null; note?: string | null; quotationItems?: QuotationLineItem[] | null; quotationRevision?: number | null };

export async function buildQuotationPdf(order: QuotationPdfData): Promise<Buffer> {
  const fontPath = path.join(process.cwd(), 'public', 'fonts', 'NotoSansTC-Regular.otf');
  const logoPath = path.join(process.cwd(), 'public', 'templates', 'quotation-logo.png');
  const stampPath = path.join(process.cwd(), 'public', 'templates', 'quotation-stamp.jpg');
  if (!fs.existsSync(fontPath)) throw new Error('報價單中文字型不存在');
  const doc = new PDFDocument({ size: 'A4', font: fontPath, margins: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN }, info: { Title: `境曜活動租借報價單 - ${order.customerName}`, Author: '境曜有限公司', Subject: '活動服務報價單' }, compress: true });
  doc.registerFont('NotoSansTC', fontPath).font('NotoSansTC');
  const chunks: Buffer[] = [];
  doc.on('data', chunk => chunks.push(Buffer.from(chunk)));
  const completed = new Promise<Buffer>((resolve, reject) => { doc.on('end', () => resolve(Buffer.concat(chunks))); doc.on('error', reject); });

  if (fs.existsSync(logoPath)) doc.image(logoPath, MARGIN, 24, { fit: [88, 34], valign: 'center' });
  doc.fillColor(INK).fontSize(20).text('活動服務報價單', MARGIN, 24, { width: CONTENT_WIDTH, align: 'center', lineBreak: false });
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Taipei' }).format(new Date());
  doc.fillColor(MUTED).fontSize(7.5).text(`製表日期：${formatDate(today)}`, MARGIN, 52, { width: CONTENT_WIDTH, align: 'center' });
  doc.moveTo(MARGIN, 66).lineTo(PAGE_WIDTH - MARGIN, 66).lineWidth(1.1).strokeColor(BRAND).stroke();
  let y = 76;
  const labelW = 56; const valueW = (CONTENT_WIDTH - labelW * 2) / 2; const infoH = 21;
  const customerRows: Array<[string, string, string, string]> = [
    ['客戶名稱', order.customerName, '聯絡電話', formatPhone(order.customerPhone)],
    ['Email', order.customerEmail || '', '活動名稱', order.eventName || ''],
    ['服務日期', order.borrowDate === order.returnDate ? formatDate(order.borrowDate) : `${formatDate(order.borrowDate)}－${formatDate(order.returnDate)}`, '報價編號', `${order.orderCode || ''}${order.quotationRevision ? ` / v${order.quotationRevision}` : ''}`],
  ];
  for (const [l1, v1, l2, v2] of customerRows) {
    drawCell(doc, l1, MARGIN, y, labelW, infoH, { background: SOFT, align: 'center', fontSize: 7.5, fillColor: BRAND });
    drawCell(doc, v1, MARGIN + labelW, y, valueW, infoH, { fontSize: 7.5 });
    drawCell(doc, l2, MARGIN + labelW + valueW, y, labelW, infoH, { background: SOFT, align: 'center', fontSize: 7.5, fillColor: BRAND });
    drawCell(doc, v2, MARGIN + labelW * 2 + valueW, y, valueW, infoH, { fontSize: 7.5 }); y += infoH;
  }
  y += 8;
  const quotationItems = order.quotationItems ? normalizeQuotationItems(order.quotationItems) : createDefaultQuotationItems(order.productName, order.productPriceNote, order.quantity, order.eventName);
  const visibleItems = quotationItems.filter(item => item.label.trim() || item.unitPrice !== null || item.quantity !== null || item.note.trim());
  const relaxedLayout = visibleItems.length <= 4;
  const columns = [215, 78, 48, 94, CONTENT_WIDTH - 215 - 78 - 48 - 94];
  const headers = ['項目／服務內容', '單價', '數量', '金額', '備註'];
  let x = MARGIN;
  headers.forEach((header, i) => { drawCell(doc, header, x, y, columns[i], 22, { background: BRAND, fillColor: '#FFFFFF', align: 'center', fontSize: 7.5 }); x += columns[i]; }); y += 22;
  visibleItems.forEach((item, rowIndex) => {
    const lineTotal = item.unitPrice !== null && item.quantity !== null ? item.unitPrice * item.quantity : null;
    const row = [item.label, item.unitPrice === null ? '' : money(item.unitPrice), item.quantity === null ? '' : String(item.quantity), lineTotal === null ? '' : money(lineTotal), item.note];
    x = MARGIN; row.forEach((value, i) => { drawCell(doc, value, x, y, columns[i], 21, { align: i === 0 || i === 4 ? 'left' : 'center', fontSize: 7.2, background: rowIndex % 2 ? '#FCFAF8' : undefined }); x += columns[i]; }); y += 21;
  });
  const { subtotal: itemSubtotal, tax, total } = calculateQuotationTotals(quotationItems);
  const summaryLabelX = MARGIN + 300; const summaryLabelW = 76; const summaryValueW = CONTENT_WIDTH - 300 - summaryLabelW;
  y += 6;
  [['未稅小計', itemSubtotal === null ? '' : money(itemSubtotal)], ['營業稅 5%', tax === null ? '' : money(tax)], ['含稅總計', total === null ? '' : money(total)]].forEach(([label, value], i) => { const h = i === 2 ? 24 : 19; drawCell(doc, label, summaryLabelX, y, summaryLabelW, h, { background: i === 2 ? BRAND : SOFT, fillColor: i === 2 ? '#FFFFFF' : BRAND, align: 'center', fontSize: 7.5 }); drawCell(doc, value, summaryLabelX + summaryLabelW, y, summaryValueW, h, { align: 'right', fontSize: i === 2 ? 10 : 7.5, background: i === 2 ? '#FFF9F4' : undefined, fillColor: i === 2 ? BRAND : INK }); y += h; });

  const noteTop = y + (relaxedLayout ? 12 : 8);
  const noteHeight = relaxedLayout ? 64 : 48;
  doc.roundedRect(MARGIN, noteTop, CONTENT_WIDTH, noteHeight, 3).lineWidth(0.6).strokeColor(BORDER).stroke();
  doc.fillColor(BRAND).fontSize(relaxedLayout ? 10 : 9).text('付款與報價說明', MARGIN + 8, noteTop + 8);
  const deposit = total === null ? '金額由管理者確認後填入' : `${money(Math.round(total / 2))}（含稅總額 50%）`;
  const noteLines = [`• 訂金：${deposit}`, '• 報價有效期限為製表日起 7 日；檔期以完成訂金付款為保留依據。', '• 空白費用欄位供管理者依現場需求補填，最終金額以雙方確認版本為準。'];
  if (order.note) noteLines.push(`• 訂單備註：${order.note}`);
  doc.fillColor(INK).fontSize(relaxedLayout ? 7.6 : 6.4).text(noteLines.join('\n'), MARGIN + 8, noteTop + (relaxedLayout ? 25 : 19), { width: CONTENT_WIDTH - 16, lineGap: relaxedLayout ? 2 : 0, height: noteHeight - 28, ellipsis: true });

  const sectionY = noteTop + noteHeight + (relaxedLayout ? 16 : 11);
  doc.moveTo(MARGIN, sectionY - 5).lineTo(PAGE_WIDTH - MARGIN, sectionY - 5).lineWidth(0.8).strokeColor(BRAND).stroke();
  doc.fillColor(INK).fontSize(relaxedLayout ? 14 : 12).text('回簽前請詳閱說明', MARGIN, sectionY, { width: CONTENT_WIDTH, align: 'center' });
  doc.fillColor(MUTED).fontSize(8).text('本頁為報價單之一部分，簽署或付款即表示同意以下約定。', MARGIN, sectionY + (relaxedLayout ? 22 : 18), { width: CONTENT_WIDTH, align: 'center' });
  const terms = ['本報價依目前需求提供，內容如有變更需另行報價，報價有效期限為 7 日。', '簽署或支付訂金後視為訂單成立，訂金 50%，尾款於活動前或當日結清。', '活動日前 30 日取消全額退款，14–30 日退 50%，14 日內取消恕不退款。', '改期以一次為限，需於活動日前 14 日提出。', '活動內容須於 7 日前確認，現場執行以報價單內容為準，新增需求另計。', '若因客戶因素（延遲、流程變更等）導致超時，將酌收延時費用。', '設備租借期間應妥善保管，如有損壞或遺失需照價賠償。', '客戶需準時提供資料，如延誤導致執行影響，本公司不負相關責任。', '天災等不可抗力因素，雙方另行協議處理。'];
  let termY = sectionY + (relaxedLayout ? 39 : 32);
  const termStep = relaxedLayout ? 19 : 16;
  const termFontSize = 8;
  terms.forEach((term, i) => { doc.fillColor(BRAND).fontSize(termFontSize).text(`${i + 1}.`, MARGIN, termY, { width: 17, align: 'right' }); doc.fillColor(INK).fontSize(termFontSize).text(term, MARGIN + 22, termY, { width: CONTENT_WIDTH - 22, lineGap: 0 }); termY += termStep; });

  const signatureTop = termY + (relaxedLayout ? 10 : 6); const signatureGap = 12; const signatureWidth = (CONTENT_WIDTH - signatureGap) / 2;
  const signatureHeight = relaxedLayout ? 99 : 75;
  doc.roundedRect(MARGIN, signatureTop, signatureWidth, signatureHeight, 3).lineWidth(0.6).strokeColor(BORDER).stroke();
  doc.roundedRect(MARGIN + signatureWidth + signatureGap, signatureTop, signatureWidth, signatureHeight, 3).lineWidth(0.6).strokeColor(BORDER).stroke();
  doc.fillColor(BRAND).fontSize(relaxedLayout ? 10 : 9).text('廠商簽章', MARGIN + 8, signatureTop + 10, { width: signatureWidth - 16, align: 'center' });
  doc.fillColor(BRAND).fontSize(relaxedLayout ? 10 : 9).text('客戶簽章', MARGIN + signatureWidth + signatureGap + 8, signatureTop + 10, { width: signatureWidth - 16, align: 'center' });
  if (fs.existsSync(stampPath)) doc.image(stampPath, MARGIN + 39, signatureTop + (relaxedLayout ? 31 : 24), { fit: relaxedLayout ? [90, 58] : [82, 48], align: 'center', valign: 'center' });
  const customerSignX = MARGIN + signatureWidth + signatureGap + 18;
  const signatureLineY = signatureTop + (relaxedLayout ? 78 : 59);
  doc.moveTo(customerSignX, signatureLineY).lineTo(customerSignX + signatureWidth - 36, signatureLineY).lineWidth(0.5).strokeColor(BORDER).stroke();
  doc.fillColor(MUTED).fontSize(relaxedLayout ? 7 : 6.2).text('簽名／蓋章', customerSignX, signatureLineY + 4, { width: signatureWidth - 36, align: 'center' });
  const bankTop = signatureTop + signatureHeight + (relaxedLayout ? 12 : 7);
  const bankHeight = relaxedLayout ? 42 : 30;
  doc.roundedRect(MARGIN, bankTop, CONTENT_WIDTH, bankHeight, 3).fill(SOFT);
  doc.fillColor(BRAND).fontSize(relaxedLayout ? 8 : 7).text('匯款資訊', MARGIN + 8, bankTop + (relaxedLayout ? 10 : 7), { width: 56 });
  doc.fillColor(INK).fontSize(relaxedLayout ? 7.2 : 6.4).text('戶名：境曜有限公司｜國泰世華銀行（013）古亭分行｜帳號：030035016755', MARGIN + 66, bankTop + (relaxedLayout ? 9 : 6), { width: CONTENT_WIDTH - 76 });
  doc.fillColor(MUTED).fontSize(relaxedLayout ? 6.5 : 5.8).text('匯款後請提供帳號末五碼，方便工作人員核對。', MARGIN + 66, bankTop + (relaxedLayout ? 25 : 18), { width: CONTENT_WIDTH - 76 });
  const footerY = bankTop + bankHeight + (relaxedLayout ? 12 : 10);
  doc.moveTo(MARGIN, footerY - 7).lineTo(PAGE_WIDTH - MARGIN, footerY - 7).lineWidth(0.5).strokeColor(BORDER).stroke();
  doc.fillColor(MUTED).fontSize(6.2).text('境曜有限公司｜電話 0912-727-596｜Email Jingyaoactivities@gmail.com｜官方 LINE @040kolkv', MARGIN, footerY, { width: CONTENT_WIDTH, align: 'center', lineBreak: false });
  doc.end();
  return completed;
}
