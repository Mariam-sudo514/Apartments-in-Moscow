import createMiddleware from 'next-intl/middleware';
import type {NextRequest} from 'next/server';
import {NextResponse} from 'next/server';

import {routing} from './i18n/routing';

const handleI18nRouting = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const {pathname} = request.nextUrl;

  if (pathname === '/ru' || pathname.startsWith('/ru/')) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = pathname.replace(/^\/ru(?=\/|$)/, '') || '/';
    return NextResponse.redirect(redirectUrl, 308);
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher: ['/', '/((?!api|trpc|_next|_vercel|.*\\..*).*)']
};
