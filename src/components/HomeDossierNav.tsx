'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const links = [
  { href: '#services', label: '服務內容' },
  { href: '#cases', label: '案例精選' },
  { href: '#enquiry', label: '提出需求' },
];

export default function HomeDossierNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#cec5b8] bg-[#f7f3ec] text-[#25211d]">
      <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link href="/" aria-label="境曜有限公司首頁" className="relative block h-10 w-[108px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a66d42]">
          <Image src="/images/logo/logo-color.png" alt="境曜有限公司 BES" fill sizes="108px" className="object-contain object-left" unoptimized />
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-semibold md:flex" aria-label="首頁導覽">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-[#a66d42] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a66d42]">
              {link.label}
            </Link>
          ))}
          <Link href="/contact" className="border border-[#25211d] px-4 py-2.5 transition-colors hover:bg-[#25211d] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a66d42]">
            聯絡境曜
          </Link>
        </nav>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? '關閉首頁導覽' : '開啟首頁導覽'}
          aria-expanded={open}
          className="grid h-11 w-11 place-items-center border border-[#25211d] md:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a66d42]"
        >
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>
      {open && (
        <nav className="border-t border-[#cec5b8] bg-[#f7f3ec] px-5 py-5 md:hidden" aria-label="首頁行動版導覽">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-3">
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="py-2 text-lg font-semibold">
                {link.label}
              </Link>
            ))}
            <Link href="/contact" onClick={() => setOpen(false)} className="mt-2 w-fit border border-[#25211d] px-4 py-2.5 text-sm font-bold">
              聯絡境曜
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
