import type {ReactNode} from 'react';

import {notFound} from 'next/navigation';

import {routing} from '@/i18n/routing';
import {isLocale} from '@/types/locale';

import '../globals.css';

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{locale: string}>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export default async function LocaleLayout({
  children,
  params
}: LocaleLayoutProps) {
  const {locale} = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
