import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import AIInteractiveExperience from '@/components/AIInteractiveExperience';

export const metadata: Metadata = {
  title: 'AI 互動道具 | 境曜有限公司 BES Events',
  description: '讓影像、聲音與想像即時成為可參與、可分享的 AI 活動體驗。',
};

export default function AIInteractivePropsPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050b18] text-white">
      <section className="relative isolate min-h-[88vh] pt-28 md:pt-36">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_78%_28%,rgba(37,99,235,0.24),transparent_32%),radial-gradient(circle_at_20%_72%,rgba(6,182,212,0.12),transparent_28%),linear-gradient(135deg,#050b18_0%,#081225_58%,#050914_100%)]" />
        <div className="absolute inset-0 -z-10 opacity-25 [background-image:linear-gradient(rgba(96,165,250,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(96,165,250,0.16)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:linear-gradient(to_bottom,black,transparent_88%)]" />

        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 pb-20 md:px-12 lg:grid-cols-[0.86fr_1.14fr] lg:pb-28">
          <div className="relative z-10">
            <div className="mb-7 inline-flex items-center gap-3 rounded-full border border-cyan-300/20 bg-cyan-300/5 px-4 py-2 text-xs font-medium tracking-[0.22em] text-cyan-200">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_12px_#67e8f9]" />
              AI INTERACTIVE EXPERIENCE
            </div>
            <h1 className="max-w-xl text-5xl font-semibold leading-[1.08] tracking-[-0.04em] md:text-7xl">
              讓每一次互動，
              <span className="bg-gradient-to-r from-cyan-200 via-blue-300 to-indigo-300 bg-clip-text text-transparent">都即時生成驚喜。</span>
            </h1>
            <p className="mt-7 max-w-lg text-base leading-8 text-slate-300 md:text-lg">
              從一張照片、一句話到一個動作，AI 把賓客的參與轉化成專屬內容，讓活動不只被看見，更能被玩、被分享、被記住。
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/contact?service=AI%20互動道具" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#07101f] transition hover:-translate-y-0.5 hover:bg-cyan-100">
                規劃互動體驗
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-3xl">
            <div className="absolute -inset-8 rounded-[3rem] bg-blue-500/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-2 shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-sm">
              <Image
                src="/images/services/AI互動道具.png"
                alt="AI 互動道具於活動現場提供即時互動體驗"
                width={1536}
                height={1024}
                priority
                className="aspect-[4/3] w-full rounded-[1.55rem] object-cover"
              />
              <div className="absolute inset-x-2 bottom-2 flex items-center justify-between rounded-b-[1.55rem] bg-gradient-to-t from-[#04101f]/95 via-[#04101f]/55 to-transparent px-6 pb-5 pt-20">
                <p className="text-sm text-slate-200">即時辨識・即時生成・即時分享</p>
                <span className="rounded-full border border-cyan-200/30 bg-cyan-200/10 px-3 py-1 text-xs text-cyan-100">LIVE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-cyan-200/30 to-transparent" />
      <AIInteractiveExperience />
    </main>
  );
}
