'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown } from 'lucide-react';

const NAV_ITEMS = [
  { label: '啟動儀式', href: '/products/opening-ceremony' },
  { label: '燈光音響舞台', href: '/products/stage-lighting' },
  {
    label: '專案企劃',
    href: '/products/event-planning',
    children: [
      { label: '記者會/發表會', href: '/products/event-planning?cat=press' },
      { label: '尾牙春酒', href: '/products/event-planning?cat=banquet' },
      { label: '企業家庭日', href: '/products/event-planning?cat=family-day' },
      { label: '典禮節慶', href: '/products/event-planning?cat=ceremony' },
      { label: '市集', href: '/products/event-planning?cat=market' },
      { label: '展覽', href: '/products/event-planning?cat=exhibition' },
    ],
  },
  { label: '外派調酒', href: '/products/bartending' },
  { label: 'Show Girl', href: '/showgirl' },
  { label: '案例展示', href: '/cases' },
  { label: '聯絡我們', href: '/contact' },
];

export default function Header() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 50) {
        setVisible(true);
      } else if (currentScrollY > lastScrollY) {
        // 往下滑 → 隱藏
        setVisible(false);
        setMobileOpen(false);
      } else {
        // 往上滑 → 顯示
        setVisible(true);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 px-4 md:px-8 pt-3 transition-all duration-500 ease-in-out ${
      visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
    }`}>
      {/* 膠囊形狀的浮動導航欄 */}
      <div className="max-w-4xl mx-auto bg-black/30 backdrop-blur-md rounded-[10px]">
        <div className="px-5 py-2 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <Image src="/images/logo/logo-v3.png" alt="境曜有限公司" width={120} height={120} className="rounded-[8px] w-auto h-9" unoptimized />
          </Link>

          {/* Desktop Nav - 中間 */}
          <nav className="hidden lg:flex items-center gap-6">
            {NAV_ITEMS.map((item) => (
              <div key={item.label} className="relative">
                {item.children ? (
                  <div
                    className="relative"
                    onMouseEnter={() => setDropdownOpen(true)}
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <Link
                      href={item.href}
                      className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                        isActive(item.href) ? 'text-cta font-bold' : 'text-white hover:text-white/70'
                      }`}
                    >
                      {item.label}
                      <ChevronDown size={14} />
                    </Link>
                    {dropdownOpen && (
                      <div className="absolute top-full left-0 mt-4 bg-white rounded-xl shadow-xl py-2 min-w-[160px] border border-gray-100">
                        {item.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            className="block px-4 py-2 text-sm text-primary hover:bg-bg hover:text-primary/70 transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={item.label === '聯絡我們'
                      ? `text-sm font-medium px-4 py-2 bg-cta text-white rounded-[10px] hover:bg-cta-hover transition-colors${isActive(item.href) ? ' ring-2 ring-cta ring-offset-2' : ''}`
                      : `text-sm transition-colors ${isActive(item.href) ? 'text-cta font-bold' : 'text-white font-medium hover:text-white/70'}`
                    }
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Mobile Toggle - 右側 */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-primary"
              aria-label="選單"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden mt-2 max-w-6xl mx-auto bg-mobile-nav rounded-2xl shadow-lg overflow-hidden">
          <nav className="px-6 py-4 space-y-2">
            {NAV_ITEMS.map((item) => (
              <div key={item.label}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block py-2 text-primary font-medium hover:text-primary/60"
                >
                  {item.label}
                </Link>
                {item.children && (
                  <div className="pl-4 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        onClick={() => setMobileOpen(false)}
                        className="block py-1 text-sm text-primary/70 hover:text-primary/50"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <a
              href="tel:0912727596"
              className="block text-center py-3 bg-cta text-white font-semibold rounded-full mt-4"
            >
              📞 0912-727-596 免費諮詢
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
