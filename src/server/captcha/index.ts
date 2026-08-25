import 'server-only';

import {createHash, randomInt, randomUUID, timingSafeEqual} from 'node:crypto';

const CAPTCHA_CHARACTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CAPTCHA_LENGTH = 5;
export const CAPTCHA_TTL_MS = 5 * 60 * 1000;
export const CAPTCHA_MAX_ATTEMPTS = 5;
export const CAPTCHA_MAX_CHALLENGES = 10_000;

const CAPTCHA_GLYPHS: Readonly<Record<string, readonly string[]>> = {
  '2': ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#####'],
  '3': ['####.', '....#', '..##.', '....#', '#...#', '#...#', '.###.'],
  '4': ['#..#.', '#..#.', '#..#.', '#####', '...#.', '...#.', '...#.'],
  '5': ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.'],
  '6': ['.###.', '#....', '#....', '####.', '#...#', '#...#', '.###.'],
  '7': ['#####', '....#', '...#.', '...#.', '..#..', '..#..', '..#..'],
  '8': ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.'],
  '9': ['.###.', '#...#', '#...#', '.####', '....#', '....#', '.###.'],
  A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  B: ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'],
  C: ['.####', '#....', '#....', '#....', '#....', '#....', '.####'],
  D: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
  E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  F: ['#####', '#....', '#....', '####.', '#....', '#....', '#....'],
  G: ['.####', '#....', '#....', '#.###', '#...#', '#...#', '.####'],
  H: ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  J: ['..###', '...#.', '...#.', '...#.', '...#.', '#..#.', '.##..'],
  K: ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#'],
  L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
  M: ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'],
  N: ['#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#', '#...#'],
  P: ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
  Q: ['.###.', '#...#', '#...#', '#...#', '#..##', '#...#', '.####'],
  R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  U: ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  V: ['#...#', '#...#', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
  W: ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '##.##', '#...#'],
  X: ['#...#', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '#...#'],
  Y: ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'],
  Z: ['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####']
};

type CaptchaChallenge = {
  readonly answerHash: string;
  readonly attempts: number;
  readonly expiresAt: number;
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

function hashAnswer(value: string): string {
  return createHash('sha256').update(normalizeAnswer(value), 'utf8').digest('hex');
}

function isExpired(challenge: CaptchaChallenge, now: number): boolean {
  return now >= challenge.expiresAt;
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

  if (challenges.size >= CAPTCHA_MAX_CHALLENGES) {
    const oldest = challenges.keys().next().value;

    if (typeof oldest === 'string') {
      challenges.delete(oldest);
    }
  }

  let id = randomUUID();

  while (challenges.has(id)) {
    id = randomUUID();
  }

  challenges.set(id, {
    answerHash: hashAnswer(code),
    attempts: 0,
    expiresAt: now + CAPTCHA_TTL_MS
  });

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

  if (challenge === undefined) {
    return {ok: false, reason: 'invalid'};
  }

  if (isExpired(challenge, now)) {
    challenges.delete(id);
    return {ok: false, reason: 'expired'};
  }

  cleanupExpired(now);

  const candidate = Buffer.from(hashAnswer(answer), 'hex');
  const expected = Buffer.from(challenge.answerHash, 'hex');
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

export function getCaptchaStoreSize(): number {
  return challenges.size;
}

export function renderCaptchaSvg(code: string): string {
  const normalizedCode = normalizeAnswer(code);

  if (!/^[A-Z2-9]{5}$/u.test(normalizedCode)) {
    throw new Error('Captcha code must contain five supported characters.');
  }

  const cellSize = 2.6;
  const glyphWidth = cellSize * 5;
  const glyphGap = 4;
  const totalWidth = glyphWidth * normalizedCode.length + glyphGap * (normalizedCode.length - 1);
  const startX = (120 - totalWidth) / 2;
  const startY = 10;
  const glyphPath = normalizedCode.split('').map((character, glyphIndex) => {
    const pattern = CAPTCHA_GLYPHS[character];

    if (pattern === undefined) {
      throw new Error('Captcha glyph is not supported.');
    }

    return pattern.flatMap((row, rowIndex) => Array.from(row).flatMap((cell, columnIndex) => {
      if (cell !== '#') {
        return [];
      }

      const x = startX + glyphIndex * (glyphWidth + glyphGap) + columnIndex * cellSize;
      const y = startY + rowIndex * cellSize;
      return `M${x.toFixed(2)} ${y.toFixed(2)}h${cellSize}v${cellSize}h-${cellSize}Z`;
    })).join('');
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40" viewBox="0 0 120 40" role="img">
  <rect width="120" height="40" rx="4" fill="#dcdcdc"/>
  <path d="M5 10L115 30M3 30L110 7M25 4L95 36" stroke="#999" stroke-width="1" opacity=".65"/>
  <path d="${glyphPath}" fill="#191919"/>
</svg>`;
}
