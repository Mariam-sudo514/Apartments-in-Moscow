import {getTranslations} from 'next-intl/server';

export default async function ContactsPage() {
  const t = await getTranslations('pages');

  return <main><h1>{t('contacts')}</h1></main>;
}
