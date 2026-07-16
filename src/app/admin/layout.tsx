'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Package, Camera, Users, Building2,
  MessageSquare, HelpCircle, LayoutDashboard,
  LogOut, Lock, Menu, X, CalendarDays, Bell
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/admin', label: '儀表板', icon: LayoutDashboard },
  { href: '/admin/products', label: '產品管理', icon: Package },
  { href: '/admin/orders', label: '訂單 / 行事曆', icon: CalendarDays },
  { href: '/admin/cases', label: '案例管理', icon: Camera },
  { href: '/admin/showgirls', label: 'Show Girl', icon: Users },
  { href: '/admin/clients', label: '客戶管理', icon: Building2 },
  { href: '/admin/contacts', label: '諮詢紀錄', icon: MessageSquare },
  { href: '/admin/faqs', label: 'FAQ 管理', icon: HelpCircle },
  { href: '/admin/notifications', label: '通知設定', icon: Bell },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [inputPassword, setInputPassword] = useState('');
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const saved = localStorage.getItem('admin_password');
    if (saved) {
      setPassword(saved);
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPassword === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      localStorage.setItem('admin_password', inputPassword);
      setPassword(inputPassword);
      setIsLoggedIn(true);
      setError('');
    } else {
      setError('密碼錯誤');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_password');
    setPassword('');
    setIsLoggedIn(false);
    setInputPassword('');
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F9F7F0' }}>
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#AA7452' }}>
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: '#4A4947' }}>後台管理系統</h1>
            <p className="text-sm text-gray-500 mt-1">境曜整合行銷</p>
          </div>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={inputPassword}
              onChange={e => setInputPassword(e.target.value)}
              placeholder="請輸入管理密碼"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 mb-4"
              style={{ focusRingColor: '#AA7452' } as React.CSSProperties}
              autoFocus
            />
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <button
              type="submit"
              className="w-full py-3 text-white rounded-lg font-medium transition hover:opacity-90"
              style={{ backgroundColor: '#AA7452' }}
            >
              登入
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#F9F7F0' }}>
      {/* Mobile menu button */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-white shadow-md"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ backgroundColor: '#4A4947' }}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-white font-bold text-lg">境曜後台</h2>
            <p className="text-gray-400 text-xs mt-1">Admin Panel</p>
          </div>
          <nav className="flex-1 py-4 overflow-y-auto">
            {NAV_ITEMS.map(item => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                    isActive
                      ? 'text-white border-r-3'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                  style={isActive ? { backgroundColor: 'rgba(74,73,71,0.2)', borderRightColor: '#4A4947' } : {}}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-400 hover:text-white text-sm w-full px-2 py-2 rounded transition-colors hover:bg-white/5"
            >
              <LogOut className="w-4 h-4" />
              登出
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 lg:ml-0 min-h-screen">
        <div className="p-6 lg:p-8 pt-16 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
