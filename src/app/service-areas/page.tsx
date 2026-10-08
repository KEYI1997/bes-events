import type { Metadata } from 'next';
import Link from 'next/link';
import { createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: '活動服務地區與報價說明',
  description: '境曜有限公司提供台北、新北、桃園、新竹活動服務；其他縣市可依活動日期、設備、人員與物流條件評估。',
  path: '/service-areas',
  keywords: ['台北活動企劃', '新北活動設備租借', '桃園活動道具', '新竹活動服務', '活動報價'],
});

const AREAS = [
  ['台北市、新北市', '活動企劃、啟動儀式、道具、特效、外派調酒與活動人員的主要服務區域。請先提供場地、樓層、貨梯與進撤場時段，以安排設備與人員。'],
  ['桃園、新竹', '可依活動日期、設備需求與人員安排規劃服務；報價會一併確認物流、搭撤與現場服務條件。'],
  ['其他縣市', '可依專案條件個別評估。請提供活動日期、地點、需求內容與現場條件，由專人確認可服務範圍與安排方式。'],
];

export default function ServiceAreasPage() {
  return <main className="min-h-screen bg-[#fbfaf8] pb-24 pt-28 text-[#252b3a] md:pt-32">
    <section className="mx-auto max-w-[1120px] px-6 sm:px-8 md:px-12">
      <h1 className="text-4xl font-semibold tracking-[-0.03em] md:text-6xl">活動服務地區</h1>
      <p className="mt-6 max-w-3xl text-lg leading-9 text-[#555961]">境曜以北部活動服務為核心。是否能安排服務，會以活動日期、場地、設備、人員與物流條件一併確認，讓報價與現場執行有一致依據。</p>
    </section>
    <section className="mx-auto mt-16 max-w-[1120px] px-6 sm:px-8 md:px-12">
      <div className="grid gap-7 md:grid-cols-3">{AREAS.map(([title, text]) => <article key={title} className="border-t border-[#c9ae8a] pt-6"><h2 className="text-2xl font-semibold">{title}</h2><p className="mt-4 text-[15px] leading-8 text-[#5b5e65]">{text}</p></article>)}</div>
    </section>
    <section className="mx-auto mt-20 max-w-[1120px] border-y border-[#dedbd5] px-6 py-12 sm:px-8 md:px-12">
      <h2 className="text-3xl font-semibold">詢價前，請先準備這些資訊</h2>
      <ul className="mt-7 grid gap-4 text-[15px] leading-7 text-[#555961] md:grid-cols-2"><li>活動日期、服務時段與進撤場時間</li><li>活動地址、場地類型、樓層與貨梯條件</li><li>預計人數、流程與需要的服務或設備</li><li>客製內容、舞台尺寸、電力、網路或場地規範</li></ul>
      <p className="mt-7 max-w-3xl text-[15px] leading-8 text-[#5b5e65]">商品頁上的固定方案可作為基本參考；涉及客製、運送、樓層搬運、場地限制、現場人員或未標示價格的項目，會在確認條件後提供正式報價。</p>
      <Link href="/contact" className="mt-8 inline-flex rounded-md bg-[#aa7452] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#8f5f43]">提供活動需求，開始洽詢 →</Link>
    </section>
  </main>;
}
