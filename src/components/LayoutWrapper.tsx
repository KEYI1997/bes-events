'use client';

import { usePathname } from 'next/navigation';
import { ReactNode, useState, useEffect } from 'react';
import IntroAnimation, { shouldPlayIntro } from './IntroAnimation';

export function LayoutWrapper({
  children,
  header,
  footer,
  floatingButtons,
}: {
  children: ReactNode;
  header: ReactNode;
  footer: ReactNode;
  floatingButtons: ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  const [showIntro, setShowIntro] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (pathname === '/' && shouldPlayIntro()) {
      setShowIntro(true);
      setContentVisible(false);
    } else {
      setContentVisible(true);
    }
    setChecked(true);
  }, [pathname]);

  if (isAdmin) {
    return <>{children}</>;
  }

  // Before JS hydration check, render nothing visible (prevents flash)
  // After check, if no intro needed, show content immediately
  return (
    <>
      <div
        style={{
          visibility: contentVisible ? 'visible' : 'hidden',
          opacity: contentVisible ? 1 : 0,
        }}
      >
        {header}
        <main className="min-h-screen">{children}</main>
        {footer}
        {floatingButtons}
      </div>
      {showIntro && (
        <IntroAnimation
          onReveal={() => setContentVisible(true)}
          onComplete={() => setShowIntro(false)}
        />
      )}
      {/* Block flash: full black screen until JS determines what to do */}
      {!checked && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: '#000',
            zIndex: 99998,
          }}
        />
      )}
    </>
  );
}
