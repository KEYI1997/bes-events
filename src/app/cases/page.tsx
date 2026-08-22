import { Metadata } from 'next';
import { Suspense } from 'react';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import { supabase } from '@/lib/supabase';
import { Case } from '@/lib/types';
import CasesGrid from './CasesGrid';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '活動案例',
  description: '境曜有限公司活動案例展示，包含記者會、尾牙、家庭日、典禮、市集、展覽等各類型活動。',
};

export default async function CasesPage() {
  const { data: cases } = await supabase
    .from('cases')
    .select('*')
    .eq('visible', true)
    .order('sort_order', { ascending: true })
    .order('event_date', { ascending: false });

  return (
    <main className="bg-white min-h-screen">
      {/* Hero */}
      <section className="relative bg-primary h-[25vh] flex items-center justify-center pt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/90 to-primary" />
        <div className="relative z-10 text-center px-4">
          <AnimateOnScroll>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              活動案例
            </h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              每一場活動都是獨一無二的創意實現
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Cases Content */}
      <section className="bg-white max-w-7xl mx-auto px-4 py-16 md:py-24">
        {/* Suspense 包覆 CasesGrid，因為內部使用 useSearchParams */}
        <Suspense fallback={<div className="text-center py-16 text-primary/50">載入中...</div>}>
          <CasesGrid cases={(cases as Case[]) || []} />
        </Suspense>
      </section>
    </main>
  );
}
