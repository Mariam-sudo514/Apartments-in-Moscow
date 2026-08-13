import {getTranslations} from 'next-intl/server';

export default async function ContactsPage() {
  const t = await getTranslations('pages');

  return <h1>{t('contacts')}</h1>;
}
