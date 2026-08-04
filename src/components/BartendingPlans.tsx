'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MessageCircle, ClipboardList } from 'lucide-react';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import BartendingOrderModal from '@/components/BartendingOrderModal';

const plans = [
  {
    name: '小型聚會方案',
    badge: '輕鬆入門',
    desc: '適合私人小聚、家庭派對、節日慶祝等小規模場合。讓專業調酒師到府服務，不用出門也能享受精品調酒體驗，輕鬆辦一場難忘的家庭聚會。',
    highlights: [
      '建議人數：10 ~ 30 人',
      '服務時長：最少 2 小時',
      '計費方式：以時數計費',
      '單人調酒師服務',
      '附基本吧台器具，場地免佈置',
    ],
    imgClass: 'object-cover object-center',
    textSide: 'left' as const,
  },
  {
    name: '迎賓雞尾酒方案',
    badge: '入門首選',
    desc: '適合婚宴、發表會、企業晚宴等需要優雅開場的場合。調酒師現場調製精選迎賓雞尾酒，以色香味俱全的飲品化解賓客入場的拘謹氛圍。',
    highlights: [
      '建議人數：50 ~ 200 人',
      '服務時長：依場地時程安排',
      '計費方式：以杯數計費',
      '提供精選迎賓雞尾酒酒單',
      '可依活動主題客製化酒款顏色',
    ],
    imgClass: 'object-cover object-center scale-x-[-1]',
    textSide: 'right' as const,
  },
  {
    name: '派對暢飲方案',
    badge: '人氣熱門',
    desc: '適合生日派對、同學會、公司尾牙、私人聚會等歡樂場合。專業調酒師進駐現場，無限供應派對調酒，讓整晚嗨到停不下來。',
    highlights: [
      '建議人數：20 ~ 100 人',
      '服務時長：最少 2 小時，以小時計費',
      '計費方式：無限暢飲，以時數計費',
      '雙人調酒師搭配，供酒流暢不斷線',
      '超過 100 人建議加派人手',
    ],
    imgClass: 'object-cover object-bottom',
    textSide: 'left' as const,
  },
  {
    name: '主題客製化方案',
    badge: '品牌首選',
    desc: '適合品牌發表、展覽、記者會、廠商招待會等需要凸顯品牌形象的場合。依活動主題量身打造專屬酒單，調酒師現場互動表演，為活動帶來獨特亮點。',
    highlights: [
      '建議人數：不限',
      '服務時長：依活動需求規劃',
      '計費方式：杯數或時數，依需求報價',
      '全客製化主題酒單設計',
      '可搭配花式調酒表演，炒熱現場氣氛',
    ],
    imgClass: 'object-cover object-center',
    textSide: 'right' as const,
  },
];

export default function BartendingPlans() {
  const [orderPlan, setOrderPlan] = useState<string | null>(null);

  return (
    <>
      {/* 方案標題 */}
      <section className="max-w-7xl mx-auto px-4 pt-16 pb-8 md:pt-24 md:pb-10">
        <AnimateOnScroll>
          <h2 className="text-2xl md:text-3xl font-bold text-primary text-center mb-3">服務方案</h2>
          <p className="text-primary/60 text-center">依照您的活動規模與需求，選擇最適合的調酒方案</p>
        </AnimateOnScroll>
      </section>

      {/* Banner 包裝容器 */}
      <div className="px-6 md:px-16 space-y-0">
        {plans.map((plan, index) => {
          const isLeft = plan.textSide === 'left';
          const gradientClass = isLeft
            ? 'bg-gradient-to-r from-black/75 via-black/40 to-transparent'
            : 'bg-gradient-to-l from-black/75 via-black/40 to-transparent';
          const isFirst = index === 0;
          const isLast = index === plans.length - 1;

          return (
            <AnimateOnScroll key={plan.name} delay={index * 100}>
              <div className={`relative w-full h-[300px] md:h-[360px] overflow-hidden border-t-2 border-white ${isLast ? 'border-b-2' : ''}`}>
                <Image
                  src="/images/services/bartending.png"
                  alt={plan.name}
                  fill
                  className={plan.imgClass}
                />
                <div className={`absolute inset-0 ${gradientClass}`} />

                {/* 文字區 */}
                {isLeft ? (
                  <div className="absolute inset-0 flex flex-col justify-center px-10 md:px-16 max-w-2xl">
                    <h3 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow">{plan.name}</h3>
                    <div className="bg-black/50 px-5 py-4 space-y-1.5 mb-5">
                      {plan.highlights.map((item, i) => (
                        <p key={item} className="text-white/90 text-base">{i + 1}.{item}</p>
                      ))}
                    </div>
                    <div>
                      <button
                        onClick={() => setOrderPlan(plan.name)}
                        className="inline-flex items-center gap-2 bg-cta text-white px-7 py-3 rounded-full font-semibold text-base hover:bg-cta-hover transition-colors shadow-lg"
                      >
                        <ClipboardList size={18} />
                        建立訂單
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col justify-center items-end px-10 md:px-16">
                    <div className="max-w-2xl text-right">
                      <h3 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow">{plan.name}</h3>
                      <div className="bg-black/50 px-5 py-4 space-y-1.5 mb-5">
                        {plan.highlights.map((item, i) => (
                          <p key={item} className="text-white/90 text-base">{i + 1}.{item}</p>
                        ))}
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={() => setOrderPlan(plan.name)}
                          className="inline-flex items-center gap-2 bg-cta text-white px-7 py-3 rounded-full font-semibold text-base hover:bg-cta-hover transition-colors shadow-lg"
                        >
                          <ClipboardList size={18} />
                          建立訂單
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </AnimateOnScroll>
          );
        })}
      </div>

      <div className="pb-16 md:pb-24" />

      {/* CTA */}
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

      {/* 訂單 Modal */}
      {orderPlan && (
        <BartendingOrderModal
          planName={orderPlan}
          onClose={() => setOrderPlan(null)}
        />
      )}
    </>
  );
}
