import {describe, expect, it} from 'vitest';

import {getApartmentBySlug} from '@/data/apartments';
import {createBookingRequestDraft} from '@/lib/booking';
import {calculateTrustedBookingQuote} from '@/server/booking/booking-quote';
import type {ValidatedBookingRequest} from '@/types/booking-api';

function request(apartmentSlug: string): ValidatedBookingRequest {
  return createBookingRequestDraft({
    apartmentSlug,
    checkIn: '2026-08-20',
    checkOut: '2026-08-23',
    guestName: 'Maria Ivanova',
    guestPhone: '+7 000 000 00 00',
    locale: 'en',
    source: 'reservation',
    adults: 2,
    children: 0
  });
}

describe('trusted booking quotes', () => {
  it('uses the exact catalog price for the exact apartment', () => {
    const apartment = getApartmentBySlug('dmitrovskoe-107-apt-1');
    const quote = calculateTrustedBookingQuote(request('dmitrovskoe-107-apt-1'));

    expect(apartment).toBeDefined();
    expect(quote).toEqual({
      amount: 3 * (apartment?.catalog.price.amount ?? 0),
      apartmentSlug: 'dmitrovskoe-107-apt-1',
      currency: 'RUB',
      nights: 3,
      priceMode: 'exact'
    });
  });

  it('uses the typed catalog base price and preserves from mode', () => {
    const apartment = getApartmentBySlug('mitino-aframe');
    const quote = calculateTrustedBookingQuote(request('mitino-aframe'));

    expect(apartment?.catalog.price.mode).toBe('from');
    expect(quote).toMatchObject({
      amount: 3 * (apartment?.catalog.price.amount ?? 0),
      currency: 'RUB',
      nights: 3,
      priceMode: 'from'
    });
  });

  it('ignores client-side price-like fields and rejects an unknown slug', () => {
    const trustedRequest = request('dmitrovskoe-107-apt-1');
    const clientAttempt = {...trustedRequest, amount: 1, currency: 'USD', nights: 999};
    const quote = calculateTrustedBookingQuote(clientAttempt as ValidatedBookingRequest);

    expect(quote?.amount).toBe(3 * (getApartmentBySlug(trustedRequest.apartmentSlug)?.catalog.price.amount ?? 0));
    expect(calculateTrustedBookingQuote(request('unknown-slug'))).toBeNull();
  });
});
