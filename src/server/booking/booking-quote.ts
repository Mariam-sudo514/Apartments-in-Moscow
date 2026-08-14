import 'server-only';

import {getApartmentBySlug} from '@/data/apartments';
import {getNights} from '@/lib/reservation/calendar';
import type {BookingApiQuote, ValidatedBookingRequest} from '@/types/booking-api';

export type TrustedBookingQuote = BookingApiQuote;

export function calculateTrustedBookingQuote(
  request: ValidatedBookingRequest
): TrustedBookingQuote | null {
  const apartment = getApartmentBySlug(request.apartmentSlug);
  const nights = getNights(request.checkIn, request.checkOut);

  if (apartment === undefined || nights === null || nights <= 0) {
    return null;
  }

  return {
    amount: nights * apartment.catalog.price.amount,
    apartmentSlug: apartment.slug,
    currency: apartment.catalog.price.currency,
    nights,
    priceMode: apartment.catalog.price.mode
  };
}
