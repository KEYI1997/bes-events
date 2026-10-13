'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

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
  const isLineOrder = pathname.startsWith('/line/order');
  const isHome = pathname === '/';

  if (isAdmin || isLineOrder) {
    return <>{children}</>;
  }

  return (
    <>
      <div>
        {!isHome && header}
        <main className="min-h-screen">{children}</main>
        {!isHome && footer}
        {!isHome && floatingButtons}
      </div>
    </>
  );
}
