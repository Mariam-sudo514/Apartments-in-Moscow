import 'server-only';

export type BookingServerConfig = {
  readonly allowedOrigins: readonly string[];
  readonly rateLimitMax: number;
  readonly rateLimitWindowMs: number;
  readonly trustProxy: boolean;
};

type Environment = Readonly<Record<string, string | undefined>>;

type BookingConfigResult =
  | {readonly ok: true; readonly config: BookingServerConfig}
  | {readonly ok: false};

function parseConfiguredOrigin(value: string): string | null {
  const trimmed = value.trim();

  if (trimmed === '' || trimmed.includes('*')) {
    return null;
  }

  try {
    const parsed = new URL(trimmed);

    if (
      (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') ||
      parsed.username !== '' ||
      parsed.password !== '' ||
      parsed.pathname !== '/' ||
      parsed.search !== '' ||
      parsed.hash !== ''
    ) {
      return null;
    }

    return parsed.origin;
  } catch {
    return null;
  }
}

function parsePositiveInteger(
  value: string | undefined,
  fallback: number,
  maximum: number
): number | null {
  if (value === undefined) {
    return fallback;
  }

  if (!/^\d+$/u.test(value.trim())) {
    return null;
  }

  const parsed = Number(value);

  return Number.isSafeInteger(parsed) && parsed > 0 && parsed <= maximum
    ? parsed
    : null;
}

function parseTrustProxy(value: string | undefined): boolean | null {
  if (value === undefined || value.trim().toLowerCase() === 'false') {
    return false;
  }

  if (value.trim().toLowerCase() === 'true') {
    return true;
  }

  return null;
}

export function getBookingServerConfig(
  environment: Environment = process.env
): BookingConfigResult {
  const rawOrigins = environment.BOOKING_ALLOWED_ORIGINS;

  if (rawOrigins === undefined || rawOrigins.trim() === '') {
    return {ok: false};
  }

  const origins = rawOrigins.split(',').map(parseConfiguredOrigin);

  if (origins.some((origin) => origin === null)) {
    return {ok: false};
  }

  const rateLimitMax = parsePositiveInteger(
    environment.BOOKING_RATE_LIMIT_MAX,
    5,
    1000
  );
  const rateLimitWindowMs = parsePositiveInteger(
    environment.BOOKING_RATE_LIMIT_WINDOW_MS,
    60_000,
    86_400_000
  );
  const trustProxy = parseTrustProxy(environment.BOOKING_TRUST_PROXY);

  if (rateLimitMax === null || rateLimitWindowMs === null || trustProxy === null) {
    return {ok: false};
  }

  return {
    config: {
      allowedOrigins: [...new Set(origins as string[])],
      rateLimitMax,
      rateLimitWindowMs,
      trustProxy
    },
    ok: true
  };
}

function getOriginFromReferer(value: string): string | null {
  try {
    const parsed = new URL(value);

    if (
      (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') ||
      parsed.username !== '' ||
      parsed.password !== ''
    ) {
      return null;
    }

    return parsed.origin;
  } catch {
    return null;
  }
}

export function isBookingRequestAllowed(
  request: Request,
  config: BookingServerConfig
): boolean {
  if (request.headers.get('x-booking-request') !== '1') {
    return false;
  }

  const fetchSite = request.headers.get('sec-fetch-site');

  if (fetchSite !== null && fetchSite.trim().toLowerCase() !== 'same-origin') {
    return false;
  }

  const allowedOrigins = new Set(config.allowedOrigins);
  const originHeader = request.headers.get('origin');

  if (originHeader !== null) {
    if (originHeader.trim().toLowerCase() === 'null') {
      return false;
    }

    const origin = getOriginFromReferer(originHeader);
    return origin !== null && allowedOrigins.has(origin) && originHeader === origin;
  }

  const referer = request.headers.get('referer');
  const refererOrigin = referer === null ? null : getOriginFromReferer(referer);

  return refererOrigin !== null && allowedOrigins.has(refererOrigin);
}
