'use client';

import { useState, useEffect } from 'react';
import { Mail, Plus, Trash2, Save, CheckCircle } from 'lucide-react';

export default function NotificationsPage() {
  const [emails, setEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const getHeaders = () => ({ 'x-admin-password': localStorage.getItem('admin_password') || '' });

  const fetchEmails = async () => {
    try {
      const res = await fetch('/api/admin?table=site_content', { headers: getHeaders() });
      const json = await res.json();
      const items = json.data || [];
      const emailSetting = items.find((item: { key: string; value: string }) => item.key === 'notification_email');
      if (emailSetting?.value) {
        setEmails(emailSetting.value.split(',').map((e: string) => e.trim()).filter(Boolean));
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchEmails(); }, []);

  const addEmail = () => {
    const trimmed = newEmail.trim().toLowerCase();
    if (!trimmed) return;
    // 簡易 email 驗證
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('請輸入有效的 Email 地址');
      return;
    }
    if (emails.includes(trimmed)) {
      setError('此 Email 已存在');
      return;
    }
    setEmails([...emails, trimmed]);
    setNewEmail('');
    setError('');
    setSaved(false);
  };

  const removeEmail = (index: number) => {
    setEmails(emails.filter((_, i) => i !== index));
    setSaved(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addEmail();
    }
  };

  const handleSave = async () => {
    if (emails.length === 0) {
      setError('請至少設定一個收件信箱');
      return;
    }
    setSaving(true);
    setError('');

    const adminPwd = localStorage.getItem('admin_password') || '';
    const value = emails.join(',');

    try {
      // 先檢查是否已有 notification_email 記錄
      const res = await fetch('/api/admin?table=site_content', { headers: getHeaders() });
      const json = await res.json();
      const items = json.data || [];
      const existing = items.find((item: { key: string; value: string; id: string }) => item.key === 'notification_email');

      if (existing) {
        // 更新
        await fetch('/api/admin', {
          method: 'PUT',
          headers: { 'x-admin-password': adminPwd, 'Content-Type': 'application/json' },
          body: JSON.stringify({ table: 'site_content', id: existing.id, record: { value } }),
        });
      } else {
        // 新增
        await fetch('/api/admin', {
          method: 'POST',
          headers: { 'x-admin-password': adminPwd, 'Content-Type': 'application/json' },
          body: JSON.stringify({ table: 'site_content', record: { key: 'notification_email', value } }),
        });
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError('儲存失敗，請稍後再試');
      console.error(err);
    }
    setSaving(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#4A4947' }}>通知設定</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#AA745220' }}>
            <Mail className="w-5 h-5" style={{ color: '#AA7452' }} />
          </div>
          <div>
            <h2 className="font-bold" style={{ color: '#4A4947' }}>表單通知收件信箱</h2>
            <p className="text-sm text-gray-500">客戶送出諮詢表單後，通知信會寄到以下信箱</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">載入中...</div>
        ) : (
          <>
            {/* 現有信箱列表 */}
            <div className="space-y-2 mb-4">
              {emails.map((email, index) => (
                <div key={index} className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg group">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium">{email}</span>
                  </div>
                  <button
                    onClick={() => removeEmail(index)}
                    className="p-1.5 rounded-lg hover:bg-red-50 opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ))}
              {emails.length === 0 && (
                <div className="text-center py-6 text-gray-400 text-sm">
                  尚未設定收件信箱
                </div>
              )}
            </div>

            {/* 新增信箱 */}
            <div className="flex gap-2 mb-4">
              <input
                type="email"
                value={newEmail}
                onChange={e => { setNewEmail(e.target.value); setError(''); }}
                onKeyDown={handleKeyDown}
                placeholder="輸入 Email 地址後按 Enter 或點擊新增"
                className="flex-1 px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm"
              />
              <button
                onClick={addEmail}
                className="flex items-center gap-1.5 px-4 py-2.5 text-white rounded-lg text-sm font-medium hover:opacity-90 transition whitespace-nowrap"
                style={{ backgroundColor: '#AA7452' }}
              >
                <Plus className="w-4 h-4" /> 新增
              </button>
            </div>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            {/* 儲存按鈕 */}
            <div className="flex items-center gap-3 pt-4 border-t">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 text-white rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
                style={{ backgroundColor: '#AA7452' }}
              >
                {saving ? (
                  <>儲存中...</>
                ) : (
                  <><Save className="w-4 h-4" /> 儲存設定</>
                )}
              </button>
              {saved && (
                <span className="flex items-center gap-1.5 text-green-600 text-sm">
                  <CheckCircle className="w-4 h-4" /> 已儲存
                </span>
              )}
            </div>

            {/* 說明 */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 font-medium mb-1">💡 說明</p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 可設定多個收件信箱，每個信箱都會收到通知</li>
                <li>• 客戶從網站送出諮詢表單時，系統會自動寄送通知信到所有信箱</li>
                <li>• 通知信包含客戶姓名、電話、服務需求等完整資訊</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
