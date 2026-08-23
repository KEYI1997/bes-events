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
    <main className="min-h-screen bg-[#fbfaf8] pb-24 pt-24 text-[#252b3a]">
      <article className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-12">
        <header className="max-w-4xl border-b border-[#dedbd5] pb-8 md:pb-10">
          <p className="mb-5 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[#aa8a56]">CASE STUDY</p>
          <h1 className="max-w-4xl text-[2.1rem] font-semibold leading-[1.18] tracking-[-0.02em] text-[#252b3a] sm:text-5xl md:text-[3.5rem]">{caseItem.title}</h1>
          <div className="my-6 h-px w-14 bg-[#b89a67]" />
          {caseItem.event_date && <p className="text-sm tracking-[0.08em] text-[#85827d]">{caseItem.event_date.replace(/-/g, '.')}</p>}
        </header>

        <Link href="/cases" className="my-8 inline-flex text-sm font-medium text-[#81704f] transition-colors hover:text-[#aa8a56] hover:underline">← 返回活動案例</Link>

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
          {imageUrls.map((imageUrl, index) => (
            <div key={`${imageUrl}-${index}`} className={`group relative overflow-hidden rounded-[14px] bg-[#eeece8] ${imageUrls.length % 2 === 1 && index === imageUrls.length - 1 ? 'sm:col-span-2' : ''}`}>
              <div className={`${imageUrls.length % 2 === 1 && index === imageUrls.length - 1 ? 'aspect-[2/1]' : 'aspect-[4/3]'}`}>
                <Image src={imageUrl} alt={`${caseItem.title} 活動照片 ${index + 1}`} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.015]" />
              </div>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-14 max-w-3xl border-l-2 border-[#b89a67] pl-5 text-base leading-[1.9] text-[#4d5159] sm:mt-16 sm:pl-7 md:text-lg">
          <div className="whitespace-pre-wrap">{caseItem.description}</div>
        </div>
        {(caseItem.used_services?.length || caseItem.used_products?.length || caseItem.applicable_occasions?.length) ? (
          <section className="mx-auto mt-14 grid max-w-5xl gap-10 rounded-[18px] border border-[#e5e1da] bg-[#f3f1ed] p-6 sm:p-8 md:grid-cols-2 md:gap-14 md:p-10">
            <div>
              {caseItem.used_services?.length ? <CaseMetadata title="本次服務" items={caseItem.used_services} /> : null}
              {caseItem.used_products?.length ? <CaseMetadata title="使用道具／產品" items={caseItem.used_products} /> : null}
            </div>
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
      <h2 className="text-base font-semibold text-[#303642]">{title}</h2>
      <div className="my-3 h-px w-10 bg-[#b89a67]" />
      <ul className="space-y-2 text-sm leading-6 text-[#62615d]">
        {items.map(item => <li key={item}>• {item}</li>)}
      </ul>
    </div>
  );
}
