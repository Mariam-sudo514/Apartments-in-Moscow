import {createHmac} from 'node:crypto';

import {describe, expect, it} from 'vitest';

import {
  BOOKING_BODY_LIMIT_BYTES,
  BookingBodyTooLargeError,
  BookingInvalidJsonError,
  FixedWindowRateLimiter,
  getBookingRateLimitKey,
  getBookingServerConfig,
  getRateLimitSecret,
  isBookingRequestAllowed,
  isJsonContentType,
  RATE_LIMIT_MAX_ENTRIES,
  readJsonBody
} from '@/server/booking';
import {TEST_RATE_LIMIT_SECRET} from './test-fixtures';

function getConfig(environment: Record<string, string | undefined>) {
  const result = getBookingServerConfig({
    BOOKING_RATE_LIMIT_SECRET: TEST_RATE_LIMIT_SECRET,
    ...environment
  });

  expect(result.ok).toBe(true);

  if (!result.ok) {
    throw new Error('Expected a valid booking configuration');
  }

  return result.config;
}

function request(headers: HeadersInit = {}): Request {
  return new Request('https://example.test/api/booking', {headers, method: 'POST'});
}

describe('booking request security helpers', () => {
  it('accepts only exact configured origins and safe origin configuration', () => {
    const config = getConfig({BOOKING_ALLOWED_ORIGINS: 'https://example.test'});

    expect(isBookingRequestAllowed(request({
      origin: 'https://example.test',
      'sec-fetch-site': 'same-origin',
      'x-booking-request': '1'
    }), config)).toBe(true);
    expect(isBookingRequestAllowed(request({
      origin: 'https://evil.test',
      'x-booking-request': '1'
    }), config)).toBe(false);
    expect(isBookingRequestAllowed(request({
      origin: 'https://example.test/',
      'x-booking-request': '1'
    }), config)).toBe(false);

    for (const value of [
      '',
      'https://example.test/path',
      'https://*.example.test',
      'https://u:p@example.test',
      'https://example.test/path',
      'https://example.test/?query=1',
      'https://example.test/#hash'
    ]) {
      expect(getBookingServerConfig({BOOKING_ALLOWED_ORIGINS: value}).ok).toBe(false);
    }
    expect(getBookingServerConfig({
      BOOKING_ALLOWED_ORIGINS: 'https://example.test,https://example.test',
      BOOKING_RATE_LIMIT_SECRET: TEST_RATE_LIMIT_SECRET,
      BOOKING_RATE_LIMIT_MAX: '10',
      BOOKING_RATE_LIMIT_WINDOW_MS: '1000',
      BOOKING_TRUST_PROXY: 'true'
    })).toMatchObject({ok: true});
    expect(getBookingServerConfig({
      BOOKING_ALLOWED_ORIGINS: 'https://example.test',
      NODE_ENV: 'production'
    }).ok).toBe(false);
    expect(getBookingServerConfig({
      BOOKING_ALLOWED_ORIGINS: 'https://example.test',
      BOOKING_RATE_LIMIT_SECRET: TEST_RATE_LIMIT_SECRET,
      NODE_ENV: 'production'
    }).ok).toBe(true);
    expect(getBookingServerConfig({BOOKING_ALLOWED_ORIGINS: 'https://example.test', BOOKING_RATE_LIMIT_MAX: '0'}).ok).toBe(false);
    expect(getBookingServerConfig({BOOKING_ALLOWED_ORIGINS: 'https://example.test', BOOKING_RATE_LIMIT_WINDOW_MS: 'not-a-number'}).ok).toBe(false);
    expect(getBookingServerConfig({BOOKING_ALLOWED_ORIGINS: 'https://example.test', BOOKING_TRUST_PROXY: 'yes'}).ok).toBe(false);
  });

  it('requires an exact 64-hex secret outside the test runtime', () => {
    expect(getRateLimitSecret({NODE_ENV: 'development'})).toBeNull();
    expect(getRateLimitSecret({
      BOOKING_RATE_LIMIT_SECRET: 'a'.repeat(63),
      NODE_ENV: 'production'
    })).toBeNull();
    expect(getRateLimitSecret({
      BOOKING_RATE_LIMIT_SECRET: 'not-a-secret',
      NODE_ENV: 'production'
    })).toBeNull();
    expect(getRateLimitSecret({
      BOOKING_RATE_LIMIT_SECRET: `${'a'.repeat(64)} `,
      NODE_ENV: 'production'
    })).toBeNull();

    const testSecret = getRateLimitSecret({NODE_ENV: 'test'});

    expect(testSecret).toMatch(/^[a-f0-9]{64}$/u);
    expect(getRateLimitSecret({NODE_ENV: 'test'})).toBe(testSecret);
  });

  it('requires the booking header, same-origin Fetch Metadata and strict Referer fallback', () => {
    const config = getConfig({BOOKING_ALLOWED_ORIGINS: 'https://example.test'});

    expect(isBookingRequestAllowed(request({origin: 'https://example.test'}), config)).toBe(false);
    expect(isBookingRequestAllowed(request({
      origin: 'https://example.test',
      'sec-fetch-site': 'cross-site',
      'x-booking-request': '1'
    }), config)).toBe(false);
    expect(isBookingRequestAllowed(request({
      referer: 'https://example.test/reservation?step=1',
      'x-booking-request': '1'
    }), config)).toBe(true);
    expect(isBookingRequestAllowed(request({
      referer: 'https://evil.test/reservation',
      'x-booking-request': '1'
    }), config)).toBe(false);
    expect(isBookingRequestAllowed(request({
      origin: 'null',
      'x-booking-request': '1'
    }), config)).toBe(false);
    expect(isBookingRequestAllowed(request({
      origin: 'not a url',
      'x-booking-request': '1'
    }), config)).toBe(false);
    expect(isBookingRequestAllowed(request({
      referer: 'https://u:p@example.test/path',
      'x-booking-request': '1'
    }), config)).toBe(false);
  });

  it('parses only supported JSON content types and enforces the 8 KiB body boundary', async () => {
    expect(isJsonContentType('application/json')).toBe(true);
    expect(isJsonContentType('application/json; charset=utf-8')).toBe(true);
    expect(isJsonContentType('text/plain')).toBe(false);
    expect(isJsonContentType('application/json; charset=iso-8859-1')).toBe(false);

    const boundary = `${' '.repeat(BOOKING_BODY_LIMIT_BYTES - 2)}{}`;
    await expect(readJsonBody(new Request('https://example.test', {
      body: boundary,
      headers: {'content-type': 'application/json'},
      method: 'POST'
    }))).resolves.toEqual({});

    await expect(readJsonBody(new Request('https://example.test', {
      body: `${boundary} `,
      headers: {'content-type': 'application/json'},
      method: 'POST'
    }))).rejects.toBeInstanceOf(BookingBodyTooLargeError);
    await expect(readJsonBody(new Request('https://example.test', {
      body: '{}',
      headers: {'content-length': String(BOOKING_BODY_LIMIT_BYTES + 1)},
      method: 'POST'
    }))).rejects.toBeInstanceOf(BookingBodyTooLargeError);
    await expect(readJsonBody(new Request('https://example.test', {method: 'POST'}))).rejects.toBeInstanceOf(BookingInvalidJsonError);
  });

  it('rejects empty and malformed JSON bodies without network access', async () => {
    await expect(readJsonBody(new Request('https://example.test', {
      body: '',
      method: 'POST'
    }))).rejects.toBeInstanceOf(BookingInvalidJsonError);
    const invalidUtf8 = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array([0xff]));
        controller.close();
      }
    });
    await expect(readJsonBody(new Request('https://example.test', {
      body: invalidUtf8,
      duplex: 'half',
      method: 'POST'
    } as RequestInit & {duplex: 'half'}))).rejects.toBeInstanceOf(BookingInvalidJsonError);
    await expect(readJsonBody(new Request('https://example.test', {
      body: '{broken',
      method: 'POST'
    }))).rejects.toBeInstanceOf(BookingInvalidJsonError);
  });

  it('resets a fixed-window limiter deterministically and keys trusted proxy addresses', () => {
    let now = 1_000;
    const limiter = new FixedWindowRateLimiter(() => now);

    expect(limiter.consume('client', 2, 1_000)).toEqual({allowed: true});
    expect(limiter.consume('client', 2, 1_000)).toEqual({allowed: true});
    expect(limiter.consume('client', 2, 1_000)).toMatchObject({allowed: false});
    now = 2_000;
    expect(limiter.consume('client', 2, 1_000)).toEqual({allowed: true});
    expect(limiter.size()).toBe(1);
    const hashedKey = getBookingRateLimitKey(new Request('https://example.test', {
      headers: {'x-forwarded-for': '203.0.113.10, 10.0.0.1'}
    }), true, TEST_RATE_LIMIT_SECRET);
    const expectedHmac = createHmac('sha256', TEST_RATE_LIMIT_SECRET)
      .update('203.0.113.10', 'utf8')
      .digest('hex');

    expect(hashedKey).toBe(`forwarded:${expectedHmac}`);
    expect(hashedKey).toMatch(/^forwarded:[a-f0-9]{64}$/u);
    expect(hashedKey).not.toContain('203.0.113.10');
    expect(getBookingRateLimitKey(request(), false, null)).toBe('single-process-fallback');
    expect(getBookingRateLimitKey(new Request('https://example.test', {
      headers: {'x-forwarded-for': '   '}
    }), true, TEST_RATE_LIMIT_SECRET)).toBe('forwarded:unknown');
    expect(getBookingRateLimitKey(new Request('https://example.test', {
      headers: {'x-forwarded-for': 'x'.repeat(129)}
    }), true, TEST_RATE_LIMIT_SECRET)).toBe('forwarded:unknown');

    const untrustedHeaders = (address: string) => new Request('https://example.test', {
      headers: {'x-forwarded-for': address}
    });
    expect(getBookingRateLimitKey(untrustedHeaders('203.0.113.10'), false, null))
      .toBe(getBookingRateLimitKey(untrustedHeaders('203.0.113.11'), false, null));

    const bounded = new FixedWindowRateLimiter(() => now);

    for (let index = 0; index < 10_001; index += 1) {
      bounded.consume(`client-${index}`, 1, 1_000);
    }

    expect(bounded.size()).toBeLessThanOrEqual(RATE_LIMIT_MAX_ENTRIES);
  });
});
