import type {BookingRequestDraft} from './booking';

export type BookingApiQuote = {
  readonly apartmentSlug: string;
  readonly nights: number;
  readonly amount: number;
  readonly currency: 'RUB';
  readonly priceMode: 'exact' | 'from';
};

export type BookingApiErrorCode =
  | 'SERVER_MISCONFIGURED'
  | 'UNSUPPORTED_MEDIA_TYPE'
  | 'PAYLOAD_TOO_LARGE'
  | 'INVALID_JSON'
  | 'REQUEST_FORBIDDEN'
  | 'INVALID_REQUEST'
  | 'CAPTCHA_REQUIRED'
  | 'CAPTCHA_INVALID'
  | 'VALIDATION_FAILED'
  | 'RATE_LIMITED'
  | 'DELIVERY_NOT_CONFIGURED'
  | 'DELIVERY_FAILED'
  | 'INTERNAL_ERROR';

export type BookingApiError = {
  readonly code: BookingApiErrorCode;
  readonly message: string;
  readonly fields?: Readonly<Record<string, string>>;
};

export type BookingApiFailureResponse = {
  readonly ok: false;
  readonly error: BookingApiError;
  readonly quote?: BookingApiQuote;
};

export type BookingApiAcceptedQuote = Omit<BookingApiQuote, 'apartmentSlug'>;

export type BookingApiAcceptedResponse = {
  readonly ok: true;
  readonly code: 'BOOKING_REQUEST_ACCEPTED';
  readonly quote: BookingApiAcceptedQuote;
};

export type BookingApiResponse = BookingApiFailureResponse | BookingApiAcceptedResponse;

export type ValidatedBookingRequest = BookingRequestDraft;
