import {describe, expect, it} from 'vitest';

import {
  CAPTCHA_MAX_ATTEMPTS,
  CAPTCHA_TTL_MS,
  createCaptchaChallenge,
  getCaptchaStoreSize,
  invalidateCaptchaChallenge,
  renderCaptchaSvg,
  verifyCaptchaChallenge
} from '@/server/captcha';

describe('local CAPTCHA challenge store', () => {
  it('accepts a challenge once and does not expose its answer in SVG text or metadata', () => {
    const challenge = createCaptchaChallenge({code: 'AB234', now: 10_000});
    const svg = renderCaptchaSvg(challenge.code);

    expect(svg).not.toContain('AB234');
    expect(svg).not.toContain('<text');
    expect(svg).not.toContain('aria-label');
    expect(svg).toContain('<path');
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

  it('keeps challenge answers, refreshes and attempts isolated', () => {
    const challengeA = createCaptchaChallenge({code: 'AB234', now: 50_000});
    const challengeB = createCaptchaChallenge({code: 'CD567', now: 50_000});

    expect(challengeA.id).not.toBe(challengeB.id);
    expect(verifyCaptchaChallenge(challengeA.id, 'CD567', 50_001)).toEqual({
      ok: false,
      reason: 'invalid'
    });
    expect(verifyCaptchaChallenge(challengeB.id, 'CD567', 50_002)).toEqual({ok: true});
    expect(verifyCaptchaChallenge(challengeA.id, 'AB234', 50_003)).toEqual({ok: true});
    expect(verifyCaptchaChallenge(challengeB.id, 'CD567', 50_004)).toEqual({
      ok: false,
      reason: 'invalid'
    });

    const refreshed = createCaptchaChallenge({code: 'EF789', now: 51_000});
    const unaffected = createCaptchaChallenge({code: 'GH234', now: 51_000});
    invalidateCaptchaChallenge(refreshed.id);

    expect(verifyCaptchaChallenge(refreshed.id, 'EF789', 51_001)).toEqual({
      ok: false,
      reason: 'invalid'
    });
    expect(verifyCaptchaChallenge(unaffected.id, 'GH234', 51_002)).toEqual({ok: true});

    const expiring = createCaptchaChallenge({code: 'JK567', now: 52_000});
    const stillValid = createCaptchaChallenge({code: 'LM234', now: 52_000});

    expect(verifyCaptchaChallenge(expiring.id, 'JK567', 52_000 + CAPTCHA_TTL_MS)).toEqual({
      ok: false,
      reason: 'expired'
    });
    expect(verifyCaptchaChallenge(stillValid.id, 'LM234', 52_001)).toEqual({ok: true});
  });

  it('allows at most one success when a challenge is submitted twice', () => {
    const challenge = createCaptchaChallenge({code: 'NP345', now: 60_000});
    const results = [
      verifyCaptchaChallenge(challenge.id, 'NP345', 60_001),
      verifyCaptchaChallenge(challenge.id, 'NP345', 60_001)
    ];

    expect(results.filter((result) => result.ok)).toHaveLength(1);
    expect(results.filter((result) => !result.ok)).toHaveLength(1);
    expect(verifyCaptchaChallenge(challenge.id, 'NP345', 60_002)).toEqual({
      ok: false,
      reason: 'invalid'
    });
  });

  it('keeps challenge IDs unique and the in-memory store bounded', () => {
    const ids = new Set(
      Array.from({length: 1_000}, () => createCaptchaChallenge({code: 'QR678'}).id)
    );

    expect(ids).toHaveLength(1_000);

    for (let index = 0; index < 10_000; index += 1) {
      createCaptchaChallenge({code: 'ST789', now: 100_000});
    }

    expect(getCaptchaStoreSize()).toBeLessThanOrEqual(10_000);

    const expiredAt = 100_000 + CAPTCHA_TTL_MS;
    createCaptchaChallenge({code: 'UV234', now: expiredAt});
    expect(getCaptchaStoreSize()).toBeLessThanOrEqual(10_000);
  });
});
