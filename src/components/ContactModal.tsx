'use client';
import { useState } from 'react';
import { Send, CheckCircle, X } from 'lucide-react';

const SERVICE_TYPES = ['啟動儀式', '燈光音響舞台', '專案企劃', '外派調酒', 'Show Girl', '其他'];
const REQUIRED_FIELDS = ['name', 'phone', 'email', 'service_type', 'event_date', 'event_end_date'] as const;
const PHONE_REGEX = /^(09\d{2}-?\d{3}-?\d{3}|0\d{1,2}-?\d{6,8})$/;

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
}

export default function ContactModal({ isOpen, onClose, productName }: ContactModalProps) {
  const [form, setForm] = useState({
    name: '', phone: '', email: '', service_type: '', event_date: '', event_end_date: '', description: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [errorFields, setErrorFields] = useState<string[]>([]);
  const [phoneError, setPhoneError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const missing = REQUIRED_FIELDS.filter(field => !form[field]);
    if (missing.length > 0) {
      setErrorFields(missing);
      setError('請填寫所有必填欄位');
      setPhoneError('');
      setTimeout(() => setErrorFields([]), 500);
      return;
    }

    if (!PHONE_REGEX.test(form.phone.replace(/\s/g, ''))) {
      setErrorFields(['phone']);
      setPhoneError('請輸入有效的電話號碼（例：0912345678 或 02-23456789）');
      setError('');
      setTimeout(() => setErrorFields([]), 500);
      return;
    }

    setPhoneError('');
    setErrorFields([]);
    setLoading(true);
    setError('');

    // 把產品名稱加到描述中
    const desc = productName
      ? `【詢問商品】${productName}\n${form.description}`
      : form.description;

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, description: desc }),
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

  const handleClose = () => {
    setSuccess(false);
    setError('');
    setErrorFields([]);
    setPhoneError('');
    onClose();
  };

  if (!isOpen) return null;

  const inputClass = (field: string) =>
    `w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#AA7452] focus:border-transparent bg-white text-sm ${
      errorFields.includes(field)
        ? 'border-[#FF5C5C] animate-shake-x'
        : 'border-gray-200'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
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

        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-2xl border-b px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-bold" style={{ color: '#4A4947' }}>建立訂單諮詢</h2>
            {productName && (
              <p className="text-sm text-gray-500 mt-0.5">商品：{productName}</p>
            )}
          </div>
          <button onClick={handleClose} className="p-2 rounded-lg hover:bg-gray-100 transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <CheckCircle size={48} className="mx-auto mb-4" style={{ color: '#AA7452' }} />
              <h3 className="text-xl font-bold mb-2" style={{ color: '#4A4947' }}>感謝您的諮詢！</h3>
              <p className="text-gray-500 mb-6">我們將在 24 小時內與您聯繫</p>
              <button
                onClick={handleClose}
                className="px-6 py-2.5 text-white rounded-lg font-medium hover:opacity-90 transition"
                style={{ backgroundColor: '#AA7452' }}
              >
                關閉
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">姓名 *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                    className={inputClass('name')}
                    placeholder="您的姓名"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">電話 *</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({...form, phone: e.target.value})}
                    className={inputClass('phone')}
                    placeholder="您的電話"
                  />
                  {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({...form, email: e.target.value})}
                    className={inputClass('email')}
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">服務類型 *</label>
                  <select
                    value={form.service_type}
                    onChange={(e) => setForm({...form, service_type: e.target.value})}
                    className={inputClass('service_type')}
                  >
                    <option value="">請選擇</option>
                    {SERVICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">活動起日 *</label>
                  <input
                    type="date"
                    value={form.event_date}
                    onChange={(e) => setForm({...form, event_date: e.target.value})}
                    className={inputClass('event_date')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">活動迄日 *</label>
                  <input
                    type="date"
                    value={form.event_end_date}
                    onChange={(e) => setForm({...form, event_end_date: e.target.value})}
                    className={inputClass('event_end_date')}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">需求說明</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#AA7452] focus:border-transparent bg-white text-sm"
                  placeholder="請簡述您的活動需求..."
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-white font-bold rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ backgroundColor: '#AA7452' }}
              >
                <Send size={18} />
                {loading ? '提交中...' : '送出諮詢'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
