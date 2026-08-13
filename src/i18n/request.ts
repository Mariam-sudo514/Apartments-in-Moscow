import {getRequestConfig} from 'next-intl/server';

import {defaultLocale, isLocale} from '@/types/locale';

export default getRequestConfig(async ({requestLocale}) => {
  const requestedLocale = await requestLocale;
  const locale = isLocale(requestedLocale) ? requestedLocale : defaultLocale;
  const messages = (await import(`../messages/${locale}.json`)).default;

  return {
    locale,
    messages
  };
});
