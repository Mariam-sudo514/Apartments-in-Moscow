import {beforeEach, describe, expect, it, vi} from 'vitest';

import {GET} from '@/app/api/captcha/route';

import {TEST_RATE_LIMIT_SECRET} from '../booking/test-fixtures';

beforeEach(() => {
  vi.stubEnv('NODE_ENV', 'test');
  vi.stubEnv('BOOKING_RATE_LIMIT_SECRET', TEST_RATE_LIMIT_SECRET);
});

describe('CAPTCHA route', () => {
  it('fails closed without a production rate-limit secret', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('BOOKING_RATE_LIMIT_SECRET', '');

    expect(GET(new Request('https://example.test/api/captcha')).status).toBe(503);
  });

  it('returns a cache-disabled local SVG and opaque challenge header', async () => {
    const response = GET(new Request('https://example.test/api/captcha'));
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('image/svg+xml');
    expect(response.headers.get('cache-control')).toBe('no-store, private');
    expect(response.headers.get('pragma')).toBe('no-cache');
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    expect(response.headers.get('x-captcha-challenge')).toMatch(/^[0-9a-f-]{36}$/u);
    expect(body).toContain('<svg');
    expect(body).not.toContain('application/json');
    expect(body).not.toContain('"answer"');
    expect(body).not.toContain('<text');
  });

  it('rate-limits CAPTCHA issuance with Retry-After', () => {
    vi.stubEnv('BOOKING_TRUST_PROXY', 'true');
    const headers = {'X-Forwarded-For': '198.51.100.40'};

    for (let index = 0; index < 5; index += 1) {
      expect(GET(new Request('https://example.test/api/captcha', {headers})).status).toBe(200);
    }

    const limited = GET(new Request('https://example.test/api/captcha', {headers}));

    expect(limited.status).toBe(429);
    expect(limited.headers.get('retry-after')).toMatch(/^\d+$/u);
  });
});
