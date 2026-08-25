import {beforeEach, describe, expect, it, vi} from 'vitest';

const delivery = vi.hoisted(() => ({
  deliverBookingEmail: vi.fn()
}));

import {TEST_RATE_LIMIT_SECRET} from './test-fixtures';

vi.mock('@/server/mail', () => ({
  deliverBookingEmail: delivery.deliverBookingEmail
}));

import {POST} from '@/app/api/booking/route';
import {addCalendarDays, getMoscowTodayIso} from '@/lib/reservation/calendar';
import {createCaptchaChallenge} from '@/server/captcha';

function makeRequest(
  payload: Record<string, unknown>,
  forwardedFor = '198.51.100.10'
): Request {
  return new Request('https://example.test/api/booking', {
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
      Origin: 'https://example.test',
      'Sec-Fetch-Site': 'same-origin',
      'X-Booking-Request': '1',
      'X-Forwarded-For': forwardedFor
    },
    method: 'POST'
  });
}

function reservationPayload(challenge: {readonly code: string; readonly id: string}): Record<string, unknown> {
  const checkIn = getMoscowTodayIso();

  return {
    adults: 2,
    apartmentSlug: 'dmitrovskoe-107-apt-1',
    captchaAnswer: challenge.code,
    captchaChallengeId: challenge.id,
    checkIn,
    checkOut: addCalendarDays(checkIn, 2),
    children: 1,
    guestEmail: 'test@example.com',
    guestName: 'Test Guest',
    locale: 'en',
    preferredContactMethod: 'email',
    preferredContactValue: null,
    source: 'reservation',
    website: ''
  };
}

describe('booking route CAPTCHA integration', () => {
  beforeEach(() => {
    vi.stubEnv('BOOKING_ALLOWED_ORIGINS', 'https://example.test');
    vi.stubEnv('BOOKING_RATE_LIMIT_SECRET', TEST_RATE_LIMIT_SECRET);
    vi.stubEnv('BOOKING_TRUST_PROXY', 'true');
    delivery.deliverBookingEmail.mockReset();
    delivery.deliverBookingEmail.mockResolvedValue({kind: 'accepted'});
  });

  it('fails closed with SERVER_MISCONFIGURED when production has no rate-limit secret', async () => {
    vi.unstubAllEnvs();
    vi.stubEnv('BOOKING_ALLOWED_ORIGINS', 'https://example.test');
    vi.stubEnv('BOOKING_TRUST_PROXY', 'false');
    vi.stubEnv('NODE_ENV', 'production');

    const response = await POST(makeRequest({}));
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body).toMatchObject({ok: false, error: {code: 'SERVER_MISCONFIGURED'}});
    expect(delivery.deliverBookingEmail).not.toHaveBeenCalled();
  });

  it('fails closed with SERVER_MISCONFIGURED when production has an invalid rate-limit secret', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('BOOKING_RATE_LIMIT_SECRET', 'not-a-valid-64-hex-key');

    const response = await POST(makeRequest({}));
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body).toMatchObject({ok: false, error: {code: 'SERVER_MISCONFIGURED'}});
    expect(delivery.deliverBookingEmail).not.toHaveBeenCalled();
  });

  it('does not deliver mail when Reservation CAPTCHA is invalid', async () => {
    const challenge = createCaptchaChallenge({code: 'AB234'});
    const response = await POST(makeRequest({
      ...reservationPayload(challenge),
      captchaAnswer: 'WRONG'
    }));
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body).toMatchObject({ok: false, error: {code: 'CAPTCHA_INVALID'}});
    expect(delivery.deliverBookingEmail).not.toHaveBeenCalled();
  });

  it('delivers a valid Reservation once and rejects replay', async () => {
    const challenge = createCaptchaChallenge({code: 'CD567'});
    const payload = reservationPayload(challenge);

    const firstResponse = await POST(makeRequest(payload));
    const replayResponse = await POST(makeRequest(payload));
    const firstBody = await firstResponse.json();
    const replayBody = await replayResponse.json();

    expect(firstResponse.status).toBe(200);
    expect(firstBody).toMatchObject({ok: true, code: 'BOOKING_REQUEST_ACCEPTED'});
    expect(replayResponse.status).toBe(422);
    expect(replayBody).toMatchObject({ok: false, error: {code: 'CAPTCHA_INVALID'}});
    expect(delivery.deliverBookingEmail).toHaveBeenCalledTimes(1);
  });

  it('atomically rejects a concurrent double-submit after the first challenge use', async () => {
    const challenge = createCaptchaChallenge({code: 'EF789'});
    const payload = reservationPayload(challenge);
    const [firstResponse, secondResponse] = await Promise.all([
      POST(makeRequest(payload, '198.51.100.15')),
      POST(makeRequest(payload, '198.51.100.15'))
    ]);
    const statuses = [firstResponse.status, secondResponse.status].sort((a, b) => a - b);

    expect(statuses).toEqual([200, 422]);
    expect(delivery.deliverBookingEmail).toHaveBeenCalledTimes(1);
  });

  it('rejects unsupported, malformed and oversized requests before CAPTCHA or delivery', async () => {
    const unsupported = new Request('https://example.test/api/booking', {
      body: 'not-json',
      headers: {
        'Content-Type': 'text/plain',
        Origin: 'https://example.test',
        'Sec-Fetch-Site': 'same-origin',
        'X-Booking-Request': '1',
        'X-Forwarded-For': '198.51.100.20'
      },
      method: 'POST'
    });
    const malformed = new Request('https://example.test/api/booking', {
      body: '{broken',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'https://example.test',
        'Sec-Fetch-Site': 'same-origin',
        'X-Booking-Request': '1',
        'X-Forwarded-For': '198.51.100.21'
      },
      method: 'POST'
    });
    const oversized = new Request('https://example.test/api/booking', {
      body: 'x'.repeat(8 * 1024 + 1),
      headers: {
        'Content-Type': 'application/json',
        Origin: 'https://example.test',
        'Sec-Fetch-Site': 'same-origin',
        'X-Booking-Request': '1',
        'X-Forwarded-For': '198.51.100.22'
      },
      method: 'POST'
    });

    expect((await POST(unsupported)).status).toBe(415);
    expect((await POST(malformed)).status).toBe(400);
    expect((await POST(oversized)).status).toBe(413);
    expect(delivery.deliverBookingEmail).not.toHaveBeenCalled();
  });

  it('applies the short burst booking limit with Retry-After', async () => {
    const requests = Array.from({length: 4}, () => (
      new Request('https://example.test/api/booking', {
        body: 'not-json',
        headers: {
          'Content-Type': 'text/plain',
          Origin: 'https://example.test',
          'Sec-Fetch-Site': 'same-origin',
          'X-Booking-Request': '1',
          'X-Forwarded-For': '198.51.100.30'
        },
        method: 'POST'
      })
    ));

    expect((await POST(requests[0]!)).status).toBe(415);
    expect((await POST(requests[1]!)).status).toBe(415);
    expect((await POST(requests[2]!)).status).toBe(415);
    const limited = await POST(requests[3]!);

    expect(limited.status).toBe(429);
    expect(limited.headers.get('retry-after')).toMatch(/^\d+$/u);
  });
});
