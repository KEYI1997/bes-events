'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Check, ClipboardList, ShieldCheck } from 'lucide-react';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import BartendingOrderModal from '@/components/BartendingOrderModal';
import { Product } from '@/lib/types';

const PLAN_DETAIL_LABELS = ['方案杯數', '建議人數', '原價', '優惠價', '現場加點估價'];

function parseSection(description: string, title: string) {
  const match = description.match(new RegExp(`【${title}】\\n?([\\s\\S]*?)(?=\\n*【|$)`));
  return (match?.[1] || '')
    .split('\n')
    .map(line => line.replace(/^(?:\*|•|-)\s*/, '').trim())
    .filter(Boolean);
}

function getPlanValue(lines: string[], label: string) {
  const line = lines.find(item => item.startsWith(`${label}：`) || item.startsWith(`${label}:`));
  return line?.replace(new RegExp(`^${label}[：:]\\s*`), '') || '';
}

export default function BartendingPlans({ products }: { products: Product[] }) {
  const [orderPlan, setOrderPlan] = useState<string | null>(null);
  const firstDescription = products[0]?.description || products[0]?.service_content || '';
  const firstServiceLines = parseSection(firstDescription, '服務內容');
  const includedServices = firstServiceLines.filter(line => (
    !PLAN_DETAIL_LABELS.some(label => line.startsWith(`${label}：`) || line.startsWith(`${label}:`))
  ));
  const notices = parseSection(firstDescription, '注意事項');

  return (
    <>
      <section className="max-w-7xl mx-auto px-4 pt-16 pb-8 md:pt-24 md:pb-10">
        <AnimateOnScroll>
          <h2 className="text-2xl md:text-3xl font-bold text-primary text-center mb-3">服務方案</h2>
          <p className="text-primary/60 text-center">依照活動規模與預計飲用人數，選擇最適合的調酒杯數</p>
        </AnimateOnScroll>
      </section>

      {products.length > 0 ? (
        <div className="px-6 md:px-16 space-y-0">
          {products.map((product, index) => {
            const description = product.description || product.service_content || '';
            const serviceLines = parseSection(description, '服務內容');
            const isLeft = index % 2 === 0;
            const gradientClass = isLeft
              ? 'bg-gradient-to-r from-black/80 via-black/50 to-transparent'
              : 'bg-gradient-to-l from-black/80 via-black/50 to-transparent';
            const highlights = [
              `建議人數：${getPlanValue(serviceLines, '建議人數')}`,
              `原價：${getPlanValue(serviceLines, '原價')}`,
              `優惠價：${getPlanValue(serviceLines, '優惠價') || product.price_note}`,
              `現場加點：${getPlanValue(serviceLines, '現場加點估價')}`,
            ].filter(item => !item.endsWith('：'));

            return (
              <AnimateOnScroll key={product.id} delay={index * 80}>
                <div className={`relative w-full h-[330px] md:h-[380px] overflow-hidden border-t-2 border-white ${index === products.length - 1 ? 'border-b-2' : ''}`}>
                  <Image
                    src="/images/services/bartending.png"
                    alt={product.name}
                    fill
                    className={`object-cover ${isLeft ? 'object-center' : 'object-bottom'} ${!isLeft ? 'scale-x-[-1]' : ''}`}
                  />
                  <div className={`absolute inset-0 ${gradientClass}`} />

                  <div className={`absolute inset-0 flex flex-col justify-center px-8 md:px-16 ${isLeft ? 'items-start' : 'items-end'}`}>
                    <div className={`w-full max-w-2xl ${isLeft ? 'text-left' : 'text-right'}`}>
                      <h3 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow">{product.name}</h3>
                      <div className="bg-black/55 px-5 py-4 space-y-1.5 mb-5 inline-block min-w-[280px] md:min-w-[390px] text-left">
                        {highlights.map((item, itemIndex) => (
                          <p key={item} className={`text-white/90 text-sm md:text-base ${itemIndex === 2 ? 'font-bold text-[#D8A76D]' : ''}`}>
                            {itemIndex + 1}. {item}
                          </p>
                        ))}
                      </div>
                      <div className={isLeft ? '' : 'flex justify-end'}>
                        <button
                          type="button"
                          onClick={() => setOrderPlan(product.name)}
                          className="inline-flex items-center gap-2 bg-cta text-white px-7 py-3 rounded-full font-semibold text-base hover:bg-cta-hover transition-colors shadow-lg"
                        >
                          <ClipboardList size={18} />
                          建立訂單
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
            );
          })}
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 pb-16">
          <div className="text-center py-14 bg-[#F9F7F0] rounded-2xl text-primary/55">方案整理中，歡迎先與我們聯繫。</div>
        </div>
      )}

      {(includedServices.length > 0 || notices.length > 0) && (
        <section className="bg-[#F9F7F0] border-y border-primary/10 mt-16 md:mt-24">
          <div className="max-w-6xl mx-auto px-4 py-14 md:py-20 grid lg:grid-cols-2 gap-8">
            {includedServices.length > 0 && (
              <AnimateOnScroll direction="left">
                <div className="bg-white rounded-2xl p-7 h-full border border-primary/10 shadow-sm">
                  <h2 className="text-2xl font-bold text-primary mb-6">服務包含</h2>
                  <div className="space-y-3">
                    {includedServices.map(item => (
                      <div key={item} className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-cta mt-1 flex-shrink-0" />
                        <p className="text-sm text-primary/70 leading-relaxed">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </AnimateOnScroll>
            )}

            {notices.length > 0 && (
              <AnimateOnScroll direction="right">
                <div className="bg-white rounded-2xl p-7 h-full border border-primary/10 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <ShieldCheck className="w-6 h-6 text-cta" />
                    <h2 className="text-2xl font-bold text-primary">加購服務與注意事項</h2>
                  </div>
                  <div className="space-y-3">
                    {notices.map(item => (
                      <div key={item} className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-cta mt-1 flex-shrink-0" />
                        <p className="text-sm text-primary/70 leading-relaxed">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </AnimateOnScroll>
            )}
          </div>
        </section>
      )}

      {orderPlan && <BartendingOrderModal planName={orderPlan} onClose={() => setOrderPlan(null)} />}
    </>
  );
}
