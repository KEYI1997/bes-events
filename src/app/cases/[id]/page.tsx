import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Case } from '@/lib/types';

type FacebookCaseDetail = { sourceUrl?: string; imageUrls?: string[] };

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { data } = await supabase.from('cases').select('title, description').eq('id', id).eq('visible', true).maybeSingle();
  return data ? { title: data.title, description: data.description?.slice(0, 150) } : { title: '活動案例' };
}

export default async function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data } = await supabase.from('cases').select('*').eq('id', id).eq('visible', true).maybeSingle();
  if (!data) notFound();
  const caseItem = data as Case;

  const { data: detailRecord } = await supabase
    .from('site_content')
    .select('value')
    .eq('key', `facebook_case_detail_${id}`)
    .maybeSingle();
  let detail: FacebookCaseDetail = {};
  try {
    detail = detailRecord?.value ? JSON.parse(detailRecord.value) as FacebookCaseDetail : {};
  } catch {
    detail = {};
  }
  const imageUrls = detail.imageUrls?.length ? detail.imageUrls : [caseItem.image_url];

  return (
    <main className="min-h-screen bg-white pt-28 pb-20">
      <article className="mx-auto max-w-5xl px-4">
        <Link href="/cases" className="mb-8 inline-flex text-sm font-medium text-cta hover:underline">← 返回活動案例</Link>
        <p className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-cta">Case sharing</p>
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-cta/10 px-3 py-1 text-sm font-medium text-cta">{caseItem.category}</span>
          {caseItem.service_type && <span className="text-sm text-primary/60">{caseItem.service_type}</span>}
          {caseItem.event_date && <span className="text-sm text-primary/60">{caseItem.event_date}</span>}
        </div>
        <h1 className="mb-8 text-3xl font-bold leading-tight text-primary md:text-5xl">{caseItem.title}</h1>
        <div className="grid gap-4 sm:grid-cols-2">
          {imageUrls.map((imageUrl, index) => (
            <div key={`${imageUrl}-${index}`} className={`relative overflow-hidden rounded-2xl bg-primary/5 ${imageUrls.length % 2 === 1 && index === imageUrls.length - 1 ? 'sm:col-span-2 sm:w-1/2 sm:justify-self-center' : ''}`}>
              <Image src={imageUrl} alt={`${caseItem.title} 活動照片 ${index + 1}`} width={1400} height={900} className="h-auto w-full object-cover" />
            </div>
          ))}
        </div>
        <div className="mx-auto mt-10 max-w-3xl whitespace-pre-wrap text-base leading-8 text-primary/80 md:text-lg">
          {caseItem.description}
        </div>
        {(caseItem.used_services?.length || caseItem.used_products?.length || caseItem.applicable_occasions?.length) ? (
          <section className="mx-auto mt-12 grid max-w-3xl gap-6 border-t pt-8 md:grid-cols-3">
            {caseItem.used_services?.length ? <CaseMetadata title="本次服務" items={caseItem.used_services} /> : null}
            {caseItem.used_products?.length ? <CaseMetadata title="使用道具／產品" items={caseItem.used_products} /> : null}
            {caseItem.applicable_occasions?.length ? <CaseMetadata title="適用場合" items={caseItem.applicable_occasions} /> : null}
          </section>
        ) : null}
        {detail.sourceUrl && (
          <div className="mt-10 border-t pt-6">
            <a href={detail.sourceUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-cta hover:underline">查看原始 Facebook 貼文 ↗</a>
          </div>
        )}
      </article>
    </main>
  );
}

function CaseMetadata({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-bold text-primary">{title}</h2>
      <ul className="space-y-2 text-sm leading-6 text-primary/70">
        {items.map(item => <li key={item}>• {item}</li>)}
      </ul>
    </div>
  );
}
