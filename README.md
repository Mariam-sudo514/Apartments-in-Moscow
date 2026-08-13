# Moscow Apartments

Moscow Apartments is a Next.js foundation for the staged migration of a legacy apartment-rental website. This repository currently contains only the technical scaffold for localized routing and future migration work.

## Migration status

Stage 1 is complete: the App Router foundation, strict TypeScript configuration, localized routing, minimal technical pages, and a health endpoint are in place. Legacy UI, content, images, booking functionality, CAPTCHA, and styles have not been migrated yet.

## Technology stack

- Next.js 16
- React 19
- TypeScript with strict checks
- `next-intl` for locale-aware routing and server-side messages
- ESLint
- npm

## Prerequisites

- Node.js 20.9 or newer
- npm 10 or newer

## Installation

```bash
npm install
```

Copy `.env.example` to `.env.local` when a local public site URL is needed. The current example contains no credentials or mail configuration.

## Development

```bash
npm run dev
```

The development server runs at `http://localhost:3000` by default.

## Build and verification

```bash
npm run lint
npm run typecheck
npm run build
npm run verify
```

## Scaffold routes

Russian is the default locale and does not use a URL prefix:

- `/`
- `/apartments`
- `/contacts`
- `/reservation`

English uses the `/en` prefix:

- `/en`
- `/en/apartments`
- `/en/contacts`
- `/en/reservation`

The health endpoint is available at `/api/health` and is independent of locale routing.

## Future work

The next stages will migrate the existing visual system and content using CSS Modules and shared components. Booking, CAPTCHA, Docker, and Mailpit will be added later with separate validation and security review.
