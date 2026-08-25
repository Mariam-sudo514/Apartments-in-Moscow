import {describe, expect, it} from 'vitest';

import {validateBooking as validateBookingImplementation} from '@/lib/booking';
import type {
  BookingValidationInput,
  HomeBookingValidationInput,
  HomeBookingLabels,
  ReservationBookingValidationInput
} from '@/types/booking';
import type {IsoDate} from '@/types/reservation';

import {clientLabels} from './test-fixtures';

const homeLabels = clientLabels as unknown as HomeBookingLabels;

const iso = (value: string): IsoDate => value as IsoDate;

function validInput(
  overrides: Partial<HomeBookingValidationInput> = {}
): HomeBookingValidationInput {
  return {
    apartmentSlug: 'dmitrovskoe-107-apt-1',
    checkIn: iso('2026-08-20'),
    checkOut: iso('2026-08-22'),
    guestEmail: 'maria@example.com',
    guestName: 'Maria Ivanova',
    labels: homeLabels,
    locale: 'en',
    preferredContactMethod: 'email',
    preferredContactValue: '',
    source: 'home',
    todayIso: iso('2026-08-16'),
    ...overrides
  };
}

function reservationInput(
  overrides: Partial<ReservationBookingValidationInput> = {}
): ReservationBookingValidationInput {
  return {
    apartmentSlug: 'dmitrovskoe-107-apt-1',
    adults: 2,
    checkIn: iso('2026-08-20'),
    checkOut: iso('2026-08-22'),
    children: 1,
    guestName: 'Maria Ivanova',
    guestEmail: 'maria@example.com',
    labels: clientLabels,
    locale: 'ru',
    preferredContactMethod: 'email',
    preferredContactValue: '',
    source: 'reservation',
    todayIso: iso('2026-08-16'),
    ...overrides
  };
}

function validateBooking(input: BookingValidationInput) {
  if (input.source === 'home') {
    return validateBookingImplementation({...input, source: 'home'});
  }

  return validateBookingImplementation({...input, source: 'reservation'});
}

describe('client booking validation', () => {
  it('trims valid Cyrillic names and creates a minimal Home draft', () => {
    const result = validateBooking(validInput({
      guestEmail: ' maria@example.com ',
      guestName: '  Мария Иванова  '
    }));

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.draft).toEqual({
        apartmentSlug: 'dmitrovskoe-107-apt-1',
        checkIn: '2026-08-20',
        checkOut: '2026-08-22',
        guestEmail: 'maria@example.com',
        guestName: 'Мария Иванова',
        locale: 'en',
        preferredContactMethod: 'email',
        preferredContactValue: null,
        source: 'home'
      });
      expect(result.draft).not.toHaveProperty('guestPhone');
      expect(result.draft).not.toHaveProperty('price');
      expect(result.draft).not.toHaveProperty('total');
      expect(result.draft).not.toHaveProperty('address');
      expect(result.draft).not.toHaveProperty('nights');
      expect(result.draft).not.toHaveProperty('currency');
    }
  });

  it('accepts valid email, WhatsApp and Telegram values', () => {
    expect(validateBooking(validInput({guestName: " Anne-Marie O'Neil "})).ok).toBe(true);
    expect(validateBooking(validInput({preferredContactMethod: 'whatsapp', preferredContactValue: '+995 555 00 00 00'})).ok).toBe(true);
    expect(validateBooking(validInput({preferredContactMethod: 'telegram', preferredContactValue: '@maria_user'})).ok).toBe(true);
  });

  it('rejects invalid names with precise local errors', () => {
    expect(validateBooking(validInput({guestName: ''}))).toMatchObject({
      errors: {guestName: clientLabels.guestNameRequired},
      ok: false
    });
    expect(validateBooking(validInput({guestName: 'A'}))).toMatchObject({
      errors: {guestName: clientLabels.guestNameTooShort},
      ok: false
    });
    expect(validateBooking(validInput({guestName: 'x'.repeat(101)}))).toMatchObject({
      errors: {guestName: clientLabels.guestNameTooLong},
      ok: false
    });
    expect(validateBooking(validInput({guestName: 'Maria\u0000'}))).toMatchObject({
      errors: {guestName: clientLabels.guestNameControlCharacters},
      ok: false
    });
  });

  it('rejects invalid Home email and contact values', () => {
    expect(validateBooking(validInput({guestEmail: ''}))).toMatchObject({
      errors: {guestEmail: clientLabels.guestEmailRequired},
      ok: false
    });
    expect(validateBooking(validInput({guestEmail: 'not-an-email'}))).toMatchObject({
      errors: {guestEmail: clientLabels.guestEmailFormat},
      ok: false
    });
    for (const preferredContactValue of ['123456', '+995ABC555', '7+995555555']) {
      expect(validateBooking(validInput({preferredContactMethod: 'whatsapp', preferredContactValue}))).toMatchObject({
        errors: {preferredContactValue: clientLabels.whatsappNumberFormat},
        ok: false
      });
    }
    expect(validateBooking(validInput({preferredContactMethod: 'telegram', preferredContactValue: 'maria_user'}))).toMatchObject({
      errors: {preferredContactValue: clientLabels.telegramUsernameFormat}
    });
    expect(validateBooking(validInput({preferredContactMethod: ''}))).toMatchObject({
      errors: {preferredContactMethod: clientLabels.preferredContactMethodRequired},
      ok: false
    });
  });

  it('creates reservation drafts with guest counts and contact fields but no trusted fields', () => {
    const result = validateBooking(reservationInput());

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.draft).toMatchObject({adults: 2, children: 1, locale: 'ru', source: 'reservation'});
      expect(Object.keys(result.draft).sort()).toEqual([
        'adults',
        'apartmentSlug',
        'checkIn',
        'checkOut',
        'children',
        'guestEmail',
        'guestName',
        'locale',
        'preferredContactMethod',
        'preferredContactValue',
        'source'
      ]);
    }
  });

  it('enforces date, apartment and reservation guest constraints', () => {
    expect(validateBooking(validInput({checkIn: iso('2026-08-15')}))).toMatchObject({
      errors: {checkIn: clientLabels.checkInPast},
      ok: false
    });
    expect(validateBooking(validInput({checkIn: iso('2026-08-22'), checkOut: iso('2026-08-22')})).ok).toBe(false);
    expect(validateBooking(validInput({checkIn: iso('2026-08-22'), checkOut: iso('2026-08-21')})).ok).toBe(false);
    expect(validateBooking(validInput({apartmentSlug: null}))).toMatchObject({
      errors: {apartment: clientLabels.apartmentRequired},
      ok: false
    });
    expect(validateBooking(reservationInput({adults: 0, children: 11}))).toMatchObject({
      errors: {reservation: clientLabels.reservationIncomplete},
      ok: false
    });
  });
});
