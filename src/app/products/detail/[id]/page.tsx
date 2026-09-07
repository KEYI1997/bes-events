'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Minus, Plus, ShoppingCart } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ContactModal from '@/components/ContactModal';
import ImageLightbox from '@/components/ImageLightbox';
import { formatProductAmount, optionKey, parseProductOptionRows, productExtraTotals, type ProductExtraSelection } from '@/lib/productOptions';
import ProductExtrasSelection from '@/components/ProductExtrasSelection';

interface ProductDetail {
  id: string;
  name: string;
  category: string;
  description?: string;
  image_url?: string;
  image_urls?: string[];
  price_note?: string;
  ai_file_url?: string;
  stock?: number;
}

function parseDescription(desc: string) {
  const service = desc.match(/【(?:服務內容|效果介紹)】\n?([\s\S]*?)(?=\n*【|$)/)?.[1]?.trim() || '';
  const features = desc.match(/【效果特色】\n?([\s\S]*?)(?=\n*【|$)/)?.[1]?.trim() || '';
  const notice = desc.match(/【注意事項】\n?([\s\S]*?)(?=\n*【|$)/)?.[1]?.trim() || '';
  const occasions = desc.match(/【適用場合】\n?([\s\S]*?)(?=\n*【|$)/)?.[1]?.trim() || '';
  const youtube = desc.match(/【YouTube】\n?([\s\S]*?)(?=\n*【|$)/)?.[1]?.trim() || '';
  const sizeImg = desc.match(/【尺寸圖】\n?(https?:\/\/[^\s]+)/)?.[1] || '';
  return { service, features, notice, occasions, youtube, sizeImg, priceOptions: parseProductOptionRows(desc, '價格選項'), addOns: parseProductOptionRows(desc, '加購方案'), choices: parseProductOptionRows(desc, '選購商品') };
}

function parseLines(text: string): string[] {
  return text.split('\n').map(l => l.replace(/^(?:\*|•|-|\d+[\.、])\s*/, '').trim()).filter(Boolean);
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [contactOpen, setContactOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [extras, setExtras] = useState<ProductExtraSelection>({ addOns: [], choices: [] });
  const [selectedPriceOption, setSelectedPriceOption] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [priceSelectionError, setPriceSelectionError] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      const { data } = await supabase.from('products').select('*').eq('id', productId).eq('visible', true).maybeSingle();
      setProduct(data);
      setExtras({ addOns: [], choices: [] });
      setCurrentSlide(0);
      setSelectedPriceOption('');
      setQuantity(1);
      setPriceSelectionError(false);
      setContactOpen(false);
      setLoading(false);
    }
    if (productId) fetchProduct();
  }, [productId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">載入中...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center text-gray-500">找不到此產品</div>;

  const images = product.image_url
    ? product.image_url.split(',').map(url => url.trim()).filter(Boolean)
    : (product.image_urls || []);
  const parsed = parseDescription(product.description || '');
  const priceOptions = parsed.priceOptions.length > 0
    ? parsed.priceOptions
    : product.price_note ? [{ label: '價格', price: product.price_note }] : [];
  const serviceType = ['活動特效', '啟動儀式', '外派調酒'].includes(product.category) ? product.category : undefined;
  const isEquipmentProduct = ['活動特效', '啟動儀式'].includes(product.category);
  const detailSections = [
    { title: product.category === '活動特效' ? '效果介紹' : '服務內容', lines: parseLines(parsed.service), tone: 'blue', numbered: product.category !== '活動特效' },
    { title: '效果特色', lines: parseLines(parsed.features), tone: 'green', numbered: true },
    { title: '注意事項', lines: parseLines(parsed.notice), tone: 'orange', numbered: true },
    { title: '適用場合', lines: parseLines(parsed.occasions), tone: 'purple', numbered: true },
  ].filter(section => section.lines.length > 0);

  const openEquipmentOrder = () => {
    if (priceOptions.length > 1 && !selectedPriceOption) {
      setPriceSelectionError(true);
      return;
    }
    setContactOpen(true);
  };

  if (isEquipmentProduct) {
    return <EquipmentProductDetail
      product={product}
      images={images}
      parsed={parsed}
      priceOptions={priceOptions}
      detailSections={detailSections}
      currentSlide={currentSlide}
      selectedPriceOption={selectedPriceOption}
      quantity={quantity}
      extras={extras}
      priceSelectionError={priceSelectionError}
      contactOpen={contactOpen}
      lightboxOpen={lightboxOpen}
      serviceType={serviceType}
      onPreviousImage={() => setCurrentSlide(previous => (previous - 1 + images.length) % images.length)}
      onNextImage={() => setCurrentSlide(previous => (previous + 1) % images.length)}
      onSelectImage={setCurrentSlide}
      onOpenLightbox={() => setLightboxOpen(true)}
      onCloseLightbox={() => setLightboxOpen(false)}
      onSelectPrice={value => { setSelectedPriceOption(value); setPriceSelectionError(false); }}
      onExtrasChange={setExtras}
      onQuantityChange={setQuantity}
      onOpenOrder={openEquipmentOrder}
      onCloseOrder={() => setContactOpen(false)}
    />;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F7F0' }}>
      {/* 返回 */}
      <div className="max-w-[1504px] mx-auto px-12 pt-28">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition">
          <ChevronLeft className="w-4 h-4" /> 返回列表
        </button>
      </div>

      {/* ===== 頂部區域：左圖(64.4%) 右資訊(33.6%) 高度560px ===== */}
      <section className="max-w-[1504px] mx-auto px-12 pt-6">
        <div className="flex flex-col lg:flex-row gap-8 items-stretch">
          {/* 左側圖片：64.4% 寬 */}
          <div className="w-full lg:w-[64.4%] flex flex-col">
            {images.length > 0 ? (
              <>
                <div className="relative w-full flex-1 min-h-[440px] rounded-2xl overflow-hidden bg-[#f7f4ef] shadow-sm group cursor-pointer" onClick={() => setLightboxOpen(true)}>
                  <Image
                    src={images[currentSlide] || images[0]}
                    alt={`${product.name}－${product.category}活動服務圖片`}
                    fill
                    className="object-contain object-center"
                  />
                  {/* Hover 放大 icon */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 448 512" 
                      className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      fill="currentColor"
                    >
                      <path d="M32 32C14.3 32 0 46.3 0 64l0 96c0 17.7 14.3 32 32 32s32-14.3 32-32l0-64 64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 32zM64 352c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 96c0 17.7 14.3 32 32 32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0 0-64zM320 32c-17.7 0-32 14.3-32 32s14.3 32 32 32l64 0 0 64c0 17.7 14.3 32 32 32s32-14.3 32-32l0-96c0-17.7-14.3-32-32-32l-96 0zM448 352c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 64-64 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l96 0c17.7 0 32-14.3 32-32l0-96z"/>
                    </svg>
                  </div>
                  {/* 左右切換按鈕 */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); setCurrentSlide((prev) => (prev - 1 + images.length) % images.length); }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center transition-all hover:scale-110"
                        aria-label="上一張"
                      >
                        <ChevronLeft className="w-6 h-6 text-gray-700" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setCurrentSlide((prev) => (prev + 1) % images.length); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center transition-all hover:scale-110"
                        aria-label="下一張"
                      >
                        <ChevronRight className="w-6 h-6 text-gray-700" />
                      </button>
                    </>
                  )}
                </div>
                {images.length > 1 && (
                  <div className="flex justify-center gap-2 mt-4">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`h-2.5 rounded-full transition-all duration-300 ${
                          currentSlide === idx ? 'bg-[#AA7452] w-6' : 'bg-gray-300 hover:bg-gray-400 w-2.5'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full flex-1 min-h-[440px] rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">暫無圖片</div>
            )}
          </div>

          {/* 右側資訊：33.6% 寬 */}
          <div className="w-full lg:w-[33.6%] flex">
            <div className="bg-white rounded-2xl p-8 shadow-sm flex flex-col justify-center w-full">
              <h1 className="text-2xl md:text-3xl font-bold mb-6" style={{ color: '#4A4947' }}>{product.name}</h1>
              <hr className="border-gray-200 mb-6" />
              <div className="mb-8 space-y-2">
                {priceOptions.length > 0 ? priceOptions.map((option, index) => <div key={`${option.label}-${index}`} className="flex items-baseline justify-between gap-4 border-b border-gray-100 pb-2 last:border-b-0"><span className="text-sm font-medium text-gray-600">{option.label}</span><span className="text-xl font-bold text-right" style={{ color: '#AA7452' }}>{option.price || '洽詢'}</span></div>) : <p className="text-3xl font-bold" style={{ color: '#AA7452' }}>洽詢</p>}
              </div>

              {/* 建立訂單 */}
              <button
                onClick={() => setContactOpen(true)}
                className="squish-btn flex items-center justify-center gap-2 w-4/5 mx-auto py-3.5 text-white text-lg font-bold rounded-full transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                style={{ backgroundColor: '#AA7452' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" className="w-5 h-5" fill="white"><path d="M0 32C0 14.3 14.3 0 32 0L48 0c44.2 0 80 35.8 80 80l0 288c0 8.8 7.2 16 16 16l416 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-416 0c-44.2 0-80-35.8-80-80L64 80c0-8.8-7.2-16-16-16L32 64C14.3 64 0 49.7 0 32zM160 128l0 64c0 17.7 14.3 32 32 32l128 0c17.7 0 32-14.3 32-32l0-64c0-17.7-14.3-32-32-32L192 96c-17.7 0-32 14.3-32 32zm192 0l0 64c0 17.7 14.3 32 32 32l128 0c17.7 0 32-14.3 32-32l0-64c0-17.7-14.3-32-32-32L384 96c-17.7 0-32 14.3-32 32zM160 320l0-64c0-17.7 14.3-32 32-32l128 0c17.7 0 32 14.3 32 32l0 64c0 17.7-14.3 32-32 32l-128 0c-17.7 0-32-14.3-32-32zm192 0l0-64c0-17.7 14.3-32 32-32l128 0c17.7 0 32 14.3 32 32l0 64c0 17.7-14.3 32-32 32l-128 0c-17.7 0-32-14.3-32-32z"/></svg>
                建立訂單
              </button>

              {/* 下載 AI 完稿範例 */}
              {product.ai_file_url && (
                <div className="mt-3 text-center">
                  <a
                    href={product.ai_file_url}
                    download
                    className="flex items-center justify-center gap-2 w-4/5 mx-auto py-3.5 text-lg font-bold rounded-full transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-2"
                    style={{ color: '#4A4947', borderColor: '#4A4947' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-5 h-5" fill="#4A4947"><path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 242.7-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7 288 32zM64 352c-35.3 0-64 28.7-64 64l0 32c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-32c0-35.3-28.7-64-64-64l-101.5 0-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352 64 352zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/></svg>
                    下載 AI 完稿範例
                  </a>
                  <p className="text-xs text-gray-500 mt-2">提供 Adobe Illustrator 格式</p>
                </div>
              )}

              {/* 三項特色 */}
              <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-100">
                <div className="flex flex-col items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-5 h-5" fill="#4A4947"><path d="M256 0c4.6 0 9.2 1 13.4 2.9L457.7 82.8c22 9.3 38.4 31 38.3 57.2c-.5 99.2-41.3 280.7-213.6 363.2c-16.7 8-36.1 8-52.8 0C57.3 420.7 16.5 239.2 16 140c-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.8 1 251.4 0 256 0z"/></svg>
                  <span className="text-[11px] text-gray-600">品質保證</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-5 h-5" fill="#4A4947"><path d="M256 80C149.9 80 62.4 159.4 49.6 262c9.4-3.8 19.6-6 30.4-6c26.5 0 48 21.5 48 48l0 128c0 26.5-21.5 48-48 48l-16 0c-35.3 0-64-28.7-64-64L0 256C0 114.6 114.6 0 256 0S512 114.6 512 256l0 160c0 35.3-28.7 64-64 64l-16 0c-26.5 0-48-21.5-48-48l0-128c0-26.5 21.5-48 48-48c10.8 0 21 2.1 30.4 6C449.6 159.4 362.1 80 256 80z"/></svg>
                  <span className="text-[11px] text-gray-600">專業服務</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" className="w-5 h-5" fill="#4A4947"><path d="M48 0C21.5 0 0 21.5 0 48L0 368c0 26.5 21.5 48 48 48l16 0c0 53 43 96 96 96s96-43 96-96l128 0c0 53 43 96 96 96s96-43 96-96l32 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l0-64 0-32 0-18.7c0-17-6.7-33.3-18.7-45.3L512 146.7C500 134.7 483.7 128 466.7 128L416 128l0-80c0-26.5-21.5-48-48-48L48 0zM416 160l50.7 0L544 237.3l0 18.7-128 0 0-96zM160 464a48 48 0 1 1 0-96 48 48 0 1 1 0 96zm368-48a48 48 0 1 1 -96 0 48 48 0 1 1 96 0z"/></svg>
                  <span className="text-[11px] text-gray-600">快速安排</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 產品說明：依資料顯示效果介紹、特色、注意事項與適用場合 ===== */}
      {(parsed.addOns.length > 0 || parsed.choices.length > 0) && <section className="max-w-[1504px] mx-auto px-6 md:px-12 pt-8">
        <div className="rounded-2xl bg-white p-5 md:p-8">
          <ProductExtrasSelection addOns={parsed.addOns} choices={parsed.choices} selection={extras} onChange={setExtras} basePrice={priceOptions.length === 1 ? priceOptions[0].price : ''} />
          <button type="button" onClick={() => setContactOpen(true)} className="mt-5 rounded-full bg-[#AA7452] px-6 py-3 font-semibold text-white hover:bg-[#8F5F43]">確認選擇，建立訂單</button>
        </div>
      </section>}
      {detailSections.length > 0 && (
        <section className="max-w-[1504px] mx-auto px-12 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {detailSections.map(section => (
              <div key={section.title} className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
                <h2 className="text-lg font-bold mb-5" style={{ color: '#4A4947' }}>{section.title}</h2>
                {section.numbered ? (
                  <div className="space-y-3">
                    {section.lines.map((line, idx) => (
                      <div key={`${section.title}-${idx}`} className="flex gap-3 items-start">
                        <span
                          className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{
                            backgroundColor: section.tone === 'orange' ? '#AA745220' : '#AA7452',
                            color: section.tone === 'orange' ? '#AA7452' : '#FFFFFF',
                          }}
                        >
                          {idx + 1}
                        </span>
                        <p className="text-gray-700 text-sm leading-relaxed">{line}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{section.lines.join('\n')}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== 尺寸說明 ===== */}
      {parsed.sizeImg && (
        <section className="max-w-[1504px] mx-auto px-12 pt-8">
          <h2 className="text-lg font-bold mb-4" style={{ color: '#4A4947' }}>
            尺寸說明
          </h2>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="relative w-full" style={{ aspectRatio: '3/2' }}>
              <Image src={parsed.sizeImg} alt="尺寸圖" fill className="object-contain" />
            </div>
          </div>
        </section>
      )}

      {/* ===== YouTube 影片 ===== */}
      {parsed.youtube && (
        <section className="max-w-[1504px] mx-auto px-12 pt-8 pb-12">
          <h2 className="text-lg font-bold mb-4" style={{ color: '#4A4947' }}>
            影片介紹
          </h2>
          <div className="aspect-video w-full rounded-2xl overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${parsed.youtube.match(/[?&]v=([^&]+)/)?.[1] || parsed.youtube.split('/').pop()}`}
              className="w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        </section>
      )}

      {/* 聯絡表單 Modal */}
      {contactOpen && <ContactModal
        key={product.id}
        isOpen={contactOpen}
        onClose={() => setContactOpen(false)}
        productName={product.name}
        productId={product.id}
        serviceType={serviceType}
        addOnOptions={parsed.addOns}
        choiceOptions={parsed.choices}
        initialExtraSelection={extras}
        onExtraSelectionChange={setExtras}
        priceOptions={priceOptions}
      />}

      {/* 圖片放大 Lightbox */}
      {lightboxOpen && images.length > 0 && (
        <ImageLightbox
          src={images[currentSlide] || images[0]}
          alt={`${product.name}－${product.category}活動方案圖片`}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}

function EquipmentProductDetail({
  product,
  images,
  parsed,
  priceOptions,
  detailSections,
  currentSlide,
  selectedPriceOption,
  quantity,
  extras,
  priceSelectionError,
  contactOpen,
  lightboxOpen,
  serviceType,
  onPreviousImage,
  onNextImage,
  onSelectImage,
  onOpenLightbox,
  onCloseLightbox,
  onSelectPrice,
  onExtrasChange,
  onQuantityChange,
  onOpenOrder,
  onCloseOrder,
}: {
  product: ProductDetail;
  images: string[];
  parsed: ReturnType<typeof parseDescription>;
  priceOptions: Array<{ label: string; price: string }>;
  detailSections: Array<{ title: string; lines: string[]; tone: string; numbered: boolean }>;
  currentSlide: number;
  selectedPriceOption: string;
  quantity: number;
  extras: ProductExtraSelection;
  priceSelectionError: boolean;
  contactOpen: boolean;
  lightboxOpen: boolean;
  serviceType?: string;
  onPreviousImage: () => void;
  onNextImage: () => void;
  onSelectImage: (index: number) => void;
  onOpenLightbox: () => void;
  onCloseLightbox: () => void;
  onSelectPrice: (value: string) => void;
  onExtrasChange: (value: ProductExtraSelection) => void;
  onQuantityChange: (value: number) => void;
  onOpenOrder: () => void;
  onCloseOrder: () => void;
}) {
  const descriptionLines = parseLines(parsed.service).slice(0, 2);
  const selectedSpecification = priceOptions.find(option => `${option.label}｜${option.price}` === selectedPriceOption) || (priceOptions.length === 1 ? priceOptions[0] : undefined);
  const totals = productExtraTotals(selectedSpecification?.price || '', parsed.addOns, extras.addOns);
  const updateExtra = (field: 'addOns' | 'choices', value: string, checked: boolean) => onExtrasChange({
    ...extras,
    [field]: checked ? [...extras[field], value] : extras[field].filter(item => item !== value),
  });

  return (
    <main className="min-h-screen bg-[#fcfaf7] px-5 pb-16 pt-28 text-[#3f3f3d] sm:px-8 md:pt-32 lg:px-12 lg:pb-24">
      <div className="mx-auto max-w-[1360px]">
        <button onClick={() => history.back()} className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#6c6863] transition-colors hover:text-[#aa7452]">
          <ChevronLeft size={17} /> 返回產品列表
        </button>

        <section className="rounded-[20px] border border-[#ebe5dc] bg-[#fffdf9] p-5 shadow-[0_14px_36px_rgba(70,57,43,0.045)] md:p-8 lg:p-10">
          <div className="grid items-start gap-9 lg:grid-cols-[minmax(0,1.1fr)_minmax(390px,0.9fr)] lg:gap-12">
            <div className="min-w-0">
              {images.length > 0 ? <>
                <div className="group relative aspect-[4/5] overflow-hidden rounded-[14px] bg-[#f2eee8]">
                  <button type="button" onClick={onOpenLightbox} className="absolute inset-0 z-10 cursor-zoom-in" aria-label="放大檢視商品圖片" />
                  <Image src={images[currentSlide] || images[0]} alt={`${product.name}－${product.category}活動服務圖片`} fill priority className="object-contain object-center" />
                  {images.length > 1 && <>
                    <button type="button" onClick={onPreviousImage} aria-label="上一張圖片" className="absolute left-4 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#e4ddd3] bg-white/95 text-[#6d6257] transition-colors hover:border-[#aa7452] hover:text-[#aa7452]"><ChevronLeft size={18} /></button>
                    <button type="button" onClick={onNextImage} aria-label="下一張圖片" className="absolute right-4 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#e4ddd3] bg-white/95 text-[#6d6257] transition-colors hover:border-[#aa7452] hover:text-[#aa7452]"><ChevronRight size={18} /></button>
                  </>}
                </div>
                {images.length > 1 && <div className="mt-4 grid grid-cols-4 gap-3">{images.slice(0, 4).map((image, index) => <button key={`${image}-${index}`} type="button" onClick={() => onSelectImage(index)} className={`relative aspect-square overflow-hidden rounded-[10px] border bg-[#f4f0ea] transition-colors ${currentSlide === index ? 'border-[#aa7452]' : 'border-transparent hover:border-[#cdbcae]'}`} aria-label={`檢視第 ${index + 1} 張圖片`}><Image src={image} alt={`${product.name} 縮圖 ${index + 1}`} fill sizes="(max-width: 1024px) 22vw, 130px" className="object-contain object-center" /></button>)}</div>}
              </> : <div className="flex aspect-[4/5] items-center justify-center rounded-[14px] bg-[#f2eee8] text-sm text-[#8a837a]">暫無圖片</div>}
            </div>

            <div className="min-w-0 py-1 lg:py-3">
              <p className="text-[13px] font-semibold tracking-[0.12em] text-[#aa7452]">{product.category}</p>
              <h1 className="mt-3 text-[32px] font-bold leading-tight tracking-[-0.025em] text-[#3f3f3d] md:text-[36px]">{product.name}</h1>
              {descriptionLines.length > 0 && <p className="mt-4 max-w-[34rem] text-[15px] leading-7 text-[#74706a]">{descriptionLines.join(' ')}</p>}

              <div className="mt-8 space-y-3">
                {priceOptions.length > 0 ? <fieldset>
                  <legend className="mb-3 text-sm font-semibold text-[#4a4947]">選擇規格{priceOptions.length > 1 ? ' *' : ''}</legend>
                  <div className="space-y-3">{priceOptions.map((option, index) => {
                    const value = `${option.label}｜${option.price}`;
                    const checked = selectedSpecification === option;
                    return <label key={value} className={`flex min-h-14 cursor-pointer items-center justify-between gap-4 rounded-xl border px-4 py-3 transition-colors ${checked ? 'border-[#aa7452] bg-white' : 'border-[#e6e1da] bg-white hover:border-[#c9ad96]'}`}>
                      <span className="flex min-w-0 items-center gap-3"><input type="radio" name="equipment-price-option" value={value} checked={checked} onChange={() => onSelectPrice(value)} className="h-4 w-4 shrink-0 accent-[#aa7452]" /><span className="font-medium text-[#4a4947]">{option.label}</span></span>
                      <span className="shrink-0 text-sm font-semibold text-[#aa7452]">{option.price || '洽詢'}</span>
                    </label>;
                  })}</div>
                  {priceSelectionError && <p className="mt-2 text-sm text-red-600">請先選擇商品規格。</p>}
                </fieldset> : <div className="rounded-xl border border-[#e6e1da] bg-white px-4 py-4 text-sm font-medium text-[#6f6961]">價格依活動需求報價</div>}
              </div>

              {(parsed.addOns.length > 0 || parsed.choices.length > 0) && <div className="mt-7 space-y-6">
                {parsed.addOns.length > 0 && <fieldset><legend className="mb-3 text-sm font-semibold text-[#4a4947]">加購商品 <span className="font-normal text-[#8c867d]">（可複選）</span></legend><div className="space-y-3">{parsed.addOns.map((option, index) => { const key = optionKey(option, index); const checked = extras.addOns.includes(key); return <label key={key} className={`flex min-h-14 cursor-pointer items-center justify-between gap-4 rounded-xl border px-4 py-3 transition-colors ${checked ? 'border-[#aa7452] bg-white' : 'border-[#e6e1da] bg-white hover:border-[#c9ad96]'}`}><span className="flex min-w-0 items-center gap-3"><input type="checkbox" checked={checked} onChange={event => updateExtra('addOns', key, event.target.checked)} className="h-4 w-4 shrink-0 accent-[#aa7452]" /><span className="font-medium text-[#4a4947]">{option.label}</span></span><span className="shrink-0 text-sm font-semibold text-[#aa7452]">+ {option.price || '洽詢'}</span></label>; })}</div></fieldset>}
                {parsed.choices.length > 0 && <fieldset><legend className="mb-3 text-sm font-semibold text-[#4a4947]">選購商品 <span className="font-normal text-[#8c867d]">（可複選）</span></legend><div className="space-y-3">{parsed.choices.map((option, index) => { const key = optionKey(option, index); const checked = extras.choices.includes(key); return <label key={key} className={`flex min-h-14 cursor-pointer items-center justify-between gap-4 rounded-xl border px-4 py-3 transition-colors ${checked ? 'border-[#aa7452] bg-white' : 'border-[#e6e1da] bg-white hover:border-[#c9ad96]'}`}><span className="flex min-w-0 items-center gap-3"><input type="checkbox" checked={checked} onChange={event => updateExtra('choices', key, event.target.checked)} className="h-4 w-4 shrink-0 accent-[#aa7452]" /><span className="font-medium text-[#4a4947]">{option.label}</span></span><span className="shrink-0 text-sm font-semibold text-[#8c867d]">不加價</span></label>; })}</div></fieldset>}
                {selectedSpecification && (parsed.addOns.length > 0 || parsed.choices.length > 0) && <p className="text-sm text-[#706a62]">{totals.total === null ? '完整金額以正式報價為準。' : `預估合計：${formatProductAmount(totals.total)}`}</p>}
              </div>}

              <div className="mt-7"><p className="mb-3 text-sm font-semibold text-[#4a4947]">數量</p><div className="inline-flex items-center rounded-lg border border-[#e4ded6] bg-white"><button type="button" aria-label="減少數量" onClick={() => onQuantityChange(Math.max(1, quantity - 1))} className="flex h-10 w-10 items-center justify-center text-[#6f6961] transition-colors hover:text-[#aa7452]"><Minus size={16} /></button><span className="w-10 text-center text-sm font-semibold tabular-nums text-[#4a4947]">{quantity}</span><button type="button" aria-label="增加數量" onClick={() => onQuantityChange(Math.min(99, quantity + 1))} className="flex h-10 w-10 items-center justify-center text-[#6f6961] transition-colors hover:text-[#aa7452]"><Plus size={16} /></button></div></div>

              <button type="button" onClick={onOpenOrder} className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#aa7452] px-6 py-4 text-base font-bold text-white transition-colors hover:bg-[#935e40]"><ShoppingCart size={18} strokeWidth={1.8} /> 加入訂單</button>
              {product.ai_file_url && <a href={product.ai_file_url} download className="mt-4 inline-flex text-sm font-semibold text-[#6d6257] underline decoration-[#cbb59e] underline-offset-4 transition-colors hover:text-[#aa7452]">下載 AI 完稿範例</a>}
            </div>
          </div>
        </section>

        {detailSections.length > 0 && <section className="mt-14 grid gap-x-12 md:grid-cols-2">{detailSections.map(section => <section key={section.title} className="border-t border-[#e6dfd6] py-7"><h2 className="text-lg font-bold text-[#4a4947]">{section.title}</h2><div className="mt-4 space-y-3">{section.lines.map((line, index) => <p key={`${section.title}-${index}`} className="text-[15px] leading-7 text-[#706c66]">{line}</p>)}</div></section>)}</section>}

        {parsed.sizeImg && <section className="mt-8 border-t border-[#e6dfd6] pt-7"><h2 className="text-lg font-bold text-[#4a4947]">尺寸說明</h2><div className="relative mt-5 aspect-[3/2] max-w-4xl overflow-hidden rounded-xl bg-white"><Image src={parsed.sizeImg} alt="尺寸圖" fill className="object-contain" /></div></section>}
        {parsed.youtube && <section className="mt-8 border-t border-[#e6dfd6] pt-7"><h2 className="text-lg font-bold text-[#4a4947]">影片介紹</h2><div className="mt-5 aspect-video overflow-hidden rounded-xl"><iframe src={`https://www.youtube.com/embed/${parsed.youtube.match(/[?&]v=([^&]+)/)?.[1] || parsed.youtube.split('/').pop()}`} className="h-full w-full" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" /></div></section>}
      </div>

      {contactOpen && <ContactModal key={`${product.id}-${selectedPriceOption}-${quantity}`} isOpen={contactOpen} onClose={onCloseOrder} productName={product.name} productId={product.id} serviceType={serviceType} addOnOptions={parsed.addOns} choiceOptions={parsed.choices} initialExtraSelection={extras} onExtraSelectionChange={onExtrasChange} priceOptions={priceOptions} initialPriceOptionValue={selectedPriceOption} orderQuantity={quantity} />}
      {lightboxOpen && images.length > 0 && <ImageLightbox src={images[currentSlide] || images[0]} alt={`${product.name}－${product.category}活動方案圖片`} onClose={onCloseLightbox} />}
    </main>
  );
}
