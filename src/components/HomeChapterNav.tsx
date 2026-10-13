'use client';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const links = [
  { href: '#needs', label: '活動需求' },
  { href: '#services', label: '服務內容' },
  { href: '#cases', label: '現場案例' },
];

export default function HomeChapterNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-[#ff8126] text-[#111111]">
      <div className="mx-auto flex h-[70px] max-w-[1600px] items-center justify-between px-4 sm:px-7 lg:px-10">
        <Link href="/" className="text-lg font-bold tracking-[-0.06em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#111111]" aria-label="境曜有限公司首頁">
          境曜 <span className="font-medium tracking-[-0.03em]">BES</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-semibold md:flex" aria-label="首頁導覽">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="transition-opacity hover:opacity-55 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#111111]">
              {link.label}
            </Link>
          ))}
          <Link href="#enquiry" className="bg-[#de194b] px-4 py-3 text-[#f4f5f0] transition-colors hover:bg-[#111111] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#111111]">
            整理我的需求
          </Link>
        </nav>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? '關閉首頁導覽' : '開啟首頁導覽'}
          aria-expanded={open}
          className="grid h-11 w-11 place-items-center bg-[#111111] text-[#f4f5f0] transition-transform active:scale-95 md:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#111111]"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open && (
        <nav className="bg-[#ff8126] px-4 pb-7 pt-3 md:hidden" aria-label="首頁行動版導覽">
          <div className="mx-auto flex max-w-[1600px] flex-col items-start gap-3 text-2xl font-bold tracking-[-0.05em]">
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#111111]">
                {link.label}
              </Link>
            ))}
            <Link href="#enquiry" onClick={() => setOpen(false)} className="mt-2 bg-[#de194b] px-4 py-3 text-base text-[#f4f5f0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#111111]">
              整理我的需求
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
