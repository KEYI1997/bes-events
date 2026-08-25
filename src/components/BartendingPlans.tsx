'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ArrowRight, Check, MapPin, ShieldCheck } from 'lucide-react';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import BartendingOrderModal from '@/components/BartendingOrderModal';
import { Product } from '@/lib/types';

const PLAN_DETAIL_LABELS = ['方案杯數', '建議人數', '原價', '優惠價', '現場加點估價'];

function parseSection(description: string, title: string) {
  const match = description.match(new RegExp(`【${title}】\\n?([\\s\\S]*?)(?=\\n*【|$)`));
  return (match?.[1] || '').split('\n').map(line => line.replace(/^(?:\*|•|-)\s*/, '').trim()).filter(Boolean);
}

function getPlanValue(lines: string[], label: string) {
  const line = lines.find(item => item.startsWith(`${label}：`) || item.startsWith(`${label}:`));
  return line?.replace(new RegExp(`^${label}[：:]\\s*`), '') || '';
}

function BartendingLines() {
  return (
    <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1200 620" preserveAspectRatio="none" fill="none">
      <defs>
        <filter id="bar-glow" x="-300%" y="-300%" width="600%" height="600%"><feGaussianBlur stdDeviation="10" /></filter>
        <radialGradient id="bar-point"><stop offset="0" stopColor="#fffdf7" /><stop offset=".08" stopColor="#fffdf7" /><stop offset=".2" stopColor="#d6a34a" stopOpacity=".75" /><stop offset="1" stopColor="#d6a34a" stopOpacity="0" /></radialGradient>
      </defs>
      <path d="M-50 145 C155 56 338 193 548 96 C742 8 978 135 1250 52" stroke="#c89b55" strokeWidth="1.35" opacity=".3" strokeDasharray="1700" strokeDashoffset="1700"><animate attributeName="stroke-dashoffset" from="1700" to="0" dur="1.8s" fill="freeze" /></path>
      <path d="M-40 305 C180 360 338 240 520 292 C739 355 920 218 1240 174" stroke="#d0a565" strokeWidth=".9" opacity=".22" strokeDasharray="1700" strokeDashoffset="1700"><animate attributeName="stroke-dashoffset" from="1700" to="0" begin=".18s" dur="1.9s" fill="freeze" /></path>
      <path d="M-35 490 C190 544 357 412 548 448 C760 489 933 550 1240 345" stroke="#d8b67a" strokeWidth=".75" opacity=".3" strokeDasharray="1700" strokeDashoffset="1700"><animate attributeName="stroke-dashoffset" from="1700" to="0" begin=".34s" dur="2s" fill="freeze" /></path>
      <path d="M-20 220 C160 180 294 268 430 214 C620 138 800 248 1030 176 C1114 150 1170 158 1230 132" stroke="#d8b67a" strokeWidth=".42" opacity=".14" />
      <path d="M80 566 C264 476 394 594 582 518 C766 444 940 530 1230 438" stroke="#c89b55" strokeWidth=".35" opacity=".14" />
      <circle cx="650" cy="91" r="32" fill="url(#bar-point)" opacity=".32" filter="url(#bar-glow)" /><circle cx="650" cy="91" r="1.8" fill="#fffdf7" opacity=".9" />
      <circle cx="184" cy="490" r="35" fill="url(#bar-point)" opacity=".28" filter="url(#bar-glow)" /><circle cx="184" cy="490" r="1.8" fill="#fffdf7" opacity=".9" />
      <circle cx="1050" cy="380" r="34" fill="url(#bar-point)" opacity=".3" filter="url(#bar-glow)" /><circle cx="1050" cy="380" r="1.8" fill="#fffdf7" opacity=".9" />
    </svg>
  );
}

export default function BartendingPlans({ products }: { products: Product[] }) {
  const [orderPlan, setOrderPlan] = useState<string | null>(null);
  const firstDescription = products[0]?.description || products[0]?.service_content || '';
  const firstServiceLines = parseSection(firstDescription, '服務內容');
  const includedServices = firstServiceLines.filter(line => !PLAN_DETAIL_LABELS.some(label => line.startsWith(`${label}：`) || line.startsWith(`${label}:`)));
  const notices = parseSection(firstDescription, '注意事項');
  const serviceFeatures = includedServices.length > 0 ? includedServices.slice(0, 5) : ['專業調酒團隊', '客製化酒單', '完整吧台設備', '彈性場地配合', '加點服務'];

  return (
    <main className="min-h-screen overflow-hidden bg-[#fdfcfb] text-[#172039]">
      <section className="relative min-h-[620px] border-b border-[#e2ded8] bg-white md:min-h-[680px]">
        <div className="absolute inset-y-0 right-0 w-full md:w-[61%]">
          <Image src="/images/services/bartending.png" alt="外派調酒活動服務" fill priority className="object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/55 to-transparent md:from-white md:via-white/20 md:to-transparent" />
        </div>
        <BartendingLines />
        <div className="relative z-10 mx-auto flex min-h-[620px] max-w-[1400px] items-center px-6 py-28 md:min-h-[680px] md:px-12 lg:px-20">
          <AnimateOnScroll>
            <div className="max-w-xl">
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-[#b58445]">BAR SERVICE</p>
              <h1 className="mt-5 text-5xl font-semibold tracking-tight text-[#172039] md:text-7xl">外派調酒</h1>
              <p className="mt-7 max-w-lg text-base leading-8 text-[#4f535b] md:text-lg">從 50 杯到 400 杯的行動酒吧方案，<br className="hidden md:block" />包含專業調酒、客製酒單、吧台器具與場地規劃。</p>
              <a href="#plans" className="mt-9 inline-flex items-center gap-2 rounded-md bg-[#b58445] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#996f39]">洽詢調酒方案 <ArrowRight size={16} /></a>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      <section id="plans" className="mx-auto max-w-[1400px] border-b border-[#e2ded8] px-5 py-20 md:px-10 md:py-24 lg:px-16">
        <AnimateOnScroll>
          <div className="text-center"><p className="text-sm uppercase tracking-[0.28em] text-[#b58445]">SERVICE PLANS</p><h2 className="mt-3 text-3xl font-medium tracking-tight md:text-5xl">服務方案</h2><p className="mt-4 text-sm leading-7 text-[#5b5e65] md:text-base">依照活動規模與預計飲用人數，選擇最適合的調酒杯數</p></div>
        </AnimateOnScroll>
        {products.length > 0 ? (
          <div className="mt-12 grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-4">
            {products.map((product, index) => {
              const description = product.description || product.service_content || '';
              const lines = parseSection(description, '服務內容');
              const cups = getPlanValue(lines, '方案杯數');
              const people = getPlanValue(lines, '建議人數');
              const original = getPlanValue(lines, '原價');
              const sale = getPlanValue(lines, '優惠價') || product.price_note;
              const extra = getPlanValue(lines, '現場加點估價');
              return <div key={product.id} className="h-full"><AnimateOnScroll delay={index * 100}><article className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#e8e1d8] bg-white shadow-[0_10px_30px_rgba(23,32,57,0.06)]">
                <div className="relative aspect-[4/3] overflow-hidden"><Image src="/images/services/bartending-plans-2026.jpg" alt={product.name} fill className="object-cover" /></div>
                <div className="flex flex-1 flex-col p-5 md:p-6"><p className="font-serif text-xl tracking-wide text-[#172039]">{product.name.split('｜')[0]}</p><h3 className="mt-2 text-lg font-medium text-[#303746]">{cups || product.name.split('｜')[1] || '調酒方案'}</h3>
                  <div className="mt-5 space-y-3 text-sm leading-6 text-[#5b5e65]"><p>建議人數：{people || '依活動需求評估'}</p>{original && <p>原價：{original}</p>}{sale && <p className="font-semibold text-[#b58445]">優惠價：{sale}</p>}{extra && <p>現場加點：{extra}</p>}</div>
                  <button type="button" onClick={() => setOrderPlan(product.name)} className="mt-auto inline-flex items-center justify-center gap-2 rounded-md border border-[#b58445] px-4 py-2.5 text-sm font-medium text-[#9a6c31] transition hover:bg-[#b58445] hover:text-white">立即預訂 <ArrowRight size={15} /></button>
                </div>
              </article></AnimateOnScroll></div>;
            })}
          </div>
        ) : <div className="py-16 text-center text-[#5b5e65]">方案整理中，歡迎先與我們聯繫。</div>}
        <p className="mx-auto mt-10 max-w-3xl text-center text-sm leading-7 text-[#5b5e65]">{includedServices.join('、') || '以上價格與服務內容依目前網站方案資料為準。'}</p>
      </section>

      <section className="relative mx-auto max-w-[1400px] border-b border-[#e2ded8] px-5 py-16 md:px-10 md:py-20 lg:px-16">
        <div className="text-center"><p className="text-sm uppercase tracking-[0.28em] text-[#b58445]">SERVICE DETAILS</p><h2 className="mt-3 text-3xl font-medium md:text-4xl">服務內容</h2></div>
        <div className="mx-auto mt-12 flex max-w-6xl flex-wrap justify-center gap-y-10">{serviceFeatures.map((item, index) => <div key={`${item}-${index}`} className="w-full text-center md:w-1/5 md:border-r md:border-[#dedbd5] md:px-6 md:last:border-r-0"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#cda774] text-[#b58445]"><Check size={22} strokeWidth={1.4} /></div><h3 className="mt-5 text-lg font-medium text-[#172039]">{item.split('：')[0]}</h3><p className="mx-auto mt-3 max-w-[14rem] text-base leading-7 text-[#5b5e65]">{item.includes('：') ? item.split('：').slice(1).join('：') : '依活動需求提供現場服務與規劃。'}</p></div>)}</div>
        {notices.length > 0 && <div className="mx-auto mt-12 max-w-3xl border-t border-[#e2ded8] pt-6 text-center text-sm leading-7 text-[#5b5e65]"><ShieldCheck className="mx-auto mb-2 text-[#b58445]" size={20} strokeWidth={1.4} />{notices.join('、')}</div>}
      </section>

      <section className="relative mx-auto max-w-5xl px-5 py-16 md:px-10 md:py-20"><div className="rounded-2xl border border-[#e2d8c9] bg-white px-7 py-10 text-center shadow-[0_8px_28px_rgba(23,32,57,0.04)] md:px-12"><MapPin className="mx-auto text-[#b58445]" size={28} strokeWidth={1.3} /><h2 className="mt-4 text-2xl font-medium md:text-3xl">想了解更多方案與細節？</h2><p className="mt-3 text-sm leading-7 text-[#5b5e65]">歡迎與我們聯繫，為您的活動規劃最合適的調酒服務。</p><a href="/contact" className="mt-6 inline-flex items-center gap-2 rounded-md bg-[#b58445] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#996f39]">洽詢專屬方案 <ArrowRight size={16} /></a></div></section>
      {orderPlan && <BartendingOrderModal planName={orderPlan} onClose={() => setOrderPlan(null)} />}
    </main>
  );
}
