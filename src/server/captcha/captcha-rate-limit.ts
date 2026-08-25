import 'server-only';

import {getRateLimitSecret} from '@/server/booking/booking-origin';
import {getBookingRateLimitKey, FixedWindowRateLimiter} from '@/server/booking/booking-rate-limit';

export const CAPTCHA_BURST_LIMIT = 5;
export const CAPTCHA_BURST_WINDOW_MS = 10_000;
export const CAPTCHA_SUSTAINED_LIMIT = 30;
export const CAPTCHA_SUSTAINED_WINDOW_MS = 60_000;

const burstLimiter = new FixedWindowRateLimiter();
const sustainedLimiter = new FixedWindowRateLimiter();

export function consumeCaptchaRateLimit(request: Request): {
  readonly allowed: boolean;
  readonly configured: boolean;
  readonly retryAfterSeconds?: number;
} {
  const rateLimitSecret = getRateLimitSecret();

  if (rateLimitSecret === null) {
    return {allowed: false, configured: false};
  }

  const key = getBookingRateLimitKey(
    request,
    process.env.BOOKING_TRUST_PROXY?.trim().toLowerCase() === 'true',
    rateLimitSecret
  );
  const burst = burstLimiter.consume(key, CAPTCHA_BURST_LIMIT, CAPTCHA_BURST_WINDOW_MS);

  if (!burst.allowed) {
    return {...burst, configured: true};
  }

  return {
    ...sustainedLimiter.consume(key, CAPTCHA_SUSTAINED_LIMIT, CAPTCHA_SUSTAINED_WINDOW_MS),
    configured: true
  };
}
