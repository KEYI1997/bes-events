'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ProductDetail {
  id: string;
  name: string;
  category: string;
  description?: string;
  image_url?: string;
  price_note?: string;
}

function parseDescription(desc: string) {
  const service = desc.match(/【服務內容】\n?([\s\S]*?)(?=\n*【|$)/)?.[1]?.trim() || '';
  const notice = desc.match(/【注意事項】\n?([\s\S]*?)(?=\n*【|$)/)?.[1]?.trim() || '';
  const youtube = desc.match(/【YouTube】\n?([\s\S]*?)(?=\n*【|$)/)?.[1]?.trim() || '';
  const sizeImg = desc.match(/【尺寸圖】\n?(https?:\/\/[^\s]+)/)?.[1] || '';
  return { service, notice, youtube, sizeImg };
}

function parseLines(text: string): string[] {
  return text.split('\n').map(l => l.replace(/^\d+[\.\、\s]*/, '').trim()).filter(Boolean);
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

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
  const serviceLines = parseLines(parsed.service);
  const noticeLines = parseLines(parsed.notice);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F7F0' }}>
      {/* 返回 */}
      <div className="max-w-[1504px] mx-auto px-12 pt-20">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition">
          <ChevronLeft className="w-4 h-4" /> 返回列表
        </button>
      </div>

      {/* ===== 頂部區域：左圖(64.4%) 右資訊(33.6%) 高度560px ===== */}
      <section className="max-w-[1504px] mx-auto px-12 pt-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 左側圖片：64.4% 寬 */}
          <div className="w-full lg:w-[64.4%] h-auto lg:h-[500px]">
            {images.length > 0 ? (
              <>
                <div className="relative w-full h-[440px] rounded-2xl overflow-hidden bg-white shadow-sm">
                  <Image
                    src={images[currentSlide] || images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
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
              <div className="w-full h-[440px] rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">暫無圖片</div>
            )}
          </div>

          {/* 右側資訊：33.6% 寬 */}
          <div className="w-full lg:w-[33.6%] h-auto lg:h-[500px]">
            <div className="bg-white rounded-2xl p-8 shadow-sm h-full flex flex-col justify-center">
              <h1 className="text-2xl md:text-3xl font-bold mb-6" style={{ color: '#4A4947' }}>{product.name}</h1>
              <hr className="border-gray-200 mb-6" />
              <p className="text-sm font-medium mb-1" style={{ color: '#AA7452' }}>價格</p>
              <p className="text-3xl font-bold mb-8" style={{ color: '#AA7452' }}>{product.price_note || '洽詢'}</p>

              {/* 建立訂單 */}
              <Link
                href="/contact"
                className="squish-btn flex items-center justify-center gap-2 w-4/5 mx-auto py-3.5 text-white text-lg font-bold rounded-full transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                style={{ backgroundColor: '#AA7452' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" className="w-5 h-5" fill="white"><path d="M0 32C0 14.3 14.3 0 32 0L48 0c44.2 0 80 35.8 80 80l0 288c0 8.8 7.2 16 16 16l416 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-416 0c-44.2 0-80-35.8-80-80L64 80c0-8.8-7.2-16-16-16L32 64C14.3 64 0 49.7 0 32zM160 128l0 64c0 17.7 14.3 32 32 32l128 0c17.7 0 32-14.3 32-32l0-64c0-17.7-14.3-32-32-32L192 96c-17.7 0-32 14.3-32 32zm192 0l0 64c0 17.7 14.3 32 32 32l128 0c17.7 0 32-14.3 32-32l0-64c0-17.7-14.3-32-32-32L384 96c-17.7 0-32 14.3-32 32zM160 320l0-64c0-17.7 14.3-32 32-32l128 0c17.7 0 32 14.3 32 32l0 64c0 17.7-14.3 32-32 32l-128 0c-17.7 0-32-14.3-32-32zm192 0l0-64c0-17.7 14.3-32 32-32l128 0c17.7 0 32 14.3 32 32l0 64c0 17.7-14.3 32-32 32l-128 0c-17.7 0-32-14.3-32-32z"/></svg>
                建立訂單
              </Link>

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

      {/* ===== 底部區域：服務內容(48.9%) + 注意事項(48.9%) 間距32px ===== */}
      {(serviceLines.length > 0 || noticeLines.length > 0) && (
        <section className="max-w-[1504px] mx-auto px-12 pt-8">
          <div className="flex flex-col md:flex-row gap-8">
            {serviceLines.length > 0 && (
              <div className="w-full md:w-1/2 bg-white rounded-2xl p-6 md:p-8 shadow-sm">
                <h2 className="text-lg font-bold mb-5 flex items-center gap-2" style={{ color: '#4A4947' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" className="w-5 h-5" fill="#AA7452"><path d="M96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3zM625 177L497 305c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L591 143c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/></svg>
                  服務內容
                </h2>
                <div className="space-y-3">
                  {serviceLines.map((line, idx) => (
                    <div key={idx} className="flex gap-3 items-start">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: '#AA7452' }}>{idx + 1}</span>
                      <p className="text-gray-700 text-sm leading-relaxed">{line}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {noticeLines.length > 0 && (
              <div className="w-full md:w-1/2 bg-white rounded-2xl p-6 md:p-8 shadow-sm">
                <h2 className="text-lg font-bold mb-5 flex items-center gap-2" style={{ color: '#4A4947' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-5 h-5" fill="#AA7452"><path d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-384c-13.3 0-24 10.7-24 24l0 112c0 13.3 10.7 24 24 24s24-10.7 24-24l0-112c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"/></svg>
                  注意事項
                </h2>
                <div className="space-y-3">
                  {noticeLines.map((line, idx) => (
                    <div key={idx} className="flex gap-3 items-start">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: '#AA745220', color: '#AA7452' }}>{idx + 1}</span>
                      <p className="text-gray-700 text-sm leading-relaxed">{line}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
    </div>
  );
}
