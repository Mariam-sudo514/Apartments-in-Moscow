import {getTranslations} from 'next-intl/server';

export default async function ApartmentsPage() {
  const t = await getTranslations('pages');

  return <h1>{t('apartments')}</h1>;
}
