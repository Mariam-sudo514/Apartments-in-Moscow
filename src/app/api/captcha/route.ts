import {
  createCaptchaChallenge,
  invalidateCaptchaChallenge,
  renderCaptchaSvg
} from '@/server/captcha';
import {
  consumeCaptchaRateLimit
} from '@/server/captcha/captcha-rate-limit';

export const runtime = 'nodejs';

export function GET(request: Request): Response {
  const rateLimit = consumeCaptchaRateLimit(request);

  if (!rateLimit.configured) {
    return new Response(null, {
      headers: {
        'Cache-Control': 'no-store, private',
        'Pragma': 'no-cache',
        'X-Content-Type-Options': 'nosniff'
      },
      status: 503
    });
  }

  if (!rateLimit.allowed) {
    return new Response(null, {
      headers: {
        'Cache-Control': 'no-store, private',
        'Pragma': 'no-cache',
        'Retry-After': String(rateLimit.retryAfterSeconds ?? 1),
        'X-Content-Type-Options': 'nosniff'
      },
      status: 429
    });
  }

  const previous = new URL(request.url).searchParams.get('previous');
  invalidateCaptchaChallenge(previous);

  const challenge = createCaptchaChallenge();

  return new Response(renderCaptchaSvg(challenge.code), {
    headers: {
      'Cache-Control': 'no-store, private',
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'X-Captcha-Challenge': challenge.id,
      'X-Content-Type-Options': 'nosniff',
      'Pragma': 'no-cache'
    },
    status: 200
  });
}

function methodNotAllowed(): Response {
  return new Response(null, {
    headers: {Allow: 'GET'},
    status: 405
  });
}

export const HEAD = methodNotAllowed;
export const POST = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
export const OPTIONS = methodNotAllowed;
