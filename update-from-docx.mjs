// update-from-docx.mjs - 用docx最新內容更新資料庫
const BASE_URL = 'http://localhost:3000';
const ADMIN_PWD = 'bes2024admin';

const updatedData = [
  { sort: 14, name: '升降發光啟動儀式', price: '200公分 $28,000 / 400公分 $35,000',
    service: '1. 附一名專業啟動儀式控師。\n2. 上方圓形燈片可替換為長條合成板。\n3. 圓形燈片與燈箱使用透光膜，輸出檔請於五個工作天內提供AI檔及JPG檔放雲端連結以利核對，若無法及時提供請與業務接洽。\n4. 上升與下降速度為固定，無法調整。\n5. 道具需提供電力110V。\n6. 提供無縫隙大屏發光燈箱，可無縫隙連接保持輸出完整性與多人長官可以使用。\n7. 升降發光啟動儀式200公分最多提供5個燈板。',
    notice: '1. 請提前告知是否需要及時上下舞台，如需此服務，請提供舞台高度。\n2. 圓形燈片升降時或會產生輕微機械聲響，建議配合現場音樂進行遮掩。\n3. 裝台時間約為 40 分鐘，需提供預留時間。\n4. 若活動場地不在一樓，請提供貨梯，並確保貨梯尺寸至少為 200*110*90 公分以上，以便安全運送道具。',
    yt: 'https://www.youtube.com/watch?v=D2kspHVaxoQ' },
  { sort: 15, name: '倒沙顯字', price: '$28,000',
    service: '1. 現場專業啟動儀式控師，確保儀式順利進行。\n2. 大圖輸出設計，讓活動主題或品牌一展無遺。\n3. 依照人數提供倒沙瓶，需活動前先確認使用人數。',
    notice: '1. 請提前告知是否需要及時上下舞台，如需此服務，請提供舞台高度。\n2. 請注意底圖輸出圖像，建議以素色為主；車貼貼圖避免圖示過小、過度複雜細節等等，金沙難以附著且無法施工。\n3. 此道具無法彩排為一次性產品。\n4. 裝台時間約為 1小時(現場張貼)，確保活動準時進行。\n5. 若活動場地不在一樓，請提供貨梯，並確保貨梯尺寸至少為 200*110*90 公分以上，以便安全運送道具。\n6. 倒沙顏色需提前與業務溝通。',
    yt: 'https://www.youtube.com/watch?v=vg7RHzd17P4' },
  { sort: 16, name: '七彩燈球柱', price: '$1,000 + 球 $300',
    service: '1. 提供專業啟動儀式遙控器，輕鬆掌控啟動流程。\n2. 自備電池無須提供電力。\n3. 提供完整啟動儀式教學視頻，讓您輕鬆上手操作。\n4. 如需控師至現場協助需增加控師費，五隻以上免控師費。',
    notice: '1. 道具顏色需在活動前預先調整好，活動進行中無法遠端變更顏色設定。\n2. 道具無輪子設計，需人工搬運，請提前做好準備。\n3. 啟動時只需輕輕觸碰，即可點亮道具，無需施加重壓。\n4. 此活動可以於戶外使用亮度係數高。',
    yt: 'https://www.youtube.com/watch?v=wvnShwsgwas' },
];

async function main() {
  const res = await fetch(`${BASE_URL}/api/admin?table=products`, {
    headers: { 'x-admin-password': ADMIN_PWD },
  });
  const { data: products } = await res.json();
  const sorted = products.sort((a, b) => a.sort_order - b.sort_order);

  let ok = 0;
  for (const update of updatedData) {
    const product = sorted[update.sort - 1];
    if (!product) continue;

    // 保留尺寸圖URL
    const sizeMatch = (product.description || '').match(/【尺寸圖】\n?(https:\/\/[^\s]+)/);
    
    const descParts = [];
    descParts.push(`【服務內容】\n${update.service}`);
    descParts.push(`【注意事項】\n${update.notice}`);
    descParts.push(`【YouTube】\n${update.yt}`);
    if (sizeMatch) descParts.push(`【尺寸圖】\n${sizeMatch[1]}`);
    const description = descParts.join('\n\n');

    const putRes = await fetch(`${BASE_URL}/api/admin`, {
      method: 'PUT',
      headers: { 'x-admin-password': ADMIN_PWD, 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: 'products', id: product.id, record: { description, price_note: update.price } }),
    });

    if (putRes.ok) {
      ok++;
      console.log(`OK: ${update.name}`);
    } else {
      console.log(`FAIL: ${update.name} - ${await putRes.text()}`);
    }
  }
  console.log(`\nDone: ${ok}/${updatedData.length} updated`);
}

main().catch(console.error);
