import 'server-only';

import {randomInt, randomUUID, timingSafeEqual} from 'node:crypto';

const CAPTCHA_CHARACTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CAPTCHA_LENGTH = 5;
export const CAPTCHA_TTL_MS = 5 * 60 * 1000;
export const CAPTCHA_MAX_ATTEMPTS = 5;

type CaptchaChallenge = {
  readonly answer: string;
  readonly attempts: number;
  readonly createdAt: number;
};

type CaptchaChallengeOptions = {
  readonly code?: string;
  readonly now?: number;
};

export type CaptchaVerificationResult =
  | {readonly ok: true}
  | {
      readonly ok: false;
      readonly reason: 'expired' | 'invalid' | 'missing' | 'attempts_exceeded';
    };

const challenges = new Map<string, CaptchaChallenge>();

function createCode(): string {
  return Array.from({length: CAPTCHA_LENGTH}, () => (
    CAPTCHA_CHARACTERS[randomInt(CAPTCHA_CHARACTERS.length)]
  )).join('');
}

function normalizeAnswer(value: string): string {
  return value.trim().toUpperCase();
}

function isExpired(challenge: CaptchaChallenge, now: number): boolean {
  return now - challenge.createdAt >= CAPTCHA_TTL_MS;
}

function cleanupExpired(now: number): void {
  for (const [id, challenge] of challenges) {
    if (isExpired(challenge, now)) {
      challenges.delete(id);
    }
  }
}

export function createCaptchaChallenge(options: CaptchaChallengeOptions = {}): {
  readonly id: string;
  readonly code: string;
} {
  const now = options.now ?? Date.now();
  const code = normalizeAnswer(options.code ?? createCode());

  cleanupExpired(now);

  if (!/^[A-Z2-9]{5}$/u.test(code)) {
    throw new Error('Captcha code must contain five supported characters.');
  }

  const id = randomUUID();
  challenges.set(id, {answer: code, attempts: 0, createdAt: now});

  return {code, id};
}

export function invalidateCaptchaChallenge(id: string | null | undefined): void {
  if (id !== undefined && id !== null && id !== '') {
    challenges.delete(id);
  }
}

export function verifyCaptchaChallenge(
  id: string,
  answer: string,
  now: number = Date.now()
): CaptchaVerificationResult {
  if (id === '' || answer.trim() === '') {
    return {ok: false, reason: 'missing'};
  }

  const challenge = challenges.get(id);

  if (challenge !== undefined && isExpired(challenge, now)) {
    challenges.delete(id);
    return {ok: false, reason: 'expired'};
  }

  cleanupExpired(now);

  if (challenge === undefined) {
    return {ok: false, reason: 'invalid'};
  }

  const candidate = Buffer.from(normalizeAnswer(answer), 'utf8');
  const expected = Buffer.from(challenge.answer, 'utf8');
  const matches = candidate.length === expected.length && timingSafeEqual(candidate, expected);

  if (matches) {
    challenges.delete(id);
    return {ok: true};
  }

  const attempts = challenge.attempts + 1;

  if (attempts >= CAPTCHA_MAX_ATTEMPTS) {
    challenges.delete(id);
    return {ok: false, reason: 'attempts_exceeded'};
  }

  challenges.set(id, {...challenge, attempts});
  return {ok: false, reason: 'invalid'};
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export function renderCaptchaSvg(code: string): string {
  const safeCode = escapeXml(normalizeAnswer(code));

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40" viewBox="0 0 120 40" role="img">
  <rect width="120" height="40" rx="4" fill="#dcdcdc"/>
  <path d="M5 10L115 30M3 30L110 7M25 4L95 36" stroke="#999" stroke-width="1" opacity=".65"/>
  <text x="60" y="27" fill="#191919" font-family="monospace" font-size="20" font-weight="700" letter-spacing="3" text-anchor="middle">${safeCode}</text>
</svg>`;
}
