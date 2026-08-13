import {getTranslations} from 'next-intl/server';

export default async function ApartmentsPage() {
  const t = await getTranslations('pages');

  return <main><h1>{t('apartments')}</h1></main>;
}
