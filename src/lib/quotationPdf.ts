import fs from 'node:fs';
import path from 'node:path';
import PDFDocument from 'pdfkit';
import { extractQuotationUnitPrice, type QuotationOrderData } from '@/lib/quotationWorkbook';

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 42;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const BRAND = '#8E5F43';
const INK = '#373432';
const MUTED = '#756F6A';
const BORDER = '#CFC7C0';
const SOFT = '#F7F2EE';

function formatDate(value: string) {
  return value ? value.replace(/-/g, '/') : '';
}

function formatPhone(value?: string | null) {
  if (!value) return '';
  const digits = value.replace(/\D/g, '');
  if (/^09\d{8}$/.test(digits)) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return value;
}

function money(value: number) {
  return `NT$ ${Math.round(value).toLocaleString('en-US')}`;
}

type CellOptions = PDFKit.Mixins.TextOptions & {
  background?: string;
  fillColor?: string;
  fontSize?: number;
};

function textInCell(
  doc: PDFKit.PDFDocument,
  value: string,
  x: number,
  y: number,
  width: number,
  height: number,
  options: CellOptions = {},
) {
  const fontSize = options.fontSize ?? 9;
  const fillColor = options.fillColor ?? INK;
  const textOptions = { ...options };
  delete textOptions.fontSize;
  delete textOptions.fillColor;
  delete textOptions.background;
  doc.fontSize(fontSize).fillColor(fillColor);
  const textHeight = doc.heightOfString(value, { width: width - 12, ...textOptions });
  doc.text(value, x + 6, y + Math.max(4, (height - textHeight) / 2), {
    width: width - 12,
    height: height - 6,
    ellipsis: true,
    lineBreak: true,
    ...textOptions,
  });
}

function drawCell(
  doc: PDFKit.PDFDocument,
  value: string,
  x: number,
  y: number,
  width: number,
  height: number,
  options: CellOptions = {},
) {
  if (options.background) doc.rect(x, y, width, height).fill(options.background);
  doc.rect(x, y, width, height).lineWidth(0.6).strokeColor(BORDER).stroke();
  textInCell(doc, value, x, y, width, height, options);
}

export type QuotationPdfData = QuotationOrderData & {
  customerEmail?: string | null;
  note?: string | null;
};

export async function buildQuotationPdf(order: QuotationPdfData): Promise<Buffer> {
  const fontPath = path.join(process.cwd(), 'public', 'fonts', 'NotoSansTC-Regular.otf');
  const logoPath = path.join(process.cwd(), 'public', 'templates', 'quotation-logo.png');
  const stampPath = path.join(process.cwd(), 'public', 'templates', 'quotation-stamp.jpg');
  if (!fs.existsSync(fontPath)) throw new Error('報價單中文字型不存在');

  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN },
    info: {
      Title: `境曜活動租借報價單 - ${order.customerName}`,
      Author: '境曜有限公司',
      Subject: '活動服務報價單',
    },
    compress: true,
  });
  doc.registerFont('NotoSansTC', fontPath);
  doc.font('NotoSansTC');

  const chunks: Buffer[] = [];
  doc.on('data', chunk => chunks.push(Buffer.from(chunk)));
  const completed = new Promise<Buffer>((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });

  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, MARGIN, 34, { fit: [128, 52], valign: 'center' });
  }
  doc.fillColor(INK).fontSize(22).text('活動服務報價單', 245, 40, { width: 308, align: 'right' });
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Taipei' }).format(new Date());
  doc.fillColor(MUTED).fontSize(9).text(`製表日期：${formatDate(today)}`, 330, 70, { width: 223, align: 'right' });
  doc.moveTo(MARGIN, 94).lineTo(PAGE_WIDTH - MARGIN, 94).lineWidth(1.4).strokeColor(BRAND).stroke();

  let y = 108;
  const labelW = 62;
  const valueW = (CONTENT_WIDTH - labelW * 2) / 2;
  const infoH = 28;
  const customerRows: Array<[string, string, string, string]> = [
    ['客戶名稱', order.customerName, '聯絡電話', formatPhone(order.customerPhone)],
    ['Email', order.customerEmail || '', '活動名稱', order.eventName || ''],
    ['服務日期', order.borrowDate === order.returnDate
      ? formatDate(order.borrowDate)
      : `${formatDate(order.borrowDate)}－${formatDate(order.returnDate)}`, '報價編號', order.orderCode || ''],
  ];
  for (const [l1, v1, l2, v2] of customerRows) {
    drawCell(doc, l1, MARGIN, y, labelW, infoH, { background: SOFT, align: 'center', fontSize: 9, fillColor: BRAND });
    drawCell(doc, v1, MARGIN + labelW, y, valueW, infoH, { fontSize: 9 });
    drawCell(doc, l2, MARGIN + labelW + valueW, y, labelW, infoH, { background: SOFT, align: 'center', fontSize: 9, fillColor: BRAND });
    drawCell(doc, v2, MARGIN + labelW * 2 + valueW, y, valueW, infoH, { fontSize: 9 });
    y += infoH;
  }

  y += 16;
  const columns = [206, 78, 52, 95, 80];
  const headers = ['項目／服務內容', '單價', '數量', '金額', '備註'];
  let x = MARGIN;
  for (let i = 0; i < headers.length; i += 1) {
    drawCell(doc, headers[i], x, y, columns[i], 28, { background: BRAND, fillColor: '#FFFFFF', align: 'center', fontSize: 9 });
    x += columns[i];
  }
  y += 28;

  const unitPrice = extractQuotationUnitPrice(order.productPriceNote);
  const itemSubtotal = unitPrice === null ? null : unitPrice * order.quantity;
  const itemRows: Array<[string, string, string, string, string]> = [
    [order.productName, unitPrice === null ? '' : money(unitPrice), String(order.quantity), itemSubtotal === null ? '' : money(itemSubtotal), order.eventName || ''],
    ['運費', '', '', '', ''],
    ['人員交通費', '', '', '', ''],
    ['搬運／樓層費', '', '', '', ''],
    ['其他加購', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
  ];
  const rowH = 28;
  itemRows.forEach((row, rowIndex) => {
    x = MARGIN;
    row.forEach((value, index) => {
      drawCell(doc, value, x, y, columns[index], rowH, {
        align: index === 0 || index === 4 ? 'left' : 'center',
        fontSize: rowIndex === 0 ? 9 : 8.5,
        background: rowIndex % 2 === 1 ? '#FCFAF8' : undefined,
      });
      x += columns[index];
    });
    y += rowH;
  });

  y += 10;
  const summaryLabelX = MARGIN + 286;
  const summaryLabelW = 82;
  const summaryValueW = CONTENT_WIDTH - 286 - summaryLabelW;
  const tax = itemSubtotal === null ? null : Math.round(itemSubtotal * 0.05);
  const total = itemSubtotal === null || tax === null ? null : itemSubtotal + tax;
  const summaries: Array<[string, string]> = [
    ['未稅小計', itemSubtotal === null ? '' : money(itemSubtotal)],
    ['營業稅 5%', tax === null ? '' : money(tax)],
    ['含稅總計', total === null ? '' : money(total)],
  ];
  summaries.forEach(([label, value], index) => {
    const height = index === 2 ? 31 : 25;
    drawCell(doc, label, summaryLabelX, y, summaryLabelW, height, {
      background: index === 2 ? BRAND : SOFT,
      fillColor: index === 2 ? '#FFFFFF' : BRAND,
      align: 'center',
      fontSize: 9,
    });
    drawCell(doc, value, summaryLabelX + summaryLabelW, y, summaryValueW, height, {
      align: 'right',
      fontSize: index === 2 ? 12 : 9,
      background: index === 2 ? '#FFF9F4' : undefined,
      fillColor: index === 2 ? BRAND : INK,
    });
    y += height;
  });

  const noteTop = y + 12;
  const noteWidth = CONTENT_WIDTH;
  doc.roundedRect(MARGIN, noteTop, noteWidth, 88, 4).lineWidth(0.7).strokeColor(BORDER).stroke();
  doc.fillColor(BRAND).fontSize(10).text('付款與報價說明', MARGIN + 10, noteTop + 9);
  const deposit = total === null ? '金額由管理者確認後填入' : `${money(Math.round(total / 2))}（含稅總額 50%）`;
  const noteLines = [
    `• 訂金：${deposit}`,
    '• 報價有效期限為製表日起 7 日；檔期以完成訂金付款為保留依據。',
    '• 空白費用欄位供管理者依現場需求補填，最終金額以雙方確認版本為準。',
  ];
  if (order.note) noteLines.push(`• 訂單備註：${order.note}`);
  doc.fillColor(INK).fontSize(8.2).text(noteLines.join('\n'), MARGIN + 10, noteTop + 29, {
    width: noteWidth - 20,
    lineGap: 2,
    height: 52,
    ellipsis: true,
  });

  const footerY = PAGE_HEIGHT - 67;
  doc.moveTo(MARGIN, footerY - 10).lineTo(PAGE_WIDTH - MARGIN, footerY - 10).lineWidth(0.7).strokeColor(BORDER).stroke();
  doc.fillColor(MUTED).fontSize(7.5).text(
    '境曜有限公司｜電話 0912-727-596｜Email Jingyaoactivities@gmail.com｜官方 LINE @040kolkv',
    MARGIN,
    footerY,
    { width: CONTENT_WIDTH, align: 'center', lineBreak: false },
  );

  doc.addPage({ size: 'A4', margins: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN } });
  doc.fillColor(INK).fontSize(19).text('回簽前請詳閱說明', MARGIN, 46, { width: CONTENT_WIDTH });
  doc.fillColor(MUTED).fontSize(8).text('本頁為報價單之一部分，簽署或付款即表示同意以下約定。', MARGIN, 75, { width: CONTENT_WIDTH });
  doc.moveTo(MARGIN, 96).lineTo(PAGE_WIDTH - MARGIN, 96).lineWidth(1.2).strokeColor(BRAND).stroke();

  const terms = [
    '本報價依目前需求提供，內容如有變更需另行報價，報價有效期限為 7 日。',
    '簽署或支付訂金後視為訂單成立，訂金 50%，尾款於活動前或當日結清。',
    '活動日前 30 日取消全額退款，14–30 日退 50%，14 日內取消恕不退款。',
    '改期以一次為限，需於活動日前 14 日提出。',
    '活動內容須於 7 日前確認，現場執行以報價單內容為準，新增需求另計。',
    '若因客戶因素（延遲、流程變更等）導致超時，將酌收延時費用。',
    '設備租借期間應妥善保管，如有損壞或遺失需照價賠償。',
    '客戶需準時提供資料，如延誤導致執行影響，本公司不負相關責任。',
    '天災等不可抗力因素，雙方另行協議處理。',
  ];
  let termY = 119;
  terms.forEach((term, index) => {
    doc.fillColor(BRAND).fontSize(9).text(`${index + 1}.`, MARGIN + 2, termY, { width: 22, align: 'right' });
    const termHeight = doc.heightOfString(term, { width: CONTENT_WIDTH - 36, lineGap: 3 });
    doc.fillColor(INK).fontSize(9).text(term, MARGIN + 32, termY, { width: CONTENT_WIDTH - 36, lineGap: 3 });
    termY += Math.max(31, termHeight + 12);
  });

  const signatureTop = Math.max(485, termY + 24);
  const signatureGap = 18;
  const signatureWidth = (CONTENT_WIDTH - signatureGap) / 2;
  doc.roundedRect(MARGIN, signatureTop, signatureWidth, 142, 4).lineWidth(0.7).strokeColor(BORDER).stroke();
  doc.roundedRect(MARGIN + signatureWidth + signatureGap, signatureTop, signatureWidth, 142, 4).lineWidth(0.7).strokeColor(BORDER).stroke();
  doc.fillColor(BRAND).fontSize(10).text('廠商簽章', MARGIN + 10, signatureTop + 10, { width: signatureWidth - 20, align: 'center' });
  doc.fillColor(BRAND).fontSize(10).text('客戶簽章', MARGIN + signatureWidth + signatureGap + 10, signatureTop + 10, { width: signatureWidth - 20, align: 'center' });
  if (fs.existsSync(stampPath)) {
    doc.image(stampPath, MARGIN + 71, signatureTop + 39, { fit: [106, 78], align: 'center', valign: 'center' });
  }
  const customerSignX = MARGIN + signatureWidth + signatureGap + 24;
  doc.moveTo(customerSignX, signatureTop + 111).lineTo(customerSignX + signatureWidth - 48, signatureTop + 111).lineWidth(0.6).strokeColor(BORDER).stroke();
  doc.fillColor(MUTED).fontSize(7.5).text('簽名／蓋章', customerSignX, signatureTop + 117, { width: signatureWidth - 48, align: 'center' });

  const bankTop = signatureTop + 164;
  doc.roundedRect(MARGIN, bankTop, CONTENT_WIDTH, 55, 4).fill(SOFT);
  doc.fillColor(BRAND).fontSize(9).text('匯款資訊', MARGIN + 12, bankTop + 10, { width: 62 });
  doc.fillColor(INK).fontSize(9).text('戶名：境曜有限公司｜國泰世華銀行（013）古亭分行｜帳號：030035016755', MARGIN + 78, bankTop + 10, { width: CONTENT_WIDTH - 90 });
  doc.fillColor(MUTED).fontSize(7.5).text('匯款後請提供帳號末五碼，方便工作人員核對。', MARGIN + 78, bankTop + 31, { width: CONTENT_WIDTH - 90 });

  const secondFooterY = PAGE_HEIGHT - 55;
  doc.moveTo(MARGIN, secondFooterY - 10).lineTo(PAGE_WIDTH - MARGIN, secondFooterY - 10).lineWidth(0.7).strokeColor(BORDER).stroke();
  doc.fillColor(MUTED).fontSize(7.5).text('境曜有限公司｜Bright Events Services', MARGIN, secondFooterY, {
    width: CONTENT_WIDTH,
    align: 'center',
    lineBreak: false,
  });

  doc.end();
  return completed;
}
