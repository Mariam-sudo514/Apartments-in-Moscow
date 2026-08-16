import {fileURLToPath} from 'node:url';

import {defineConfig} from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src/', import.meta.url)),
      'server-only': fileURLToPath(new URL('./tests/stubs/server-only.ts', import.meta.url))
    }
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      all: false,
      include: [
        'src/config/legacy-redirects.ts',
        'src/data/apartments/apartment-queries.ts',
        'src/lib/booking/booking-payload.ts',
        'src/lib/booking/booking-validation.ts',
        'src/lib/reservation/calendar.ts',
        'src/lib/reservation/plural.ts',
        'src/server/booking/booking-body.ts',
        'src/server/booking/booking-origin.ts',
        'src/server/booking/booking-quote.ts',
        'src/server/booking/booking-rate-limit.ts',
        'src/server/booking/booking-validation.ts',
        'src/server/mail/booking-email.ts',
        'src/server/mail/mail-config.ts',
        'src/app/robots.ts',
        'src/app/sitemap.ts'
      ],
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: './coverage',
      thresholds: {
        branches: 80,
        functions: 85,
        lines: 85,
        statements: 85
      }
    }
  }
});
