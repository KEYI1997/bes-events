'use client';

import Link from 'next/link';
import { useState } from 'react';

const experiences = [
  {
    key: 'portrait',
    number: '01',
    title: 'AI 形象生成',
    eyebrow: '一拍，進入另一個世界',
    description: '賓客留下影像，現場即時轉化成活動主題角色、未來形象或品牌限定風格。每一張都不一樣，也自然成為願意分享的內容。',
    tags: ['主題造型', '品牌場景', '即時輸出'],
    prompt: '正在生成你的未來角色…',
    accent: 'from-cyan-300 via-blue-400 to-indigo-500',
  },
  {
    key: 'conversation',
    number: '02',
    title: 'AI 品牌角色',
    eyebrow: '讓品牌真的開口說話',
    description: '把品牌個性變成可對話的數位角色，迎賓、導覽、回答活動問題，也能設計趣味彩蛋，讓資訊被更輕鬆地理解。',
    tags: ['智慧迎賓', '活動導覽', '趣味問答'],
    prompt: '嗨，今天想探索哪一個驚喜？',
    accent: 'from-blue-300 via-violet-400 to-fuchsia-500',
  },
  {
    key: 'motion',
    number: '03',
    title: '聲音・動作互動',
    eyebrow: '不用學，動一下就會玩',
    description: '透過語音、表情或動作觸發畫面變化，把等待時間變成遊戲，把圍觀人群變成參與者，適合展場、發布會與大型活動。',
    tags: ['動作辨識', '語音觸發', '多人參與'],
    prompt: '偵測到互動，畫面正在回應…',
    accent: 'from-emerald-300 via-cyan-400 to-blue-500',
  },
] as const;

export default function AIInteractiveExperience() {
  const [activeKey, setActiveKey] = useState<(typeof experiences)[number]['key']>('portrait');
  const active = experiences.find(item => item.key === activeKey) || experiences[0];
  const [pulse, setPulse] = useState(0);

  const triggerDemo = () => setPulse(value => value + 1);

  return (
    <>
      <section className="bg-[#050b18] px-6 py-24 md:px-12 md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 border-b border-white/10 pb-20 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold tracking-[0.24em] text-cyan-200">DESIGNED FOR PARTICIPATION</p>
              <h2 className="mt-5 text-4xl font-semibold tracking-[-0.035em] text-white md:text-6xl">科技不是主角，<br />參與的人才是。</h2>
            </div>
            <p className="max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
              我們從活動目的與賓客動線開始設計，讓互動一看就懂、一碰就有回應。AI 藏在體驗裡，留下的是笑聲、驚喜，還有一份專屬於當下的作品。
            </p>
          </div>

          <div className="pt-20">
            <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-semibold tracking-[0.24em] text-slate-500">CHOOSE AN EXPERIENCE</p>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-white md:text-5xl">今天，想讓賓客怎麼玩？</h2>
              </div>
              <p className="max-w-sm text-sm leading-7 text-slate-400">點選下方體驗，看看不同的互動想像。每一種形式都可配合活動主題與品牌視覺客製。</p>
            </div>

            <div className="grid overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] lg:grid-cols-[0.78fr_1.22fr]">
              <div className="border-b border-white/10 lg:border-b-0 lg:border-r">
                {experiences.map(item => {
                  const isActive = item.key === active.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setActiveKey(item.key)}
                      aria-pressed={isActive}
                      className={`group flex w-full items-center gap-6 border-b border-white/10 px-6 py-7 text-left transition last:border-b-0 md:px-9 ${isActive ? 'bg-white/[0.07]' : 'hover:bg-white/[0.035]'}`}
                    >
                      <span className={`text-xs font-semibold tracking-[0.2em] transition ${isActive ? 'text-cyan-200' : 'text-slate-600 group-hover:text-slate-400'}`}>{item.number}</span>
                      <span className={`text-lg font-medium transition md:text-xl ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>{item.title}</span>
                      <span className={`ml-auto text-lg transition ${isActive ? 'translate-x-0 text-cyan-200' : '-translate-x-2 text-transparent group-hover:translate-x-0 group-hover:text-slate-400'}`}>↗</span>
                    </button>
                  );
                })}
              </div>

              <div className="grid min-h-[560px] gap-10 p-7 md:p-12 lg:grid-cols-[1fr_0.9fr] lg:items-center">
                <div key={active.key} className="ai-fade-in">
                  <p className="text-sm font-medium text-cyan-200">{active.eyebrow}</p>
                  <h3 className="mt-4 text-4xl font-semibold tracking-[-0.035em] text-white">{active.title}</h3>
                  <p className="mt-6 text-base leading-8 text-slate-300">{active.description}</p>
                  <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/10 pt-6">
                    {active.tags.map(tag => <span key={tag} className="text-xs tracking-[0.12em] text-slate-400">{tag}</span>)}
                  </div>
                </div>

                <div className="relative mx-auto flex aspect-[4/5] w-full max-w-[300px] items-center justify-center overflow-hidden rounded-[2.1rem] border border-white/15 bg-[#071124] p-5 shadow-[0_25px_80px_rgba(0,0,0,0.35)]">
                  <div className={`absolute inset-0 bg-gradient-to-br ${active.accent} opacity-15 transition duration-700`} />
                  <div className="absolute inset-5 rounded-[1.55rem] border border-white/10 [background-image:radial-gradient(rgba(255,255,255,0.13)_1px,transparent_1px)] [background-size:16px_16px]" />
                  <div key={`${active.key}-${pulse}`} className="ai-orbit relative flex h-40 w-40 items-center justify-center rounded-full border border-cyan-200/30 bg-cyan-200/5">
                    <div className={`h-20 w-20 rounded-full bg-gradient-to-br ${active.accent} opacity-80 blur-[1px] shadow-[0_0_55px_rgba(34,211,238,0.38)]`} />
                    <span className="absolute h-2 w-2 rounded-full bg-white shadow-[0_0_15px_white]" />
                  </div>
                  <div className="absolute inset-x-8 bottom-9">
                    <p className="min-h-10 text-center text-xs leading-5 text-slate-300">{active.prompt}</p>
                    <button type="button" onClick={triggerDemo} className="mt-4 w-full rounded-full border border-cyan-200/30 bg-cyan-200/10 px-4 py-2.5 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-200/20 active:scale-[0.98]">
                      點一下，觸發互動
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#eef4ff] px-6 py-24 text-[#0a1730] md:px-12 md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-xs font-semibold tracking-[0.24em] text-blue-700">FROM IDEA TO LIVE</p>
              <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] md:text-6xl">將創意構想，<br />轉化為現場體驗。</h2>
            </div>
            <div className="divide-y divide-[#0a1730]/15 border-y border-[#0a1730]/15">
              {[
                ['01', '定義互動', '確認活動情境、參與人數與希望留下的記憶點。'],
                ['02', '設計內容', '把品牌視覺、語氣與活動主題放進每一次回應。'],
                ['03', '現場啟動', '完成設備測試與動線安排，讓賓客直覺開始玩。'],
              ].map(([number, title, text]) => (
                <div key={number} className="grid gap-4 py-7 md:grid-cols-[56px_180px_1fr] md:items-center">
                  <span className="text-xs font-semibold tracking-[0.2em] text-blue-700">{number}</span>
                  <h3 className="text-xl font-semibold">{title}</h3>
                  <p className="text-sm leading-7 text-[#0a1730]/65">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-24 overflow-hidden rounded-[2.5rem] bg-[#071124] px-7 py-14 text-white md:px-14 md:py-16">
            <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="text-xs font-semibold tracking-[0.24em] text-cyan-200">MAKE IT YOURS</p>
                <h2 className="mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.04em] md:text-6xl">下一個讓人排隊想玩的體驗，從你的活動開始。</h2>
                <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300">告訴我們活動主題、場地與想像，我們會協助找到最適合的互動方式。</p>
              </div>
              <Link href="/contact?service=AI%20互動道具" className="inline-flex w-fit items-center rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[#071124] transition hover:-translate-y-0.5 hover:bg-cyan-100">
                開始規劃
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
