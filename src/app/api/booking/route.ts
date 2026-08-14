import 'server-only';

import {getMoscowTodayIso} from '@/lib/reservation/calendar';
import {
  BOOKING_BODY_LIMIT_BYTES,
  BookingBodyTooLargeError,
  BookingInvalidJsonError,
  bookingRateLimiter,
  calculateTrustedBookingQuote,
  createBookingErrorResponse,
  createDeliveryNotConfiguredResponse,
  getBookingRateLimitKey,
  getBookingServerConfig,
  isBookingRequestAllowed,
  isJsonContentType,
  readJsonBody,
  validateBookingPayload
} from '@/server/booking';

export const runtime = 'nodejs';

export async function POST(request: Request): Promise<Response> {
  const configResult = getBookingServerConfig();

  if (!configResult.ok) {
    return createBookingErrorResponse('SERVER_MISCONFIGURED', 503);
  }

  if (!isBookingRequestAllowed(request, configResult.config)) {
    return createBookingErrorResponse('REQUEST_FORBIDDEN', 403);
  }

  const rateLimit = bookingRateLimiter.consume(
    getBookingRateLimitKey(request, configResult.config.trustProxy),
    configResult.config.rateLimitMax,
    configResult.config.rateLimitWindowMs
  );

  if (!rateLimit.allowed) {
    return createBookingErrorResponse(
      'RATE_LIMITED',
      429,
      undefined,
      {'Retry-After': String(rateLimit.retryAfterSeconds ?? 1)}
    );
  }

  if (!isJsonContentType(request.headers.get('content-type'))) {
    return createBookingErrorResponse('UNSUPPORTED_MEDIA_TYPE', 415);
  }

  let payload: unknown;

  try {
    payload = await readJsonBody(request, BOOKING_BODY_LIMIT_BYTES);
  } catch (error) {
    if (error instanceof BookingBodyTooLargeError) {
      return createBookingErrorResponse('PAYLOAD_TOO_LARGE', 413);
    }

    if (error instanceof BookingInvalidJsonError) {
      return createBookingErrorResponse('INVALID_JSON', 400);
    }

    return createBookingErrorResponse('INTERNAL_ERROR', 500);
  }

  const validation = validateBookingPayload(payload, getMoscowTodayIso());

  if (!validation.ok) {
    return validation.kind === 'invalid_request'
      ? createBookingErrorResponse('INVALID_REQUEST', 400)
      : createBookingErrorResponse('VALIDATION_FAILED', 422, validation.fields);
  }

  const quote = calculateTrustedBookingQuote(validation.request);

  if (quote === null) {
    return createBookingErrorResponse('INTERNAL_ERROR', 500);
  }

  return createDeliveryNotConfiguredResponse(quote);
}

function methodNotAllowed(): Response {
  return createBookingErrorResponse('INVALID_REQUEST', 405, undefined, {Allow: 'POST'});
}

export const GET = methodNotAllowed;
export const HEAD = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
export const OPTIONS = methodNotAllowed;
