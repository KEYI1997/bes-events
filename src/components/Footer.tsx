import Link from 'next/link';
import { Phone, Mail, MapPin, Camera, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* 品牌 */}
          <div>
            <h3 className="text-xl font-bold mb-4">境曜有限公司</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              Bright Events Services，專注於各類型活動整合與現場執行，
              致力於為企業打造具影響力與記憶點的活動體驗。
            </p>
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
            <div className="flex gap-4 mt-6">
              <a href="https://www.youtube.com/@境曜" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-cta transition-colors" aria-label="YouTube">
                <wa-icon name="youtube" family="brands" style={{ fontSize: '18px' }}></wa-icon>
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-cta transition-colors" aria-label="Instagram">
                <Camera size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-cta transition-colors" aria-label="Facebook">
                <Globe size={18} />
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
