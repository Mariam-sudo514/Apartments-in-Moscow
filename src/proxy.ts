import createMiddleware from 'next-intl/middleware';
import type {NextRequest} from 'next/server';
import {NextResponse} from 'next/server';

import {routing} from './i18n/routing';

const handleI18nRouting = createMiddleware(routing);

function getUnprefixedPathname(pathname: string): string {
  const defaultLocalePrefix = `/${routing.defaultLocale}`;

  if (pathname === defaultLocalePrefix) {
    return '/';
  }

  return pathname.startsWith(`${defaultLocalePrefix}/`)
    ? pathname.slice(defaultLocalePrefix.length)
    : pathname;
}

function getAlternateLinks(request: NextRequest): string {
  const pathname = getUnprefixedPathname(request.nextUrl.pathname);
  const ruUrl = request.nextUrl.clone();
  ruUrl.pathname = pathname;
  const enUrl = request.nextUrl.clone();
  enUrl.pathname = pathname === '/' ? '/en' : `/en${pathname}`;

  return [
    [ruUrl, 'ru'],
    [enUrl, 'en'],
    [ruUrl, 'x-default']
  ]
    .map(([url, locale]) => `<${url}>; rel="alternate"; hreflang="${locale}"`)
    .join(', ');
}

export default function proxy(request: NextRequest) {
  // next-intl marks its internal locale rewrite so the proxy does not process it again.
  if (request.headers.has('X-NEXT-INTL-LOCALE')) {
    const response = NextResponse.next();
    response.headers.set('Link', getAlternateLinks(request));
    return response;
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher: ['/', '/((?!api|trpc|_next|_vercel|.*\\..*).*)']
};
