import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* 品牌 Logo */}
          <div>
            <img
              src="/images/logo/logo.jpg"
              alt="境曜有限公司 BES"
              className="w-40 h-auto rounded-lg"
            />
          </div>

          {/* 快速連結 */}
          <div>
            <h3 className="text-lg font-bold mb-4">服務項目</h3>
            <nav className="space-y-2">
              {[
                { label: '啟動儀式', href: '/products/opening-ceremony' },
                { label: '燈光音響舞台', href: '/products/stage-lighting' },
                { label: '專案企劃', href: '/products/event-planning' },
                { label: '外派調酒', href: '/products/bartending' },
                { label: 'Show Girl', href: '/showgirl' },
                { label: '案例展示', href: '/cases' },
                { label: '聯絡我們', href: '/contact' },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block text-sm text-white/70 hover:text-cta transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* 聯絡資訊 */}
          <div>
            <h3 className="text-lg font-bold mb-4">隱私權政策</h3>
            <nav className="space-y-2">
              <Link
                href="/privacy"
                className="block text-sm text-white/70 hover:text-cta transition-colors"
              >
                隱私權及個資保護政策
              </Link>
            </nav>
          </div>

          {/* 聯絡我們 */}
          <div>
            <h3 className="text-lg font-bold mb-4">聯絡我們</h3>
            <div className="space-y-3">
              <a href="tel:0912727596" className="flex items-center gap-2 text-sm text-white/70 hover:text-cta transition-colors">
                <Phone size={16} /> 0912-727-596
              </a>
              <a href="mailto:Jingyaoactivities@gmail.com" className="flex items-center gap-2 text-sm text-white/70 hover:text-cta transition-colors">
                <Mail size={16} /> Jingyaoactivities@gmail.com
              </a>
              <a href="https://line.me/ti/p/~@648ubibg" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-white/70 hover:text-cta transition-colors">
                <MapPin size={16} /> LINE：@648ubibg
              </a>
            </div>
            {/* 社群 */}
            <div className="flex gap-5 mt-6 items-center">
              <a href="https://www.youtube.com/@境曜" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-cta transition-colors" aria-label="YouTube">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 576 512" fill="currentColor"><path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z"/></svg>
              </a>
              <a href="https://line.me/ti/p/~@648ubibg" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-cta transition-colors" aria-label="LINE">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512" fill="currentColor"><path d="M311 196.8v81.3c0 2.1-1.6 3.7-3.7 3.7h-13c-1.3 0-2.4-.7-3-1.5l-37.3-50.3v48.2c0 2.1-1.6 3.7-3.7 3.7h-13c-2.1 0-3.7-1.6-3.7-3.7V196.9c0-2.1 1.6-3.7 3.7-3.7h12.9c1.1 0 2.4 .6 3 1.6l37.3 50.3V196.9c0-2.1 1.6-3.7 3.7-3.7h13c2.1-.1 3.8 1.5 3.8 3.6zm-93.7-3.7h-13c-2.1 0-3.7 1.6-3.7 3.7v81.3c0 2.1 1.6 3.7 3.7 3.7h13c2.1 0 3.7-1.6 3.7-3.7V196.8c0-2.1-1.6-3.7-3.7-3.7zm-31.4 68.1H150.3V196.8c0-2.1-1.6-3.7-3.7-3.7h-13c-2.1 0-3.7 1.6-3.7 3.7v81.3c0 1 .3 1.8 1 2.5 .7 .6 1.5 1.2 2.7 1.2h36.7c2.1 0 3.7-1.6 3.7-3.7v-13c0-2.1-1.6-3.8-3.7-3.8zm143.3-68.1H293c-2.1 0-3.7 1.6-3.7 3.7v81.3c0 1 .3 1.8 1 2.5 .7 .6 1.5 1.2 2.7 1.2h36.7c2.1 0 3.7-1.6 3.7-3.7v-13c0-2.1-1.6-3.7-3.7-3.7H310v-13.2h19.7c2.1 0 3.7-1.6 3.7-3.7v-13c0-2.1-1.6-3.7-3.7-3.7H310v-13.2h19.7c2.1 0 3.7-1.6 3.7-3.7v-13c-.1-2.1-1.7-3.7-3.8-3.7zM512 93.4V419.4c-.1 51.2-42.1 92.7-93.4 92.6H92.6C41.4 512-.1 470-0 418.8V93.4C.1 42.2 42.2 .1 93.4 0H418.6c51.2 0 93.3 42.1 93.4 93.4zM441.6 233.5c0-83.4-83.7-151.3-186.4-151.3s-186.4 67.9-186.4 151.3c0 74.7 66.3 137.4 155.9 149.3 21.8 4.7 19.3 12.7 14.4 42.1-.8 4.7-3.8 18.4 16.1 10 19.9-8.4 107-63 146-107.8 26.9-29.4 39.8-59.3 40.4-93.6z"/></svg>
              </a>
              <a href="#" className="text-white/70 hover:text-cta transition-colors" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 448 512" fill="currentColor"><path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </div>
      {/* Bottom bar */}
      <div className="border-t border-white/10 py-6">
        <p className="text-center text-sm text-white/50">
          Copyright © 2024 境曜有限公司 All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
