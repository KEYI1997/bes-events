'use client';

import { useState, useEffect } from 'react';
import { X, ClipboardList } from 'lucide-react';

const EVENT_TYPES = [
  '婚宴 / 婚禮',
  '企業尾牙 / 春酒',
  '品牌發表 / 記者會',
  '生日派對',
  '私人聚會',
  '展覽 / 攤位',
  '開幕典禮',
  '其他',
];

interface BartendingOrderModalProps {
  planName: string;
  onClose: () => void;
}

interface FormState {
  name: string;
  phone: string;
  email: string;
  event_date: string;
  event_time: string;
  event_type: string;
  note: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
  event_date?: string;
  event_time?: string;
  event_type?: string;
}

export default function BartendingOrderModal({ planName, onClose }: BartendingOrderModalProps) {
  const [form, setForm] = useState<FormState>({
    name: '',
    phone: '',
    email: '',
    event_date: '',
    event_time: '',
    event_type: '',
    note: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // 鎖定背景捲動
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // 按 Esc 關閉
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.name.trim()) newErrors.name = '請填寫姓名';

    const phoneRegex = /^(\+886|0)[0-9]{8,10}$/;
    if (!form.phone.trim()) {
      newErrors.phone = '請填寫電話';
    } else if (!phoneRegex.test(form.phone.replace(/[-\s]/g, ''))) {
      newErrors.phone = '電話格式不正確（例：0912345678）';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim()) {
      newErrors.email = '請填寫 Email';
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = 'Email 格式不正確（例：name@example.com）';
    }

    if (!form.event_date) newErrors.event_date = '請選擇活動日期';
    if (!form.event_time) newErrors.event_time = '請選擇活動時間';
    if (!form.event_type) newErrors.event_type = '請選擇活動類型';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          service_type: '外派調酒',
          event_date: form.event_date,
          description: `方案：${planName}\n活動時間：${form.event_time}\n活動類型：${form.event_type}${form.note ? `\n備註：${form.note}` : ''}`,
        }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        alert('提交失敗，請稍後再試');
      }
    } catch {
      alert('提交失敗，請確認網路連線後再試');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* 遮罩 */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal 本體 */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-primary px-6 py-5 rounded-t-2xl flex items-start justify-between z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ClipboardList size={20} className="text-cta" />
              <span className="text-white/70 text-sm font-medium">建立訂單</span>
            </div>
            <h2 className="text-white text-xl font-bold leading-snug">{planName}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors mt-1 flex-shrink-0"
            aria-label="關閉"
          >
            <X size={24} />
          </button>
        </div>

        {success ? (
          /* 成功畫面 */
          <div className="px-6 py-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-primary mb-2">訂單已送出！</h3>
            <p className="text-primary/60 text-sm mb-6">我們將盡快與您聯繫，確認活動細節。</p>
            <button
              onClick={onClose}
              className="bg-cta text-white px-8 py-3 rounded-full font-semibold hover:bg-cta-hover transition-colors"
            >
              關閉
            </button>
          </div>
        ) : (
          /* 表單 */
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5" noValidate>

            {/* 姓名 */}
            <div>
              <label className="block text-sm font-semibold text-primary mb-1.5">
                姓名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => handleChange('name', e.target.value)}
                placeholder="請輸入您的姓名"
                className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors ${
                  errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-cta'
                }`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* 電話 */}
            <div>
              <label className="block text-sm font-semibold text-primary mb-1.5">
                電話 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => handleChange('phone', e.target.value)}
                placeholder="例：0912-345-678"
                className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors ${
                  errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-cta'
                }`}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-primary mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => handleChange('email', e.target.value)}
                placeholder="例：name@example.com"
                className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors ${
                  errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-cta'
                }`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* 活動日期 + 時間（同一列） */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-primary mb-1.5">
                  活動日期 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.event_date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => handleChange('event_date', e.target.value)}
                  className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors ${
                    errors.event_date ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-cta'
                  }`}
                />
                {errors.event_date && <p className="text-red-500 text-xs mt-1">{errors.event_date}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-primary mb-1.5">
                  活動時間 <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={form.event_time}
                  onChange={e => handleChange('event_time', e.target.value)}
                  className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors ${
                    errors.event_time ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-cta'
                  }`}
                />
                {errors.event_time && <p className="text-red-500 text-xs mt-1">{errors.event_time}</p>}
              </div>
            </div>

            {/* 活動類型 */}
            <div>
              <label className="block text-sm font-semibold text-primary mb-1.5">
                活動類型 <span className="text-red-500">*</span>
              </label>
              <select
                value={form.event_type}
                onChange={e => handleChange('event_type', e.target.value)}
                className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors bg-white ${
                  errors.event_type ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-cta'
                }`}
              >
                <option value="">請選擇活動類型</option>
                {EVENT_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {errors.event_type && <p className="text-red-500 text-xs mt-1">{errors.event_type}</p>}
            </div>

            {/* 備註（非必填） */}
            <div>
              <label className="block text-sm font-semibold text-primary mb-1.5">
                備註 <span className="text-primary/40 font-normal">（選填）</span>
              </label>
              <textarea
                value={form.note}
                onChange={e => handleChange('note', e.target.value)}
                placeholder="例：場地特殊需求、預估人數、其他說明..."
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-cta transition-colors resize-none"
              />
            </div>

            {/* 提交 */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-cta text-white py-4 rounded-full font-semibold text-base hover:bg-cta-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  送出中...
                </>
              ) : (
                <>
                  <ClipboardList size={18} />
                  送出訂單
                </>
              )}
            </button>

            <p className="text-center text-xs text-primary/40">
              送出後我們將於 1 個工作日內與您聯繫確認
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
