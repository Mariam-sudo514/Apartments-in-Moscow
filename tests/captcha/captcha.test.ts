import {describe, expect, it} from 'vitest';

import {
  CAPTCHA_MAX_ATTEMPTS,
  CAPTCHA_TTL_MS,
  createCaptchaChallenge,
  invalidateCaptchaChallenge,
  renderCaptchaSvg,
  verifyCaptchaChallenge
} from '@/server/captcha';

describe('local CAPTCHA challenge store', () => {
  it('accepts a challenge once and does not expose its answer in the SVG metadata', () => {
    const challenge = createCaptchaChallenge({code: 'AB234', now: 10_000});
    const svg = renderCaptchaSvg(challenge.code);

    expect(svg).toContain('AB234');
    expect(svg).not.toContain('aria-label');
    expect(verifyCaptchaChallenge(challenge.id, 'ab234', 10_001)).toEqual({ok: true});
    expect(verifyCaptchaChallenge(challenge.id, 'AB234', 10_002)).toEqual({
      ok: false,
      reason: 'invalid'
    });
  });

  it('expires, invalidates and limits challenges', () => {
    const expired = createCaptchaChallenge({code: 'CD567', now: 20_000});
    expect(verifyCaptchaChallenge(expired.id, 'CD567', 20_000 + CAPTCHA_TTL_MS)).toEqual({
      ok: false,
      reason: 'expired'
    });

    const invalidated = createCaptchaChallenge({code: 'EF789', now: 30_000});
    invalidateCaptchaChallenge(invalidated.id);
    expect(verifyCaptchaChallenge(invalidated.id, 'EF789', 30_001)).toEqual({
      ok: false,
      reason: 'invalid'
    });

    const limited = createCaptchaChallenge({code: 'GH234', now: 40_000});
    for (let attempt = 1; attempt < CAPTCHA_MAX_ATTEMPTS; attempt += 1) {
      expect(verifyCaptchaChallenge(limited.id, 'WRONG', 40_000 + attempt)).toEqual({
        ok: false,
        reason: 'invalid'
      });
    }
    expect(verifyCaptchaChallenge(limited.id, 'WRONG', 40_010)).toEqual({
      ok: false,
      reason: 'attempts_exceeded'
    });
  });
});
