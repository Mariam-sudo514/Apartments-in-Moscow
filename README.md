# Moscow Apartments

[![CI](https://github.com/Mariam-sudo514/Apartments-in-Moscow/actions/workflows/ci.yml/badge.svg)](https://github.com/Mariam-sudo514/Apartments-in-Moscow/actions/workflows/ci.yml)

Moscow Apartments is a Next.js foundation for the staged migration of a legacy apartment-rental website.

## Migration status

Stage 4A adds a typed apartment data foundation for all 12 legacy properties. RU/EN catalog and detail data, price modes, source provenance, map embeds, cover paths, and ordered gallery manifests are prepared in `src/data/apartments` using the shared domain types in `src/types/apartment.ts`. Stage 4B migrates the RU/EN apartment catalog and all 12 localized detail routes, with static slug generation, localized metadata, semantic breadcrumbs, responsive detail layouts, keyboard-accessible galleries, lazy map embeds, and the 108 source gallery images copied byte-for-byte into `public/images/apartments`. Stage 5 restores the Home apartment carousel with local `swiper@14.1.0`, 12 data-driven slides, loop, five-second autoplay, hover pause, keyboard and touch navigation, clickable dynamic pagination, and responsive 1/2/3-slide layouts. Stage 6 migrates the full RU/EN Contacts page with localized metadata, safe placeholder contact links from `src/config/social-links.ts`, and a CSS/icon visual contact panel. Stage 7A adds localized reservation date, guest, and apartment selection with a responsive keyboard-accessible calendar and preliminary client-side price calculation. Stage 7B adds localized reservation contact fields, strict client-side validation, and a typed in-memory booking request draft; the review control never sends data or creates a network request. Stage 7C and Stage 10B.2 add the Home booking workflow on `/` and `/en` with localized contact, native date, typed apartment selection, strict local validation, Moscow-date readiness, a local CAPTCHA challenge, the existing honeypot, and one main submit action. Stage 8A adds a `POST /api/booking` Route Handler with strict JSON, request-origin and Fetch Metadata checks, server-side validation, trusted typed-data quotes, an 8 KiB streaming body limit, and an in-memory fixed-window rate limiter. The Stage 7A total uses typed apartment prices but is not server-authoritative. The Contacts page uses a user-supplied replacement QR and neutral display values in place of legacy contact data. Stage 3 static Home sections remain implemented: the Hero, Why Choose Us feature cards, and the static Contacts teaser. Stage 2 shared responsive Header/Footer, local Montserrat/Roboto fonts, RU/EN navigation, the Footer language switch, and safe placeholder social links remain in place.

The prepared translations and catalog/detail discrepancies require later content review. The reservation form keeps its typed request draft in memory, while the Home form submits its validated fields through the local-only booking delivery workflow. The API repeats validation, recalculates a trusted quote, and verifies the Home CAPTCHA before handing the request to Nodemailer and Mailpit. Stage 7A and client-side form totals remain preliminary and are not server-authoritative. The local CAPTCHA uses an opaque challenge id, a short-lived in-memory store, limited attempts, and one-time successful verification. Contacts use the user-supplied replacement QR, neutral display values instead of legacy phone, email, and handle data, and safe example.com action links. The apartment gallery is implemented separately from the Home carousel.

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

## Testing

```bash
npm test
npm run test:coverage
npm run verify
```

The deterministic Node test suite covers typed apartment data and manifests, calendar and Moscow-date arithmetic, client and server booking validation, trusted quotes, request security boundaries, local mail configuration and plain-text rendering, legacy redirects, and sitemap/robots invariants. Browser end-to-end behavior remains a separate manual Stage 9B check. The CI workflow is configured but no GitHub Actions result is claimed until it has been run on GitHub.

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

Apartment detail routes use the same slug in both locales, for example:

- `/apartments/dmitrovskoe-107-apt-1`
- `/en/apartments/dmitrovskoe-107-apt-1`

The health endpoint is available at `/api/health` and is independent of locale routing.

The shared Header and Footer use the existing responsive contract, including the 900px mobile menu breakpoint, the 950px Footer navigation breakpoint, and the 450px Footer stacking breakpoint. Montserrat and Roboto are loaded from local variable font files. The Footer language switch keeps the current route, query parameters, and hash while using RU/EN placeholder routing. Social actions use safe `example.com` links and the neutral `mail@gmail.com` display placeholder.

## Booking API

The `POST /api/booking` endpoint accepts strict JSON requests up to 8 KiB, requires an exact configured origin plus the `X-Booking-Request: 1` header, validates Fetch Metadata when present, and applies a fixed-window in-memory rate limiter. The documented local defaults are five requests per 60 seconds with `BOOKING_TRUST_PROXY=false`; proxy-derived client addresses are used only when explicitly enabled. Home requests additionally require a local CAPTCHA challenge and answer; invalid, expired, repeated, or unknown challenges are rejected before delivery. Stage 8B connects Home and reservation requests to local-only Nodemailer delivery through Mailpit. The API repeats validation, recalculates a trusted quote from typed apartment data, and sends a plain-text message to the safe `landlord@example.test` placeholder. No booking data is stored, and the client-side quote remains preliminary rather than server-authoritative.

## Local booking delivery

Stage 8B uses `nodemailer@9.0.3` and Docker Compose for local delivery only. The web container uses the pinned `node:22.22.0-bookworm-slim` image and connects to the pinned `axllent/mailpit:v1.30.0` service over the internal Docker network. SMTP port `1025` is not published to the host; the Mailpit UI is available only at `http://127.0.0.1:8025`. Mail is sent from `bookings@example.test` to `landlord@example.test`, with no real recipients, credentials, or external SMTP relay.

```bash
docker compose config
docker compose build
docker compose up -d
docker compose ps
docker compose logs --no-log-prefix web
docker compose down
```

The application is available at `http://127.0.0.1:3000`, Mailpit at `http://127.0.0.1:8025`, and the health endpoint at `http://127.0.0.1:3000/api/health`. The Mailpit service has no persistent volume, so local messages are intentionally ephemeral. Production SMTP, real recipients, booking persistence, and the production booking workflow are not implemented.

## SEO and legacy URL migration

Stage 9A adds permanent `308` redirects for the published legacy `.html` URLs. Legacy pages are Russian and redirect directly to the unprefixed RU routes, preserving query parameters without creating redirect chains. The current route map is:

| Legacy URL | Next.js route |
| --- | --- |
| `/index.html` | `/` |
| `/apartaments.html` | `/apartments` |
| `/contacts.html` | `/contacts` |
| `/reservation.html` | `/reservation` |
| `/apartament780.html` | `/apartments/dmitrovskoe-107-apt-1` |
| `/apartament755.html` | `/apartments/dmitrovskoe-107-apt-2` |
| `/apartament1202.html` | `/apartments/altufyevskoe-2-apt-3` |
| `/apartament1204.html` | `/apartments/altufyevskoe-2-apt-4` |
| `/apartament1206.html` | `/apartments/altufyevskoe-2-apt-5` |
| `/apartament759.html` | `/apartments/dmitrovskoe-107-apt-6` |
| `/ap.html` | `/apartments/dmitrovskoe-107-apt-7` |
| `/apartament794.html` | `/apartments/dmitrovskoe-107-apt-8` |
| `/apartament230.html` | `/apartments/beskudnikovsky-31-apt-9` |
| `/apartament170.html` | `/apartments/beskudnikovsky-52-apt-10` |
| `/apartament58-230.html` | `/apartments/beskudnikovsky-58-apt-11` |
| `/apartament12.html` | `/apartments/mitino-aframe` |

Every RU and EN indexable route now has localized title and description metadata, a locale-correct canonical, `ru-RU`/`en-US` alternates, and an `x-default` alternate pointing to RU. `sitemap.xml` contains the 32 localized public routes, while `robots.txt` allows public pages, disallows crawling `/api/`, and points to the absolute sitemap URL. The root `/favicon.ico` now uses the existing byte-identical favicon asset.

`NEXT_PUBLIC_SITE_URL` accepts only an absolute HTTP(S) origin without credentials, query, hash, or path. It falls back to `http://localhost:3000` locally; set the real site origin before a production build. No production domain, analytics, or speculative structured data is included.

## Future work

The current local anti-abuse layer includes exact-origin and Fetch Metadata checks, the required request header, an 8 KiB body limit, a honeypot, a short-lived one-time CAPTCHA challenge for Home submissions, and an in-memory rate limiter. Future production work requires a final CAPTCHA or Turnstile decision, persistent or distributed rate limiting, production SMTP delivery and secret management, booking persistence and idempotency, monitoring, legacy redirects, and the final SEO, accessibility, and regression review.

## Quality audit

Stage 9B completed a local production-build quality audit across the RU/EN core routes, legacy redirects, SEO endpoints, booking API, Docker Compose, and Mailpit delivery. The audit added a keyboard-accessible skip link, mobile drawer focus management, an explicit carousel pause/resume control, defensive response headers, and a narrow mobile overflow fix for apartment detail rules. Local checks passed with no dependency changes; Lighthouse was not run because it was not installed and no new package was added. This audit is not a WCAG certification, penetration test, field Core Web Vitals report, or production deployment approval.
