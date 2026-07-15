// add-all-products.mjs
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3000';
const ADMIN_PWD = 'bes2024admin';
const IMG_BASE = String.raw`C:\Users\User\OneDrive\Desktop\客戶管理\08-境曜有限公司\網站架設\啟動儀式商品\商品資訊`;

async function uploadFile(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const fileBuffer = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);
  const blob = new Blob([fileBuffer]);
  const formData = new FormData();
  formData.append('file', blob, fileName);
  formData.append('folder', 'products');
  try {
    const res = await fetch(`${BASE_URL}/api/upload`, {
      method: 'POST',
      headers: { 'x-admin-password': ADMIN_PWD },
      body: formData,
    });
    const json = await res.json();
    return json.url || null;
  } catch { return null; }
}

const products = [
  { name: 'LED 3D魔方啟動儀式', folder: 'LED 3D魔方啟動儀式', price: '$36,000', yt: 'https://www.youtube.com/watch?v=IEE9RouVA-A',
    service: '1. 現場專業啟動儀式控師，確保儀式順利進行。\n2. 五面皆可呈現畫面。\n3. 可正面展示，也可側面使用。\n4. 加購聚焦啟動儀式，另收 $5,000。',
    notice: '1. 請提前告知是否需要及時上下舞台，如需此服務，請提供舞台高度。\n2. 道具本身無法提供聲音，請音控配合同步撥放啟動音樂。\n3. 設備安裝時間約為 30 分鐘。\n4. 本道具需 220V、10A 的電力插座支援。\n5. 若活動場地不在一樓，請提供貨梯，並確保貨梯尺寸至少為 200×110×90 公分以上，以便順利運送道具。' },
  { name: 'LED電視球', folder: 'LED電視球', price: '$43,000', yt: 'https://www.youtube.com/watch?v=YSHsvuPIM30',
    service: '1. 配備兩位專業控師現場支援運送與操作流程。\n2. 提供 60 分鐘前置作業時間，確保啟動順暢、設備測試完整。\n\n【技術與影音需求】\n1. 需提供 110V、10A 電力插座以供電使用。\n2. 若需同步聲音播放，請提供 3.5 mm 音源線。\n3. 影片內容請以 MP4 格式，1920×1080（Full HD）解析度，RGB 色彩模式上傳；檔案大小無限制。',
    notice: '【場地與物流條件】\n1. 需安排停車與卸貨區域，並確保道路或電梯空間寬敞、動線順暢。\n2. 若運送路線較窄，請確保通行尺寸至少 130cm × 130cm × 180cm。\n3. 若需搬至非一樓場地，場地需備有至少 111cm × 111cm × 160cm 的貨梯。\n4. 啟動操作台與控台距離需控制在 50 米以內，確保控師可以清楚觀看畫面並即時操作。' },
  { name: '星辰運轉啟動儀式', folder: '星辰運轉啟動儀式', price: '$26,000', yt: 'https://www.youtube.com/watch?v=JrwpywnkSn0',
    service: '1. 現場專業控師。\n2. 影片規格：1080×1080，正方形比例 MP4 檔。\n3. 此款道具遠端遙控控制。', notice: '' },
  { name: '3D魔球啟動儀式', folder: '3D魔球啟動儀式', price: '$20,000', yt: 'https://www.youtube.com/watch?v=f4VrFzWNWSY',
    service: '1. 啟動儀式專業控師。',
    notice: '1. 影片規格：1080×1080，正方形比例 MP4 檔。\n2. 有輪子，無須接電，可遠端遙控。' },
  { name: '聚焦全息啟動儀式', folder: '聚焦全息啟動儀式', price: '$23,000', yt: 'https://www.youtube.com/watch?v=U1u0xHDZvA8',
    service: '1. 現場專業啟動儀式控師。\n\n【選配配件】\n1. 藍色按鈕\n2. 透明壓克力發光手掌：八個卡槽為固定，可依照人數不同更換為按鈕',
    notice: '1. 需提供 110V 電力插座。\n2. 有輪子，可遙控。' },
  { name: '卷軸啟動儀式', folder: '卷軸啟動儀式', price: '$23,000', yt: 'https://www.youtube.com/watch?v=z41suKvyt8M',
    service: '1. 現場 1 位專業啟動儀式控師，確保儀式順利進行。\n2. 卷軸大圖輸出，為您提供視覺上的震撼效果。',
    notice: '1. 請提前告知是否需要及時上下舞台，如需此服務，請提供舞台高度。\n2. 卷軸為電動展開，手動收回，展開時可能會有輕微機械聲，建議利用現場音樂進行遮掩。\n3. 設備安裝時間約為 30 分鐘。\n4. 本道具需 110V、5A 的電力插座支援。\n5. 若活動場地不在一樓，請提供貨梯，並確保貨梯尺寸至少為 200×110×90 公分以上。' },
  { name: '雙軌啟動儀式', folder: '雙軌啟動儀式', price: '$28,000', yt: '',
    service: '1. 現場 1 位專業啟動儀式控師，確保儀式順利進行。\n2. 卷軸大圖輸出，為您提供視覺上的震撼效果。',
    notice: '1. 請提前告知是否需要及時上下舞台，如需此服務，請提供舞台高度。\n2. 卷軸為電動展開，手動收回，展開時可能會有輕微機械聲，建議利用現場音樂進行遮掩。\n3. 設備安裝時間約為 30 分鐘。\n4. 本道具需 110V、5A 的電力插座支援。\n5. 若活動場地不在一樓，請提供貨梯，並確保貨梯尺寸至少為 200×110×90 公分以上。' },
  { name: '布幕啟動儀式', folder: '布幕啟動儀式', price: '$20,000', yt: 'https://www.youtube.com/watch?v=PsXiqbIGQ9I',
    service: '1. 現場專業啟動儀式控師，確保儀式順利進行。\n2. 大圖輸出設計，讓活動主題或品牌一展無遺。',
    notice: '1. 請提前告知是否需要及時上下舞台，如需此服務，請提供舞台高度。\n2. 請注意輸出圖像可能會被布幕部分遮擋，需提前確認遮蔽區域。\n3. 布幕展開時或會產生輕微機械聲響，建議配合現場音樂進行遮掩。\n4. 裝台時間約為 20 分鐘，效率快捷，保證活動準時進行。\n5. 若活動場地不在一樓，請提供貨梯，並確保貨梯尺寸至少為 200×110×90 公分以上。' },
  { name: '禮盒啟動儀式', folder: '禮盒啟動儀式', price: '$23,000', yt: 'https://www.youtube.com/watch?v=Awtx0rlYu3g',
    service: '1. 現場專業啟動儀式控師，確保儀式順利進行。\n2. 大圖輸出，呈現品牌或活動主題的完美視覺效果。',
    notice: '1. 如需額外加租緞帶、氣球、燈條等裝飾，請在活動前至少五個工作天內確認。這些加租項目數量有限，需提前預約。\n2. 請提前告知是否需要及時上下舞台，如需此服務，請提供舞台高度。\n3. 啟動儀式的展開與關閉速度為固定速率，無法調整，敬請理解。\n4. 若活動場地不在一樓，請提供貨梯，並確保貨梯尺寸至少為 200×110×90 公分。\n5. 附贈的手掌啟動儀式如未使用，無法退費或折抵。\n6. 如禮物盒內需要放置合成板，建議最大尺寸為高 50cm、寬 60cm。' },
  { name: '魔法書啟動儀式', folder: '魔法書啟動儀式', price: '$23,000', yt: 'https://www.youtube.com/watch?v=js7gJlOUt98',
    service: '1. 現場專業啟動儀式控師，確保儀式順利進行。\n2. 道具大圖輸出，呈現精緻的視覺效果。',
    notice: '1. 附贈的手掌啟動儀式如未使用，無法退費或折抵。\n2. 請提前告知是否需要及時上下舞台，如需此服務，請提供舞台高度。\n3. 此道具需 110V、5A 電力插座支援，請提前確認場地電力需求。\n4. 若活動場地不在一樓，請提供貨梯，並確保貨梯尺寸至少為 200×110×90 公分。' },
  { name: '沙漏含合成板', folder: '沙漏含合成板', price: '$28,000', yt: 'https://www.youtube.com/watch?v=gJ5ucfpYXBc',
    service: '1. 道具底圖大圖輸出：量身定制，呈現品牌或活動主題的視覺焦點。\n2. 活動前測試影片：在活動前進行完整測試並錄製影片，確保一切順利無誤。',
    notice: '1. 沙漏中的球體顏色請於活動前至少五個工作天內確認，以便準備。顏色可選：黑色、白色、黃色、藍色、彩色。\n2. 此道具因不便進行現場彩排，我們將提前測試並錄影，確保儀式效果。\n3. 如有客製化需求，請提前提供具體範圍，我們將根據需求為您報價。\n4. 建議以平推移動道具，不建議進行及時上下舞台的操作，以確保道具安全。\n5. 若活動場地不在一樓，請提供符合運輸要求的貨梯，尺寸至少為 200×200×90 公分。\n6. 若需要製作合成板，另收費 $5,000。' },
  { name: '3D全息投影風扇', folder: '3D全息投影風扇', price: '$3,500', yt: 'https://www.youtube.com/watch?v=Ey0dVEg0Cw4',
    service: '1. 啟動儀式動畫輸出（不含設計）：您的專屬動畫效果將在全息風扇上完美呈現。\n2. 教學影片或現場執行：如有需要，可提供詳細教學影片或現場執行服務（額外費用）。',
    notice: '1. 由於全息風扇的高速旋轉，拍照時可能會因轉速產生水波紋效果，這是正常現象，敬請理解。\n2. 請於活動前五天提供動畫檔案，以便進行測試和調整，確保現場效果。\n3. 播放內容可放圖片（JPG）或影片（MP4），請設定 40 公分圓形或正方形，像素：500×500，解析度：72dpi。' },
  { name: '手掌啟動儀式', folder: '手掌啟動儀式', price: '$1,500', yt: 'https://www.youtube.com/watch?v=lsZCNJhdMhs',
    service: '1. 提供專業啟動儀式遙控器，輕鬆掌控啟動流程。\n2. 附贈八顆電池，確保儀式順利進行。\n3. 提供完整啟動儀式教學視頻，讓您輕鬆上手操作。',
    notice: '1. 道具顏色需在活動前預先調整好，活動進行中無法遠端變更顏色設定。\n2. 道具無輪子設計，需人工搬運，請提前做好準備。\n3. 啟動時只需輕輕觸碰，即可點亮道具，無需施加重壓。\n4. 若活動於白天在戶外進行，陽光強烈可能會影響光柱效果，這是正常現象。\n5. 建議選擇較陰暗的時段或室內場地以達最佳視覺效果。\n6. 建議長官人數四到五位，如需增加人數，可提供手掌啟動儀式、推進器等等搭配使用。' },
  { name: '升降發光啟動儀式', folder: '升降發光啟動儀式', price: '200公分 $28,000 ／ 400公分 $35,000', yt: 'https://www.youtube.com/watch?v=D2kspHVaxoQ',
    service: '（待補充）', notice: '（待補充）' },
  { name: '倒沙顯字啟動儀式', folder: '倒沙顯字啟動儀式', price: '$28,000', yt: 'https://www.youtube.com/watch?v=vg7RHzd17P4',
    service: '（待補充）', notice: '（待補充）' },
  { name: '七彩燈球柱', folder: '七彩燈球柱', price: '$1,000＋球 $300', yt: 'https://www.youtube.com/watch?v=wvnShwsgwas',
    service: '（待補充）', notice: '（待補充）' },
  { name: '醫療DNA啟動儀式', folder: '醫療DNA啟動儀式', price: '$30,000', yt: '',
    service: '（待補充）', notice: '（待補充）' },
  { name: 'LED視訊柱', folder: 'LED視訊柱', price: '（未定）', yt: '',
    service: '（待補充）', notice: '（待補充）' },
];

async function main() {
  let ok = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const folderPath = path.join(IMG_BASE, p.folder);

    let imageUrl = '';
    let sizeImageUrl = '';

    // 上傳展示圖（第一張 _1.）
    if (fs.existsSync(folderPath)) {
      const files = fs.readdirSync(folderPath).sort();
      const displayFile = files.find(f => f.match(/_1\./));
      const sizeFile = files.find(f => f.includes('尺寸圖'));

      if (displayFile) {
        const url = await uploadFile(path.join(folderPath, displayFile));
        if (url) imageUrl = url;
        console.log(`  展示圖: ${displayFile} -> ${url ? 'OK' : 'FAIL'}`);
      }
      if (sizeFile) {
        const url = await uploadFile(path.join(folderPath, sizeFile));
        if (url) sizeImageUrl = url;
        console.log(`  尺寸圖: ${sizeFile} -> ${url ? 'OK' : 'FAIL'}`);
      }
    }

    // 組合 description
    const descParts = [];
    if (p.service) descParts.push(`【服務內容】\n${p.service}`);
    if (p.notice) descParts.push(`【注意事項】\n${p.notice}`);
    if (p.yt) descParts.push(`【YouTube】\n${p.yt}`);
    if (sizeImageUrl) descParts.push(`【尺寸圖】\n${sizeImageUrl}`);
    const description = descParts.join('\n\n');

    // 新增產品
    const record = {
      name: p.name,
      slug: p.name.replace(/\s+/g, '-'),
      category: '啟動儀式',
      description,
      image_url: imageUrl,
      price_note: p.price,
      visible: true,
      sort_order: i + 1,
    };

    const res = await fetch(`${BASE_URL}/api/admin`, {
      method: 'POST',
      headers: { 'x-admin-password': ADMIN_PWD, 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: 'products', record }),
    });

    if (res.ok) {
      ok++;
      console.log(`OK: ${i + 1}. ${p.name}`);
    } else {
      const err = await res.text();
      console.log(`FAIL: ${p.name} - ${err}`);
    }
  }

  console.log(`\nDone: ${ok}/${products.length} products created`);
}

main().catch(console.error);
