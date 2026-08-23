'use client';

import { useEffect, useRef, useState } from 'react';

type ScrollRevealSectionProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Creates a continuous, scroll-driven page reveal without locking the scroll
 * position or using scroll snap. The section starts below the viewport and
 * advances upward as its reveal window moves through the viewport.
 */
export default function ScrollRevealSection({ children, className = '' }: ScrollRevealSectionProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = () => setReducedMotion(media.matches);
    updateMotionPreference();
    media.addEventListener('change', updateMotionPreference);

    return () => media.removeEventListener('change', updateMotionPreference);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    const shell = shellRef.current;
    if (!shell) return;

    let frame = 0;
    const updateProgress = () => {
      frame = 0;
      const viewportHeight = window.innerHeight || 1;
      const progress = Math.min(1, Math.max(0, -shell.getBoundingClientRect().top / viewportHeight));
      shell.style.setProperty('--scroll-reveal-progress', progress.toString());
    };
    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);

    return () => {
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [reducedMotion]);

  return (
    <div
      ref={shellRef}
      className={`scroll-reveal-shell ${reducedMotion ? 'scroll-reveal-reduced' : ''}`}
    >
      <section className={`scroll-reveal-panel ${className}`}>{children}</section>
    </div>
  );
}
