import type {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

import {legacyRedirects} from './src/config/legacy-redirects';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  headers: async () => [
    {
      headers: [
        {key: 'X-Content-Type-Options', value: 'nosniff'},
        {key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin'},
        {key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()'},
        {key: 'X-Frame-Options', value: 'SAMEORIGIN'}
      ],
      source: '/:path*'
    }
  ],
  redirects: async () =>
    legacyRedirects.map(({destination, source}) => ({
      destination,
      permanent: true,
      source
    }))
};

export default withNextIntl(nextConfig);
