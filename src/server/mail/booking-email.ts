import 'server-only';

import {getApartmentBySlug, getLocalizedApartment} from '@/data/apartments';
import type {HomeBookingRequestDraft, ReservationBookingRequestDraft} from '@/types/booking';
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

function formatEmailDate(value: string, locale: 'ru' | 'en'): string {
  return new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'UTC',
    year: 'numeric'
  }).format(new Date(`${value}T00:00:00Z`));
}

function getReservationEmailContent(
  request: ReservationBookingRequestDraft,
  address: string,
  locale: 'ru' | 'en'
): BookingEmailContent {
  const isRussian = locale === 'ru';
  const labels = isRussian
    ? {
      address: 'Адрес квартиры',
      adults: 'Количество гостей',
      checkIn: 'Дата заезда',
      checkOut: 'Дата выезда',
      children: 'Количество детей',
      guestEmail: 'Email гостя',
      guestName: 'Имя гостя',
      preferredContactMethod: 'Предпочтительный способ связи',
      telegramUsername: 'Имя пользователя Telegram',
      whatsappNumber: 'Номер WhatsApp',
      subject: 'Новая заявка на бронирование'
      }
    : {
      address: 'Apartment address',
      adults: 'Number of guests',
      checkIn: 'Check-in date',
      checkOut: 'Check-out date',
      children: 'Number of children',
      guestEmail: 'Guest email',
      guestName: 'Guest name',
      preferredContactMethod: 'Preferred contact method',
      telegramUsername: 'Telegram username',
      whatsappNumber: 'WhatsApp number',
      subject: 'New booking request'
      };

  const contactMethod = request.preferredContactMethod === 'email'
    ? 'Email'
    : request.preferredContactMethod === 'whatsapp'
      ? 'WhatsApp'
      : 'Telegram';

  const lines = [
    `${labels.guestName}: ${request.guestName}`,
    `${labels.adults}: ${request.adults}`,
    `${labels.children}: ${request.children}`,
    `${labels.guestEmail}: ${request.guestEmail}`,
    `${labels.preferredContactMethod}: ${contactMethod}`,
    ...(request.preferredContactMethod === 'whatsapp'
      ? [`${labels.whatsappNumber}: ${request.preferredContactValue ?? ''}`]
      : request.preferredContactMethod === 'telegram'
        ? [`${labels.telegramUsername}: ${request.preferredContactValue ?? ''}`]
        : []),
    `${labels.address}: ${address}`,
    `${labels.checkIn}: ${formatEmailDate(request.checkIn, locale)}`,
    `${labels.checkOut}: ${formatEmailDate(request.checkOut, locale)}`
  ];

  return {subject: labels.subject, text: lines.join('\n')};
}

function getHomeEmailContent(
  request: HomeBookingRequestDraft,
  address: string,
  locale: 'ru' | 'en'
): BookingEmailContent {
  const isRussian = locale === 'ru';
  const labels = isRussian
    ? {
        address: 'Адрес квартиры',
        checkIn: 'Дата заезда',
        checkOut: 'Дата выезда',
        guestEmail: 'Email гостя',
        guestName: 'Имя гостя',
        preferredContactMethod: 'Предпочтительный способ связи',
        telegramUsername: 'Имя пользователя Telegram',
        whatsappNumber: 'Номер WhatsApp',
        subject: 'Новая заявка на бронирование'
      }
    : {
        address: 'Apartment address',
        checkIn: 'Check-in date',
        checkOut: 'Check-out date',
        guestEmail: 'Guest email',
        guestName: 'Guest name',
        preferredContactMethod: 'Preferred contact method',
        telegramUsername: 'Telegram username',
        whatsappNumber: 'WhatsApp number',
        subject: 'New booking request'
      };

  const contactMethod = request.preferredContactMethod === 'email'
    ? 'Email'
    : request.preferredContactMethod === 'whatsapp'
      ? 'WhatsApp'
      : 'Telegram';

  const lines = [
    `${labels.guestName}: ${request.guestName}`,
    `${labels.guestEmail}: ${request.guestEmail}`,
    `${labels.preferredContactMethod}: ${contactMethod}`,
    ...(request.preferredContactMethod === 'whatsapp'
      ? [`${labels.whatsappNumber}: ${request.preferredContactValue ?? ''}`]
      : request.preferredContactMethod === 'telegram'
        ? [`${labels.telegramUsername}: ${request.preferredContactValue ?? ''}`]
        : []),
    `${labels.address}: ${address}`,
    `${labels.checkIn}: ${formatEmailDate(request.checkIn, locale)}`,
    `${labels.checkOut}: ${formatEmailDate(request.checkOut, locale)}`
  ];

  return {subject: labels.subject, text: lines.join('\n')};
}

function getEmailContent(
  request: ValidatedBookingRequest,
  quote: BookingApiQuote
): BookingEmailContent | null {
  void quote;

  const apartment = getApartmentBySlug(request.apartmentSlug);

  if (apartment === undefined) {
    return null;
  }

  const localized = getLocalizedApartment(apartment, request.locale);

  if (request.source === 'reservation') {
    return getReservationEmailContent(request, localized.detail.address, request.locale);
  }

  return getHomeEmailContent(request, localized.detail.address, request.locale);
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
