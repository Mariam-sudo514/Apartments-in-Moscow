import 'server-only';

type RateLimitEntry = {
  readonly count: number;
  readonly windowStartedAt: number;
};

export type RateLimitResult = {
  readonly allowed: boolean;
  readonly retryAfterSeconds?: number;
};

const MAX_ENTRIES = 10_000;

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
      if (this.entries.size >= MAX_ENTRIES) {
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

export function getBookingRateLimitKey(request: Request, trustProxy: boolean): string {
  if (trustProxy) {
    const forwardedFor = request.headers.get('x-forwarded-for');
    const firstForwardedAddress = forwardedFor?.split(',')[0]?.trim();

    if (firstForwardedAddress !== undefined && firstForwardedAddress.length > 0 && firstForwardedAddress.length <= 128) {
      return `forwarded:${firstForwardedAddress}`;
    }

    return 'forwarded:unknown';
  }

  return 'single-process-fallback';
}

export const bookingRateLimiter = new FixedWindowRateLimiter();
