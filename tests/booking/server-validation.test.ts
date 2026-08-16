import {describe, expect, it} from 'vitest';

import {validateBookingPayload} from '@/server/booking/booking-validation';
import type {IsoDate} from '@/types/reservation';

const today = '2026-08-16' as IsoDate;

function homePayload(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    apartmentSlug: 'dmitrovskoe-107-apt-1',
    checkIn: '2026-08-20',
    checkOut: '2026-08-22',
    guestName: 'Maria Ivanova',
    guestPhone: '+7 000 000 00 00',
    locale: 'en',
    source: 'home',
    ...overrides
  };
}

function reservationPayload(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    ...homePayload({locale: 'ru', source: 'reservation'}),
    adults: 2,
    children: 1,
    ...overrides
  };
}

describe('server booking payload validation', () => {
  it('accepts valid RU reservation and EN Home payloads', () => {
    expect(validateBookingPayload(reservationPayload(), today)).toMatchObject({ok: true});
    expect(validateBookingPayload(homePayload(), today)).toMatchObject({ok: true});
  });

  it('rejects malformed shapes, nested data, unknown keys and forbidden keys', () => {
    for (const payload of [null, [], {guestName: {nested: true}}, homePayload({unknown: true})]) {
      expect(validateBookingPayload(payload, today)).toEqual({kind: 'invalid_request', ok: false});
    }

    const forbidden = JSON.parse('{"__proto__": {"polluted": true}}') as unknown;
    expect(validateBookingPayload(forbidden, today)).toEqual({kind: 'invalid_request', ok: false});
    expect(validateBookingPayload({a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9, j: 10, k: 11}, today)).toEqual({
      kind: 'invalid_request',
      ok: false
    });
  });

  it('rejects client-provided trusted quote and display fields', () => {
    for (const key of ['price', 'total', 'address', 'title', 'nights', 'currency']) {
      expect(validateBookingPayload(homePayload({[key]: 1}), today)).toEqual({
        kind: 'invalid_request',
        ok: false
      });
    }
  });

  it('rejects a filled honeypot and invalid locale/source/slug', () => {
    expect(validateBookingPayload(homePayload({website: 'bot'}), today)).toEqual({
      kind: 'invalid_request',
      ok: false
    });
    expect(validateBookingPayload(homePayload({locale: 'de'}), today)).toMatchObject({
      fields: {locale: 'invalid_value'},
      kind: 'validation_failed',
      ok: false
    });
    expect(validateBookingPayload(homePayload({source: 'unknown'}), today)).toMatchObject({
      fields: {source: 'invalid_value'},
      kind: 'validation_failed',
      ok: false
    });
    expect(validateBookingPayload(homePayload({apartmentSlug: 'missing-slug'}), today)).toMatchObject({
      fields: {apartmentSlug: 'invalid_slug'},
      kind: 'validation_failed',
      ok: false
    });
    expect(validateBookingPayload(homePayload({apartmentSlug: ''}), today)).toMatchObject({
      fields: {apartmentSlug: 'required'},
      kind: 'validation_failed',
      ok: false
    });
    expect(validateBookingPayload(homePayload({apartmentSlug: 'x'.repeat(101)}), today)).toMatchObject({
      fields: {apartmentSlug: 'too_long'},
      kind: 'validation_failed',
      ok: false
    });
  });

  it('reports required, type, format and date errors without coercion', () => {
    expect(validateBookingPayload({}, today)).toMatchObject({
      fields: {
        apartmentSlug: 'required',
        checkIn: 'required',
        checkOut: 'required',
        guestName: 'required',
        guestPhone: 'required',
        locale: 'required',
        source: 'required'
      },
      kind: 'validation_failed',
      ok: false
    });
    expect(validateBookingPayload(homePayload({guestName: 7, guestPhone: 7, checkIn: 7, checkOut: 7}), today)).toMatchObject({
      fields: {
        checkIn: 'invalid_type',
        checkOut: 'invalid_type',
        guestName: 'invalid_type',
        guestPhone: 'invalid_type'
      },
      kind: 'validation_failed',
      ok: false
    });
    expect(validateBookingPayload(homePayload({checkIn: '2026-02-30', checkOut: '2026-13-01'}), today)).toMatchObject({
      fields: {checkIn: 'invalid_date', checkOut: 'invalid_date'},
      kind: 'validation_failed',
      ok: false
    });
    expect(validateBookingPayload(homePayload({guestName: 'A', guestPhone: '123456'}), today)).toMatchObject({
      fields: {guestName: 'too_short', guestPhone: 'too_short'},
      kind: 'validation_failed',
      ok: false
    });
    expect(validateBookingPayload(homePayload({guestName: 'x'.repeat(101), guestPhone: '1234567890123456'}), today)).toMatchObject({
      fields: {guestName: 'too_long', guestPhone: 'too_long'},
      kind: 'validation_failed',
      ok: false
    });
    expect(validateBookingPayload(homePayload({guestName: 'Maria\u0000', guestPhone: '123ABC456'}), today)).toMatchObject({
      fields: {guestName: 'control_characters', guestPhone: 'invalid_format'},
      kind: 'validation_failed',
      ok: false
    });
    expect(validateBookingPayload(homePayload({guestPhone: '7+9999999'}), today)).toMatchObject({
      fields: {guestPhone: 'invalid_format'},
      kind: 'validation_failed',
      ok: false
    });
  });

  it('rejects past, same-day and reversed date ranges', () => {
    for (const overrides of [
      {checkIn: '2026-08-15'},
      {checkIn: '2026-08-20', checkOut: '2026-08-20'},
      {checkIn: '2026-08-22', checkOut: '2026-08-21'}
    ]) {
      expect(validateBookingPayload(homePayload(overrides), today)).toMatchObject({
        kind: 'validation_failed',
        ok: false
      });
    }
  });

  it('keeps Home and Reservation guest contracts separate and bounded', () => {
    expect(validateBookingPayload(homePayload({adults: 1}), today)).toMatchObject({
      fields: {adults: 'not_allowed'},
      kind: 'validation_failed',
      ok: false
    });
    expect(validateBookingPayload(reservationPayload({adults: 0}), today)).toMatchObject({
      fields: {adults: 'out_of_range'},
      kind: 'validation_failed',
      ok: false
    });
    expect(validateBookingPayload(reservationPayload({adults: 11}), today)).toMatchObject({
      fields: {adults: 'out_of_range'},
      kind: 'validation_failed',
      ok: false
    });
    expect(validateBookingPayload(reservationPayload({children: -1}), today)).toMatchObject({
      fields: {children: 'out_of_range'},
      kind: 'validation_failed',
      ok: false
    });
    expect(validateBookingPayload(reservationPayload({children: 11}), today)).toMatchObject({
      fields: {children: 'out_of_range'},
      kind: 'validation_failed',
      ok: false
    });
    expect(validateBookingPayload(reservationPayload({adults: '2', children: 1}), today)).toMatchObject({
      fields: {adults: 'invalid_type'},
      kind: 'validation_failed',
      ok: false
    });
    const missingChildren = reservationPayload({adults: 2});
    delete missingChildren.children;
    expect(validateBookingPayload(missingChildren, today)).toMatchObject({
      fields: {children: 'required'},
      kind: 'validation_failed',
      ok: false
    });
    expect(validateBookingPayload(homePayload({website: ''}), today)).toMatchObject({ok: true});
  });

  it('normalizes only the validated fields in the resulting request', () => {
    const result = validateBookingPayload(reservationPayload({guestName: '  Мария  '}), today);

    expect(result).toMatchObject({ok: true});

    if (result.ok) {
      expect(result.request).toEqual({
        adults: 2,
        apartmentSlug: 'dmitrovskoe-107-apt-1',
        checkIn: '2026-08-20',
        checkOut: '2026-08-22',
        children: 1,
        guestName: 'Мария',
        guestPhone: '+7 000 000 00 00',
        locale: 'ru',
        source: 'reservation'
      });
    }
  });
});
