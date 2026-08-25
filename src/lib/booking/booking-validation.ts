import {
  compareCalendarDates,
  getNights
} from '@/lib/reservation/calendar';
import type {
  BookingDraftResult,
  BookingFieldErrors,
  BookingValidationInput,
  PreferredContactMethod
} from '@/types/booking';

import {createBookingRequestDraft} from './booking-payload';

const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001F\u007F]/u;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;
const WHATSAPP_CHARACTER_PATTERN = /^[+0-9() -]+$/u;
const TELEGRAM_PATTERN = /^@[A-Za-z0-9_]{5,32}$/u;

function countCharacters(value: string): number {
  return Array.from(value).length;
}

function normalizeWhatsApp(value: string): string | null {
  const trimmed = value.trim();
  const normalized = trimmed.replace(/[ ()-]/gu, '');

  return WHATSAPP_CHARACTER_PATTERN.test(trimmed) && /^\+[0-9]{7,15}$/u.test(normalized)
    ? normalized
    : null;
}

export function validateBooking(
  input: BookingValidationInput & {readonly source: 'home'}
): BookingDraftResult<'home'>;
export function validateBooking(
  input: BookingValidationInput & {readonly source: 'reservation'}
): BookingDraftResult<'reservation'>;
export function validateBooking(input: BookingValidationInput): BookingDraftResult {
  const errors: Partial<Record<keyof BookingFieldErrors, string>> = {};
  const guestName = input.guestName.trim();
  const guestNameLength = countCharacters(guestName);
  const nights = getNights(input.checkIn, input.checkOut);

  if (guestName.length === 0) {
    errors.guestName = input.labels.guestNameRequired;
  } else if (CONTROL_CHARACTER_PATTERN.test(guestName)) {
    errors.guestName = input.labels.guestNameControlCharacters;
  } else if (guestNameLength < 2) {
    errors.guestName = input.labels.guestNameTooShort;
  } else if (guestNameLength > 100) {
    errors.guestName = input.labels.guestNameTooLong;
  }

  const guestEmail = input.guestEmail.trim();
  let preferredContactMethod: PreferredContactMethod | undefined;
  let preferredContactValue: string | null = null;

  const contactValue = input.preferredContactValue.trim();

  if (guestEmail.length === 0) {
    errors.guestEmail = input.labels.guestEmailRequired;
  } else if (
    guestEmail.length > 254 ||
    CONTROL_CHARACTER_PATTERN.test(guestEmail) ||
    !EMAIL_PATTERN.test(guestEmail)
  ) {
    errors.guestEmail = input.labels.guestEmailFormat;
  }

  if (input.preferredContactMethod === '') {
    errors.preferredContactMethod = input.labels.preferredContactMethodRequired;
  } else {
    preferredContactMethod = input.preferredContactMethod;

    if (preferredContactMethod === 'email') {
      if (contactValue.length > 0) {
        errors.preferredContactValue = input.labels.preferredContactValueFormat;
      }
    } else if (preferredContactMethod === 'whatsapp') {
      if (contactValue.length === 0) {
        errors.preferredContactValue = input.labels.whatsappNumberRequired;
      } else {
        preferredContactValue = normalizeWhatsApp(contactValue);
        if (preferredContactValue === null) {
          errors.preferredContactValue = input.labels.whatsappNumberFormat;
        }
      }
    } else if (contactValue.length === 0) {
      errors.preferredContactValue = input.labels.telegramUsernameRequired;
    } else if (!TELEGRAM_PATTERN.test(contactValue)) {
      errors.preferredContactValue = input.labels.telegramUsernameFormat;
    } else {
      preferredContactValue = contactValue;
    }
  }

  if (input.todayIso === null) {
    errors.today = input.labels.todayInitializing;
  }

  if (input.checkIn === null) {
    errors.checkIn = input.labels.checkInRequired;
  } else if (
    input.todayIso !== null &&
    compareCalendarDates(input.checkIn, input.todayIso) < 0
  ) {
    errors.checkIn = input.labels.checkInPast;
  }

  if (input.checkOut === null) {
    errors.checkOut = input.labels.checkOutRequired;
  } else if (input.checkIn !== null && (nights === null || nights <= 0)) {
    errors.checkOut = input.labels.checkOutAfterCheckIn;
  }

  if (input.apartmentSlug === null) {
    errors.apartment = input.labels.apartmentRequired;
  }

  if (input.source === 'reservation' && (
    input.apartmentSlug === null ||
    input.checkIn === null ||
    input.checkOut === null ||
    nights === null ||
    nights <= 0 ||
    input.adults === undefined ||
    input.adults < 1 ||
    input.adults > 10 ||
    input.children === undefined ||
    input.children < 0 ||
    input.children > 10
  )) {
    errors.reservation = input.labels.reservationIncomplete;
  }

  if (Object.keys(errors).length > 0) {
    return {errors, ok: false};
  }

  if (
    input.apartmentSlug === null ||
    input.checkIn === null ||
    input.checkOut === null
  ) {
    return {errors: {reservation: input.labels.reservationIncomplete}, ok: false};
  }

  const base = {
    apartmentSlug: input.apartmentSlug,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    guestName,
    locale: input.locale
  };

  if (input.source === 'reservation') {
    if (input.adults === undefined || input.children === undefined) {
      return {errors: {reservation: input.labels.reservationIncomplete}, ok: false};
    }

    return {
      draft: createBookingRequestDraft({
        ...base,
        adults: input.adults,
        children: input.children,
        guestEmail,
        preferredContactMethod: preferredContactMethod as PreferredContactMethod,
        preferredContactValue,
        source: input.source
      }),
      ok: true
    };
  }

  if (guestEmail === undefined || preferredContactMethod === undefined) {
    return {errors: {reservation: input.labels.reservationIncomplete}, ok: false};
  }

  return {
    draft: createBookingRequestDraft({
      ...base,
      guestEmail,
      preferredContactMethod,
      preferredContactValue,
      source: input.source
    }),
    ok: true
  };
}
