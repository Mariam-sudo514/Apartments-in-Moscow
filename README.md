# Moscow Apartments

Moscow Apartments is a Next.js foundation for the staged migration of a legacy apartment-rental website.

## Migration status

Stage 4A adds a typed apartment data foundation for all 12 legacy properties. RU/EN catalog and detail data, price modes, source provenance, map embeds, cover paths, and ordered gallery manifests are prepared in `src/data/apartments` using the shared domain types in `src/types/apartment.ts`. Stage 3 static Home sections remain implemented: the Hero, Why Choose Us feature cards, and the static Contacts teaser. Stage 2 shared responsive Header/Footer, local Montserrat/Roboto fonts, RU/EN navigation, the Footer language switch, and safe placeholder social links remain in place.

The catalog UI, detail routes, apartment slider, booking forms, and backend functionality are not implemented yet. The prepared translations and catalog/detail discrepancies require later content review. CAPTCHA, reservation widgets, email delivery, and the remaining legacy Home sections are also outside the current scope.

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
