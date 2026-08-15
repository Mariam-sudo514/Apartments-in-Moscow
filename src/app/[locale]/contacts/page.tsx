import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {notFound} from 'next/navigation';

import {Breadcrumbs} from '@/components/Breadcrumbs';
import {ContactsPageContent} from '@/components/ContactsPageContent';
import {createPageMetadata} from '@/lib/seo/metadata';
import {isLocale, type Locale} from '@/types/locale';

type ContactsPageProps = {
  readonly params: Promise<{locale: string}>;
};

function getRouteLocale(value: string): Locale {
  if (!isLocale(value)) {
    notFound();
  }

  return value;
}

export async function generateMetadata({params}: ContactsPageProps): Promise<Metadata> {
  const {locale: rawLocale} = await params;
  const locale = getRouteLocale(rawLocale);
  const t = await getTranslations({locale, namespace: 'metadata'});

  return createPageMetadata({
    description: t('contactsDescription'),
    locale,
    path: '/contacts',
    title: t('contactsTitle')
  });
}

export default async function ContactsPage({params}: ContactsPageProps) {
  const {locale: rawLocale} = await params;
  const locale = getRouteLocale(rawLocale);
  const t = await getTranslations({locale, namespace: 'contacts'});

  return (
    <>
      <Breadcrumbs
        ariaLabel={t('breadcrumbs.ariaLabel')}
        items={[
          {href: '/', label: t('breadcrumbs.home')},
          {label: t('breadcrumbs.contacts')}
        ]}
      />
      <ContactsPageContent locale={locale} />
    </>
  );
}
