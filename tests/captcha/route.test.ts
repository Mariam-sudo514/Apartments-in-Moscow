import {describe, expect, it} from 'vitest';

import {GET} from '@/app/api/captcha/route';

describe('CAPTCHA route', () => {
  it('returns a cache-disabled local SVG and opaque challenge header', async () => {
    const response = GET(new Request('https://example.test/api/captcha'));
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('image/svg+xml');
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    expect(response.headers.get('x-captcha-challenge')).toMatch(/^[0-9a-f-]{36}$/u);
    expect(body).toContain('<svg');
    expect(body).not.toContain('application/json');
    expect(body).not.toContain('"answer"');
  });
});
