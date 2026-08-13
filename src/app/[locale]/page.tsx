import {getTranslations} from 'next-intl/server';

export default async function HomePage() {
  const t = await getTranslations('pages');

  return <h1>{t('home')}</h1>;
}
