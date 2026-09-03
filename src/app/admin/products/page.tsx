'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, X, Upload, Eye, EyeOff, ImageIcon, Search } from 'lucide-react';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { PRODUCT_CATEGORIES } from '@/lib/services';
import { SortableTableRow } from '@/components/admin/SortableTableRow';
import ProductExtraEditor from '@/components/admin/ProductExtraEditor';
import { parseProductOptionRows, productPriceAmount, serializeProductOptionRows, type ProductOptionRow } from '@/lib/productOptions';

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

const CATEGORIES = PRODUCT_CATEGORIES.filter(category => category !== '燈光音響舞台');

// 取得展示圖片（兼容新舊schema + 逗號分隔）
function getDisplayImage(p: ProductData): string {
  if (p.image_urls && p.image_urls.length > 0) return p.image_urls[0];
  if (p.image_url) return p.image_url.split(',')[0];
  return '';
}

// 從 description 解析服務內容、注意事項、YouTube、AI圖檔
function parseProduct(p: ProductData) {
  const priceOptions = parseProductOptionRows(p.description || '', '價格選項');
  const addOns = parseProductOptionRows(p.description || '', '加購方案');
  const choices = parseProductOptionRows(p.description || '', '選購商品');
  if (p.service_content !== undefined && p.service_content !== '') {
    return { service: p.service_content || '', features: '', occasions: '', notice: p.notice || '', youtube: p.youtube_url || '', ai_file: p.ai_file_url || '', priceOptions, addOns, choices };
  }
  const desc = (p.description || '').replace(/\n*【尺寸圖】\n?https?:\/\/[^\s]+/g, '').replace(/\n*【AI圖檔】\n?https?:\/\/[^\s]+/g, '');
  const service = desc.match(/【(?:服務內容|效果介紹)】\n?([\s\S]*?)(?=\n*【|$)/)?.[1]?.trim() || '';
  const features = desc.match(/【效果特色】\n?([\s\S]*?)(?=\n*【|$)/)?.[1]?.trim() || '';
  const occasions = desc.match(/【適用場合】\n?([\s\S]*?)(?=\n*【|$)/)?.[1]?.trim() || '';
  const notice = desc.match(/【注意事項】\n?([\s\S]*?)(?=\n*【|$)/)?.[1]?.trim() || '';
  const youtube = desc.match(/【YouTube】\n?([\s\S]*?)(?=\n*【|$)/)?.[1]?.trim() || '';
  const ai_file = (p.description || '').match(/【AI圖檔】\n?(https?:\/\/[^\s]+)/)?.[1]?.trim() || '';
  return { service: service || (desc.includes('【') ? '' : desc), features, occasions, notice, youtube, ai_file, priceOptions, addOns, choices };
}

function getAllProductImages(p: ProductData): string[] {
  const legacyImages = p.image_url?.split(',').map(url => url.trim()).filter(Boolean) || [];
  return [...new Set([...(p.image_urls || []), ...legacyImages])];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState<ProductData | null>(null);
  const [editing, setEditing] = useState<ProductData | null>(null);
  const [form, setForm] = useState({
    name: '', category: '啟動儀式', price_note: '', price_options: [] as ProductOptionRow[], add_ons: [] as ProductOptionRow[], choices: [] as ProductOptionRow[],
    service_content: '', features: '', occasions: '', notice: '', youtube_url: '',
    image_url: '', size_image_url: '', ai_file_url: '',
    stock: 1, visible: true,
  });
  const [uploading, setUploading] = useState<string | null>(null);
  const [extraUploading, setExtraUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [savingOrder, setSavingOrder] = useState(false);
  const orderSaveQueue = useRef<Promise<void>>(Promise.resolve());
  const orderSaveVersion = useRef(0);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const getHeaders = () => ({ 'x-admin-password': localStorage.getItem('admin_password') || '' });

  const fetchData = async () => {
    const res = await fetch('/api/admin?table=products', { headers: getHeaders(), cache: 'no-store' });
    const json = await res.json();
    const loaded = (json.data || []) as ProductData[];
    setProducts(loaded.sort((a, b) => a.category.localeCompare(b.category, 'zh-Hant') || (a.sort_order ?? 0) - (b.sort_order ?? 0)));
    setLoading(false);
  };

  // 管理員憑證只存在瀏覽器，頁面掛載後載入一次。
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', category: '啟動儀式', price_note: '', price_options: [], add_ons: [], choices: [], service_content: '', features: '', occasions: '', notice: '', youtube_url: '', image_url: '', size_image_url: '', ai_file_url: '', stock: 1, visible: true });
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
      price_options: parsed.priceOptions,
      add_ons: parsed.addOns.map(row => ({ ...row, id: row.id || crypto.randomUUID() })),
      choices: parsed.choices.map(row => ({ ...row, id: row.id || crypto.randomUUID(), price: '0' })),
      service_content: parsed.service,
      features: parsed.features,
      occasions: parsed.occasions,
      notice: parsed.notice,
      youtube_url: parsed.youtube || p.youtube_url || '',
      image_url: getAllProductImages(p).join(','),
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
    if (extraUploading || uploading) return;
    if (form.add_ons.some(row => !row.label.trim() || (productPriceAmount(row.price) ?? 0) <= 0)) {
      alert('請填寫每個加購商品的名稱與大於 0 的確定金額，例如：3000 或 NT$3,000。');
      return;
    }
    if (form.choices.some(row => !row.label.trim())) {
      alert('請填寫每個選購商品的名稱。');
      return;
    }
    const adminPwd = localStorage.getItem('admin_password') || '';
    // 組合為舊schema格式存入（兼容）
    const description = [
      form.service_content ? `${form.category === '活動特效' ? '【效果介紹】' : '【服務內容】'}\n${form.service_content}` : '',
      form.price_options.length ? `【價格選項】\n${serializeProductOptionRows(form.price_options)}` : '',
      form.add_ons.length ? `【加購方案】\n${serializeProductOptionRows(form.add_ons)}` : '',
      form.choices.length ? `【選購商品】\n${serializeProductOptionRows(form.choices.map(row => ({ ...row, price: '0' })))}` : '',
      form.features ? `【效果特色】\n${form.features}` : '',
      form.notice ? `【注意事項】\n${form.notice}` : '',
      form.occasions ? `【適用場合】\n${form.occasions}` : '',
      form.youtube_url ? `【YouTube】\n${form.youtube_url}` : '',
      form.size_image_url ? `【尺寸圖】\n${form.size_image_url}` : '',
      form.ai_file_url ? `【AI圖檔】\n${form.ai_file_url}` : '',
    ].filter(Boolean).join('\n\n');

    const record: Record<string, unknown> = {
      name: form.name,
      category: form.category,
      description,
      image_url: form.image_url,
      price_note: form.price_options.length
        ? form.price_options.filter(row => row.label.trim() || row.price.trim()).map(row => `${row.label.trim()} ${row.price.trim()}`).join('\n')
        : form.price_note,
      stock: form.stock,
      visible: form.visible,
      ai_file_url: form.ai_file_url || null,
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
        record.sort_order = products
          .filter(product => product.category === form.category)
          .reduce((max, product) => Math.max(max, product.sort_order ?? 0), 0) + 1;
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
  };

  const addOptionRow = (field: 'price_options' | 'add_ons') => {
    setForm(current => ({ ...current, [field]: [...current[field], { label: '', price: '' }] }));
  };

  const updateOptionRow = (field: 'price_options' | 'add_ons', index: number, key: keyof ProductOptionRow, value: string) => {
    setForm(current => ({ ...current, [field]: current[field].map((row, rowIndex) => rowIndex === index ? { ...row, [key]: value } : row) }));
  };

  const removeOptionRow = (field: 'price_options' | 'add_ons', index: number) => {
    setForm(current => ({ ...current, [field]: current[field].filter((_, rowIndex) => rowIndex !== index) }));
  };

  const filteredProducts = products
    .filter(product => {
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      const query = searchTerm.trim().toLowerCase();
      const matchesSearch = !query || product.name.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => (
      a.category.localeCompare(b.category, 'zh-Hant') || (a.sort_order ?? 0) - (b.sort_order ?? 0)
    ));

  const canDrag = categoryFilter !== 'all' && !searchTerm.trim();

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    if (!canDrag || !over || active.id === over.id) return;
    const categoryProducts = products
      .filter(product => product.category === categoryFilter)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    const fromIndex = categoryProducts.findIndex(product => product.id === active.id);
    const toIndex = categoryProducts.findIndex(product => product.id === over.id);
    if (fromIndex < 0 || toIndex < 0) return;

    const reordered = arrayMove(categoryProducts, fromIndex, toIndex);
    const orderMap = new Map(reordered.map((product, index) => [product.id, index + 1]));
    setProducts(current => current.map(product => (
      orderMap.has(product.id) ? { ...product, sort_order: orderMap.get(product.id)! } : product
    )));
    setSavingOrder(true);
    const saveVersion = ++orderSaveVersion.current;
    const headers = { ...getHeaders(), 'Content-Type': 'application/json' };

    const saveTask = orderSaveQueue.current.then(async () => {
      const responses = await Promise.all(reordered.map((product, index) => fetch('/api/admin', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ table: 'products', id: product.id, record: { sort_order: index + 1 } }),
      })));
      if (responses.some(response => !response.ok)) throw new Error('排序儲存失敗');
    });
    orderSaveQueue.current = saveTask.catch(() => undefined);

    try {
      await saveTask;
    } catch {
      if (saveVersion === orderSaveVersion.current) {
        alert('排序儲存失敗，已重新載入原順序。');
        await fetchData();
      }
    } finally {
      if (saveVersion === orderSaveVersion.current) setSavingOrder(false);
    }
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

      <div className="bg-white rounded-xl shadow-sm p-4 mb-5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <label htmlFor="product-category-filter" className="text-sm font-medium text-gray-600 whitespace-nowrap">產品大項</label>
            <select
              id="product-category-filter"
              value={categoryFilter}
              onChange={event => setCategoryFilter(event.target.value)}
              className="min-w-48 px-3 py-2 border rounded-lg bg-white text-sm focus:outline-none focus:ring-2"
            >
              <option value="all">全部產品（{products.length}）</option>
              {CATEGORIES.map(category => (
                <option key={category} value={category}>
                  {category}（{products.filter(product => product.category === category).length}）
                </option>
              ))}
            </select>
          </div>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
              placeholder="搜尋產品名稱"
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
            />
          </div>
          <p className="text-xs text-gray-500 lg:ml-auto">
            {savingOrder
              ? '正在背景儲存前臺順序，仍可繼續拖曳。'
              : categoryFilter === 'all'
                ? '選擇一個產品大項後，即可拖曳調整前臺順序。'
                : searchTerm.trim()
                  ? '清除搜尋文字後即可拖曳排序。'
                  : `可拖曳「${categoryFilter}」品項調整前臺順序。`}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">載入中...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="w-12 px-2 py-3 text-center">排序</th>
                  <th className="px-4 py-3 text-left">展示圖片</th>
                  <th className="px-4 py-3 text-left">名稱</th>
                  <th className="px-4 py-3 text-left">分類</th>
                  <th className="px-4 py-3 text-center">庫存</th>
                  <th className="px-4 py-3 text-center">狀態</th>
                  <th className="px-4 py-3 text-center">操作</th>
                </tr>
              </thead>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={filteredProducts.map(product => product.id)} strategy={verticalListSortingStrategy}>
                  <tbody>
                    {filteredProducts.map(p => (
                      <SortableTableRow
                        key={p.id}
                        id={p.id}
                        disabled={!canDrag}
                        className="border-b last:border-0 hover:bg-gray-50"
                        label={`拖曳調整 ${p.name} 的順序`}
                      >
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
                      </SortableTableRow>
                    ))}
                    {filteredProducts.length === 0 && <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">沒有符合條件的產品資料</td></tr>}
                  </tbody>
                </SortableContext>
              </DndContext>
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
                    <h3 className="text-sm font-bold mb-2" style={{ color: '#4A4947' }}>{showDetail.category === '活動特效' ? '效果介紹' : '服務內容'}</h3>
                    <div className="bg-blue-50 rounded-lg p-4 text-sm whitespace-pre-wrap leading-relaxed">{parsed.service}</div>
                  </div>
                )}
                {parsed.features && (
                  <div>
                    <h3 className="text-sm font-bold mb-2" style={{ color: '#4A4947' }}>效果特色</h3>
                    <div className="bg-emerald-50 rounded-lg p-4 text-sm whitespace-pre-wrap leading-relaxed">{parsed.features}</div>
                  </div>
                )}
                {parsed.notice && (
                  <div>
                    <h3 className="text-sm font-bold mb-2" style={{ color: '#4A4947' }}>注意事項</h3>
                    <div className="bg-orange-50 rounded-lg p-4 text-sm whitespace-pre-wrap leading-relaxed">{parsed.notice}</div>
                  </div>
                )}
                {parsed.occasions && (
                  <div>
                    <h3 className="text-sm font-bold mb-2" style={{ color: '#4A4947' }}>適用場合</h3>
                    <div className="bg-violet-50 rounded-lg p-4 text-sm whitespace-pre-wrap leading-relaxed">{parsed.occasions}</div>
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

              {/* 分類 */}
              <div>
                <div>
                  <label className="block text-sm font-medium mb-1">分類 *</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 p-4">
                <div className="mb-3 flex items-center justify-between gap-3"><div><label className="block text-sm font-medium">價格選項</label><p className="mt-0.5 text-xs text-gray-500">可新增不同種類、規格或數量的價格。</p></div><button type="button" onClick={() => addOptionRow('price_options')} className="inline-flex shrink-0 items-center gap-1 rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-gray-50"><Plus className="h-4 w-4" />新增價格列</button></div>
                {form.price_options.length > 0 ? <div className="space-y-2">{form.price_options.map((row, index) => <div key={`price-${index}`} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-2"><input value={row.label} onChange={e => updateOptionRow('price_options', index, 'label', e.target.value)} placeholder="項目／規格，例如：四頭" className="min-w-0 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2" /><input value={row.price} onChange={e => updateOptionRow('price_options', index, 'price', e.target.value)} placeholder="價格，例如：NT$12,000" className="min-w-0 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2" /><button type="button" onClick={() => removeOptionRow('price_options', index)} className="rounded-lg p-2 text-red-500 hover:bg-red-50" aria-label="移除此價格列"><X className="h-4 w-4" /></button></div>)}</div> : <div className="rounded-lg bg-gray-50 px-3 py-3 text-sm text-gray-500">尚未新增價格選項。若僅需要一個價格，可直接填寫下方的單一價格說明。</div>}
                <input value={form.price_note} onChange={e => setForm(f => ({ ...f, price_note: e.target.value }))} placeholder="單一價格說明（沒有價格選項時使用），例如：NT$36,000" className="mt-3 w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2" />
              </div>

              {(['add_ons', 'choices'] as const).map(field => (
                <ProductExtraEditor key={field} title={field === 'add_ons' ? '加購商品' : '選購商品'} free={field === 'choices'}
                  rows={form[field]} busy={extraUploading} onBusy={setExtraUploading}
                  onAdd={() => setForm(current => ({ ...current, [field]: [...current[field], { id: crypto.randomUUID(), label: '', price: field === 'choices' ? '0' : '', imageUrl: '' }] }))}
                  onUpdate={(id, key, value) => setForm(current => ({ ...current, [field]: current[field].map(row => row.id === id ? { ...row, [key]: value } : row) }))}
                  onRemove={id => setForm(current => ({ ...current, [field]: current[field].filter(row => row.id !== id) }))}
                />
              ))}

              {/* 服務內容 */}
              <div>
                <label className="block text-sm font-medium mb-1">{form.category === '活動特效' ? '效果介紹' : '服務內容'}</label>
                <textarea value={form.service_content} onChange={e => setForm(f => ({ ...f, service_content: e.target.value }))} rows={4} placeholder={form.category === '活動特效' ? '說明產品效果與使用情境' : '每行一項'} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2" />
              </div>

              {form.category === '活動特效' && (
                <div>
                  <label className="block text-sm font-medium mb-1">效果特色</label>
                  <textarea value={form.features} onChange={e => setForm(f => ({ ...f, features: e.target.value }))} rows={4} placeholder="每行一項特色" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2" />
                </div>
              )}

              {/* 注意事項 */}
              <div>
                <label className="block text-sm font-medium mb-1">注意事項</label>
                <textarea value={form.notice} onChange={e => setForm(f => ({ ...f, notice: e.target.value }))} rows={4} placeholder="每行一項" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2" />
              </div>

              {form.category === '活動特效' && (
                <div>
                  <label className="block text-sm font-medium mb-1">適用場合</label>
                  <textarea value={form.occasions} onChange={e => setForm(f => ({ ...f, occasions: e.target.value }))} rows={4} placeholder="每行一個場合" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2" />
                </div>
              )}

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
                <button type="submit" disabled={extraUploading || !!uploading} className="px-4 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: '#AA7452' }}>{editing ? '更新' : '新增'}</button>
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
