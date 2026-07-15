'use client';
import { useState, useEffect } from 'react';
import { Phone, MessageCircle, ArrowUp } from 'lucide-react';

export default function FloatingButtons() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-all"
          aria-label="回到頂部"
        >
          <ArrowUp size={20} />
        </button>
      )}
      <a
        href="https://line.me/ti/p/~@648ubibg"
        target="_blank"
        rel="noopener noreferrer"
        className="w-12 h-12 bg-[#06C755] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#05b04c] transition-all"
        aria-label="LINE 聯絡"
      >
        <MessageCircle size={20} />
      </a>
      <a
        href="tel:0912727596"
        className="w-12 h-12 bg-cta text-white rounded-full flex items-center justify-center shadow-lg hover:bg-cta-hover transition-all"
        aria-label="撥打電話"
      >
        <Phone size={20} />
      </a>
    </div>
  );
}
