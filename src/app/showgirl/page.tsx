import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { MessageCircle, UserRound } from 'lucide-react';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import { supabase } from '@/lib/supabase';
import { ShowGirl } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Show Girl | 境曜有限公司 BES Events',
  description: '專業活動人員派遣，提供展場接待、活動協助等服務。境曜有限公司 Show Girl 專業團隊。',
};

export default async function ShowGirlPage() {
  const { data: showgirls } = await supabase
    .from('showgirls')
    .select('*')
    .eq('visible', true)
    .order('sort_order', { ascending: true });

  return (
    <main className="bg-bg min-h-screen">
      {/* Hero */}
      <section className="relative bg-primary h-[25vh] flex items-center justify-center pt-32">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/90 to-primary" />
        <div className="relative z-10 text-center px-4">
          <AnimateOnScroll>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Show Girl
            </h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              專業活動人員派遣，提供展場接待、活動協助等服務
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Gallery */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        {showgirls && showgirls.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(showgirls as ShowGirl[]).map((girl, index) => (
              <AnimateOnScroll key={girl.id} delay={index * 100}>
                <div className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                  <div className="relative aspect-[3/4]">
                    <Image
                      src={girl.image_url}
                      alt={girl.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all">
                      <h3 className="text-xl font-bold">{girl.name}</h3>
                      {girl.height && (
                        <p className="text-white/80 text-sm mt-1">
                          身高 {girl.height} cm
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <AnimateOnScroll>
              <UserRound size={64} className="mx-auto text-cta/50 mb-6" />
              <h2 className="text-2xl font-bold text-primary mb-4">
                即將上線，請洽詢
              </h2>
              <p className="text-primary/60 mb-8">
                我們正在整理最新的 Show Girl 資料，歡迎直接聯繫了解更多
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-cta text-white px-8 py-4 rounded-full font-semibold hover:bg-cta-hover transition-colors"
              >
                <MessageCircle size={20} />
                立即諮詢
              </Link>
            </AnimateOnScroll>
          </div>
        )}
      </section>

      {/* CTA Section */}
      {showgirls && showgirls.length > 0 && (
        <section className="bg-primary py-16">
          <div className="max-w-4xl mx-auto text-center px-4">
            <AnimateOnScroll>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                需要活動人員支援？
              </h2>
              <p className="text-white/80 mb-8">
                歡迎聯繫我們，依據活動需求推薦最適合的人選
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-cta text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-cta-hover transition-colors"
              >
                <MessageCircle size={20} />
                立即諮詢
              </Link>
            </AnimateOnScroll>
          </div>
        </section>
      )}
    </main>
  );
}
