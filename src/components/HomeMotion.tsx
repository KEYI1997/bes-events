'use client';

import { CSSProperties, ReactNode, useEffect, useRef, useState } from 'react';

export function HomeMotionProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setReady(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <div className={ready ? 'home-motion-ready' : undefined}>
      {children}
      <style jsx global>{`
        .home-reveal { opacity: 1; transform: none; }
        .home-hero-line { display: block; }
        @media (prefers-reduced-motion: no-preference) {
          .home-motion-ready .home-hero-line {
            animation: home-mask-rise 780ms cubic-bezier(.16, 1, .3, 1) both;
          }
          .home-motion-ready .home-hero-line:nth-child(2) { animation-delay: 110ms; }
          .home-motion-ready .home-reveal { opacity: 0; transform: translateY(24px); }
          .home-motion-ready .home-reveal.home-reveal--visible {
            animation: home-reveal-up 620ms cubic-bezier(.16, 1, .3, 1) var(--home-delay, 0ms) both;
          }
          .home-motion-ready .home-drift { animation: home-drift 12s ease-in-out infinite alternate; }
        }
        @keyframes home-mask-rise {
          from { clip-path: inset(100% 0 0 0); transform: translateY(0.45em); }
          to { clip-path: inset(0 0 0 0); transform: translateY(0); }
        }
        @keyframes home-reveal-up {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes home-drift {
          from { transform: scale(1.01); }
          to { transform: scale(1.07) translate3d(-1.5%, -1%, 0); }
        }
      `}</style>
    </div>
  );
}

export function HomeReveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.12 });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`home-reveal${visible ? ' home-reveal--visible' : ''} ${className}`}
      style={{ '--home-delay': `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}
