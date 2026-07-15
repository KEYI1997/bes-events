'use client';
import { useEffect, useRef, ReactNode } from 'react';

export default function AnimateOnScroll({
  children,
  delay = 0,
  direction = 'up'
}: {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'left' | 'right';
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => el.classList.add('is-visible'), delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  const className = direction === 'left'
    ? 'animate-from-left'
    : direction === 'right'
    ? 'animate-from-right'
    : 'animate-on-scroll';

  return <div ref={ref} className={className}>{children}</div>;
}
