import 'server-only';

import {createHmac} from 'node:crypto';

type RateLimitEntry = {
  readonly count: number;
  readonly windowStartedAt: number;
};

export type RateLimitResult = {
  readonly allowed: boolean;
  readonly retryAfterSeconds?: number;
};

export const RATE_LIMIT_MAX_ENTRIES = 10_000;

export const BOOKING_BURST_LIMIT = 3;
export const BOOKING_BURST_WINDOW_MS = 10_000;

export class FixedWindowRateLimiter {
  private readonly entries = new Map<string, RateLimitEntry>();

  constructor(private readonly clock: () => number = Date.now) {}

  consume(
    key: string,
    maxRequests: number,
    windowMs: number,
    now: number = this.clock()
  ): RateLimitResult {
    this.removeExpired(now, windowMs);
    const current = this.entries.get(key);

    if (current === undefined) {
      if (this.entries.size >= RATE_LIMIT_MAX_ENTRIES) {
        return {allowed: false, retryAfterSeconds: Math.max(1, Math.ceil(windowMs / 1000))};
      }

      this.entries.set(key, {count: 1, windowStartedAt: now});
      return {allowed: true};
    }

    if (now - current.windowStartedAt >= windowMs) {
      this.entries.set(key, {count: 1, windowStartedAt: now});
      return {allowed: true};
    }

    if (current.count >= maxRequests) {
      return {
        allowed: false,
        retryAfterSeconds: Math.max(
          1,
          Math.ceil((windowMs - (now - current.windowStartedAt)) / 1000)
        )
      };
    }

    this.entries.set(key, {
      count: current.count + 1,
      windowStartedAt: current.windowStartedAt
    });
    return {allowed: true};
  }

  size(): number {
    return this.entries.size;
  }

  private removeExpired(now: number, windowMs: number): void {
    for (const [key, entry] of this.entries) {
      if (now - entry.windowStartedAt >= windowMs) {
        this.entries.delete(key);
      }
    }
  }
}

export function getBookingRateLimitKey(
  request: Request,
  trustProxy: boolean,
  rateLimitSecret: string | null
): string {
  if (trustProxy) {
    const forwardedFor = request.headers.get('x-forwarded-for');
    const firstForwardedAddress = forwardedFor?.split(',')[0]?.trim();

    if (
      rateLimitSecret !== null &&
      firstForwardedAddress !== undefined &&
      firstForwardedAddress.length > 0 &&
      firstForwardedAddress.length <= 128
    ) {
      const addressHash = createHmac('sha256', rateLimitSecret)
        .update(firstForwardedAddress, 'utf8')
        .digest('hex');

      return `forwarded:${addressHash}`;
    }

    return rateLimitSecret === null ? 'forwarded:unavailable' : 'forwarded:unknown';
  }

  return 'single-process-fallback';
}

export const bookingBurstRateLimiter = new FixedWindowRateLimiter();
export const bookingRateLimiter = new FixedWindowRateLimiter();
