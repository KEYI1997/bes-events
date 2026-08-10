'use client';

import { useState, useEffect } from 'react';
import { Mail, Plus, Trash2, Save, CheckCircle, Bell, Lock, Eye, EyeOff } from 'lucide-react';

export default function NotificationsPage() {
  const [emails, setEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // 密碼變更相關 state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdSaved, setPwdSaved] = useState(false);
  const [pwdError, setPwdError] = useState('');

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
    if (e.key === 'Enter') { e.preventDefault(); addEmail(); }
  };

  const handleSave = async () => {
    if (emails.length === 0) { setError('請至少設定一個收件信箱'); return; }
    setSaving(true);
    setError('');
    const adminPwd = localStorage.getItem('admin_password') || '';
    const value = emails.join(',');
    try {
      // 先 GET 找到現有記錄的 id
      const res = await fetch('/api/admin?table=site_content', {
        headers: { 'x-admin-password': adminPwd },
      });
      const json = await res.json();

      if (!res.ok) {
        setError(`讀取設定失敗：${json.error || res.status}`);
        setSaving(false);
        return;
      }

      const items: { key: string; id: string }[] = json.data || [];
      const existing = items.find(item => item.key === 'notification_email');

      if (existing) {
        // 更新
        const putRes = await fetch('/api/admin', {
          method: 'PUT',
          headers: { 'x-admin-password': adminPwd, 'Content-Type': 'application/json' },
          body: JSON.stringify({ table: 'site_content', id: existing.id, record: { value, updated_at: new Date().toISOString() } }),
        });
        const putJson = await putRes.json();
        if (!putRes.ok) { setError(`儲存失敗：${putJson.error || putRes.status}`); setSaving(false); return; }
      } else {
        // 新增
        const postRes = await fetch('/api/admin', {
          method: 'POST',
          headers: { 'x-admin-password': adminPwd, 'Content-Type': 'application/json' },
          body: JSON.stringify({ table: 'site_content', record: { key: 'notification_email', value } }),
        });
        const postJson = await postRes.json();
        if (!postRes.ok) { setError(`儲存失敗：${postJson.error || postRes.status}`); setSaving(false); return; }
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
      {/* 頁首 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#4A4947' }}>通知設定</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

      {/* ══ 左欄：收件信箱設定 ══ */}
      <div className="space-y-5">

        {/* ── 目前收件信箱 ── */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* 區塊標題 */}
          <div className="flex items-center gap-3 px-6 py-4 border-b bg-gray-50">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#AA745215' }}>
              <Bell className="w-4 h-4" style={{ color: '#AA7452' }} />
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: '#4A4947' }}>目前通知收件信箱</p>
              <p className="text-xs text-gray-400">客戶送出詢問單或新訂單時，系統會寄通知到以下信箱</p>
            </div>
          </div>

          {loading ? (
            <div className="px-6 py-10 text-center text-gray-400 text-sm">載入中...</div>
          ) : emails.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <Mail className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">尚未設定任何收件信箱</p>
              <p className="text-gray-300 text-xs mt-1">請在下方新增至少一個信箱</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {emails.map((email, index) => (
                <li key={index} className="flex items-center justify-between px-6 py-3.5">
                  <div className="flex items-center gap-3">
                    {/* 序號圓點 */}
                    <span className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: '#AA745215', color: '#AA7452' }}>
                      {index + 1}
                    </span>
                    <Mail className="w-4 h-4 text-gray-300 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-700">{email}</span>
                  </div>
                  {/* 刪除按鈕 — 一直顯示 */}
                  <button
                    onClick={() => removeEmail(index)}
                    title="刪除此信箱"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-red-500 hover:bg-red-50 border border-red-100 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    刪除
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* 信箱數量摘要 */}
          {!loading && emails.length > 0 && (
            <div className="px-6 py-3 bg-gray-50 border-t">
              <p className="text-xs text-gray-400">
                共 <span className="font-semibold" style={{ color: '#AA7452' }}>{emails.length}</span> 個收件信箱
              </p>
            </div>
          )}
        </div>

        {/* ── 新增信箱 ── */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b bg-gray-50">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#AA745215' }}>
              <Plus className="w-4 h-4" style={{ color: '#AA7452' }} />
            </div>
            <p className="font-semibold text-sm" style={{ color: '#4A4947' }}>新增收件信箱</p>
          </div>
          <div className="px-6 py-5">
            <div className="flex gap-2">
              <input
                type="email"
                value={newEmail}
                onChange={e => { setNewEmail(e.target.value); setError(''); }}
                onKeyDown={handleKeyDown}
                placeholder="example@gmail.com"
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 text-sm"
                style={{ '--tw-ring-color': '#AA745240' } as React.CSSProperties}
              />
              <button
                onClick={addEmail}
                className="flex items-center gap-1.5 px-5 py-2.5 text-white rounded-lg text-sm font-medium hover:opacity-90 transition whitespace-nowrap"
                style={{ backgroundColor: '#AA7452' }}
              >
                <Plus className="w-4 h-4" /> 新增
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">輸入 Email 後按 Enter 或點擊「新增」，新增後記得按下方「儲存設定」</p>
            {error && (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                ⚠️ {error}
              </p>
            )}
          </div>
        </div>

        {/* ── 儲存按鈕 ── */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 px-6 py-2.5 text-white rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
            style={{ backgroundColor: '#AA7452' }}
          >
            {saving ? '儲存中...' : <><Save className="w-4 h-4" /> 儲存設定</>}
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
              <CheckCircle className="w-4 h-4" /> 已成功儲存
            </span>
          )}
        </div>

        {/* ── 說明 ── */}
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
          <p className="text-sm text-blue-800 font-semibold mb-2">💡 說明</p>
          <ul className="text-sm text-blue-700 space-y-1.5">
            <li>• 可設定多個收件信箱，每個信箱都會同時收到通知</li>
            <li>• 客戶送出諮詢表單時，會自動寄送「新詢問單通知」</li>
            <li>• 後台新增訂單時，會自動寄送「新訂單通知」</li>
            <li>• 修改後請務必點擊「儲存設定」才會生效</li>
          </ul>
        </div>

      </div>{/* 左欄結束 */}

      {/* ══ 右欄：變更密碼 ══ */}
      <div>

        {/* ── 變更密碼 ── */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden lg:sticky lg:top-6">
          <div className="flex items-center gap-3 px-6 py-4 border-b bg-gray-50">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#4A494715' }}>
              <Lock className="w-4 h-4" style={{ color: '#4A4947' }} />
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: '#4A4947' }}>變更後台密碼</p>
              <p className="text-xs text-gray-400">修改登入後台所使用的密碼</p>
            </div>
          </div>
          <div className="px-6 py-5 space-y-4">
            {/* 目前密碼 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">目前密碼</label>
              <div className="relative">
                <input
                  type={showCurrentPwd ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={e => { setCurrentPassword(e.target.value); setPwdError(''); }}
                  placeholder="請輸入目前的密碼"
                  className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 text-sm"
                  style={{ '--tw-ring-color': '#4A494740' } as React.CSSProperties}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 新密碼 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">新密碼</label>
              <div className="relative">
                <input
                  type={showNewPwd ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => { setNewPassword(e.target.value); setPwdError(''); }}
                  placeholder="請輸入新密碼（至少 6 個字元）"
                  className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 text-sm"
                  style={{ '--tw-ring-color': '#4A494740' } as React.CSSProperties}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPwd(!showNewPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 確認新密碼 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">確認新密碼</label>
              <div className="relative">
                <input
                  type={showConfirmPwd ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); setPwdError(''); }}
                  placeholder="請再次輸入新密碼"
                  className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 text-sm"
                  style={{ '--tw-ring-color': '#4A494740' } as React.CSSProperties}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {pwdError && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                ⚠️ {pwdError}
              </p>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={async () => {
                  // 驗證
                  if (!currentPassword) { setPwdError('請輸入目前密碼'); return; }
                  if (!newPassword) { setPwdError('請輸入新密碼'); return; }
                  if (newPassword.length < 6) { setPwdError('新密碼至少需要 6 個字元'); return; }
                  if (newPassword !== confirmPassword) { setPwdError('兩次輸入的新密碼不一致'); return; }
                  
                  const storedPwd = localStorage.getItem('admin_password') || '';
                  if (currentPassword !== storedPwd) { setPwdError('目前密碼不正確'); return; }

                  setPwdSaving(true);
                  setPwdError('');

                  try {
                    // 呼叫 API 更新密碼
                    const res = await fetch('/api/admin/change-password', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', 'x-admin-password': storedPwd },
                      body: JSON.stringify({ currentPassword, newPassword }),
                    });
                    const json = await res.json();

                    if (!res.ok) {
                      setPwdError(json.error || '密碼變更失敗');
                      setPwdSaving(false);
                      return;
                    }

                    // 更新 localStorage
                    localStorage.setItem('admin_password', newPassword);
                    
                    // 清空表單
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setPwdSaved(true);
                    setTimeout(() => setPwdSaved(false), 3000);
                  } catch (err) {
                    setPwdError('密碼變更失敗，請稍後再試');
                    console.error(err);
                  }
                  setPwdSaving(false);
                }}
                disabled={pwdSaving}
                className="flex items-center gap-2 px-6 py-2.5 text-white rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
                style={{ backgroundColor: '#4A4947' }}
              >
                {pwdSaving ? '變更中...' : <><Lock className="w-4 h-4" /> 變更密碼</>}
              </button>
              {pwdSaved && (
                <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                  <CheckCircle className="w-4 h-4" /> 密碼已成功變更
                </span>
              )}
            </div>
          </div>
        </div>

      </div>{/* 右欄結束 */}

    </div>{/* grid 結束 */}
    </div>
  );
}
