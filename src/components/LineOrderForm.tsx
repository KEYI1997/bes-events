'use client';

import { useMemo, useState } from 'react';
import { CheckCircle, ChevronDown, ClipboardList, LoaderCircle } from 'lucide-react';
import { Product } from '@/lib/types';

type FormState = {
  category: string;
  productId: string;
  name: string;
  phone: string;
  email: string;
  eventDate: string;
  eventEndDate: string;
  note: string;
};

export default function LineOrderForm({
  products,
  initialCustomer,
}: {
  products: Product[];
  initialCustomer: { name: string; phone: string };
}) {
  const categories = useMemo(
    () => Array.from(new Set(products.map(product => product.category))),
    [products]
  );
  const [form, setForm] = useState<FormState>({
    category: categories[0] || '',
    productId: '',
    name: initialCustomer.name,
    phone: initialCustomer.phone,
    email: '',
    eventDate: '',
    eventEndDate: '',
    note: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const categoryProducts = useMemo(
    () => products.filter(product => product.category === form.category),
    [form.category, products]
  );
  const selectedProduct = products.find(product => product.id === form.productId);

  const update = (field: keyof FormState, value: string) => {
    setForm(current => ({
      ...current,
      [field]: value,
      ...(field === 'category' ? { productId: '' } : {}),
    }));
    setError('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.category || !form.productId || !form.name.trim() || !form.phone.trim() || !form.eventDate) {
      setError('請完成大項、細項、姓名、電話與活動日期。');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          service_type: `${form.category} — ${selectedProduct?.name || ''}`,
          event_date: form.eventDate,
          event_end_date: form.eventEndDate || form.eventDate,
          description: [
            '【LINE 圖文選單新增訂單】',
            `產品大項：${form.category}`,
            `產品細項：${selectedProduct?.name || ''}`,
            form.note.trim() ? `需求備註：${form.note.trim()}` : '',
          ].filter(Boolean).join('\n'),
        }),
      });

      if (!response.ok) throw new Error('送出失敗');
      setSuccess(true);
    } catch {
      setError('訂單需求送出失敗，請稍後再試或直接在 LINE 留言。');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F7F4EE] px-5 py-12 flex items-center justify-center">
        <div className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-sm border border-primary/10">
          <CheckCircle className="mx-auto mb-5 text-[#06C755]" size={64} />
          <h1 className="text-2xl font-bold text-primary mb-3">訂單需求已送出</h1>
          <p className="text-primary/65 leading-7">
            管理人員已收到通知，確認服務內容與檔期後會與您聯絡，並建立正式訂單。
          </p>
          <button
            type="button"
            onClick={() => window.close()}
            className="mt-8 w-full rounded-full bg-primary py-3.5 font-semibold text-white"
          >
            返回 LINE
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F4EE] px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-2xl overflow-hidden rounded-3xl bg-white shadow-sm border border-primary/10">
        <header className="bg-primary px-6 py-7 text-white sm:px-9">
          <div className="flex items-center gap-3 mb-2">
            <ClipboardList size={25} />
            <h1 className="text-2xl font-bold">新增訂單</h1>
          </div>
          <p className="text-sm leading-6 text-white/70">先選擇服務大項，再從下方選擇需要的產品細項。</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-7 px-5 py-7 sm:px-9">
          <section>
            <label className="mb-3 block font-bold text-primary">1. 選擇產品大項</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {categories.map(category => (
                <button
                  key={category}
                  type="button"
                  onClick={() => update('category', category)}
                  className={`rounded-xl border-2 px-3 py-3 text-sm font-semibold transition-colors ${
                    form.category === category
                      ? 'border-cta bg-cta text-white'
                      : 'border-primary/15 bg-white text-primary hover:border-cta/60'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </section>

          <section>
            <label htmlFor="line-product" className="mb-3 block font-bold text-primary">2. 選擇產品細項</label>
            <div className="relative">
              <select
                id="line-product"
                value={form.productId}
                onChange={event => update('productId', event.target.value)}
                required
                className="w-full appearance-none rounded-xl border-2 border-primary/15 bg-white px-4 py-3.5 pr-11 text-primary outline-none focus:border-cta"
              >
                <option value="">請選擇{form.category || '產品'}細項</option>
                {categoryProducts.map(product => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-primary/50" size={20} />
            </div>
            {categoryProducts.length === 0 && (
              <p className="mt-2 text-sm text-red-500">此分類目前尚無可選產品。</p>
            )}
          </section>

          <div className="border-t border-primary/10 pt-7">
            <h2 className="mb-5 font-bold text-primary">3. 填寫聯絡與活動資訊</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="姓名 *" value={form.name} onChange={value => update('name', value)} required />
              <Field label="手機號碼 *" type="tel" inputMode="tel" value={form.phone} onChange={value => update('phone', value)} required placeholder="0912345678" readOnly={Boolean(initialCustomer.phone)} />
              <Field label="Email" type="email" value={form.email} onChange={value => update('email', value)} />
              <Field label="活動日期 *" type="date" value={form.eventDate} onChange={value => update('eventDate', value)} required />
              <Field label="結束日期" type="date" value={form.eventEndDate} min={form.eventDate} onChange={value => update('eventEndDate', value)} />
            </div>
            {initialCustomer.phone && (
              <p className="mt-3 rounded-xl bg-[#EAF8EF] px-4 py-3 text-sm font-medium text-[#237A3B]">
                已自動帶入 LINE 綁定電話，不需要再次輸入。
              </p>
            )}
            <label className="mt-4 block text-sm font-semibold text-primary">
              其他需求
              <textarea
                value={form.note}
                onChange={event => update('note', event.target.value)}
                rows={4}
                placeholder="活動地點、時間、人數、數量或其他需求"
                className="mt-2 w-full resize-none rounded-xl border-2 border-primary/15 px-4 py-3 font-normal outline-none focus:border-cta"
              />
            </label>
          </div>

          {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting || products.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-cta py-4 font-bold text-white transition-colors hover:bg-cta-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting && <LoaderCircle className="animate-spin" size={19} />}
            {submitting ? '送出中…' : '送出訂單需求'}
          </button>
          <p className="text-center text-xs leading-5 text-primary/50">送出後由管理人員確認檔期與內容，再建立正式訂單。</p>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  placeholder,
  inputMode,
  min,
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  min?: string;
  readOnly?: boolean;
}) {
  return (
    <label className="block text-sm font-semibold text-primary">
      {label}
      <input
        type={type}
        value={value}
        onChange={event => onChange(event.target.value)}
        required={required}
        placeholder={placeholder}
        inputMode={inputMode}
        min={min}
        readOnly={readOnly}
        className={`mt-2 w-full rounded-xl border-2 border-primary/15 px-4 py-3 font-normal outline-none focus:border-cta ${readOnly ? 'bg-gray-100 text-primary/65' : ''}`}
      />
    </label>
  );
}
