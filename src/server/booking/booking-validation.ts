import 'server-only';

import {getApartmentBySlug} from '@/data/apartments';
import {createBookingRequestDraft} from '@/lib/booking/booking-payload';
import {
  compareCalendarDates,
  getMoscowTodayIso,
  getNights,
  parseIsoDate
} from '@/lib/reservation/calendar';
import type {IsoDate} from '@/types/reservation';
import type {ValidatedBookingRequest} from '@/types/booking-api';
import type {PreferredContactMethod} from '@/types/booking';

const ALLOWED_KEYS = new Set([
  'adults',
  'apartmentSlug',
  'checkIn',
  'checkOut',
  'children',
  'captchaAnswer',
  'captchaChallengeId',
  'guestEmail',
  'guestName',
  'guestPhone',
  'locale',
  'preferredContactMethod',
  'preferredContactValue',
  'source',
  'website'
]);
const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001F\u007F-\u009F]/u;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;
const WHATSAPP_CHARACTER_PATTERN = /^[+0-9() -]+$/u;
const TELEGRAM_PATTERN = /^@[A-Za-z0-9_]{5,32}$/u;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/u;

export type BookingValidationResult =
  | {
      readonly captcha: {
        readonly answer: string;
        readonly challengeId: string;
      };
      readonly ok: true;
      readonly request: ValidatedBookingRequest;
    }
  | {
      readonly ok: false;
      readonly kind: 'invalid_request' | 'validation_failed';
      readonly fields?: Readonly<Record<string, string>>;
    };

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function hasOwn(value: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function invalidRequest(): BookingValidationResult {
  return {kind: 'invalid_request', ok: false};
}

function getStringField(
  payload: Record<string, unknown>,
  field: string,
  errors: Record<string, string>
): string | null {
  if (!hasOwn(payload, field)) {
    errors[field] = 'required';
    return null;
  }

  const value = payload[field];

  if (typeof value !== 'string') {
    errors[field] = 'invalid_type';
    return null;
  }

  return value;
}

function getNullableStringField(
  payload: Record<string, unknown>,
  field: string,
  errors: Record<string, string>
): string | null | undefined {
  if (!hasOwn(payload, field)) {
    return undefined;
  }

  const value = payload[field];

  if (value === null) {
    return null;
  }

  if (typeof value !== 'string') {
    errors[field] = 'invalid_type';
    return null;
  }

  return value;
}

function parseDateField(
  payload: Record<string, unknown>,
  field: 'checkIn' | 'checkOut',
  errors: Record<string, string>
): IsoDate | null {
  const value = getStringField(payload, field, errors);

  if (value === null) {
    return null;
  }

  if (value === '') {
    errors[field] = 'required';
    return null;
  }

  if (!ISO_DATE_PATTERN.test(value)) {
    errors[field] = 'invalid_date';
    return null;
  }

  try {
    parseIsoDate(value);
    return value as IsoDate;
  } catch {
    errors[field] = 'invalid_date';
    return null;
  }
}

function validateShape(payload: unknown): payload is Record<string, unknown> {
  if (!isRecord(payload)) {
    return false;
  }

  const keys = Object.keys(payload);

  if (keys.length > ALLOWED_KEYS.size) {
    return false;
  }

  for (const key of keys) {
    if (FORBIDDEN_KEYS.has(key) || !ALLOWED_KEYS.has(key)) {
      return false;
    }

    const value = payload[key];

    if (value === null && key !== 'preferredContactValue') {
      return false;
    }

    if (typeof value === 'object' && value !== null) {
      return false;
    }
  }

  return true;
}

function validateName(
  payload: Record<string, unknown>,
  errors: Record<string, string>
): string | null {
  const value = getStringField(payload, 'guestName', errors);

  if (value === null) {
    return null;
  }

  const normalized = value.normalize('NFC');
  const trimmed = normalized.trim();
  const length = Array.from(trimmed).length;

  if (trimmed.length === 0) {
    errors.guestName = 'required';
  } else if (CONTROL_CHARACTER_PATTERN.test(normalized)) {
    errors.guestName = 'control_characters';
  } else if (length < 2) {
    errors.guestName = 'too_short';
  } else if (length > 100) {
    errors.guestName = 'too_long';
  }

  return errors.guestName === undefined ? trimmed : null;
}

function validateEmail(
  payload: Record<string, unknown>,
  errors: Record<string, string>
): string | null {
  const value = getStringField(payload, 'guestEmail', errors);

  if (value === null) {
    return null;
  }

  const normalized = value.trim();

  if (normalized.length === 0) {
    errors.guestEmail = 'required';
  } else if (
    normalized.length > 254 ||
    CONTROL_CHARACTER_PATTERN.test(value) ||
    !EMAIL_PATTERN.test(normalized)
  ) {
    errors.guestEmail = 'invalid_format';
  }

  return errors.guestEmail === undefined ? normalized : null;
}

function validatePreferredContactMethod(
  payload: Record<string, unknown>,
  errors: Record<string, string>
): PreferredContactMethod | null {
  const value = getStringField(payload, 'preferredContactMethod', errors);

  if (value === null) {
    return null;
  }

  if (value !== 'email' && value !== 'whatsapp' && value !== 'telegram') {
    errors.preferredContactMethod = 'invalid_value';
    return null;
  }

  return value;
}

function getPreferredContactValue(
  payload: Record<string, unknown>,
  errors: Record<string, string>
): string | null | undefined {
  return getNullableStringField(payload, 'preferredContactValue', errors);
}

function validatePreferredContactValue(
  method: PreferredContactMethod | null,
  value: string | null | undefined,
  errors: Record<string, string>
): string | null {
  if (method === null) {
    return null;
  }

  if (method === 'email') {
    if (value !== undefined && value !== null) {
      errors.preferredContactValue = 'not_allowed';
    }
    return null;
  }

  if (value === undefined || value === null || value.trim().length === 0) {
    errors.preferredContactValue = 'required';
    return null;
  }

  const normalized = value.trim();

  if (CONTROL_CHARACTER_PATTERN.test(value)) {
    errors.preferredContactValue = 'invalid_format';
    return null;
  }

  if (method === 'whatsapp') {
    const compact = normalized.replace(/[ ()-]/gu, '');

    if (!WHATSAPP_CHARACTER_PATTERN.test(normalized) || !/^\+[0-9]{7,15}$/u.test(compact)) {
      errors.preferredContactValue = 'invalid_format';
      return null;
    }

    return compact;
  }

  if (!TELEGRAM_PATTERN.test(normalized)) {
    errors.preferredContactValue = 'invalid_format';
    return null;
  }

  return normalized;
}

function validateIntegerField(
  payload: Record<string, unknown>,
  field: 'adults' | 'children',
  minimum: number,
  maximum: number,
  errors: Record<string, string>
): number | null {
  if (!hasOwn(payload, field)) {
    errors[field] = 'required';
    return null;
  }

  const value = payload[field];

  if (typeof value !== 'number' || !Number.isInteger(value)) {
    errors[field] = 'invalid_type';
    return null;
  }

  if (value < minimum || value > maximum) {
    errors[field] = 'out_of_range';
    return null;
  }

  return value;
}

export function validateBookingPayload(
  payload: unknown,
  todayIso: IsoDate = getMoscowTodayIso()
): BookingValidationResult {
  if (!validateShape(payload)) {
    return invalidRequest();
  }

  if (hasOwn(payload, 'website') && payload.website !== '') {
    return invalidRequest();
  }

  const errors: Record<string, string> = {};
  const sourceValue = getStringField(payload, 'source', errors);
  const localeValue = getStringField(payload, 'locale', errors);
  const guestName = validateName(payload, errors);
  const apartmentSlugValue = getStringField(payload, 'apartmentSlug', errors);
  const checkIn = parseDateField(payload, 'checkIn', errors);
  const checkOut = parseDateField(payload, 'checkOut', errors);

  if (sourceValue !== null && sourceValue !== 'home' && sourceValue !== 'reservation') {
    errors.source = 'invalid_value';
  }

  if (localeValue !== null && localeValue !== 'ru' && localeValue !== 'en') {
    errors.locale = 'invalid_value';
  }

  let apartmentSlug: string | null = apartmentSlugValue;

  if (apartmentSlugValue !== null) {
    if (apartmentSlugValue.length === 0) {
      errors.apartmentSlug = 'required';
      apartmentSlug = null;
    } else if (apartmentSlugValue.length > 100) {
      errors.apartmentSlug = 'too_long';
      apartmentSlug = null;
    } else if (getApartmentBySlug(apartmentSlugValue) === undefined) {
      errors.apartmentSlug = 'invalid_slug';
      apartmentSlug = null;
    }
  }

  if (checkIn !== null && compareCalendarDates(checkIn, todayIso) < 0) {
    errors.checkIn = 'past';
  }

  if (checkIn !== null && checkOut !== null) {
    const nights = getNights(checkIn, checkOut);

    if (nights === null || nights <= 0) {
      errors.checkOut = 'must_be_after_check_in';
    }
  }

  let adults: number | null = null;
  let children: number | null = null;
  let guestEmail: string | null = null;
  let preferredContactMethod: PreferredContactMethod | null = null;
  let preferredContactValue: string | null = null;
  let captcha: {readonly answer: string; readonly challengeId: string} | undefined;

  const captchaChallengeId = getStringField(payload, 'captchaChallengeId', errors);
  const captchaAnswer = getStringField(payload, 'captchaAnswer', errors);

  if (captchaChallengeId !== null && captchaChallengeId.length === 0) {
    errors.captchaChallengeId = 'required';
  }

  if (captchaAnswer !== null && captchaAnswer.trim().length === 0) {
    errors.captchaAnswer = 'required';
  }

  if (captchaChallengeId !== null && captchaChallengeId.length > 200) {
    errors.captchaChallengeId = 'too_long';
  }

  if (captchaChallengeId !== null && CONTROL_CHARACTER_PATTERN.test(captchaChallengeId)) {
    errors.captchaChallengeId = 'control_characters';
  }

  if (captchaAnswer !== null && captchaAnswer.trim().length > 32) {
    errors.captchaAnswer = 'too_long';
  }

  if (captchaAnswer !== null && CONTROL_CHARACTER_PATTERN.test(captchaAnswer)) {
    errors.captchaAnswer = 'control_characters';
  }

  if (
    captchaChallengeId !== null &&
    captchaAnswer !== null &&
    captchaChallengeId.length > 0 &&
    captchaAnswer.trim().length > 0 &&
    errors.captchaChallengeId === undefined &&
    errors.captchaAnswer === undefined
  ) {
    captcha = {
      answer: captchaAnswer,
      challengeId: captchaChallengeId
    };
  }

  if (sourceValue === 'reservation' || sourceValue === 'home') {
    guestEmail = validateEmail(payload, errors);
    preferredContactMethod = validatePreferredContactMethod(payload, errors);
    preferredContactValue = validatePreferredContactValue(
      preferredContactMethod,
      getPreferredContactValue(payload, errors),
      errors
    );

    if (hasOwn(payload, 'guestPhone')) {
      errors.guestPhone = 'not_allowed';
    }
  }

  if (sourceValue === 'reservation') {
    adults = validateIntegerField(payload, 'adults', 1, 10, errors);
    children = validateIntegerField(payload, 'children', 0, 10, errors);
  } else if (sourceValue === 'home') {
    if (hasOwn(payload, 'adults')) {
      errors.adults = 'not_allowed';
    }
    if (hasOwn(payload, 'children')) {
      errors.children = 'not_allowed';
    }

  }

  if (Object.keys(errors).length > 0) {
    return {fields: errors, kind: 'validation_failed', ok: false};
  }

  if (
    sourceValue === null ||
    localeValue === null ||
    guestName === null ||
    apartmentSlug === null ||
    checkIn === null ||
    checkOut === null
  ) {
    return {fields: {request: 'invalid'}, kind: 'validation_failed', ok: false};
  }

  if (sourceValue === 'reservation' && (adults === null || children === null)) {
    return {fields: {request: 'invalid'}, kind: 'validation_failed', ok: false};
  }

  if (
    (sourceValue === 'reservation' || sourceValue === 'home') &&
    (guestEmail === null ||
      preferredContactMethod === null ||
      preferredContactMethod === undefined ||
      preferredContactValue === undefined)
  ) {
    return {fields: {request: 'invalid'}, kind: 'validation_failed', ok: false};
  }

  if (captcha === undefined) {
    return {fields: {request: 'invalid'}, kind: 'validation_failed', ok: false};
  }

  const base = {
    apartmentSlug,
    checkIn,
    checkOut,
    guestName,
    locale: localeValue as 'ru' | 'en'
  };

  return sourceValue === 'reservation'
    ? {
      ok: true,
      request: createBookingRequestDraft({
          ...base,
          adults: adults as number,
          children: children as number,
          guestEmail: guestEmail as string,
          preferredContactMethod: preferredContactMethod as PreferredContactMethod,
          preferredContactValue,
          source: 'reservation'
        }),
        captcha
      }
    : {
      captcha,
        ok: true,
      request: createBookingRequestDraft({
        ...base,
        guestEmail: guestEmail as string,
        preferredContactMethod: preferredContactMethod as PreferredContactMethod,
        preferredContactValue,
        source: 'home'
      })
      };
}
