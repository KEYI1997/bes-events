'use client';

import { useState, useEffect } from 'react';
import { Mail, Plus, Trash2, Save, CheckCircle, Bell, Lock, Eye, EyeOff, Phone } from 'lucide-react';

const DEFAULT_ADMIN_PHONE = '0911247541';

function normalizePhone(phone: string) {
  let normalized = phone.replace(/[\s\-()]/g, '');
  if (normalized.startsWith('+886')) normalized = `0${normalized.slice(4)}`;
  if (normalized.startsWith('886')) normalized = `0${normalized.slice(3)}`;
  return normalized;
}

function parseAdminPhones(value?: string): string[] {
  if (!value) return [DEFAULT_ADMIN_PHONE];

  let rawPhones: string[];
  try {
    const parsed = JSON.parse(value);
    rawPhones = Array.isArray(parsed) ? parsed : [value];
  } catch {
    rawPhones = value.split(/[,;\n]/);
  }

  return [...new Set(rawPhones.map(phone => normalizePhone(String(phone))).filter(phone => /^09\d{8}$/.test(phone)))];
}

export default function NotificationsPage() {
  const [emails, setEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // LINE 管理員電話相關 state
  const [adminPhones, setAdminPhones] = useState<string[]>([]);
  const [newAdminPhone, setNewAdminPhone] = useState('');
  const [phoneSaving, setPhoneSaving] = useState(false);
  const [phoneSaved, setPhoneSaved] = useState(false);
  const [phoneError, setPhoneError] = useState('');

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

  useEffect(() => {
    let cancelled = false;

    const loadSettings = async () => {
      try {
        const res = await fetch('/api/admin?table=site_content', {
          headers: { 'x-admin-password': localStorage.getItem('admin_password') || '' },
        });
        const json = await res.json();
        if (cancelled) return;

        const items = json.data || [];
        const emailSetting = items.find((item: { key: string; value: string }) => item.key === 'notification_email');
        if (emailSetting?.value) {
          setEmails(emailSetting.value.split(',').map((e: string) => e.trim()).filter(Boolean));
        }
        const adminPhoneSetting = items.find((item: { key: string; value: string }) => item.key === 'admin_line_phone');
        setAdminPhones(parseAdminPhones(adminPhoneSetting?.value));
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadSettings();
    return () => { cancelled = true; };
  }, []);

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

  const saveAdminPhones = async (nextPhones: string[]) => {
    setPhoneSaving(true);
    setPhoneError('');
    const adminPwd = localStorage.getItem('admin_password') || '';
    const value = JSON.stringify(nextPhones);

    try {
      const res = await fetch('/api/admin?table=site_content', {
        headers: { 'x-admin-password': adminPwd },
      });
      const json = await res.json();

      if (!res.ok) {
        setPhoneError(`讀取設定失敗：${json.error || res.status}`);
        return false;
      }

      const items: { key: string; id: string }[] = json.data || [];
      const existing = items.find(item => item.key === 'admin_line_phone');
      const saveRes = existing
        ? await fetch('/api/admin', {
            method: 'PUT',
            headers: { 'x-admin-password': adminPwd, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              table: 'site_content',
              id: existing.id,
              record: { value, updated_at: new Date().toISOString() },
            }),
          })
        : await fetch('/api/admin', {
            method: 'POST',
            headers: { 'x-admin-password': adminPwd, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              table: 'site_content',
              record: { key: 'admin_line_phone', value },
            }),
          });
      const saveJson = await saveRes.json();

      if (!saveRes.ok) {
        setPhoneError(`儲存失敗：${saveJson.error || saveRes.status}`);
        return false;
      }

      setAdminPhones(nextPhones);
      setPhoneSaved(true);
      setTimeout(() => setPhoneSaved(false), 3000);
      return true;
    } catch (err) {
      setPhoneError('儲存失敗，請稍後再試');
      console.error(err);
      return false;
    } finally {
      setPhoneSaving(false);
    }
  };

  const handleAddAdminPhone = async () => {
    const normalized = normalizePhone(newAdminPhone);
    if (!/^09\d{8}$/.test(normalized)) {
      setPhoneError('請輸入有效的台灣手機號碼，例如 0912345678');
      return;
    }
    if (adminPhones.includes(normalized)) {
      setPhoneError('此管理人員電話已經新增');
      return;
    }

    const savedSuccessfully = await saveAdminPhones([...adminPhones, normalized]);
    if (savedSuccessfully) setNewAdminPhone('');
  };

  const handleRemoveAdminPhone = async (phone: string) => {
    if (adminPhones.length <= 1) {
      setPhoneError('至少需要保留一位管理人員');
      return;
    }
    await saveAdminPhones(adminPhones.filter(item => item !== phone));
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

      {/* ══ 右欄：管理員設定 ══ */}
      <div className="space-y-5">

        {/* ── LINE 管理員電話 ── */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b bg-gray-50">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#06C75515' }}>
              <Phone className="w-4 h-4" style={{ color: '#06C755' }} />
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: '#4A4947' }}>LINE 管理人員</p>
              <p className="text-xs text-gray-400">目前共 {adminPhones.length} 位，可新增多位管理人員</p>
            </div>
          </div>
          <div className="px-6 py-5 space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">已新增的管理人員</p>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700">
                  共 {adminPhones.length} 位
                </span>
              </div>
              {loading ? (
                <div className="py-6 text-center text-sm text-gray-400">載入中...</div>
              ) : adminPhones.length === 0 ? (
                <div className="py-6 text-center text-sm text-gray-400 border border-dashed rounded-lg">尚未新增管理人員</div>
              ) : (
                <ul className="divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden">
                  {adminPhones.map((phone, index) => (
                    <li key={phone} className="flex items-center justify-between px-4 py-3 bg-white">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-green-50 text-green-700">
                          {index + 1}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-gray-700">{phone}</p>
                          <p className="text-xs text-green-600">已新增</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAdminPhone(phone)}
                        disabled={phoneSaving || adminPhones.length <= 1}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-red-500 hover:bg-red-50 border border-red-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        title={adminPhones.length <= 1 ? '至少需要保留一位管理人員' : '刪除此管理人員'}
                      >
                        <Trash2 className="w-3.5 h-3.5" /> 刪除
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">新增手機號碼</label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  inputMode="tel"
                  value={newAdminPhone}
                  onChange={e => { setNewAdminPhone(e.target.value); setPhoneError(''); setPhoneSaved(false); }}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); void handleAddAdminPhone(); } }}
                  placeholder="例如：0912345678"
                  className="flex-1 min-w-0 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 text-sm"
                  style={{ '--tw-ring-color': '#06C75540' } as React.CSSProperties}
                />
                <button
                  type="button"
                  onClick={handleAddAdminPhone}
                  disabled={phoneSaving || loading}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-white rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50 whitespace-nowrap"
                  style={{ backgroundColor: '#06C755' }}
                >
                  {phoneSaving ? '儲存中...' : <><Plus className="w-4 h-4" /> 新增</>}
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              新增後，該人員需在 LINE 傳送「管理者：手機號碼」完成管理員認證。
            </p>
            {phoneError && <p className="text-red-500 text-sm">⚠️ {phoneError}</p>}
            {phoneSaved && (
              <p className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                <CheckCircle className="w-4 h-4" /> 管理人員清單已更新
              </p>
            )}
          </div>
        </div>

        {/* ── 變更密碼 ── */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
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
