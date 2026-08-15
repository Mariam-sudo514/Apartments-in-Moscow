import type {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

import {legacyRedirects} from './src/config/legacy-redirects';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  output: 'standalone',
  redirects: async () =>
    legacyRedirects.map(({destination, source}) => ({
      destination,
      permanent: true,
      source
    }))
};

export default withNextIntl(nextConfig);
