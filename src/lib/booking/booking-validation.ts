import {
  compareCalendarDates,
  getNights
} from '@/lib/reservation/calendar';
import type {
  BookingDraftResult,
  BookingFieldErrors,
  BookingValidationInput
} from '@/types/booking';

import {createBookingRequestDraft} from './booking-payload';

const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001F\u007F]/u;
const PHONE_CHARACTER_PATTERN = /^[+0-9() -]+$/u;

function countCharacters(value: string): number {
  return Array.from(value).length;
}

export function getPhoneDigits(value: string): string {
  return value.replace(/\D/gu, '');
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
  const guestPhone = input.guestPhone.trim();
  const guestNameLength = countCharacters(guestName);
  const phoneDigits = getPhoneDigits(guestPhone);
  const plusCount = (guestPhone.match(/\+/gu) ?? []).length;
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

  if (guestPhone.length === 0) {
    errors.guestPhone = input.labels.guestPhoneRequired;
  } else if (
    !PHONE_CHARACTER_PATTERN.test(guestPhone) ||
    plusCount > 1 ||
    (plusCount === 1 && !guestPhone.startsWith('+'))
  ) {
    errors.guestPhone = input.labels.guestPhoneFormat;
  } else if (phoneDigits.length < 7) {
    errors.guestPhone = input.labels.guestPhoneTooShort;
  } else if (phoneDigits.length > 15) {
    errors.guestPhone = input.labels.guestPhoneTooLong;
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
    guestPhone,
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
        source: input.source
      }),
      ok: true
    };
  }

  return {
    draft: createBookingRequestDraft({...base, source: input.source}),
    ok: true
  };
}
