import {describe, expect, it} from 'vitest';

import {validateBooking as validateBookingImplementation} from '@/lib/booking';
import type {BookingValidationInput} from '@/types/booking';
import type {IsoDate} from '@/types/reservation';

import {clientLabels} from './test-fixtures';

const iso = (value: string): IsoDate => value as IsoDate;

function validInput(
  overrides: Partial<BookingValidationInput> = {}
): BookingValidationInput {
  return {
    apartmentSlug: 'dmitrovskoe-107-apt-1',
    checkIn: iso('2026-08-20'),
    checkOut: iso('2026-08-22'),
    guestName: 'Maria Ivanova',
    guestPhone: '+7 (000) 000-00-00',
    labels: clientLabels,
    locale: 'en',
    source: 'home',
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
      guestName: '  Мария Иванова  ',
      guestPhone: ' 1234567 '
    }));

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.draft).toEqual({
        apartmentSlug: 'dmitrovskoe-107-apt-1',
        checkIn: '2026-08-20',
        checkOut: '2026-08-22',
        guestName: 'Мария Иванова',
        guestPhone: '1234567',
        locale: 'en',
        source: 'home'
      });
      expect(result.draft).not.toHaveProperty('price');
      expect(result.draft).not.toHaveProperty('total');
      expect(result.draft).not.toHaveProperty('address');
      expect(result.draft).not.toHaveProperty('nights');
      expect(result.draft).not.toHaveProperty('currency');
    }
  });

  it('accepts Latin hyphens, apostrophes and the 7/15 digit phone boundaries', () => {
    expect(validateBooking(validInput({guestName: " Anne-Marie O'Neil ", guestPhone: '123 4567'})).ok).toBe(true);
    expect(validateBooking(validInput({guestPhone: '123456789012345'})).ok).toBe(true);
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

  it('rejects phone characters, plus placement and digit length violations', () => {
    for (const guestPhone of ['123456', '1234567890123456', '123ABC456', '7+9999999', '++7999999']) {
      expect(validateBooking(validInput({guestPhone}))).toMatchObject({
        errors: {guestPhone: expect.any(String)},
        ok: false
      });
    }
    expect(validateBooking(validInput({guestPhone: '123456'}))).toMatchObject({
      errors: {guestPhone: clientLabels.guestPhoneTooShort}
    });
    expect(validateBooking(validInput({guestPhone: '1234567890123456'}))).toMatchObject({
      errors: {guestPhone: clientLabels.guestPhoneTooLong}
    });
  });

  it('creates reservation drafts with guest counts and no trusted fields', () => {
    const result = validateBooking(validInput({
      adults: 2,
      children: 1,
      locale: 'ru',
      source: 'reservation'
    }));

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.draft).toMatchObject({adults: 2, children: 1, locale: 'ru', source: 'reservation'});
      expect(Object.keys(result.draft).sort()).toEqual([
        'adults',
        'apartmentSlug',
        'checkIn',
        'checkOut',
        'children',
        'guestName',
        'guestPhone',
        'locale',
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
    expect(validateBooking(validInput({adults: 0, children: 11, source: 'reservation'}))).toMatchObject({
      errors: {reservation: clientLabels.reservationIncomplete},
      ok: false
    });
  });
});
