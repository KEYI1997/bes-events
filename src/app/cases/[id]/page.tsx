import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Case } from '@/lib/types';
import CaseGallery from './CaseGallery';
import JsonLd from '@/components/JsonLd';
import { absoluteUrl, breadcrumbJsonLd, createPageMetadata, SITE_NAME, SITE_URL, webPageJsonLd } from '@/lib/seo';

type CaseMediaDetail = { sourceUrl?: string; imageUrls?: string[]; videoUrls?: string[] };

function uniqueUrls(urls: Array<string | undefined>) {
  return [...new Set(urls.map(url => url?.trim()).filter((url): url is string => Boolean(url)))];
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { data } = await supabase.from('cases').select('title, description, image_url').eq('id', id).eq('visible', true).maybeSingle();
  return data
    ? createPageMetadata({
        title: data.title,
        description: data.description?.slice(0, 150) || `${SITE_NAME}活動案例`,
        path: `/cases/${id}`,
        image: data.image_url?.split(',')[0] || undefined,
        keywords: ['活動案例', data.title, SITE_NAME],
      })
    : createPageMetadata({ title: '活動案例', description: `${SITE_NAME}活動案例`, path: '/cases' });
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
  let detail: CaseMediaDetail = {};
  try {
    detail = detailRecord?.value ? JSON.parse(detailRecord.value) as CaseMediaDetail : {};
  } catch {
    detail = {};
  }
  const imageUrls = uniqueUrls([
    ...caseItem.image_url.split(',').map(url => url.trim()),
    ...(detail.imageUrls || []),
  ]);
  const videoUrls = uniqueUrls(detail.videoUrls || []);
  const titleMatch = caseItem.title.match(/【([^】]+)】/);
  const activityTitle = titleMatch?.[1]?.trim() || caseItem.title.replace(/^【|】$/g, '').trim();
  const products = caseItem.used_products?.filter(Boolean).join(' | ');
  const displayTitle = products ? `${products} | ${activityTitle}` : activityTitle;
  const articleText = caseItem.description.replace(/^\s*【[^】]+】\s*\r?\n?/, '').trim();
  const articleId = `${absoluteUrl(`/cases/${id}`)}#article`;
  const structuredData = [
    webPageJsonLd({
      path: `/cases/${id}`,
      name: `${displayTitle}｜境曜有限公司活動案例`,
      description: articleText.slice(0, 180),
      image: imageUrls.find(Boolean),
      mainEntityId: articleId,
    }),
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      '@id': articleId,
      headline: displayTitle,
      description: articleText.slice(0, 180),
      image: imageUrls.filter(Boolean).map(absoluteUrl),
      mainEntityOfPage: absoluteUrl(`/cases/${id}`),
      author: { '@id': `${SITE_URL}/#organization` },
      publisher: { '@id': `${SITE_URL}/#organization` },
      datePublished: caseItem.created_at,
      inLanguage: 'zh-Hant-TW',
    },
    breadcrumbJsonLd([
      { name: '首頁', path: '/' },
      { name: '活動案例', path: '/cases' },
      { name: displayTitle, path: `/cases/${id}` },
    ]),
  ];

  return (
    <><JsonLd data={structuredData} /><main className="min-h-screen bg-[#fbfaf8] pb-24 pt-24 text-[#252b3a]">
      <article className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-12">
        <Link href="/cases" className="mb-8 inline-flex text-base font-bold text-[#81704f] transition-colors hover:text-[#aa8a56] hover:underline">← 返回活動案例</Link>
        <header className="border-b border-[#dedbd5] pb-8 md:pb-10">
          <p className="mb-5 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[#aa8a56]">CASE STUDY</p>
          <h1 className="whitespace-nowrap text-[1.8rem] font-semibold leading-[1.18] tracking-[-0.02em] text-[#252b3a] sm:text-5xl md:text-[3.5rem]">{displayTitle}</h1>
          <div className="my-6 h-px w-14 bg-[#b89a67]" />
          {(caseItem.event_date || caseItem.activity_date) && (
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm tracking-[0.08em] text-[#85827d]">
              {caseItem.event_date && <p>文章日期：{caseItem.event_date.replace(/-/g, '.')}</p>}
              {caseItem.activity_date && <p>活動當日日期：{caseItem.activity_date.replace(/-/g, '.')}</p>}
            </div>
          )}
        </header>

        <div className="mx-auto mt-12 max-w-5xl border-l-2 border-[#b89a67] pl-5 text-base leading-[1.9] text-[#4d5159] sm:mt-14 sm:pl-7 md:text-lg">
          <div className="whitespace-pre-wrap">{articleText}</div>
        </div>
        <CaseGallery images={imageUrls} videos={videoUrls} title={displayTitle} />
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
    </main></>
  );
}

function CaseMetadata({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-[#303642] md:text-2xl">{title}</h2>
      <div className="my-3 h-px w-10 bg-[#b89a67]" />
      <ul className="space-y-2 text-base leading-7 text-[#62615d] md:text-lg">
        {items.map(item => <li key={item}>• {item}</li>)}
      </ul>
    </div>
  );
}
