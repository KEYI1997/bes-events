'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const ACTIONABLE_SELECTOR = [
  'a[href]',
  'button:not(:disabled)',
  '[role="button"]:not([aria-disabled="true"])',
  '[class*="cursor-pointer"]',
  'input[type="button"]:not(:disabled)',
  'input[type="submit"]:not(:disabled)',
  'input[type="reset"]:not(:disabled)',
  'summary',
].join(',');

export default function SiteCursor() {
  const pathname = usePathname();
  const cursorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (pathname?.startsWith('/admin')) return;

    const query = window.matchMedia('(hover: hover) and (pointer: fine)');
    if (!query.matches) return;

    document.documentElement.classList.add('site-cursor-enabled');

    const isActionable = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return false;
      if (target.closest(ACTIONABLE_SELECTOR)) return true;

      let element: Element | null = target;
      while (element) {
        if (window.getComputedStyle(element).cursor === 'pointer') return true;
        element = element.parentElement;
      }
      return false;
    };

    const updateActiveState = (active: boolean) => {
      const cursor = cursorRef.current;
      if (!cursor) return;
      cursor.classList.toggle('site-cursor--visible', active);
      cursor.classList.toggle('site-cursor--active', active);
      document.documentElement.classList.toggle('site-cursor-active', active);
    };

    const handleMove = (event: MouseEvent) => {
      const active = isActionable(event.target);
      const cursor = cursorRef.current;
      if (!cursor) return;
      cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`;
      updateActiveState(active);
    };
    const handleLeave = () => updateActiveState(false);

    window.addEventListener('mousemove', handleMove, { passive: true });
    document.addEventListener('mouseleave', handleLeave);

    return () => {
      document.documentElement.classList.remove('site-cursor-enabled');
      document.documentElement.classList.remove('site-cursor-active');
      window.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseleave', handleLeave);
    };
  }, [pathname]);

  return (
    <span
      aria-hidden="true"
      ref={cursorRef}
      className="site-cursor"
    >
      <span className="site-cursor__pulse" />
      <span className="site-cursor__ring" />
      <span className="site-cursor__core" />
    </span>
  );
}
