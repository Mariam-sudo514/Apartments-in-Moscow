import 'server-only';

import {getApartmentBySlug, getLocalizedApartment} from '@/data/apartments';
import type {BookingApiQuote, ValidatedBookingRequest} from '@/types/booking-api';

import {getBookingMailConfig} from './mail-config';
import {createBookingMailTransport} from './mail-transport';

export type BookingDeliveryResult =
  | {readonly kind: 'accepted'}
  | {readonly kind: 'delivery_failed'}
  | {readonly kind: 'not_configured'}
  | {readonly kind: 'server_misconfigured'};

type BookingEmailContent = {
  readonly subject: string;
  readonly text: string;
};

function getEmailContent(
  request: ValidatedBookingRequest,
  quote: BookingApiQuote
): BookingEmailContent | null {
  const apartment = getApartmentBySlug(request.apartmentSlug);

  if (apartment === undefined) {
    return null;
  }

  const localized = getLocalizedApartment(apartment, request.locale);
  const isRussian = request.locale === 'ru';
  const numberFormat = new Intl.NumberFormat(isRussian ? 'ru-RU' : 'en-US', {
    currency: 'RUB',
    maximumFractionDigits: 0,
    style: 'currency'
  });
  const labels = isRussian
    ? {
        adults: 'Взрослые',
        address: 'Адрес',
        apartment: 'Квартира',
        checkIn: 'Заезд',
        checkOut: 'Выезд',
        children: 'Дети',
        locale: 'Локаль',
        nights: 'Ночей',
        phone: 'Телефон',
        priceMode: 'Режим цены',
        quote: 'Предварительная стоимость',
        slug: 'Slug',
        source: 'Источник',
        guestName: 'Имя гостя',
        subject: 'Новая заявка на бронирование'
      }
    : {
        adults: 'Adults',
        address: 'Address',
        apartment: 'Apartment',
        checkIn: 'Check-in',
        checkOut: 'Check-out',
        children: 'Children',
        locale: 'Locale',
        nights: 'Nights',
        phone: 'Phone',
        priceMode: 'Price mode',
        quote: 'Preliminary quote',
        slug: 'Slug',
        source: 'Source',
        guestName: 'Guest name',
        subject: 'New booking request'
      };
  const priceMode = quote.priceMode === 'from'
    ? (isRussian ? 'от' : 'from')
    : (isRussian ? 'точная' : 'exact');

  const lines = [
    `${labels.source}: ${request.source}`,
    `${labels.locale}: ${request.locale}`,
    `${labels.guestName}: ${request.guestName}`,
    `${labels.phone}: ${request.guestPhone}`,
    '',
    `${labels.apartment}: ${localized.detail.title}`,
    `${labels.address}: ${localized.detail.address}`,
    `${labels.slug}: ${apartment.slug}`,
    `${labels.checkIn}: ${request.checkIn}`,
    `${labels.checkOut}: ${request.checkOut}`,
    `${labels.nights}: ${quote.nights}`,
    `${labels.priceMode}: ${priceMode}`,
    `${labels.quote}: ${numberFormat.format(quote.amount)}`
  ];

  if (request.source === 'reservation') {
    lines.splice(3, 0, `${labels.adults}: ${request.adults}`, `${labels.children}: ${request.children}`);
  }

  return {subject: labels.subject, text: lines.join('\n')};
}

export async function deliverBookingEmail(
  request: ValidatedBookingRequest,
  quote: BookingApiQuote
): Promise<BookingDeliveryResult> {
  const configResult = getBookingMailConfig();

  if (!configResult.ok) {
    return {kind: 'server_misconfigured'};
  }

  if (configResult.config.mode === 'disabled') {
    return {kind: 'not_configured'};
  }

  const content = getEmailContent(request, quote);

  if (content === null) {
    return {kind: 'delivery_failed'};
  }

  const transport = createBookingMailTransport(configResult.config);

  try {
    await transport.sendMail({
      from: configResult.config.from,
      subject: content.subject,
      text: content.text,
      to: configResult.config.to
    });
    return {kind: 'accepted'};
  } catch {
    return {kind: 'delivery_failed'};
  } finally {
    transport.close();
  }
}
