import { MessageCircle } from 'lucide-react';
import { LINE_URL } from '@/lib/siteLinks';

export default function OfficialLineQrCard() {
  return (
    <section aria-label="加入官方 LINE 查詢訂單" className="mt-7 border-t border-primary/10 pt-6">
      <div className="mx-auto flex max-w-sm flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
        <img
          src="/images/line-official-qrcode.svg"
          alt="境曜官方 LINE QR Code，掃描後可加入官方 LINE"
          width={116}
          height={116}
          className="h-[116px] w-[116px] shrink-0 rounded-xl border border-primary/10 bg-white p-1.5"
        />
        <div className="min-w-0 pt-1">
          <p className="text-base font-bold text-primary">加入官方 LINE，掌握訂單資訊</p>
          <p className="mt-1.5 text-sm leading-6 text-primary/65">掃描 QR Code 加入官方 LINE，可更快確認訂單內容、檔期與後續安排。</p>
          <a
            href={LINE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#06C755] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#05ae4d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#06C755]"
          >
            <MessageCircle size={16} aria-hidden="true" />
            開啟官方 LINE
          </a>
        </div>
      </div>
    </section>
  );
}
