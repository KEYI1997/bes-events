'use client';
import { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';

const SERVICE_TYPES = ['啟動儀式', '燈光音響舞台', '專案企劃', '外派調酒', 'Show Girl', '其他'];

const REQUIRED_FIELDS = ['name', 'phone', 'email', 'service_type', 'event_date', 'event_end_date'] as const;

export default function ContactFormInline() {
  const [form, setForm] = useState({
    name: '', phone: '', email: '', service_type: '', event_date: '', event_end_date: '', description: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [errorFields, setErrorFields] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 檢查必填欄位
    const missing = REQUIRED_FIELDS.filter(field => !form[field]);
    if (missing.length > 0) {
      setErrorFields(missing);
      setError('請填寫所有必填欄位');
      // 移除動畫 class 後重新加上（讓動畫可重複觸發）
      setTimeout(() => setErrorFields([]), 500);
      return;
    }

    setErrorFields([]);
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSuccess(true);
        setForm({ name: '', phone: '', email: '', service_type: '', event_date: '', event_end_date: '', description: '' });
      } else {
        setError('提交失敗，請稍後再試');
      }
    } catch {
      setError('網路錯誤，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field: string) =>
    `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cta focus:border-transparent bg-white ${
      errorFields.includes(field)
        ? 'border-[#FF5C5C] animate-shake-x'
        : 'border-primary/20'
    }`;

  if (success) {
    return (
      <div className="text-center py-12">
        <CheckCircle size={48} className="mx-auto text-cta mb-4" />
        <h3 className="text-2xl font-bold text-primary mb-2">感謝您的諮詢！</h3>
        <p className="text-primary/70">我們將在 24 小時內與您聯繫</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <style jsx>{`
        @keyframes shake-x {
          10%, 90% { transform: translateX(-1px); }
          20%, 80% { transform: translateX(2px); }
          30%, 50%, 70% { transform: translateX(-4px); }
          40%, 60% { transform: translateX(4px); }
        }
        .animate-shake-x {
          animation: shake-x 0.45s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-primary mb-1">姓名 *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({...form, name: e.target.value})}
            className={inputClass('name')}
            placeholder="您的姓名"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-primary mb-1">電話 *</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({...form, phone: e.target.value})}
            className={inputClass('phone')}
            placeholder="您的電話"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-primary mb-1">Email *</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({...form, email: e.target.value})}
            className={inputClass('email')}
            placeholder="your@email.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-primary mb-1">服務類型 *</label>
          <select
            value={form.service_type}
            onChange={(e) => setForm({...form, service_type: e.target.value})}
            className={inputClass('service_type')}
          >
            <option value="">請選擇服務類型</option>
            {SERVICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-primary mb-1">活動起日 *</label>
          <input
            type="date"
            value={form.event_date}
            onChange={(e) => setForm({...form, event_date: e.target.value})}
            className={inputClass('event_date')}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-primary mb-1">活動迄日 *</label>
          <input
            type="date"
            value={form.event_end_date}
            onChange={(e) => setForm({...form, event_end_date: e.target.value})}
            className={inputClass('event_end_date')}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-primary mb-1">需求說明</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({...form, description: e.target.value})}
          rows={4}
          className="w-full px-4 py-3 border border-primary/20 rounded-lg focus:ring-2 focus:ring-cta focus:border-transparent bg-white"
          placeholder="請簡述您的活動需求..."
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full md:w-auto px-8 py-3 bg-cta text-white font-semibold rounded-lg hover:bg-cta-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
      >
        <Send size={18} />
        {loading ? '提交中...' : '送出諮詢'}
      </button>
    </form>
  );
}
