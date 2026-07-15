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

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      {header}
      <main className="min-h-screen">{children}</main>
      {footer}
      {floatingButtons}
    </>
  );
}
