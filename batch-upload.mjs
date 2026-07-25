// batch-upload.mjs - 批次上傳圖片並更新產品
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3000';
const ADMIN_PWD = 'bes2024admin';
const IMG_BASE = String.raw`C:\Users\User\OneDrive\Desktop\客戶管理\08-境曜有限公司\網站架設\啟動儀式商品\商品圖`;

const items = [
  { folder: 'LED 魔方啟動儀式', yt: 'https://www.youtube.com/watch?v=IEE9RouVA-A' },
  { folder: 'LED電視球', yt: 'https://www.youtube.com/watch?v=YSHsvuPIM30' },
  { folder: 'LED柱', yt: 'https://www.youtube.com/watch?v=D2kspHVaxoQ' },
  { folder: '禮物盒啟動儀式', yt: 'https://www.youtube.com/watch?v=Awtx0rlYu3g' },
  { folder: '魔法書啟動儀式', yt: 'https://www.youtube.com/watch?v=js7gJlOUt98' },
  { folder: '3D魔球', yt: 'https://www.youtube.com/watch?v=f4VrFzWNWSY' },
  { folder: '倒沙啟動儀式', yt: 'https://www.youtube.com/watch?v=vg7RHzd17P4' },
  { folder: '卷軸啟動儀式', yt: 'https://www.youtube.com/watch?v=z41suKvyt8M' },
  { folder: '布幕啟動儀式', yt: 'https://www.youtube.com/watch?v=PsXiqbIGQ9I' },
  { folder: '3D全息投影風扇', yt: 'https://www.youtube.com/watch?v=Ey0dVEg0Cw4' },
  { folder: '手掌啟動儀式', yt: 'https://www.youtube.com/watch?v=lsZCNJhdMhs' },
  { folder: '七彩燈球柱啟動儀式', yt: 'https://www.youtube.com/watch?v=wvnShwsgwas' },
  { folder: '沙漏啟動儀式', yt: 'https://www.youtube.com/watch?v=gJ5ucfpYXBc' },
  { folder: '聚焦啟動儀式', yt: 'https://www.youtube.com/watch?v=U1u0xHDZvA8' },
  { folder: '星辰運轉', yt: 'https://www.youtube.com/watch?v=JrwpywnkSn0' },
];

async function uploadFile(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);
  const blob = new Blob([fileBuffer]);
  const formData = new FormData();
  formData.append('file', blob, fileName);
  formData.append('folder', 'products');

  const res = await fetch(`${BASE_URL}/api/upload`, {
    method: 'POST',
    headers: { 'x-admin-password': ADMIN_PWD },
    body: formData,
  });
  const json = await res.json();
  return json.url || null;
}

const log = [];
function logMsg(msg) { log.push(msg); console.log(msg); }

async function main() {
  const res = await fetch(`${BASE_URL}/api/admin?table=products`, {
    headers: { 'x-admin-password': ADMIN_PWD },
  });
  const { data: products } = await res.json();
  const sorted = products.sort((a, b) => a.sort_order - b.sort_order);

  logMsg(`Found ${sorted.length} products`);

  for (let i = 0; i < Math.min(sorted.length, items.length); i++) {
    const product = sorted[i];
    const item = items[i];
    const folderPath = path.join(IMG_BASE, item.folder);

    if (!fs.existsSync(folderPath)) {
      console.log(`SKIP: ${item.folder} (folder not found)`);
      logMsg(`SKIP: ${item.folder}`);
      continue;
    }

    const files = fs.readdirSync(folderPath).sort();
    
    // 找展示圖（_1.）
    const displayFile = files.find(f => f.match(/_1\./));
    // 找尺寸圖
    const sizeFile = files.find(f => f.includes('尺寸圖'));

    let imageUrl = product.image_url || '';
    let sizeImageUrl = '';

    // 上傳展示圖
    if (displayFile) {
      const url = await uploadFile(path.join(folderPath, displayFile));
      if (url) {
        imageUrl = url;
        logMsg(`  展示圖 OK: ${displayFile}`);
      }
    }

    // 上傳尺寸圖
    if (sizeFile) {
      const url = await uploadFile(path.join(folderPath, sizeFile));
      if (url) {
        sizeImageUrl = url;
        logMsg(`  尺寸圖 OK: ${sizeFile}`);
      }
    }

    // 更新 description 加入尺寸圖URL和YouTube
    let desc = product.description || '';
    // 加YouTube
    if (!desc.includes(item.yt)) {
      desc = desc.replace(/\n*\[YouTube\][\s\S]*$/, '').replace(/\n*【YouTube】[\s\S]*$/, '');
      desc += `\n\n【YouTube】\n${item.yt}`;
    }
    // 加尺寸圖
    if (sizeImageUrl && !desc.includes('尺寸圖URL')) {
      desc += `\n\n【尺寸圖URL】\n${sizeImageUrl}`;
    }

    // PUT 更新
    const putRes = await fetch(`${BASE_URL}/api/admin`, {
      method: 'PUT',
      headers: { 'x-admin-password': ADMIN_PWD, 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: 'products', id: product.id, record: { image_url: imageUrl, description: desc } }),
    });

    if (putRes.ok) {
      logMsg(`OK: ${product.name}`);
    } else {
      logMsg(`FAIL: ${product.name} - ${await putRes.text()}`);
    }
  }

  logMsg('\nDone!');
  fs.writeFileSync('C:\\Users\\User\\Downloads\\batch_upload_log.txt', log.join('\n'), 'utf8');
}

main().catch(console.error);
