import 'server-only';

import type {
  BookingApiAcceptedResponse,
  BookingApiErrorCode,
  BookingApiQuote,
  BookingApiResponse
} from '@/types/booking-api';

const BASE_HEADERS = {
  'Cache-Control': 'no-store',
  'Vary': 'Origin, Sec-Fetch-Site',
  'X-Content-Type-Options': 'nosniff'
} as const;

const MESSAGES: Record<BookingApiErrorCode, string> = {
  DELIVERY_NOT_CONFIGURED: 'Booking delivery is not configured.',
  DELIVERY_FAILED: 'The local booking delivery could not complete the request.',
  INTERNAL_ERROR: 'The booking service could not complete the request.',
  INVALID_JSON: 'The request body is not valid JSON.',
  INVALID_REQUEST: 'The booking request is invalid.',
  PAYLOAD_TOO_LARGE: 'The request body is too large.',
  RATE_LIMITED: 'Too many booking requests.',
  REQUEST_FORBIDDEN: 'The booking request is not allowed.',
  SERVER_MISCONFIGURED: 'The booking service is not configured.',
  UNSUPPORTED_MEDIA_TYPE: 'The request media type is not supported.',
  VALIDATION_FAILED: 'The booking request is invalid.'
};

export function createBookingResponse(
  body: BookingApiResponse,
  status: number,
  extraHeaders: HeadersInit = {}
): Response {
  const headers = new Headers(BASE_HEADERS);

  for (const [key, value] of Object.entries(extraHeaders)) {
    headers.set(key, value);
  }

  return Response.json(body, {headers, status});
}

export function createBookingErrorResponse(
  code: BookingApiErrorCode,
  status: number,
  fields?: Readonly<Record<string, string>>,
  extraHeaders: HeadersInit = {}
): Response {
  const error = fields === undefined
    ? {code, message: MESSAGES[code]}
    : {code, fields, message: MESSAGES[code]};

  return createBookingResponse({error, ok: false}, status, extraHeaders);
}

export function createDeliveryNotConfiguredResponse(quote: BookingApiQuote): Response {
  return createBookingResponse(
    {
      error: {
        code: 'DELIVERY_NOT_CONFIGURED',
        message: MESSAGES.DELIVERY_NOT_CONFIGURED
      },
      ok: false,
      quote
    },
    503
  );
}

export function createBookingAcceptedResponse(quote: BookingApiQuote): Response {
  const body: BookingApiAcceptedResponse = {
    code: 'BOOKING_REQUEST_ACCEPTED',
    ok: true,
    quote: {
      amount: quote.amount,
      currency: quote.currency,
      nights: quote.nights,
      priceMode: quote.priceMode
    }
  };

  return createBookingResponse(body, 200);
}
