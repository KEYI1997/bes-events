'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { AlertCircle, ArrowRight, Check, ShieldCheck, X } from 'lucide-react';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import BartendingOrderModal from '@/components/BartendingOrderModal';
import { Product } from '@/lib/types';
import { formatProductPrice } from '@/lib/productOptions';

const PLAN_DETAIL_LABELS = ['方案杯數', '建議人數', '原價', '優惠價', '現場加點估價'];

function parseSection(description: string, title: string) {
  const match = description.match(new RegExp(`【${title}】\\n?([\\s\\S]*?)(?=\\n*【|$)`));
  return (match?.[1] || '').split('\n').map(line => line.replace(/^(?:\*|•|-)\s*/, '').trim()).filter(Boolean);
}

function getPlanValue(lines: string[], label: string) {
  const line = lines.find(item => item.startsWith(`${label}：`) || item.startsWith(`${label}:`));
  return line?.replace(new RegExp(`^${label}[：:]\\s*`), '') || '';
}

function getPlanImage(product: Product, index: number) {
  // 外派調酒的方案圖片以後台「產品管理」的上傳內容為準；舊資料未設定時，才沿用既有的 A–G 預設圖片。
  const managedImage = product.image_url?.split(',')[0]?.trim() || product.image_urls?.[0];
  if (managedImage) return managedImage;

  const code = product.name.match(/PLAN\s*([A-G])/i)?.[1]?.toLowerCase() || String.fromCharCode(97 + index);
  return /^[a-g]$/.test(code)
    ? `/images/services/bartending-plans/plan-${code}.png`
    : '/images/services/bartending-plans-2026.jpg';
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
      <g aria-hidden="true">
        <circle r="32" fill="url(#bar-point)" opacity=".32" filter="url(#bar-glow)" /><circle r="2" fill="#fffdf7" opacity=".92" />
        <animateMotion path="M-50 145 C155 56 338 193 548 96 C742 8 978 135 1250 52" dur="15s" repeatCount="indefinite" />
      </g>
      <g aria-hidden="true">
        <circle r="35" fill="url(#bar-point)" opacity=".28" filter="url(#bar-glow)" /><circle r="1.8" fill="#fffdf7" opacity=".9" />
        <animateMotion path="M-35 490 C190 544 357 412 548 448 C760 489 933 550 1240 345" dur="18s" begin="-7s" repeatCount="indefinite" />
      </g>
      <g aria-hidden="true">
        <circle r="34" fill="url(#bar-point)" opacity=".3" filter="url(#bar-glow)" /><circle r="1.9" fill="#fffdf7" opacity=".9" />
        <animateMotion path="M-40 305 C180 360 338 240 520 292 C739 355 920 218 1240 174" dur="16s" begin="-11s" repeatCount="indefinite" />
      </g>
    </svg>
  );
}

function BartendingBookingNotice({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return <div className="fixed inset-0 z-[210] flex items-center justify-center p-5" role="dialog" aria-modal="true" aria-labelledby="bartending-notice-title" onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="absolute inset-0 bg-[#172039]/55" />
    <section className="relative w-full max-w-[560px] rounded-2xl bg-white p-7 shadow-[0_18px_55px_rgba(23,32,57,0.24)] sm:p-9">
      <button type="button" onClick={onClose} aria-label="關閉提醒" className="absolute right-5 top-5 rounded-full p-1 text-[#6b6f76] transition-colors hover:text-[#172039]"><X size={22} /></button>
      <AlertCircle size={26} strokeWidth={1.5} className="text-[#b58445]" aria-hidden="true" />
      <h2 id="bartending-notice-title" className="mt-4 text-2xl font-semibold text-[#172039]">預訂前提醒</h2>
      <div className="mt-6 space-y-3 text-[15px] leading-7 text-[#4f535b]">
        <p>未滿十八歲禁止飲酒，酒後不開車。</p>
        <p>臺北市、新北市免車馬費；其他地區依距離另計往返車馬費。</p>
        <p>延長服務每小時 $NT2,000；指定酒款或升級酒款另行報價。</p>
        <p>現場追加杯數依各方案標示估價；活動規模較大時，額外人力另行報價。</p>
        <p>最終報價依活動日期、地點、時數與需求確認為準。</p>
      </div>
      <button type="button" onClick={onConfirm} className="mt-8 inline-flex w-full items-center justify-center rounded-md bg-[#b58445] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#996f39]">了解</button>
    </section>
  </div>;
}

export default function BartendingPlans({ products }: { products: Product[] }) {
  const [orderPlan, setOrderPlan] = useState<{ name: string; price: string } | null>(null);
  const [noticePlan, setNoticePlan] = useState<{ name: string; price: string } | null>(null);
  const firstDescription = products[0]?.description || products[0]?.service_content || '';
  const firstServiceLines = parseSection(firstDescription, '服務內容');
  const includedServices = firstServiceLines.filter(line => !PLAN_DETAIL_LABELS.some(label => line.startsWith(`${label}：`) || line.startsWith(`${label}:`)));
  const notices = parseSection(firstDescription, '注意事項');
  const serviceFeatures = includedServices.length > 0 ? includedServices.slice(0, 5) : ['專業調酒團隊', '客製化酒單', '完整吧台設備', '彈性場地配合', '加點服務'];
  const displayedServiceFeatures = serviceFeatures.map((item, index) => index === 0 ? '客製酒單設計' : item);

  return (
    <main className="min-h-screen overflow-hidden bg-[#fdfcfb] text-[#172039]">
      <section className="relative min-h-[620px] border-b border-[#e2ded8] bg-white md:min-h-[680px]">
        <div className="absolute inset-y-0 right-0 w-full md:w-[61%]">
          <Image
            src="/images/services/bartending.png"
            alt="外派調酒活動服務"
            fill
            priority
            className="object-cover object-center [mask-image:linear-gradient(90deg,transparent_0%,rgba(0,0,0,.12)_10%,rgba(0,0,0,.48)_24%,#000_42%)] [-webkit-mask-image:linear-gradient(90deg,transparent_0%,rgba(0,0,0,.12)_10%,rgba(0,0,0,.48)_24%,#000_42%)]"
          />
          <div className="absolute inset-y-0 left-0 w-full bg-[linear-gradient(90deg,rgba(255,255,255,1)_0%,rgba(255,255,255,.98)_12%,rgba(255,255,255,.82)_29%,rgba(255,255,255,.42)_46%,rgba(255,255,255,0)_60%)] md:-translate-x-[30%]" />
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
              return <AnimateOnScroll key={product.id} delay={index * 100} className="h-full"><article className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#e8e1d8] bg-white shadow-[0_10px_30px_rgba(23,32,57,0.06)]">
                <div className="relative aspect-square overflow-hidden bg-[#f7f4ef]"><Image src={getPlanImage(product, index)} alt={`${product.name} 方案圖片`} fill className="object-contain object-center" /></div>
                <div className="flex flex-1 flex-col p-5 md:p-6"><p className="font-serif text-xl tracking-wide text-[#172039]">{product.name.split('｜')[0]}</p><h3 className="mt-2 text-lg font-medium text-[#303746]">{cups || product.name.split('｜')[1] || '調酒方案'}</h3>
                  <div className="mt-5 space-y-3 text-sm leading-6 text-[#5b5e65]"><p>建議人數：{people || '依活動需求評估'}</p>{original && <p className="relative isolate w-fit text-[1.1025em] text-[#5b5e65]"><span>原價：{formatProductPrice(original)}</span><span aria-hidden="true" className="pointer-events-none absolute -left-0.5 -right-0.5 top-1/2 h-[1.1px] -translate-y-1/2 bg-[#b58445]" /></p>}{sale && <p className={original ? 'text-[1.15em] font-semibold text-[#b58445]' : 'font-semibold text-[#b58445]'}>優惠價：{formatProductPrice(sale)}</p>}{extra && <p>現場加點：{formatProductPrice(extra)}</p>}</div>
                  <button type="button" onClick={() => setNoticePlan({ name: product.name, price: sale })} className="mt-auto inline-flex items-center justify-center gap-2 rounded-md border border-[#b58445] px-4 py-2.5 text-sm font-medium text-[#9a6c31] transition hover:bg-[#b58445] hover:text-white">立即預訂 <ArrowRight size={15} /></button>
                </div>
              </article></AnimateOnScroll>;
            })}
          </div>
        ) : <div className="py-16 text-center text-[#5b5e65]">方案整理中，歡迎先與我們聯繫。</div>}
        <p className="mx-auto mt-10 max-w-3xl text-center text-sm leading-7 text-[#5b5e65]">{includedServices.join('、') || '以上價格與服務內容依目前網站方案資料為準。'}</p>
      </section>

      <section className="relative mx-auto max-w-[1400px] border-b border-[#e2ded8] px-5 py-14 md:px-10 md:py-[4.5rem] lg:px-16">
        <div className="text-center"><p className="text-sm uppercase tracking-[0.28em] text-[#b58445]">SERVICE DETAILS</p><h2 className="mt-3 text-3xl font-medium md:text-4xl">服務內容</h2></div>
        <div className="mx-auto mt-12 flex max-w-7xl flex-wrap justify-center gap-y-10">{displayedServiceFeatures.map((item, index) => <div key={`${item}-${index}`} className="w-full text-center md:w-[22.5%] md:border-r md:border-[#dedbd5] md:px-7 md:last:border-r-0"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#cda774] text-[#b58445]"><Check size={22} strokeWidth={1.4} /></div><h3 className="mt-5 text-lg font-medium text-[#172039]">{item.split('：')[0]}</h3><p className="mx-auto mt-3 max-w-[14rem] text-base leading-7 text-[#5b5e65] md:max-w-none md:whitespace-nowrap">{item.includes('：') ? item.split('：').slice(1).join('：') : '依活動需求提供現場服務與規劃。'}</p></div>)}</div>
        {notices.length > 0 && <div className="mx-auto mt-12 max-w-3xl border-t border-[#e2ded8] pt-6 text-center text-sm leading-7 text-[#5b5e65]"><ShieldCheck className="mx-auto mb-2 text-[#b58445]" size={20} strokeWidth={1.4} />{notices.join('、')}</div>}
      </section>

      {noticePlan && <BartendingBookingNotice onClose={() => setNoticePlan(null)} onConfirm={() => { setOrderPlan(noticePlan); setNoticePlan(null); }} />}
      {orderPlan && <BartendingOrderModal planName={orderPlan.name} price={orderPlan.price} onClose={() => setOrderPlan(null)} />}
    </main>
  );
}
