import {getTranslations} from 'next-intl/server';

export default async function ReservationPage() {
  const t = await getTranslations('pages');

  return <main><h1>{t('reservation')}</h1></main>;
}
