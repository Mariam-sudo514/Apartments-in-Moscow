import {describe, expect, it} from 'vitest';

import {addCalendarDays} from '@/lib/reservation/calendar';
import {isReservationFormReady, type ReservationFormReadinessInput} from '@/lib/booking/reservation-form-readiness';
import {clientLabels} from './test-fixtures';

const today = '2026-08-16' as const;

function validInput(overrides: Partial<ReservationFormReadinessInput> = {}): ReservationFormReadinessInput {
  return {
    adults: 1,
    apartmentSlug: 'dmitrovskoe-107-apt-1',
    captchaAnswer: 'AB234',
    captchaChallengeId: 'challenge-id',
    checkIn: '2026-08-20',
    checkOut: '2026-08-22',
    children: 0,
    guestEmail: 'guest@example.com',
    guestName: 'Test Guest',
    labels: clientLabels,
    locale: 'en',
    preferredContactMethod: 'email',
    preferredContactValue: '',
    reservationReady: true,
    source: 'reservation',
    todayIso: today,
    ...overrides
  };
}

describe('Reservation form readiness', () => {
  it('keeps the submit button disabled until dates, apartment, contact and CAPTCHA are valid', () => {
    expect(isReservationFormReady(validInput({
      apartmentSlug: null,
      checkIn: null,
      checkOut: null,
      guestName: '',
      guestEmail: '',
      reservationReady: false
    }))).toBe(false);
    expect(isReservationFormReady(validInput({checkIn: null, checkOut: null, reservationReady: false}))).toBe(false);
    expect(isReservationFormReady(validInput({apartmentSlug: null, reservationReady: false}))).toBe(false);
    expect(isReservationFormReady(validInput({guestName: '', guestEmail: ''}))).toBe(false);
    expect(isReservationFormReady(validInput({captchaAnswer: ''}))).toBe(false);
    expect(isReservationFormReady(validInput({guestEmail: 'not-an-email'}))).toBe(false);
    expect(isReservationFormReady(validInput({checkOut: '2026-08-20'}))).toBe(false);
    expect(isReservationFormReady(validInput())).toBe(true);
  });

  it('becomes disabled again when a required value is cleared or CAPTCHA is refreshed', () => {
    const clearedFields: Partial<ReservationFormReadinessInput>[] = [
      {guestName: ''},
      {guestEmail: ''},
      {checkIn: null, reservationReady: false},
      {checkOut: null, reservationReady: false},
      {apartmentSlug: null, reservationReady: false}
    ];

    for (const overrides of clearedFields) {
      expect(isReservationFormReady(validInput(overrides))).toBe(false);
    }

    expect(isReservationFormReady(validInput({captchaAnswer: '', captchaChallengeId: null}))).toBe(false);
    expect(isReservationFormReady(validInput({captchaAnswer: 'WRONG', captchaChallengeId: null}))).toBe(false);
  });

  it('uses calendar validation for a non-positive date range', () => {
    const checkIn = today;
    const checkOut = addCalendarDays(checkIn, 0);

    expect(isReservationFormReady(validInput({checkIn, checkOut}))).toBe(false);
  });
});
