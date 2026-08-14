'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ContactModal from '@/components/ContactModal';
import ImageLightbox from '@/components/ImageLightbox';

interface ProductDetail {
  id: string;
  name: string;
  category: string;
  description?: string;
  image_url?: string;
  price_note?: string;
  ai_file_url?: string;
}

function parseDescription(desc: string) {
  const service = desc.match(/【(?:服務內容|效果介紹)】\n?([\s\S]*?)(?=\n*【|$)/)?.[1]?.trim() || '';
  const features = desc.match(/【效果特色】\n?([\s\S]*?)(?=\n*【|$)/)?.[1]?.trim() || '';
  const notice = desc.match(/【注意事項】\n?([\s\S]*?)(?=\n*【|$)/)?.[1]?.trim() || '';
  const occasions = desc.match(/【適用場合】\n?([\s\S]*?)(?=\n*【|$)/)?.[1]?.trim() || '';
  const youtube = desc.match(/【YouTube】\n?([\s\S]*?)(?=\n*【|$)/)?.[1]?.trim() || '';
  const sizeImg = desc.match(/【尺寸圖】\n?(https?:\/\/[^\s]+)/)?.[1] || '';
  return { service, features, notice, occasions, youtube, sizeImg };
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

  useEffect(() => {
    async function fetchProduct() {
      const { data } = await supabase.from('products').select('*').eq('id', productId).single();
      setProduct(data);
      setLoading(false);
    }
    if (productId) fetchProduct();
  }, [productId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">載入中...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center text-gray-500">找不到此產品</div>;

  const images = product.image_url ? product.image_url.split(',').filter(Boolean) : [];
  const parsed = parseDescription(product.description || '');
  const detailSections = [
    { title: product.category === '活動特效' ? '效果介紹' : '服務內容', lines: parseLines(parsed.service), tone: 'blue', numbered: product.category !== '活動特效' },
    { title: '效果特色', lines: parseLines(parsed.features), tone: 'green', numbered: true },
    { title: '注意事項', lines: parseLines(parsed.notice), tone: 'orange', numbered: true },
    { title: '適用場合', lines: parseLines(parsed.occasions), tone: 'purple', numbered: true },
  ].filter(section => section.lines.length > 0);

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
                <div className="relative w-full flex-1 min-h-[440px] rounded-2xl overflow-hidden bg-white shadow-sm group cursor-pointer" onClick={() => setLightboxOpen(true)}>
                  <Image
                    src={images[currentSlide] || images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
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
              <p className="text-3xl font-bold mb-8" style={{ color: '#AA7452' }}>NT {product.price_note || '洽詢'}</p>

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
      <ContactModal
        isOpen={contactOpen}
        onClose={() => setContactOpen(false)}
        productName={product.name}
      />

      {/* 圖片放大 Lightbox */}
      {lightboxOpen && images.length > 0 && (
        <ImageLightbox
          src={images[currentSlide] || images[0]}
          alt={product.name}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
