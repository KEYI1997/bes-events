'use client';

import { useEffect, useState, useId, useMemo, useCallback } from 'react';

// ─── TextMorph — last word fades out same as others, then done ────────────
function mapEaseToCSS(ease: unknown): string {
  if (Array.isArray(ease) && ease.length === 4) {
    return `cubic-bezier(${ease.join(',')})`;
  }
  switch (ease) {
    case 'linear': return 'linear';
    case 'easeIn': return 'ease-in';
    case 'easeOut': return 'ease-out';
    case 'easeInOut': return 'ease-in-out';
    case 'circIn': return 'cubic-bezier(0.6, 0.04, 0.98, 0.335)';
    case 'circOut': return 'cubic-bezier(0.075, 0.82, 0.165, 1)';
    case 'circInOut': return 'cubic-bezier(0.785, 0.135, 0.15, 0.86)';
    case 'backIn': return 'cubic-bezier(0.6, -0.28, 0.735, 0.045)';
    case 'backOut': return 'cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    case 'backInOut': return 'cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    default: return 'ease-in-out';
  }
}

function TextMorphSection({
  words,
  fontSize,
  color,
  morphDuration,
  holdDelay,
  ease,
  onLastFadeOutStart,
  onComplete,
}: {
  words: string[];
  fontSize: number;
  color: string;
  morphDuration: number;
  holdDelay: number;
  ease: string;
  onLastFadeOutStart: () => void;
  onComplete: () => void;
}) {
  const rawId = useId();
  const safeId = rawId.replace(/[:]/g, '');
  const filterId = `tm-thr-${safeId}`;
  const animName = `tm-rot-${safeId}`;
  const easeCSS = mapEaseToCSS(ease);

  const count = words.length;
  const morph = Math.max(0.1, morphDuration);
  const hold = Math.max(0, holdDelay);
  const slot = morph + hold;

  // Every word has same animation: fade-in + hold + fade-out
  const wordAnimationDuration = morph + hold + morph;
  // Total duration = last word's start + its full animation
  const totalDuration = (count - 1) * slot + wordAnimationDuration;
  // When the last word starts fading out (to trigger bg fade)
  const lastFadeOutTime = (count - 1) * slot + morph + hold;

  const morphInPct = ((morph / wordAnimationDuration) * 100).toFixed(4);
  const holdEndPct = (((morph + hold) / wordAnimationDuration) * 100).toFixed(4);

  const keyframes = `
@keyframes ${animName} {
  0% {
    opacity: 0;
    filter: blur(16px);
    transform: translate(-50%, -50%) scale(0.94);
  }
  ${morphInPct}% {
    opacity: 1;
    filter: blur(0);
    transform: translate(-50%, -50%) scale(1);
  }
  ${holdEndPct}% {
    opacity: 1;
    filter: blur(0);
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    opacity: 0;
    filter: blur(16px);
    transform: translate(-50%, -50%) scale(1.06);
  }
}`;

  const longest = useMemo(
    () => words.reduce((acc, w) => (w.length > acc.length ? w : acc), ''),
    [words]
  );

  useEffect(() => {
    // Trigger bg fade when last word starts its fade-out
    const fadeTimer = window.setTimeout(onLastFadeOutStart, lastFadeOutTime * 1000);
    // Complete when entire animation ends
    const completeTimer = window.setTimeout(onComplete, totalDuration * 1000);
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(completeTimer);
    };
  }, [lastFadeOutTime, totalDuration, onLastFadeOutStart, onComplete]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      <style>{keyframes}</style>

      <svg
        style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}
        aria-hidden="true"
      >
        <defs>
          <filter id={filterId}>
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 25 -9"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div
        style={{
          position: 'relative',
          filter: `url(#${filterId})`,
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          fontFamily: '"Noto Sans TC", "Inter", sans-serif',
          fontWeight: 700,
          fontSize,
          lineHeight: '1.2em',
          letterSpacing: '0.02em',
        }}
      >
        <div
          style={{
            position: 'relative',
            display: 'inline-flex',
            justifyContent: 'center',
            alignItems: 'center',
            lineHeight: 1.2,
            minHeight: '1.2em',
          }}
        >
          <span style={{ visibility: 'hidden', whiteSpace: 'nowrap', display: 'inline-block' }}>
            {longest || ' '}
          </span>

          {words.map((word, index) => (
            <span
              key={`${word}-${index}`}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                opacity: 0,
                color,
                whiteSpace: 'nowrap',
                transform: 'translate(-50%, -50%)',
                animation: `${animName} ${wordAnimationDuration}s ${(index * slot).toFixed(3)}s 1 ${easeCSS} forwards`,
                willChange: 'opacity, filter, transform',
              }}
            >
              {word}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main IntroAnimation ──────────────────────────────────────────────────
const STORAGE_KEY = 'bes-intro-played';
const WORDS = ['每一次活動', '都值得被記住'];

const MORPH_DURATION = 0.8;
const HOLD_DELAY = 0.5;
const BG_FADE_DURATION = 800; // matches the morph fade-out time

export default function IntroAnimation({ onReveal, onComplete }: { onReveal: () => void; onComplete: () => void }) {
  const [bgOpacity, setBgOpacity] = useState(1);
  const [done, setDone] = useState(false);
  const [fontSize, setFontSize] = useState(120);

  useEffect(() => {
    const updateSize = () => {
      setFontSize(window.innerWidth < 768 ? 36 : 120);
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleLastFadeOutStart = useCallback(() => {
    // When last word starts blur-out, fade the black background and reveal content
    setBgOpacity(0);
    onReveal();
  }, [onReveal]);

  const handleComplete = useCallback(() => {
    setDone(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // ignore
    }
    onComplete();
  }, [onComplete]);

  if (done) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        pointerEvents: bgOpacity === 0 ? 'none' : 'auto',
      }}
    >
      {/* Black background — fades out in sync with last word's blur-out */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#000',
          opacity: bgOpacity,
          transition: `opacity ${BG_FADE_DURATION}ms ease-out`,
        }}
      />

      {/* TextMorph — same animation for all words */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <TextMorphSection
          words={WORDS}
          fontSize={fontSize}
          color="#FFFFFF"
          morphDuration={MORPH_DURATION}
          holdDelay={HOLD_DELAY}
          ease="easeInOut"
          onLastFadeOutStart={handleLastFadeOutStart}
          onComplete={handleComplete}
        />
      </div>
    </div>
  );
}

export function shouldPlayIntro(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return !sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return false;
  }
}
