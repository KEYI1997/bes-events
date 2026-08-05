'use client';

import { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';

// 台灣手機格式：09xx-xxx-xxx 或 09xxxxxxxx（10碼）
const PHONE_REGEX = /^09\d{2}-?\d{3}-?\d{3}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function formatPhone(raw: string): string {
  // 只保留數字
  const digits = raw.replace(/\D/g, '');
  if (digits.length <= 4) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 7)}-${digits.slice(7, 10)}`;
}

export default function ShowGirlInquiryForm() {
  const [heightMin, setHeightMin] = useState(158);
  const [heightMax, setHeightMax] = useState(170);
  const [outfit, setOutfit] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventName, setEventName] = useState('');
  const [headcount, setHeadcount] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const MIN = 150;
  const MAX = 195;

  const handleMinChange = (v: number) => {
    setHeightMin(Math.min(v, heightMax - 2));
  };
  const handleMaxChange = (v: number) => {
    setHeightMax(Math.max(v, heightMin + 2));
  };

  const handlePhoneChange = (raw: string) => {
    const formatted = formatPhone(raw);
    setPhone(formatted);
    if (formatted && !PHONE_REGEX.test(formatted)) {
      setPhoneError('請輸入正確格式，例：0912-345-678');
    } else {
      setPhoneError('');
    }
  };

  const handleEmailChange = (v: string) => {
    setEmail(v);
    if (v && !EMAIL_REGEX.test(v)) {
      setEmailError('請輸入正確的 Email 格式');
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!PHONE_REGEX.test(phone)) { setPhoneError('請輸入正確格式，例：0912-345-678'); return; }
    if (!EMAIL_REGEX.test(email)) { setEmailError('請輸入正確的 Email 格式'); return; }
    setSubmitting(true);
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          email,
          service_type: 'SHOW GIRL',
          event_date: eventDate,
          description: `活動名稱：${eventName}\n需要人數：${headcount} 人\n身高範圍：${heightMin}～${heightMax} cm（含高跟鞋）\n服裝要求：${outfit}`,
        }),
      });
      setSubmitted(true);
    } catch {
      alert('送出失敗，請稍後再試');
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <CheckCircle size={56} className="text-cta mb-4" />
        <h3 className="text-xl font-bold text-primary mb-2">已收到您的需求！</h3>
        <p className="text-primary/60">我們將盡快與您聯繫，為您安排最適合的人選。</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* 身高範圍 */}
      <div className="border-2 border-primary/20 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <label className="text-sm font-semibold text-primary">身高範圍</label>
          <span className="text-xs text-primary/50 border border-primary/20 rounded-full px-2.5 py-0.5">包含高跟鞋</span>
        </div>

        {/* Min 滑桿列 */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs text-primary/50 w-8 shrink-0">最低</span>
          <input
            type="range" min={MIN} max={MAX} step={1}
            value={heightMin}
            onChange={e => handleMinChange(Number(e.target.value))}
            className="flex-1 cursor-pointer showgirl-range"
            style={{ accentColor: '#AA7452' }}
          />
          <span className="text-sm font-bold w-16 shrink-0 text-right" style={{ color: '#AA7452' }}>{heightMin} cm</span>
        </div>

        {/* Max 滑桿列 */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-primary/50 w-8 shrink-0">最高</span>
          <input
            type="range" min={MIN} max={MAX} step={1}
            value={heightMax}
            onChange={e => handleMaxChange(Number(e.target.value))}
            className="flex-1 cursor-pointer showgirl-range"
            style={{ accentColor: '#AA7452' }}
          />
          <span className="text-sm font-bold w-16 shrink-0 text-right" style={{ color: '#AA7452' }}>{heightMax} cm</span>
        </div>
      </div>

      {/* 活動名稱 + 人數 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-primary mb-1.5">活動名稱</label>
          <input
            value={eventName} onChange={e => setEventName(e.target.value)}
            placeholder="例：2025 年度尾牙"
            className="w-full px-4 py-3 border-2 border-primary/20 rounded-xl focus:outline-none focus:border-cta transition text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-primary mb-1.5">需要人數</label>
          <input
            type="number" min={1}
            value={headcount} onChange={e => setHeadcount(e.target.value)}
            placeholder="例：3"
            className="w-full px-4 py-3 border-2 border-primary/20 rounded-xl focus:outline-none focus:border-cta transition text-sm"
          />
        </div>
      </div>

      {/* 服裝要求 */}
      <div>
        <label className="block text-sm font-semibold text-primary mb-1.5">服裝要求</label>
        <textarea
          value={outfit} onChange={e => setOutfit(e.target.value)}
          placeholder="例：正式禮服、休閒便服、主題服裝…"
          rows={3}
          className="w-full px-4 py-3 border-2 border-primary/20 rounded-xl focus:outline-none focus:border-cta transition text-sm resize-none"
        />
      </div>

      {/* 姓名 */}
      <div>
        <label className="block text-sm font-semibold text-primary mb-1.5">您的姓名 *</label>
        <input
          required value={name} onChange={e => setName(e.target.value)}
          placeholder="王小明"
          className="w-full px-4 py-3 border-2 border-primary/20 rounded-xl focus:outline-none focus:border-cta transition text-sm"
        />
      </div>

      {/* 電話 + Email */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-primary mb-1.5">聯絡電話 *</label>
          <input
            required
            value={phone}
            onChange={e => handlePhoneChange(e.target.value)}
            placeholder="0912-345-678"
            maxLength={12}
            inputMode="tel"
            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition text-sm ${
              phoneError ? 'border-red-400 focus:border-red-400' : 'border-primary/20 focus:border-cta'
            }`}
          />
          {phoneError && <p className="text-xs text-red-500 mt-1">{phoneError}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-primary mb-1.5">Email *</label>
          <input
            required type="email"
            value={email}
            onChange={e => handleEmailChange(e.target.value)}
            placeholder="example@mail.com"
            inputMode="email"
            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition text-sm ${
              emailError ? 'border-red-400 focus:border-red-400' : 'border-primary/20 focus:border-cta'
            }`}
          />
          {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
        </div>
      </div>

      {/* 活動日期 */}
      <div>
        <label className="block text-sm font-semibold text-primary mb-1.5">活動日期</label>
        <input
          type="date" value={eventDate} onChange={e => setEventDate(e.target.value)}
          className="w-full px-4 py-3 border-2 border-primary/20 rounded-xl focus:outline-none focus:border-cta transition text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 py-4 text-white font-bold rounded-full transition-all hover:opacity-90 disabled:opacity-60"
        style={{ backgroundColor: '#AA7452' }}
      >
        <Send size={18} />
        {submitting ? '送出中...' : '送出需求'}
      </button>
    </form>
  );
}
