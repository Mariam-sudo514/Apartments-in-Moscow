import type {BookingSendLabels, BookingRequestDraft} from '@/types/booking';
import type {
  BookingApiAcceptedResponse,
  BookingApiErrorCode,
  BookingApiResponse
} from '@/types/booking-api';

export type BookingApiPayload = BookingRequestDraft & {
  readonly website: string;
};

export type BookingApiClientFailure =
  | {readonly kind: 'aborted'}
  | {readonly kind: 'invalid_response'}
  | {readonly kind: 'network'}
  | {
      readonly kind: 'server';
      readonly code: BookingApiErrorCode;
      readonly fields?: Readonly<Record<string, string>>;
      readonly status: number;
    };

export type BookingApiClientResult =
  | {readonly ok: true; readonly response: BookingApiAcceptedResponse}
  | {readonly ok: false; readonly failure: BookingApiClientFailure};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isBookingApiErrorCode(value: unknown): value is BookingApiErrorCode {
  return typeof value === 'string' && [
    'DELIVERY_FAILED',
    'DELIVERY_NOT_CONFIGURED',
    'INTERNAL_ERROR',
    'INVALID_JSON',
    'INVALID_REQUEST',
    'PAYLOAD_TOO_LARGE',
    'RATE_LIMITED',
    'REQUEST_FORBIDDEN',
    'SERVER_MISCONFIGURED',
    'UNSUPPORTED_MEDIA_TYPE',
    'VALIDATION_FAILED'
  ].includes(value);
}

function isBookingApiResponse(value: unknown): value is BookingApiResponse {
  if (!isRecord(value) || typeof value.ok !== 'boolean') {
    return false;
  }

  if (value.ok) {
    return value.code === 'BOOKING_REQUEST_ACCEPTED' && isRecord(value.quote);
  }

  if (!isRecord(value.error) || !isBookingApiErrorCode(value.error.code)) {
    return false;
  }

  return typeof value.error.message === 'string';
}

export async function submitBookingRequest(
  payload: BookingApiPayload,
  signal: AbortSignal
): Promise<BookingApiClientResult> {
  let response: Response;

  try {
    response = await fetch('/api/booking', {
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
        'X-Booking-Request': '1'
      },
      method: 'POST',
      signal
    });
  } catch (error) {
    return error instanceof DOMException && error.name === 'AbortError'
      ? {failure: {kind: 'aborted'}, ok: false}
      : {failure: {kind: 'network'}, ok: false};
  }

  let body: unknown;

  try {
    body = await response.json();
  } catch {
    return {failure: {kind: 'invalid_response'}, ok: false};
  }

  if (!isBookingApiResponse(body)) {
    return {failure: {kind: 'invalid_response'}, ok: false};
  }

  if (body.ok && response.status === 200) {
    return {ok: true, response: body};
  }

  if (!body.ok) {
    return {
      failure: {
        code: body.error.code,
        fields: body.error.fields,
        kind: 'server',
        status: response.status
      },
      ok: false
    };
  }

  return {failure: {kind: 'invalid_response'}, ok: false};
}

export function getBookingClientErrorMessage(
  failure: Exclude<BookingApiClientFailure, {readonly kind: 'aborted'}>,
  labels: BookingSendLabels
): string {
  if (failure.kind === 'invalid_response') {
    return labels.invalidResponse;
  }

  if (failure.kind === 'network') {
    return labels.networkFailure;
  }

  switch (failure.code) {
    case 'DELIVERY_FAILED':
      return labels.deliveryFailed;
    case 'DELIVERY_NOT_CONFIGURED':
      return labels.deliveryNotConfigured;
    case 'PAYLOAD_TOO_LARGE':
      return labels.requestPayloadTooLarge;
    case 'RATE_LIMITED':
      return labels.requestRateLimited;
    case 'REQUEST_FORBIDDEN':
      return labels.requestForbidden;
    case 'SERVER_MISCONFIGURED':
      return labels.serverMisconfigured;
    case 'UNSUPPORTED_MEDIA_TYPE':
      return labels.requestUnsupportedMedia;
    case 'VALIDATION_FAILED':
      return labels.requestValidationFailed;
    case 'INTERNAL_ERROR':
    case 'INVALID_JSON':
    case 'INVALID_REQUEST':
      return labels.requestInvalid;
  }
}
