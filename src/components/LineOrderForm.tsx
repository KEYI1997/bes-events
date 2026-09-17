'use client';

import { useMemo, useState } from 'react';
import { CheckCircle, ChevronDown, ClipboardList, LoaderCircle } from 'lucide-react';
import type { Product } from '@/lib/types';
import { trackGoogleAdsLeadConversion } from '@/lib/googleAds';
import ProductExtrasSelection from '@/components/ProductExtrasSelection';
import ProductQuantitySelector from '@/components/ProductQuantitySelector';
import {
  formatProductAmount,
  formatProductPrice,
  isSinglePurchaseOnly,
  optionKey,
  parseProductOptionRows,
  productExtraTotals,
  productOptionTotals,
  type ProductExtraSelection,
} from '@/lib/productOptions';
import { CONTACT_SERVICE_TYPES, getServiceDefinition } from '@/lib/services';

type FormState = {
  serviceType: string;
  productId: string;
  name: string;
  phone: string;
  email: string;
  eventDate: string;
  eventEndDate: string;
  eventLocation: string;
  note: string;
};

export default function LineOrderForm({
  products,
  initialCustomer,
}: {
  products: Product[];
  initialCustomer: { name: string; phone: string };
}) {
  const [form, setForm] = useState<FormState>({
    serviceType: '',
    productId: '',
    name: initialCustomer.name,
    phone: initialCustomer.phone,
    email: '',
    eventDate: '',
    eventEndDate: '',
    eventLocation: '',
    note: '',
  });
  const [extras, setExtras] = useState<ProductExtraSelection>({ addOns: [], choices: [] });
  const [selectedPriceKey, setSelectedPriceKey] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const selectedService = getServiceDefinition(form.serviceType);
  const categoryProducts = useMemo(() => {
    if (!form.serviceType) return [];
    if (selectedService.key === 'other') return products;
    return products.filter(product => selectedService.productCategories.includes(product.category));
  }, [form.serviceType, products, selectedService.key, selectedService.productCategories]);
  const selectedProduct = useMemo(() => products.find(product => product.id === form.productId), [form.productId, products]);
  const priceOptions = useMemo(() => {
    if (!selectedProduct) return [];
    const savedOptions = parseProductOptionRows(selectedProduct.description || '', '價格選項');
    return savedOptions.length > 0
      ? savedOptions
      : selectedProduct.price_note ? [{ label: '價格', price: selectedProduct.price_note }] : [];
  }, [selectedProduct]);
  const addOnOptions = useMemo(() => selectedProduct ? parseProductOptionRows(selectedProduct.description || '', '加購方案') : [], [selectedProduct]);
  const choiceOptions = useMemo(() => selectedProduct ? parseProductOptionRows(selectedProduct.description || '', '選配商品') : [], [selectedProduct]);
  const lockedPriceOptions = priceOptions.filter(option => option.locked);
  const regularPriceOption = priceOptions.find((option, index) => !option.locked && optionKey(option, index) === selectedPriceKey);
  const selectedPriceOptions = lockedPriceOptions.length > 0
    ? [...lockedPriceOptions, ...(regularPriceOption ? [regularPriceOption] : [])]
    : priceOptions.length === 1 ? priceOptions : regularPriceOption ? [regularPriceOption] : [];
  const selectedPriceBase = productOptionTotals(selectedPriceOptions);
  const totals = productExtraTotals(
    selectedPriceBase.hasQuotedItem ? '' : String(selectedPriceBase.knownSubtotal),
    addOnOptions,
    extras.addOns,
    quantity,
    extras.addOnQuantities,
  );
  const needsPriceSelection = priceOptions.filter(option => !option.locked).length > 1;
  const singlePurchaseOnly = isSinglePurchaseOnly(selectedProduct?.description);

  const updateField = (field: keyof FormState, value: string) => {
    setForm(current => ({ ...current, [field]: value }));
    setError('');
  };

  const selectService = (serviceType: string) => {
    setForm(current => ({ ...current, serviceType, productId: '' }));
    setExtras({ addOns: [], choices: [] });
    setSelectedPriceKey('');
    setQuantity(1);
    setError('');
  };

  const selectProduct = (productId: string) => {
    setForm(current => ({ ...current, productId }));
    setExtras({ addOns: [], choices: [] });
    setSelectedPriceKey('');
    setQuantity(1);
    setError('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.serviceType || !selectedProduct || !form.name.trim() || !form.phone.trim() || !form.eventDate || !form.eventLocation.trim()) {
      setError('請完成服務類型、產品項目／方案、姓名、電話、活動日期與活動地點。');
      return;
    }
    if (needsPriceSelection && !selectedPriceKey) {
      setError('請先選擇商品規格與價格。');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const selectedKeys = selectedPriceOptions.map(option => optionKey(option, priceOptions.indexOf(option)));
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          service_type: form.serviceType,
          event_date: form.eventDate,
          event_end_date: form.eventEndDate || form.eventDate,
          event_location: form.eventLocation.trim(),
          description: [
            '【LINE 圖文選單新增訂單】',
            form.note.trim() ? `【其他需求】\n${form.note.trim()}` : '',
          ].filter(Boolean).join('\n'),
          product_selection: {
            productId: selectedProduct.id,
            priceKey: selectedKeys[0] || '',
            priceKeys: selectedKeys,
            ...extras,
            quantity,
          },
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || '送出失敗');
      trackGoogleAdsLeadConversion();
      setSuccess(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '訂單需求送出失敗，請稍後再試或直接在 LINE 留言。');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return <div className="flex min-h-screen items-center justify-center bg-[#F7F4EE] px-5 py-12"><div className="w-full max-w-lg rounded-3xl border border-primary/10 bg-white p-8 text-center shadow-sm"><CheckCircle className="mx-auto mb-5 text-[#06C755]" size={64} /><h1 className="mb-3 text-2xl font-bold text-primary">訂單需求已送出</h1><p className="leading-7 text-primary/65">管理人員已收到通知，確認服務內容與檔期後會與您聯絡，並建立正式訂單。</p><button type="button" onClick={() => window.close()} className="mt-8 w-full rounded-full bg-primary py-3.5 font-semibold text-white">返回 LINE</button></div></div>;
  }

  return (
    <main className="min-h-screen bg-[#F7F4EE] px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-primary/10 bg-white shadow-sm">
        <header className="bg-primary px-6 py-7 text-white sm:px-9"><div className="mb-2 flex items-center gap-3"><ClipboardList size={25} /><h1 className="text-2xl font-bold">新增訂單</h1></div><p className="text-sm leading-6 text-white/70">選擇服務與商品後，可依商品設定選擇規格、加購與選配方案。</p></header>
        <form onSubmit={handleSubmit} className="space-y-7 px-5 py-7 sm:px-9">
          <section>
            <label className="mb-3 block font-bold text-primary">1. 選擇服務類型</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{CONTACT_SERVICE_TYPES.map(serviceType => <button key={serviceType} type="button" onClick={() => selectService(serviceType)} className={`rounded-xl border-2 px-3 py-3 text-sm font-semibold transition-colors ${form.serviceType === serviceType ? 'border-cta bg-cta text-white' : 'border-primary/15 bg-white text-primary hover:border-cta/60'}`}>{serviceType}</button>)}</div>
          </section>

          <section>
            <label htmlFor="line-product" className="mb-3 block font-bold text-primary">2. 選擇產品項目／方案</label>
            <div className="relative"><select id="line-product" value={form.productId} onChange={event => selectProduct(event.target.value)} required disabled={!form.serviceType} className="w-full appearance-none rounded-xl border-2 border-primary/15 bg-white px-4 py-3.5 pr-11 text-primary outline-none focus:border-cta disabled:cursor-not-allowed disabled:bg-gray-100"><option value="">{form.serviceType ? '請選擇產品項目或方案' : '請先選擇服務類型'}</option>{categoryProducts.map(product => <option key={product.id} value={product.id}>{product.name}</option>)}</select><ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-primary/50" size={20} /></div>
            {form.serviceType && categoryProducts.length === 0 && <p className="mt-2 text-sm text-red-500">此服務類型目前尚無可選產品。</p>}
          </section>

          {selectedProduct && <section className="space-y-6 border-t border-primary/10 pt-7">
            {priceOptions.length > 0 && <fieldset><legend className="mb-3 font-bold text-primary">3. 選擇規格與價格{needsPriceSelection ? ' *' : ''}</legend><div className="space-y-3">{priceOptions.map((option, index) => { const key = optionKey(option, index); const checked = option.locked || selectedPriceOptions.includes(option); return <label key={key} className={`flex min-h-14 items-center justify-between gap-4 rounded-xl border-2 px-4 py-3 transition-colors ${option.locked ? 'cursor-default border-primary/15 bg-primary/5' : 'cursor-pointer'} ${checked ? 'border-cta bg-white' : 'border-primary/15 bg-white hover:border-cta/60'}`}><span className="flex min-w-0 items-center gap-3"><input type={option.locked ? 'checkbox' : 'radio'} name="line-price-option" checked={checked} disabled={option.locked} onChange={event => setSelectedPriceKey(event.target.checked ? key : '')} className="h-4 w-4 shrink-0 accent-cta disabled:opacity-100" /><span className="font-medium text-primary">{option.label}</span>{option.locked && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary/70">必選</span>}</span><span className="shrink-0 text-sm font-semibold text-cta">{formatProductPrice(option.price) || '洽詢'}</span></label>; })}</div></fieldset>}
            {(addOnOptions.length > 0 || choiceOptions.length > 0) && <ProductExtrasSelection addOns={addOnOptions} choices={choiceOptions} selection={extras} onChange={setExtras} basePrice={selectedPriceBase.hasQuotedItem ? '' : String(selectedPriceBase.knownSubtotal)} quantity={quantity} />}
            <ProductQuantitySelector quantity={quantity} singlePurchaseOnly={singlePurchaseOnly} onChange={setQuantity} label={selectedService.quantityLabel} />
            {selectedPriceOptions.length > 0 && <p aria-live="polite" className="text-sm font-semibold text-primary/70">{totals.total === null ? '完整金額以正式報價為準。' : <>預估金額：<span className="text-cta">{formatProductAmount(totals.total)}</span></>}</p>}
          </section>}

          <div className="border-t border-primary/10 pt-7"><h2 className="mb-5 font-bold text-primary">{selectedProduct ? '4' : '3'}. 填寫聯絡與活動資訊</h2><div className="grid gap-4 sm:grid-cols-2"><Field label="姓名 *" value={form.name} onChange={value => updateField('name', value)} required /><Field label="聯絡電話 *" type="tel" inputMode="tel" value={form.phone} onChange={value => updateField('phone', value)} required placeholder="例：0912-345-678 或 02-2345-6789" readOnly={Boolean(initialCustomer.phone)} /><Field label="Email" type="email" value={form.email} onChange={value => updateField('email', value)} /><Field label="活動日期 *" type="date" value={form.eventDate} onChange={value => updateField('eventDate', value)} required /><Field label="結束日期" type="date" value={form.eventEndDate} min={form.eventDate} onChange={value => updateField('eventEndDate', value)} /><Field label="活動地點 *" value={form.eventLocation} onChange={value => updateField('eventLocation', value)} required placeholder="請輸入活動地點" /></div><label className="mt-4 block text-sm font-semibold text-primary">其他需求<textarea value={form.note} onChange={event => updateField('note', event.target.value)} rows={4} placeholder="活動時間、人數、現場需求或其他備註" className="mt-2 w-full resize-none rounded-xl border-2 border-primary/15 px-4 py-3 font-normal outline-none focus:border-cta" /></label></div>

          {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={submitting || products.length === 0} className="flex w-full items-center justify-center gap-2 rounded-full bg-cta py-4 font-bold text-white transition-colors hover:bg-cta-hover disabled:cursor-not-allowed disabled:opacity-50">{submitting && <LoaderCircle className="animate-spin" size={19} />}{submitting ? '送出中…' : '送出訂單需求'}</button>
          <p className="text-center text-xs leading-5 text-primary/50">送出後由管理人員確認檔期與內容，再建立正式訂單。</p>
        </form>
      </div>
    </main>
  );
}

function Field({ label, value, onChange, type = 'text', required = false, placeholder, inputMode, min, readOnly = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean; placeholder?: string; inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']; min?: string; readOnly?: boolean }) {
  return <label className="block text-sm font-semibold text-primary">{label}<input type={type} value={value} onChange={event => onChange(event.target.value)} required={required} placeholder={placeholder} inputMode={inputMode} min={min} readOnly={readOnly} className={`mt-2 w-full rounded-xl border-2 border-primary/15 px-4 py-3 font-normal outline-none focus:border-cta ${readOnly ? 'bg-gray-100 text-primary/65' : ''}`} /></label>;
}
