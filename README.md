# Moscow Apartments

Moscow Apartments is a Next.js foundation for the staged migration of a legacy apartment-rental website. This repository currently contains only the technical scaffold for localized routing and future migration work.

## Migration status

Stage 2 is complete: a shared responsive Header and Footer, local Montserrat/Roboto fonts, RU/EN navigation, a Footer language switch, and placeholder social links are in place. Legacy page UI, content, apartment data, images, booking functionality, CAPTCHA, and styles have not been migrated yet.

## Technology stack

- Next.js 16
- React 19
- TypeScript with strict checks
- `next-intl` for locale-aware routing and server-side messages
- `react-icons` for shared social and menu icons
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

The shared Header and Footer use the existing responsive contract, including the 900px mobile menu breakpoint, the 950px Footer navigation breakpoint, and the 450px Footer stacking breakpoint. Montserrat and Roboto are loaded from local variable font files. The Footer language switch keeps the current route, query parameters, and hash while using RU/EN placeholder routing. Social links intentionally use safe `example.com` and `hello@example.com` placeholders.

## Future work

The next stages will migrate the existing visual system and content using CSS Modules and shared components. Booking, CAPTCHA, Docker, and Mailpit will be added later with separate validation and security review.
