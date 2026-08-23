import localFont from 'next/font/local';
import type {Metadata} from 'next';
import type {ReactNode} from 'react';
import {NextIntlClientProvider} from 'next-intl';
import {getTranslations} from 'next-intl/server';

import {notFound} from 'next/navigation';

import {Footer} from '@/components/Footer';
import {Header} from '@/components/Header';
import {SkipLink} from '@/components/SkipLink';
import {getSiteUrl} from '@/config/site';
import {routing} from '@/i18n/routing';
import {isLocale} from '@/types/locale';

import '@/styles/reset.css';
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
  metadataBase: getSiteUrl(),
  title: 'Moscow Apartments',
  icons: {
    icon: [
      {url: '/icons/favicon.svg', type: 'image/svg+xml'},
      {
        url: '/icons/favicon-96x96.png',
        sizes: '96x96',
        type: 'image/png'
      },
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

  const t = await getTranslations();

  return (
    <html lang={locale}>
      <body className={`${montserrat.variable} ${roboto.variable}`}>
        <NextIntlClientProvider locale={locale}>
          <SkipLink label={t('accessibility.skipToContent')} />
          <Header />
          <main id="main-content" tabIndex={-1}>{children}</main>
          <Footer locale={locale} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
