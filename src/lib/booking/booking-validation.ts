import {getNights} from '@/lib/reservation/calendar';
import type {
  BookingDraftResult,
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

export function validateBooking(input: BookingValidationInput): BookingDraftResult {
  const errors: {
    guestName?: string;
    guestPhone?: string;
    reservation?: string;
  } = {};
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

  if (
    input.apartmentSlug === null ||
    input.checkIn === null ||
    input.checkOut === null ||
    nights === null ||
    nights <= 0 ||
    input.adults < 1 ||
    input.adults > 10 ||
    input.children < 0 ||
    input.children > 10
  ) {
    errors.reservation = input.labels.reservationIncomplete;
  }

  if (Object.keys(errors).length > 0) {
    return {errors, ok: false};
  }

  return {
    draft: createBookingRequestDraft({
      adults: input.adults,
      apartmentSlug: input.apartmentSlug as string,
      checkIn: input.checkIn as `${number}-${number}-${number}`,
      checkOut: input.checkOut as `${number}-${number}-${number}`,
      children: input.children,
      guestName,
      guestPhone,
      locale: input.locale
    }),
    ok: true
  };
}
