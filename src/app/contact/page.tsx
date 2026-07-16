import { Metadata } from 'next';
import { Phone, Mail, MessageCircle, MapPin, Clock } from 'lucide-react';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import ContactFormInline from '@/components/ContactFormInline';

export const metadata: Metadata = {
  title: '聯絡我們 | 境曜有限公司 BES Events',
  description: '聯繫境曜有限公司，取得活動企劃、啟動儀式、燈光音響等服務的專業諮詢與報價。',
};

const CONTACT_INFO = [
  {
    icon: Phone,
    label: '電話',
    value: '0912-727-596',
    href: 'tel:0912727596',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'service@bes-events.com',
    href: 'mailto:service@bes-events.com',
  },
  {
    icon: MessageCircle,
    label: 'LINE',
    value: '@bes-events',
    href: 'https://line.me/ti/p/@bes-events',
  },
  {
    icon: MapPin,
    label: '地址',
    value: '新北市三重區',
    href: null,
  },
  {
    icon: Clock,
    label: '服務時間',
    value: '週一至週五 09:00-18:00',
    href: null,
  },
];

export default function ContactPage() {
  return (
    <main className="bg-bg min-h-screen">
      {/* Hero */}
      <section className="relative bg-primary h-[40vh] flex items-center justify-center pt-32">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/90 to-primary" />
        <div className="relative z-10 text-center px-4">
          <AnimateOnScroll>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              聯絡我們
            </h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              有任何活動需求，歡迎與我們聯繫
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Contact Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Left: Contact Info */}
          <div className="lg:col-span-2">
            <AnimateOnScroll direction="left">
              <h2 className="text-2xl font-bold text-primary mb-8">
                聯絡資訊
              </h2>
              <div className="space-y-6">
                {CONTACT_INFO.map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-cta/10 rounded-xl flex items-center justify-center shrink-0">
                      <Icon size={22} className="text-cta" />
                    </div>
                    <div>
                      <p className="text-sm text-primary/60 mb-1">{label}</p>
                      {href ? (
                        <a
                          href={href}
                          className="text-primary font-medium hover:text-cta transition-colors"
                          target={href.startsWith('http') ? '_blank' : undefined}
                          rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        >
                          {value}
                        </a>
                      ) : (
                        <p className="text-primary font-medium">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Note */}
              <div className="mt-10 p-6 bg-cta/5 rounded-2xl border border-cta/10">
                <h3 className="font-bold text-primary mb-2">快速回覆</h3>
                <p className="text-primary/70 text-sm">
                  我們將在收到您的諮詢後 24 小時內回覆。急件請直接來電或加 LINE 聯繫。
                </p>
              </div>
            </AnimateOnScroll>
          </div>

          {/* Right: Contact Form */}
          <div className="lg:col-span-3">
            <AnimateOnScroll direction="right">
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-primary mb-6">
                  填寫諮詢表單
                </h2>
                <ContactFormInline />
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>
    </main>
  );
}
