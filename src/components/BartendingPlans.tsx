'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Check, ClipboardList, GlassWater, MessageCircle, ShieldCheck } from 'lucide-react';
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
      <section className="bg-[#F9F7F0] py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <AnimateOnScroll>
            <div className="text-center mb-10">
              <p className="text-cta font-semibold tracking-[0.24em] text-sm mb-3">MOBILE BAR SERVICE</p>
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3">境曜行動酒吧方案</h2>
              <p className="text-primary/60">專業調酒 × 質感服務 × 客製體驗</p>
            </div>
          </AnimateOnScroll>

          <div className="grid lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-8 items-start">
            <AnimateOnScroll direction="left">
              <div className="bg-primary rounded-3xl p-3 shadow-xl">
                <Image
                  src="/images/services/bartending-plans-2026.jpg"
                  alt="境曜行動酒吧方案價目表"
                  width={1054}
                  height={1473}
                  priority
                  className="w-full h-auto rounded-2xl"
                />
              </div>
            </AnimateOnScroll>

            <div>
              <AnimateOnScroll direction="right">
                <div className="bg-white rounded-3xl p-7 md:p-9 shadow-sm border border-primary/10 mb-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-11 h-11 rounded-full bg-cta/10 flex items-center justify-center">
                      <GlassWater className="w-6 h-6 text-cta" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-primary">服務包含</h3>
                      <p className="text-sm text-primary/50">每個方案皆包含完整行動酒吧服務</p>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {includedServices.map(item => (
                      <div key={item} className="flex items-start gap-2.5 bg-[#F9F7F0] rounded-xl p-3.5">
                        <Check className="w-4 h-4 text-cta mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-primary/75 leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </AnimateOnScroll>

              <AnimateOnScroll direction="right" delay={100}>
                <div className="bg-primary rounded-3xl p-7 md:p-9 text-white">
                  <h3 className="text-2xl font-bold mb-3">如何選擇方案？</h3>
                  <p className="text-white/70 leading-relaxed mb-5">
                    可先依預估飲用人數選擇杯數，我們會再依活動時間、場地與酒單需求確認最適合的配置。
                  </p>
                  <div className="flex flex-wrap gap-2 text-sm">
                    {['婚宴迎賓', '企業活動', '品牌發表', '尾牙春酒', '私人派對'].map(tag => (
                      <span key={tag} className="px-3 py-1.5 rounded-full bg-white/10 text-white/80">{tag}</span>
                    ))}
                  </div>
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <AnimateOnScroll>
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3">選擇您的調酒方案</h2>
            <p className="text-primary/60">優惠價與現場加點估價依圖示方案，最終以活動需求確認為準</p>
          </div>
        </AnimateOnScroll>

        {products.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => {
              const description = product.description || product.service_content || '';
              const serviceLines = parseSection(description, '服務內容');
              const [planLabel, cupLabel = ''] = product.name.split('｜');
              const people = getPlanValue(serviceLines, '建議人數');
              const originalPrice = getPlanValue(serviceLines, '原價');
              const salePrice = getPlanValue(serviceLines, '優惠價') || product.price_note;
              const extraCup = getPlanValue(serviceLines, '現場加點估價');

              return (
                <AnimateOnScroll key={product.id} delay={index * 70}>
                  <article className="h-full bg-white rounded-2xl border border-primary/10 shadow-sm overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                    <div className="bg-primary px-6 py-5 text-white flex items-center justify-between gap-3">
                      <div>
                        <p className="text-cta text-sm font-semibold tracking-wider">{planLabel}</p>
                        <h3 className="text-2xl font-bold mt-1">{cupLabel || product.name}</h3>
                      </div>
                      <GlassWater className="w-9 h-9 text-white/35" />
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <p className="text-sm text-primary/55 mb-1">建議人數</p>
                      <p className="text-lg font-bold text-primary mb-5">{people || '依活動需求評估'}</p>

                      <div className="border-t border-primary/10 pt-5 mb-5">
                        {originalPrice && <p className="text-sm text-primary/40 line-through">原價 {originalPrice}</p>}
                        <p className="text-3xl font-bold text-cta mt-1">{salePrice || '歡迎詢價'}</p>
                        {extraCup && <p className="text-sm text-primary/55 mt-2">現場加點：{extraCup}</p>}
                      </div>

                      <button
                        type="button"
                        onClick={() => setOrderPlan(product.name)}
                        className="mt-auto inline-flex items-center justify-center gap-2 bg-cta text-white px-5 py-3 rounded-full font-semibold hover:bg-cta-hover transition-colors"
                      >
                        <ClipboardList size={18} />
                        建立訂單
                      </button>
                    </div>
                  </article>
                </AnimateOnScroll>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-14 bg-[#F9F7F0] rounded-2xl text-primary/55">
            方案整理中，歡迎先與我們聯繫。
          </div>
        )}
      </section>

      {notices.length > 0 && (
        <section className="bg-[#F9F7F0] border-y border-primary/10">
          <div className="max-w-5xl mx-auto px-4 py-14 md:py-20">
            <AnimateOnScroll>
              <div className="flex items-center justify-center gap-3 mb-8">
                <ShieldCheck className="w-7 h-7 text-cta" />
                <h2 className="text-2xl md:text-3xl font-bold text-primary">加購服務與注意事項</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {notices.map(item => (
                  <div key={item} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-primary/10">
                    <Check className="w-4 h-4 text-cta mt-1 flex-shrink-0" />
                    <p className="text-sm text-primary/70 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </AnimateOnScroll>
          </div>
        </section>
      )}

      <section className="bg-primary py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <AnimateOnScroll>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">想了解更多？</h2>
            <p className="text-white/80 mb-8">歡迎聯繫我們，取得客製化報價與專業建議</p>
            <Link href="/contact" className="inline-flex items-center gap-2 bg-cta text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-cta-hover transition-colors">
              <MessageCircle size={20} />立即諮詢
            </Link>
          </AnimateOnScroll>
        </div>
      </section>

      {orderPlan && <BartendingOrderModal planName={orderPlan} onClose={() => setOrderPlan(null)} />}
    </>
  );
}
