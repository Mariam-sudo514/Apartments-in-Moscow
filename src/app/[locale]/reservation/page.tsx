import {getTranslations} from 'next-intl/server';

export default async function ReservationPage() {
  const t = await getTranslations('pages');

  return <h1>{t('reservation')}</h1>;
}
