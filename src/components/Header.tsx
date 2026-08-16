'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown } from 'lucide-react';
import { LINE_URL } from '@/lib/siteLinks';

const NAV_ITEMS = [
  {
    label: '服務項目',
    href: '/services',
    children: [
      { label: '活動策劃統包', href: '/services/event-package' },
      { label: '啟動儀式', href: '/services/opening-ceremony' },
      { label: '活動特效', href: '/services/special-effects' },
      { label: '外派調酒', href: '/services/bartending' },
      { label: 'SHOW GIRL', href: '/services/showgirl' },
    ],
  },
  {
    label: '活動案例',
    href: '/cases',
    children: [
      { label: '開幕典禮', href: '/cases' },
      { label: '記者會', href: '/cases?category=記者會' },
      { label: '新品發表會', href: '/cases' },
      { label: '展覽攤位', href: '/cases?category=展覽' },
      { label: '政府活動', href: '/cases' },
      { label: '春酒尾牙', href: '/cases?category=尾牙' },
      { label: '典禮節慶', href: '/cases?category=典禮' },
    ],
  },
  { label: '關於境曜', href: '/about' },
  { label: '聯絡我們', href: '/contact' },
];

export default function Header() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [fullNavOpen, setFullNavOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (pathname.startsWith(href)) return true;
    const item = NAV_ITEMS.find(n => n.href === href);
    if (item && item.children) {
      return item.children.some(child => pathname.startsWith(child.href));
    }
    return false;
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 50) {
        setVisible(true);
        setScrolled(false);
      } else if (currentScrollY > lastScrollY) {
        setVisible(false);
        setScrolled(true);
      } else {
        setVisible(true);
        setScrolled(true);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    if (fullNavOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [fullNavOpen]);

  // scrolled 時保持黑色膠囊的頁面
  const isDarkScrollPage =
    pathname === '/' ||
    pathname.startsWith('/products');

  // 決定用哪個 logo
  // 首頁未捲動 或 黑色膠囊 → 白色線條 logo
  // 其他（白底）→ 彩色 logo
  const isWhiteBg = !isDarkScrollPage || (!scrolled && pathname !== '/');
  const logoSrc = (pathname === '/' && !scrolled) || (isDarkScrollPage && scrolled)
    ? '/images/logo/logo-header.png'
    : '/images/logo/logo-color.png';

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}>
        <div className={`transition-all duration-300 ${
          scrolled
            ? isDarkScrollPage
              ? 'mx-4 md:mx-8 mt-3 bg-black/70 rounded-[10px]'
              : 'mx-4 md:mx-8 mt-3 bg-white/90 backdrop-blur-md rounded-[10px] shadow-md'
            : pathname === '/'
              ? ''
              : 'bg-white shadow-sm'
        }`}>
          <div className="px-6 md:px-12 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center flex-shrink-0">
              <Image src={logoSrc} alt="境曜有限公司" width={180} height={180} className="rounded-[8px] w-auto h-14" unoptimized />
            </Link>

            <div className="flex items-center gap-7">
              <nav className="hidden lg:flex items-center gap-7">
                {NAV_ITEMS.map((item) => (
                  <div key={item.label} className="relative">
                    {item.children ? (
                      <div
                        className="relative"
                        onMouseEnter={() => setOpenDropdown(item.label)}
                        onMouseLeave={() => setOpenDropdown(null)}
                      >
                        <Link
                          href={item.href}
                          className={`flex items-center gap-1.5 text-base font-medium px-3 py-1.5 rounded-[8px] transition-colors ${
                            isActive(item.href)
                              ? 'bg-cta text-white'
                              : scrolled || pathname !== '/'
                                ? scrolled
                                  ? isDarkScrollPage
                                    ? 'text-white hover:bg-cta hover:text-white'
                                    : 'text-primary hover:bg-cta hover:text-white'
                                  : 'text-primary hover:bg-cta hover:text-white'
                                : 'text-white hover:bg-cta hover:text-white'
                          }`}
                        >
                          {item.label}
                          <ChevronDown size={18} />
                        </Link>
                        {openDropdown === item.label && (
                          <div className="absolute top-full right-0 pt-4">
                            <div className="bg-white rounded-xl shadow-xl py-2 min-w-[180px] border border-gray-100">
                              {item.children.map((child) => (
                                <Link
                                  key={child.label}
                                  href={child.href}
                                  className="block px-5 py-2.5 text-base text-primary hover:bg-cta hover:text-white transition-colors"
                                >
                                  {child.label}
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        className={`text-base font-medium px-3 py-1.5 rounded-[8px] transition-colors ${
                          isActive(item.href)
                            ? 'bg-cta text-white'
                            : scrolled || pathname !== '/'
                              ? scrolled
                                ? isDarkScrollPage
                                  ? 'text-white hover:bg-cta hover:text-white'
                                  : 'text-primary hover:bg-cta hover:text-white'
                                : 'text-primary hover:bg-cta hover:text-white'
                              : 'text-white hover:bg-cta hover:text-white'
                        }`}
                      >
                        {item.label}
                      </Link>
                    )}
                  </div>
                ))}
              </nav>

              <button
                onClick={() => setFullNavOpen(true)}
                className={`p-2 transition-colors ${
                  scrolled
                    ? isDarkScrollPage
                      ? 'text-white hover:text-white/70'
                      : 'text-primary hover:text-cta'
                    : pathname !== '/'
                      ? 'text-primary hover:text-cta'
                      : 'text-white hover:text-white/70'
                }`}
                aria-label="開啟網站導覽"
              >
                <Menu size={32} />
              </button>
            </div>
          </div>
          {/* 底部細線 */}
          {!scrolled && (
            <div className={`h-px mx-6 md:mx-12 ${pathname === '/' ? 'bg-white/40' : 'bg-primary/10'}`} />
          )}
        </div>
      </header>

      <div
        className={`fixed inset-0 z-[100] transition-all duration-500 ${
          fullNavOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-white" />
        <button
          onClick={() => setFullNavOpen(false)}
          className="absolute top-6 right-6 md:top-8 md:right-12 z-10 p-2 text-primary hover:text-cta transition-colors"
          aria-label="關閉導覽"
        >
          <X size={32} />
        </button>
        <div className="absolute top-6 left-6 md:top-8 md:left-12">
          <Link href="/" onClick={() => setFullNavOpen(false)}>
            <Image src="/images/logo/logo-header.png" alt="境曜有限公司" width={140} height={140} className="w-auto h-10" unoptimized />
          </Link>
        </div>
        <div className="relative h-full overflow-y-auto pt-24 pb-12 px-6 md:px-12 lg:px-20">
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12">
            {NAV_ITEMS.map((item) => (
              <div key={item.label}>
                <Link
                  href={item.href}
                  onClick={() => setFullNavOpen(false)}
                  className="text-xl md:text-2xl font-bold text-primary hover:text-cta transition-colors"
                >
                  {item.label}
                </Link>
                {item.children && (
                  <div className="mt-4 space-y-3">
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        onClick={() => setFullNavOpen(false)}
                        className="block text-sm md:text-base text-primary/70 hover:text-cta transition-colors"
                      >
                        › {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-6 text-sm text-primary/70">
              <a href="tel:0912727596" className="hover:text-cta transition-colors">📞 0912-727-596</a>
              <a href="mailto:Jingyaoactivities@gmail.com" className="hover:text-cta transition-colors">✉️ Jingyaoactivities@gmail.com</a>
              <a href={LINE_URL} target="_blank" rel="noopener noreferrer" className="hover:text-cta transition-colors">💬 LINE：@040kolkv</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
