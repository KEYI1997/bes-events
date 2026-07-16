'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Upload, Eye, EyeOff, ImageIcon } from 'lucide-react';

interface ProductData {
  id: string;
  name: string;
  category: string;
  description?: string;
  service_content?: string;
  notice?: string;
  image_url?: string;
  image_urls?: string[];
  size_image_urls?: string[];
  ai_file_url?: string;
  youtube_url?: string;
  price_note?: string;
  stock?: number;
  slug?: string;
  visible: boolean;
  sort_order: number;
  created_at: string;
}

const CATEGORIES = ['啟動儀式', '燈光音響舞台', '外派調酒', 'Show Girl'] as const;

// 取得展示圖片（兼容新舊schema + 逗號分隔）
function getDisplayImage(p: ProductData): string {
  if (p.image_urls && p.image_urls.length > 0) return p.image_urls[0];
  if (p.image_url) return p.image_url.split(',')[0];
  return '';
}

// 從 description 解析服務內容、注意事項、YouTube、AI圖檔
function parseProduct(p: ProductData) {
  if (p.service_content !== undefined && p.service_content !== '') {
    return { service: p.service_content || '', notice: p.notice || '', youtube: p.youtube_url || '', ai_file: p.ai_file_url || '' };
  }
  const desc = (p.description || '').replace(/\n*【尺寸圖】\n?https?:\/\/[^\s]+/g, '').replace(/\n*【AI圖檔】\n?https?:\/\/[^\s]+/g, '');
  const service = desc.match(/【服務內容】\n?([\s\S]*?)(?=\n*【|$)/)?.[1]?.trim() || '';
  const notice = desc.match(/【注意事項】\n?([\s\S]*?)(?=\n*【|$)/)?.[1]?.trim() || '';
  const youtube = desc.match(/【YouTube】\n?([\s\S]*?)(?=\n*【|$)/)?.[1]?.trim() || '';
  const ai_file = (p.description || '').match(/【AI圖檔】\n?(https?:\/\/[^\s]+)/)?.[1]?.trim() || '';
  return { service: service || (desc.includes('【') ? '' : desc), notice, youtube, ai_file };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState<ProductData | null>(null);
  const [editing, setEditing] = useState<ProductData | null>(null);
  const [form, setForm] = useState({
    name: '', category: '啟動儀式', price_note: '',
    service_content: '', notice: '', youtube_url: '',
    image_url: '', size_image_url: '', ai_file_url: '',
    stock: 1, visible: true,
  });
  const [uploading, setUploading] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const getHeaders = () => ({ 'x-admin-password': localStorage.getItem('admin_password') || '' });

  const fetchData = async () => {
    const res = await fetch('/api/admin?table=products', { headers: getHeaders() });
    const json = await res.json();
    setProducts(json.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', category: '啟動儀式', price_note: '', service_content: '', notice: '', youtube_url: '', image_url: '', size_image_url: '', ai_file_url: '', stock: 1, visible: true });
    setShowModal(true);
  };

  const openEdit = (p: ProductData) => {
    setEditing(p);
    const parsed = parseProduct(p);
    // 從 description 中提取尺寸圖URL
    const sizeMatch = (p.description || '').match(/【尺寸圖】\n?(https:\/\/[^\s]+)/);
    const sizeUrl = (p.size_image_urls && p.size_image_urls[0]) || (sizeMatch ? sizeMatch[1] : '');
    setForm({
      name: p.name,
      category: p.category,
      price_note: p.price_note || '',
      service_content: parsed.service,
      notice: parsed.notice,
      youtube_url: parsed.youtube || p.youtube_url || '',
      image_url: getDisplayImage(p),
      size_image_url: sizeUrl,
      ai_file_url: parsed.ai_file || p.ai_file_url || '',
      stock: p.stock ?? 1,
      visible: p.visible,
    });
    setShowModal(true);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(field);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', 'products');
    const res = await fetch('/api/upload', { method: 'POST', headers: getHeaders(), body: fd });
    const json = await res.json();
    if (json.url) setForm(f => ({ ...f, [field]: json.url }));
    setUploading(null);
  };

  // 多圖上傳：上傳後用逗號連接多個URL
  const handleMultiUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(field);
    const newUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const fd = new FormData();
      fd.append('file', files[i]);
      fd.append('folder', 'products');
      const res = await fetch('/api/upload', { method: 'POST', headers: getHeaders(), body: fd });
      const json = await res.json();
      if (json.url) newUrls.push(json.url);
    }
    setForm(f => {
      const existing = f[field as keyof typeof f] as string;
      const existingUrls = existing ? existing.split(',').filter(Boolean) : [];
      return { ...f, [field]: [...existingUrls, ...newUrls].join(',') };
    });
    setUploading(null);
    e.target.value = '';
  };

  // 刪除某張圖片
  const removeImage = (field: string, index: number) => {
    setForm(f => {
      const urls = (f[field as keyof typeof f] as string).split(',').filter(Boolean);
      urls.splice(index, 1);
      return { ...f, [field]: urls.join(',') };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const adminPwd = localStorage.getItem('admin_password') || '';
    // 組合為舊schema格式存入（兼容）
    const description = [
      form.service_content ? `【服務內容】\n${form.service_content}` : '',
      form.notice ? `【注意事項】\n${form.notice}` : '',
      form.youtube_url ? `【YouTube】\n${form.youtube_url}` : '',
      form.size_image_url ? `【尺寸圖】\n${form.size_image_url}` : '',
      form.ai_file_url ? `【AI圖檔】\n${form.ai_file_url}` : '',
    ].filter(Boolean).join('\n\n');

    const record: Record<string, unknown> = {
      name: form.name,
      category: form.category,
      description,
      image_url: form.image_url,
      price_note: form.price_note,
      stock: form.stock,
      visible: form.visible,
    };

    try {
      if (editing) {
        const res = await fetch('/api/admin', {
          method: 'PUT',
          headers: { 'x-admin-password': adminPwd, 'Content-Type': 'application/json' },
          body: JSON.stringify({ table: 'products', id: editing.id, record }),
        });
        if (!res.ok) {
          const err = await res.text();
          alert(`更新失敗: ${err}`);
          return;
        }
      } else {
        record.slug = form.name.replace(/\s+/g, '-').replace(/[^\w-]/g, '') + '-' + Date.now();
        record.sort_order = 0;
        const res = await fetch('/api/admin', {
          method: 'POST',
          headers: { 'x-admin-password': adminPwd, 'Content-Type': 'application/json' },
          body: JSON.stringify({ table: 'products', record }),
        });
        if (!res.ok) {
          const err = await res.text();
          alert(`新增失敗: ${err}`);
          return;
        }
      }
    } catch (err) {
      alert(`操作失敗: ${err}`);
      return;
    }
    setShowModal(false);
    fetchData();
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await fetch('/api/admin', { method: 'DELETE', headers: { ...getHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ table: 'products', id: deleteId }) });
    setDeleteId(null);
    fetchData();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#4A4947' }}>產品管理</h1>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90 transition" style={{ backgroundColor: '#AA7452' }}>
          <Plus className="w-4 h-4" /> 新增產品
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">載入中...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="px-4 py-3 text-left">展示圖片</th>
                  <th className="px-4 py-3 text-left">名稱</th>
                  <th className="px-4 py-3 text-left">分類</th>
                  <th className="px-4 py-3 text-center">庫存</th>
                  <th className="px-4 py-3 text-center">狀態</th>
                  <th className="px-4 py-3 text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {getDisplayImage(p) ? (
                        <img src={getDisplayImage(p)} alt={p.name} className="w-12 h-12 rounded-lg object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center"><ImageIcon className="w-5 h-5 text-gray-300" /></div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setShowDetail(p)} className="font-medium text-left hover:underline" style={{ color: '#AA7452' }}>
                        {p.name}
                      </button>
                    </td>
                    <td className="px-4 py-3"><span className="px-2 py-1 rounded text-xs" style={{ backgroundColor: '#AA745220', color: '#AA7452' }}>{p.category}</span></td>
                    <td className="px-4 py-3 text-center text-gray-600 font-medium">{p.stock ?? '-'}</td>
                    <td className="px-4 py-3 text-center">{p.visible ? <Eye className="w-4 h-4 text-green-500 mx-auto" /> : <EyeOff className="w-4 h-4 text-gray-400 mx-auto" />}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-gray-100"><Pencil className="w-4 h-4 text-gray-600" /></button>
                        <button onClick={() => setDeleteId(p.id)} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-500" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">尚無產品資料</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && (() => {
        const parsed = parseProduct(showDetail);
        return (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-lg font-bold" style={{ color: '#4A4947' }}>{showDetail.name}</h2>
                <button onClick={() => setShowDetail(null)} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-5">
                {getDisplayImage(showDetail) && (
                  <img src={getDisplayImage(showDetail)} alt={showDetail.name} className="w-full max-h-64 object-cover rounded-xl" />
                )}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">分類</p>
                    <p className="font-medium text-sm">{showDetail.category}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">價位</p>
                    <p className="font-medium text-sm">{showDetail.price_note || '未設定'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">庫存</p>
                    <p className="font-medium text-sm">{showDetail.stock ?? '-'}</p>
                  </div>
                </div>
                {parsed.service && (
                  <div>
                    <h3 className="text-sm font-bold mb-2" style={{ color: '#4A4947' }}>服務內容</h3>
                    <div className="bg-blue-50 rounded-lg p-4 text-sm whitespace-pre-wrap leading-relaxed">{parsed.service}</div>
                  </div>
                )}
                {parsed.notice && (
                  <div>
                    <h3 className="text-sm font-bold mb-2" style={{ color: '#4A4947' }}>注意事項</h3>
                    <div className="bg-orange-50 rounded-lg p-4 text-sm whitespace-pre-wrap leading-relaxed">{parsed.notice}</div>
                  </div>
                )}
                {(parsed.youtube || showDetail.youtube_url) && (
                  <div>
                    <h3 className="text-sm font-bold mb-2" style={{ color: '#4A4947' }}>YouTube 影片</h3>
                    <a href={parsed.youtube || showDetail.youtube_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-all">
                      {parsed.youtube || showDetail.youtube_url}
                    </a>
                  </div>
                )}
              </div>
              <div className="p-6 border-t flex justify-end gap-3">
                <button onClick={() => { const p = showDetail; setShowDetail(null); openEdit(p); }} className="px-4 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90" style={{ backgroundColor: '#AA7452' }}>
                  編輯此商品
                </button>
                <button onClick={() => setShowDetail(null)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">關閉</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold" style={{ color: '#4A4947' }}>{editing ? '編輯產品' : '新增產品'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* 名稱 */}
              <div>
                <label className="block text-sm font-medium mb-1">名稱 *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2" />
              </div>

              {/* 分類 + 價格 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">分類 *</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">價格說明</label>
                  <input value={form.price_note} onChange={e => setForm(f => ({ ...f, price_note: e.target.value }))} placeholder="如：$36,000" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2" />
                </div>
              </div>

              {/* 服務內容 */}
              <div>
                <label className="block text-sm font-medium mb-1">服務內容</label>
                <textarea value={form.service_content} onChange={e => setForm(f => ({ ...f, service_content: e.target.value }))} rows={4} placeholder="每行一項" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2" />
              </div>

              {/* 注意事項 */}
              <div>
                <label className="block text-sm font-medium mb-1">注意事項</label>
                <textarea value={form.notice} onChange={e => setForm(f => ({ ...f, notice: e.target.value }))} rows={4} placeholder="每行一項" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2" />
              </div>

              {/* YouTube 連結 */}
              <div>
                <label className="block text-sm font-medium mb-1">YouTube 影片連結</label>
                <input value={form.youtube_url} onChange={e => setForm(f => ({ ...f, youtube_url: e.target.value }))} placeholder="https://www.youtube.com/watch?v=..." className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2" />
              </div>

              {/* 展示圖片（多選） */}
              <div>
                <label className="block text-sm font-medium mb-1">展示圖片（可多選）</label>
                <label className="inline-flex items-center gap-2 px-4 py-2 border border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">{uploading === 'image_url' ? '上傳中...' : '選擇圖片'}</span>
                  <input type="file" accept="image/*" multiple onChange={e => handleMultiUpload(e, 'image_url')} className="hidden" />
                </label>
                {form.image_url && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.image_url.split(',').filter(Boolean).map((url, idx) => (
                      <div key={idx} className="relative group">
                        <img src={url} alt={`展示圖${idx+1}`} className="w-16 h-16 rounded-lg object-cover" />
                        <button type="button" onClick={() => removeImage('image_url', idx)} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition">✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 尺寸圖片（多選） */}
              <div>
                <label className="block text-sm font-medium mb-1">尺寸圖片（可多選）</label>
                <label className="inline-flex items-center gap-2 px-4 py-2 border border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">{uploading === 'size_image_url' ? '上傳中...' : '選擇圖片'}</span>
                  <input type="file" accept="image/*" multiple onChange={e => handleMultiUpload(e, 'size_image_url')} className="hidden" />
                </label>
                {form.size_image_url && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.size_image_url.split(',').filter(Boolean).map((url, idx) => (
                      <div key={idx} className="relative group">
                        <img src={url} alt={`尺寸圖${idx+1}`} className="w-16 h-16 rounded-lg object-cover" />
                        <button type="button" onClick={() => removeImage('size_image_url', idx)} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition">✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* AI 圖檔 */}
              <div>
                <label className="block text-sm font-medium mb-1">AI 圖檔下載（Illustrator 檔案）</label>
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 px-4 py-2 border border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm">{uploading === 'ai_file_url' ? '上傳中...' : '選擇 AI 檔'}</span>
                    <input type="file" accept=".ai,.pdf,.eps" onChange={e => handleUpload(e, 'ai_file_url')} className="hidden" />
                  </label>
                  {form.ai_file_url && (
                    <div className="flex items-center gap-2">
                      <a href={form.ai_file_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">已上傳 ✓</a>
                      <button type="button" onClick={() => setForm(f => ({ ...f, ai_file_url: '' }))} className="text-xs text-red-500 hover:underline">移除</button>
                    </div>
                  )}
                </div>
              </div>

              {/* 庫存 + 顯示 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">庫存數量</label>
                  <input type="number" min={0} value={form.stock} onChange={e => setForm(f => ({ ...f, stock: Number(e.target.value) }))} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2" />
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.visible} onChange={e => setForm(f => ({ ...f, visible: e.target.checked }))} className="w-4 h-4 rounded" />
                    <span className="text-sm">顯示於前台</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">取消</button>
                <button type="submit" className="px-4 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90" style={{ backgroundColor: '#AA7452' }}>{editing ? '更新' : '新增'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-2" style={{ color: '#4A4947' }}>確認刪除</h3>
            <p className="text-gray-600 text-sm mb-6">確定要刪除此產品嗎？此操作無法復原。</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">取消</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600">刪除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
