'use client';

import { useState, useEffect } from 'react';
import { Package, Camera, Users, Building2, Star, MessageSquare, HelpCircle, AlertCircle } from 'lucide-react';

interface TableCount {
  table: string;
  label: string;
  icon: React.ElementType;
  count: number;
  color: string;
}

const TABLES: Omit<TableCount, 'count'>[] = [
  { table: 'products', label: '產品', icon: Package, color: '#AA7452' },
  { table: 'cases', label: '案例', icon: Camera, color: '#5B8C6A' },
  { table: 'showgirls', label: 'Show Girl', icon: Users, color: '#7B68AE' },
  { table: 'clients', label: '客戶', icon: Building2, color: '#4A90A4' },
  { table: 'reviews', label: '評價', icon: Star, color: '#D4A03C' },
  { table: 'contacts', label: '諮詢', icon: MessageSquare, color: '#C75B5B' },
  { table: 'faqs', label: 'FAQ', icon: HelpCircle, color: '#6B8E6B' },
];

export default function AdminDashboard() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [unreadContacts, setUnreadContacts] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const password = localStorage.getItem('admin_password') || '';
    const headers = { 'x-admin-password': password };

    const fetchAll = async () => {
      try {
        const results = await Promise.all(
          TABLES.map(t =>
            fetch(`/api/admin?table=${t.table}`, { headers })
              .then(r => r.json())
              .then(d => ({ table: t.table, count: d.data?.length || 0, data: d.data || [] }))
          )
        );
        const countMap: Record<string, number> = {};
        results.forEach(r => { countMap[r.table] = r.count; });
        setCounts(countMap);

        const contactResult = results.find(r => r.table === 'contacts');
        if (contactResult) {
          const unread = contactResult.data.filter((c: { read: boolean }) => !c.read).length;
          setUnreadContacts(unread);
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: '#4A4947' }}>儀表板</h1>

      {unreadContacts > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700 font-medium">
            您有 {unreadContacts} 筆未讀諮詢紀錄
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {TABLES.map(t => {
          const Icon = t.icon;
          return (
            <div key={t.table} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{t.label}</p>
                  <p className="text-3xl font-bold mt-1" style={{ color: '#4A4947' }}>
                    {loading ? '—' : counts[t.table] ?? 0}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${t.color}15` }}>
                  <Icon className="w-6 h-6" style={{ color: t.color }} />
                </div>
              </div>
              {t.table === 'contacts' && unreadContacts > 0 && (
                <p className="text-xs text-red-500 mt-2">🔴 {unreadContacts} 筆未讀</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
