'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const SESSION_KEY = 'bes-page-view-session';

function sessionId() {
  const existing = sessionStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const next = crypto.randomUUID();
  sessionStorage.setItem(SESSION_KEY, next);
  return next;
}

export default function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin') || pathname.startsWith('/api')) return;
    void fetch('/api/page-views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname, sessionId: sessionId() }),
      keepalive: true,
    });
  }, [pathname]);

  return null;
}
