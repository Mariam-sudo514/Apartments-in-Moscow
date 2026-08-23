import {getTranslations} from 'next-intl/server';

import {Container} from '@/components/Container';
import {HomeBookingForm} from '@/components/HomeBookingForm';
import {getAllApartments, getLocalizedApartment} from '@/data/apartments';
import type {HomeBookingLabels, HomeBookingApartmentOption} from '@/types/booking';
import type {Locale} from '@/types/locale';

type HomeBookingSectionProps = {
  readonly locale: Locale;
};

function getHomeApartmentLabel(
  locale: Locale,
  catalogOrder: number,
  address: string,
  type: string
): string {
  if (catalogOrder === 12) {
    return address.replace(/, (?:10Б|10B)$/u, '');
  }

  const legacyBuildingSuffix = catalogOrder === 4 || catalogOrder === 5
    ? locale === 'en' ? ', building 3' : ', корпус 3'
    : '';

  return `${address}${legacyBuildingSuffix}, ${type} кв. ${catalogOrder}`;
}

export async function HomeBookingSection({locale}: HomeBookingSectionProps) {
  const t = await getTranslations({locale, namespace: 'home.booking'});
  const apartments: readonly HomeBookingApartmentOption[] = getAllApartments().map((apartment) => {
    const localized = getLocalizedApartment(apartment, locale);

    return {
      address: localized.catalog.address,
      label: getHomeApartmentLabel(
        locale,
        localized.catalogOrder,
        localized.catalog.address,
        localized.catalog.type
      ),
      slug: localized.slug
    };
  });
  const labels: HomeBookingLabels = {
    apartmentLabel: t('apartmentLabel'),
    apartmentPlaceholder: t('apartmentPlaceholder'),
    apartmentRequired: t('apartmentRequired'),
    bookingDetailsTitle: t('bookingDetailsTitle'),
    checkInLabel: t('checkInLabel'),
    checkInPast: t('checkInPast'),
    checkInRequired: t('checkInRequired'),
    checkOutAfterCheckIn: t('checkOutAfterCheckIn'),
    checkOutLabel: t('checkOutLabel'),
    checkOutRequired: t('checkOutRequired'),
    contactTitle: t('contactTitle'),
    captchaAlt: t('captchaAlt'),
    captchaInvalid: t('captchaInvalid'),
    captchaLabel: t('captchaLabel'),
    captchaLoadFailed: t('captchaLoadFailed'),
    captchaPlaceholder: t('captchaPlaceholder'),
    captchaRefresh: t('captchaRefresh'),
    captchaRequired: t('captchaRequired'),
    description: t('description'),
    errorSummaryTitle: t('errorSummaryTitle'),
    guestNameControlCharacters: t('guestNameControlCharacters'),
    guestNameLabel: t('guestNameLabel'),
    guestNamePlaceholder: t('guestNamePlaceholder'),
    guestNameRequired: t('guestNameRequired'),
    guestNameTooLong: t('guestNameTooLong'),
    guestNameTooShort: t('guestNameTooShort'),
    guestPhoneFormat: t('guestPhoneFormat'),
    guestPhoneLabel: t('guestPhoneLabel'),
    guestPhonePlaceholder: t('guestPhonePlaceholder'),
    guestPhoneRequired: t('guestPhoneRequired'),
    guestPhoneTooLong: t('guestPhoneTooLong'),
    guestPhoneTooShort: t('guestPhoneTooShort'),
    reservationIncomplete: t('reservationIncomplete'),
    sendRequest: t('sendRequest'),
    sending: t('sending'),
    successMessage: t('successMessage'),
    networkFailure: t('networkFailure'),
    invalidResponse: t('invalidResponse'),
    requestInvalid: t('requestInvalid'),
    requestForbidden: t('requestForbidden'),
    requestPayloadTooLarge: t('requestPayloadTooLarge'),
    requestUnsupportedMedia: t('requestUnsupportedMedia'),
    requestValidationFailed: t('requestValidationFailed'),
    requestRateLimited: t('requestRateLimited'),
    serverMisconfigured: t('serverMisconfigured'),
    deliveryNotConfigured: t('deliveryNotConfigured'),
    deliveryFailed: t('deliveryFailed'),
    retry: t('retry'),
    title: t('title'),
    todayInitializing: t('todayInitializing')
  };

  return (
    <Container>
      <HomeBookingForm apartments={apartments} labels={labels} locale={locale} />
    </Container>
  );
}
