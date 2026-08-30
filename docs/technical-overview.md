# Technical Overview

## Application Structure

The project uses the Next.js App Router with a shared localized layout. Russian is the default locale and uses prefixless routes; English uses the `/en` prefix. The public route set includes the home page, apartment catalog, 12 dynamic apartment detail pages, Contacts, and Reservation. The API is served independently under `/api/health`, `/api/captcha`, and `/api/booking`.

Apartment content is defined as typed records in `src/data/apartments` and modeled in `src/types/apartment.ts`. Query helpers expose the ordered collection, stable slugs, and localized views. Catalog cards, detail pages, home slides, selection controls, prices, image manifests, and map metadata all read from that data layer rather than duplicating apartment content in components.

## Rendering and Client Boundaries

Pages and data-driven sections are server components by default. The interactive booking widgets and carousel are client components because they own browser state and event handling. Server components pass localized strings and minimal serializable option data into those interactive boundaries; they do not send full message dictionaries or complete apartment records to the browser.

The shared layout loads local Montserrat and Roboto font files, the global reset and base styles, and the responsive Header and Footer. Component-specific styles use CSS Modules. `next/image` serves the local apartment and hero media, while the gallery and home carousel use stable responsive dimensions to avoid layout shift.

## Booking Request Flow

Home and Reservation collect their respective contact, date, apartment, and CAPTCHA fields in React state. A successful client validation produces a strict JSON request for `POST /api/booking`; the browser does not submit a traditional form or store a booking draft in browser storage.

The Route Handler applies the request boundary checks before parsing the body. It enforces the configured origin, the required booking header, available Fetch Metadata, and the 8 KiB body limit. It then validates the source-specific payload, verifies the individual CAPTCHA challenge, resolves the selected apartment from typed data, and calculates the quote on the server. The browser-visible quote is preliminary and is not trusted as an authority.

The current public implementation does not persist booking data in a database. The validated request exists in process memory for the request lifecycle and is rendered into a plain-text message for the configured mail transport. The client receives a generic result and does not receive SMTP details or internal errors.

## Request Protection

CAPTCHA challenges are opaque, short-lived, attempt-limited, one-time values held in a bounded in-memory store. Refresh invalidates the prior challenge. Successful verification consumes the challenge, which prevents replay and avoids treating a failed CAPTCHA as a deliverable request.

The booking API and CAPTCHA issuance endpoint use bounded in-memory fixed-window rate limiters. Rate-limit keys are HMAC-SHA256 digests rather than raw client addresses. `BOOKING_TRUST_PROXY=false` is the default; enabling proxy-aware addressing requires an explicitly trusted deployment boundary and the server-only `BOOKING_RATE_LIMIT_SECRET`. Missing or malformed production configuration fails closed with a generic response.

## Email Delivery Modes

Mail delivery is selected by `BOOKING_MAIL_MODE`:

- `disabled` keeps the interface and API available without delivery.
- `mailpit` uses the local Docker Compose Mailpit service on port `1025` and exposes only the Mailpit UI on host port `8025`.
- `smtp` requires complete server-side SMTP and recipient configuration. Credentials are read from the process environment and are never committed.

The sender and recipient are configured on the server. The guest's contact fields are rendered into the message body and are not used to construct SMTP credentials or routing headers. The repository includes only safe example values and does not claim a production deployment.

## Quality and Operations

The repository includes deterministic Vitest tests, strict TypeScript checks, ESLint, a production build, and an automated `verify` script. GitHub Actions runs these checks together with an npm audit, Compose configuration validation, and a container build. Docker Compose is provided for local Mailpit delivery; it is not a production deployment configuration.

The SEO layer generates localized metadata, canonical and alternate links, a 32-URL sitemap, robots rules, and an allowlisted set of permanent redirects for the published legacy HTML paths. The public version intentionally leaves deployment, database-backed inventory, payments, persistent booking storage, and production email operations to a future system design.
