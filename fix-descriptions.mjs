// fix-descriptions.mjs - 修復所有產品的 description 亂碼
const BASE_URL = 'http://localhost:3000';
const ADMIN_PWD = 'bes2024admin';

const correctData = [
  { sort: 1, desc: `【服務內容】\n1. 現場專業啟動儀式控師，確保儀式順利進行。\n2. 五面皆可呈現畫面。\n3. 可正面展示，也可側面使用。\n4. 加購聚焦啟動儀式，另收 $5,000。\n\n【注意事項】\n1. 請提前告知是否需要及時上下舞台，如需此服務，請提供舞台高度。\n2. 道具本身無法提供聲音，請音控配合同步撥放啟動音樂。\n3. 設備安裝時間約為 30 分鐘。\n4. 本道具需 220V、10A 的電力插座支援。\n5. 若活動場地不在一樓，請提供貨梯，並確保貨梯尺寸至少為 200x110x90 公分以上。\n\n【YouTube】\nhttps://www.youtube.com/watch?v=IEE9RouVA-A` },
  { sort: 2, desc: `【服務內容】\n1. 配備兩位專業控師現場支援運送與操作流程。\n2. 提供 60 分鐘前置作業時間，確保啟動順暢、設備測試完整。\n3. 需提供 110V、10A 電力插座。\n4. 影片：MP4，1920x1080。\n\n【注意事項】\n1. 需安排停車與卸貨區域，動線順暢。\n2. 通行尺寸至少 130x130x180 cm。\n3. 貨梯至少 111x111x160 cm。\n4. 操作台與控台距離 50 米以內。\n\n【YouTube】\nhttps://www.youtube.com/watch?v=YSHsvuPIM30` },
  { sort: 3, desc: `（待補充）\n\n【YouTube】\nhttps://www.youtube.com/watch?v=D2kspHVaxoQ` },
  { sort: 4, desc: `【服務內容】\n1. 現場專業啟動儀式控師，確保儀式順利進行。\n2. 大圖輸出，呈現品牌或活動主題的完美視覺效果。\n\n【注意事項】\n1. 如需額外加租緞帶、氣球、燈條等裝飾，請在活動前至少五個工作天內確認。\n2. 請提前告知是否需要及時上下舞台，如需此服務，請提供舞台高度。\n3. 啟動儀式的展開與關閉速度為固定速率，無法調整，敬請理解。\n4. 若活動場地不在一樓，請提供貨梯，並確保貨梯尺寸至少為 200x110x90 公分。\n5. 附贈的手掌啟動儀式如未使用，無法退費或折抵。\n6. 如禮物盒內需要放置合成板，建議最大尺寸為高50寬60cm。\n\n【YouTube】\nhttps://www.youtube.com/watch?v=Awtx0rlYu3g` },
  { sort: 5, desc: `【服務內容】\n1. 現場專業啟動儀式控師，確保儀式順利進行。\n2. 道具大圖輸出，呈現精緻的視覺效果。\n\n【注意事項】\n1. 附贈的手掌啟動儀式如未使用，無法退費或折抵。\n2. 請提前告知是否需要及時上下舞台，如需此服務，請提供舞台高度。\n3. 此道具需 110V、5A 電力插座支援，請提前確認場地電力需求。\n4. 若活動場地不在一樓，請提供貨梯，並確保貨梯尺寸至少為 200x110x90 公分。\n\n【YouTube】\nhttps://www.youtube.com/watch?v=js7gJlOUt98` },
  { sort: 6, desc: `【服務內容】\n1. 啟動儀式專業控師。\n\n【注意事項】\n1. 影片規格：1080x1080，正方形比例 MP4 檔。\n2. 有輪子，無須接電，可遠端遙控。\n\n【YouTube】\nhttps://www.youtube.com/watch?v=f4VrFzWNWSY` },
  { sort: 7, desc: `（待補充）\n\n【YouTube】\nhttps://www.youtube.com/watch?v=vg7RHzd17P4` },
  { sort: 8, desc: `【服務內容】\n1. 現場 1 位專業啟動儀式控師，確保儀式順利進行。\n2. 卷軸大圖輸出，為您提供視覺上的震撼效果。\n\n【注意事項】\n1. 請提前告知是否需要及時上下舞台，如需此服務，請提供舞台高度。\n2. 卷軸為電動展開，手動收回，展開時可能會有輕微機械聲，建議利用現場音樂進行遮掩。\n3. 設備安裝時間約為 30 分鐘。\n4. 本道具需 110V、5A 的電力插座支援。\n5. 若活動場地不在一樓，請提供貨梯，並確保貨梯尺寸至少為 200x110x90 公分以上。\n\n【YouTube】\nhttps://www.youtube.com/watch?v=z41suKvyt8M` },
  { sort: 9, desc: `【服務內容】\n1. 現場專業啟動儀式控師，確保儀式順利進行。\n2. 大圖輸出設計，讓活動主題或品牌一展無遺。\n\n【注意事項】\n1. 請提前告知是否需要及時上下舞台，如需此服務，請提供舞台高度。\n2. 請注意輸出圖像可能會被布幕部分遮擋，需提前確認遮蔽區域。\n3. 布幕展開時或會產生輕微機械聲響，建議配合現場音樂進行遮掩。\n4. 裝台時間約為 20 分鐘，效率快捷，保證活動準時進行。\n5. 若活動場地不在一樓，請提供貨梯，並確保貨梯尺寸至少為 200x110x90 公分以上。\n\n【YouTube】\nhttps://www.youtube.com/watch?v=PsXiqbIGQ9I` },
  { sort: 10, desc: `【服務內容】\n1. 啟動儀式動畫輸出（不含設計）：您的專屬動畫效果將在全息風扇上完美呈現。\n2. 教學影片或現場執行：如有需要，可提供詳細教學影片或現場執行服務（額外費用）。\n\n【注意事項】\n1. 由於全息風扇的高速旋轉，拍照時可能會因轉速產生水波紋效果，這是正常現象，敬請理解。\n2. 請於活動前五天提供動畫檔案，以便進行測試和調整，確保現場效果。\n3. 播放內容可放圖片（JPG）或影片（MP4），請設定 40 公分圓形或正方形，像素：500x500，解析度：72dpi。\n\n【YouTube】\nhttps://www.youtube.com/watch?v=Ey0dVEg0Cw4` },
  { sort: 11, desc: `【服務內容】\n1. 提供專業啟動儀式遙控器，輕鬆掌控啟動流程。\n2. 附贈八顆電池，確保儀式順利進行。\n3. 提供完整啟動儀式教學視頻，讓您輕鬆上手操作。\n\n【注意事項】\n1. 道具顏色需在活動前預先調整好，活動進行中無法遠端變更顏色設定。\n2. 道具無輪子設計，需人工搬運，請提前做好準備。\n3. 啟動時只需輕輕觸碰，即可點亮道具，無需施加重壓。\n4. 若活動於白天在戶外進行，陽光強烈可能會影響光柱效果，這是正常現象。\n5. 建議選擇較陰暗的時段或室內場地以達最佳視覺效果。\n6. 建議長官人數四到五位，如需增加人數，可提供手掌啟動儀式、推進器等等搭配使用。\n\n【YouTube】\nhttps://www.youtube.com/watch?v=lsZCNJhdMhs` },
  { sort: 12, desc: `（待補充）\n\n【YouTube】\nhttps://www.youtube.com/watch?v=wvnShwsgwas` },
  { sort: 13, desc: `【服務內容】\n1. 道具底圖大圖輸出：量身定制，呈現品牌或活動主題的視覺焦點。\n2. 活動前測試影片：在活動前進行完整測試並錄製影片，確保一切順利無誤。\n\n【注意事項】\n1. 沙漏中的球體顏色請於活動前至少五個工作天內確認，以便準備。顏色可選：黑色、白色、黃色、藍色、彩色。\n2. 此道具因不便進行現場彩排，我們將提前測試並錄影，確保儀式效果。\n3. 如有客製化需求，請提前提供具體範圍，我們將根據需求為您報價。\n4. 建議以平推移動道具，不建議進行及時上下舞台的操作，以確保道具安全。\n5. 若活動場地不在一樓，請提供符合運輸要求的貨梯，尺寸至少為 200x200x90 公分。\n6. 若需要製作合成板，另收費 $5,000。\n\n【YouTube】\nhttps://www.youtube.com/watch?v=gJ5ucfpYXBc` },
  { sort: 14, desc: `【服務內容】\n1. 現場專業啟動儀式控師。\n\n【選配配件】\n1. 藍色按鈕\n2. 透明壓克力發光手掌：八個卡槽為固定，可依照人數不同更換為按鈕\n\n【注意事項】\n1. 需提供 110V 電力插座。\n2. 有輪子，可遙控。\n\n【YouTube】\nhttps://www.youtube.com/watch?v=U1u0xHDZvA8` },
  { sort: 15, desc: `【服務內容】\n1. 現場專業控師。\n2. 影片規格：1080x1080，正方形比例 MP4 檔。\n3. 此款道具遠端遙控控制。\n\n【YouTube】\nhttps://www.youtube.com/watch?v=JrwpywnkSn0` },
];

async function main() {
  const res = await fetch(`${BASE_URL}/api/admin?table=products`, {
    headers: { 'x-admin-password': ADMIN_PWD },
  });
  const { data: products } = await res.json();
  const sorted = products.sort((a, b) => a.sort_order - b.sort_order);

  let ok = 0;
  for (let i = 0; i < sorted.length; i++) {
    const product = sorted[i];
    const correct = correctData[i];
    if (!correct) continue;

    // 保留尺寸圖URL（如果有的話）
    const sizeMatch = product.description?.match(/尺寸圖: (https:\/\/[^\s]+)/);
    let desc = correct.desc;
    if (sizeMatch) {
      desc += `\n\n【尺寸圖】\n${sizeMatch[1]}`;
    }

    const putRes = await fetch(`${BASE_URL}/api/admin`, {
      method: 'PUT',
      headers: { 'x-admin-password': ADMIN_PWD, 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: 'products', id: product.id, record: { description: desc } }),
    });

    if (putRes.ok) {
      ok++;
      console.log(`OK: ${product.sort_order}. ${product.name}`);
    } else {
      console.log(`FAIL: ${product.name}`);
    }
  }
  console.log(`\nDone: ${ok}/${sorted.length} fixed`);
}

main().catch(console.error);
