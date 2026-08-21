import ExcelJS from 'exceljs';

export interface QuotationOrderData {
  orderCode?: string | null;
  customerName: string;
  customerPhone?: string | null;
  quantity: number;
  borrowDate: string;
  returnDate: string;
  eventName?: string | null;
  productName: string;
  productPriceNote?: string | null;
}

function parsePositiveAmount(value: string) {
  const amount = Number(value.replace(/,/g, ''));
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

export function extractQuotationUnitPrice(priceNote?: string | null) {
  if (!priceNote) return null;

  const normalized = priceNote.replace(/，/g, ',').trim();
  if (/洽詢|面議|另議|未定|無價|請來電/.test(normalized)) return null;

  const salePrice = normalized.match(/優惠價\s*[:：]?\s*(?:NT\s*\$?|TWD\s*)?([0-9][0-9,]*)/i);
  if (salePrice) return parsePositiveAmount(salePrice[1]);

  const currencyPrice = normalized.match(/(?:NT\s*\$?|TWD|\$)\s*([0-9][0-9,]*)/i);
  if (currencyPrice) return parsePositiveAmount(currencyPrice[1]);

  const plainPrice = normalized.match(/^\s*([0-9][0-9,]*)\s*元?\s*$/);
  return plainPrice ? parsePositiveAmount(plainPrice[1]) : null;
}

function formatQuotationDate(value: string) {
  return value.replace(/-/g, '/');
}

function formatPhone(value?: string | null) {
  if (!value) return '';
  const digits = value.replace(/\D/g, '');
  if (/^09\d{8}$/.test(digits)) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return value;
}

export async function buildQuotationWorkbook(template: Buffer, order: QuotationOrderData) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(template as unknown as ArrayBuffer);

  const sheet = workbook.getWorksheet('工作表1') ?? workbook.worksheets[0];
  if (!sheet) throw new Error('報價單範本缺少工作表');

  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Taipei' })
    .format(new Date())
    .replace(/-/g, '/');
  const dateRange = order.borrowDate === order.returnDate
    ? formatQuotationDate(order.borrowDate)
    : `${formatQuotationDate(order.borrowDate)}－${formatQuotationDate(order.returnDate)}`;
  const unitPrice = extractQuotationUnitPrice(order.productPriceNote);
  const subtotal = unitPrice === null ? null : unitPrice * order.quantity;
  const tax = subtotal === null ? null : Math.round(subtotal * 0.05);
  const total = subtotal === null || tax === null ? null : subtotal + tax;
  const depositText = total === null
    ? '確認款項後，請匯款訂金(50%) $_____，並簽名回傳報價單'
    : `確認款項後，請匯款訂金(50%) $${Math.round(total / 2)}，並簽名回傳報價單`;

  sheet.getCell('I1').value = `製表日期：${today}`;
  sheet.getCell('F10').value = order.customerName;
  sheet.getCell('I12').value = order.customerName;
  sheet.getCell('I14').value = formatPhone(order.customerPhone);
  sheet.getCell('F16').value = dateRange;
  sheet.getCell('C18').value = order.orderCode || '';

  sheet.getCell('B24').value = order.productName;
  sheet.getCell('E24').value = unitPrice;
  sheet.getCell('F24').value = order.quantity;
  sheet.getCell('H24').value = order.eventName || '';

  const itemRows = [24, 26, 28, 30, 32, 34, 36, 38];
  for (const row of itemRows) {
    const rowTotal = row === 24 ? subtotal : null;
    sheet.getCell(`G${row}`).value = {
      formula: `IF(OR(E${row}="",F${row}=""),"",E${row}*F${row})`,
      result: rowTotal ?? '',
    };
  }

  sheet.getCell('B26').value = '運費';
  sheet.getCell('B28').value = '人員交通費';
  sheet.getCell('B30').value = '搬運／樓層費';
  sheet.getCell('B32').value = '其他加購';
  sheet.getCell('B34').value = null;
  sheet.getCell('B36').value = null;
  sheet.getCell('B38').value = null;

  sheet.getCell('I42').value = {
    formula: 'IF(COUNT(G24:G38)=0,"",SUM(G24:G38))',
    result: subtotal ?? '',
  };
  sheet.getCell('I44').value = {
    formula: 'IF(I42="","",ROUND(I42*0.05,0))',
    result: tax ?? '',
  };
  sheet.getCell('I46').value = {
    formula: 'IF(I42="","",I42+I44)',
    result: total ?? '',
  };
  sheet.getCell('C42').value = {
    formula: 'IF(I46="","確認款項後，請匯款訂金(50%) $_____，並簽名回傳報價單","確認款項後，請匯款訂金(50%) $"&ROUND(I46/2,0)&"，並簽名回傳報價單")',
    result: depositText,
  };

  workbook.calcProperties.fullCalcOnLoad = true;

  return Buffer.from(await workbook.xlsx.writeBuffer());
}
