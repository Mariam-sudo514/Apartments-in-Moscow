import localFont from 'next/font/local';
import type {Metadata} from 'next';
import type {ReactNode} from 'react';
import {NextIntlClientProvider} from 'next-intl';

import {notFound} from 'next/navigation';

import {Footer} from '@/components/Footer';
import {Header} from '@/components/Header';
import {routing} from '@/i18n/routing';
import {isLocale} from '@/types/locale';

import '../globals.css';

const montserrat = localFont({
  src: [
    {
      path: '../../fonts/Montserrat-VariableFont_wght.ttf',
      style: 'normal',
      weight: '100 900'
    },
    {
      path: '../../fonts/Montserrat-Italic-VariableFont_wght.ttf',
      style: 'italic',
      weight: '100 900'
    }
  ],
  display: 'swap',
  variable: '--font-montserrat'
});

const roboto = localFont({
  src: [
    {
      path: '../../fonts/Roboto-VariableFont_wdth,wght.ttf',
      style: 'normal',
      weight: '100 900'
    },
    {
      path: '../../fonts/Roboto-Italic-VariableFont_wdth,wght.ttf',
      style: 'italic',
      weight: '100 900'
    }
  ],
  display: 'swap',
  variable: '--font-roboto'
});

export const metadata: Metadata = {
  title: 'Moscow Apartments',
  icons: {
    icon: [
      {url: '/icons/favicon.svg', type: 'image/svg+xml'},
      {
        url: '/icons/favicon-96x96.png',
        sizes: '96x96',
        type: 'image/png'
      },
      {url: '/icons/favicon.ico'}
    ],
    apple: '/icons/apple-touch-icon.png'
  },
  manifest: '/icons/site.webmanifest'
};

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
      <body className={`${montserrat.variable} ${roboto.variable}`}>
        <NextIntlClientProvider locale={locale}>
          <Header />
          <main>{children}</main>
          <Footer locale={locale} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
