# Stage 9B Quality Audit

Date: 2026-08-15

## Scope

This audit covered the RU and EN Home, apartment catalog, representative apartment detail, Contacts, and Reservation routes, plus the booking API, SEO endpoints, confirmed legacy redirects, Docker Compose, and local Mailpit delivery. The audit was performed against the local production build at the Stage 9B starting revision `00121227173a389941089564b8beec99e5a0bf77` with unstaged working-tree fixes.

## Findings addressed

- Added a localized skip link targeting the main content landmark.
- Added initial focus, Escape handling, focus return, and Tab wrapping to the mobile navigation drawer.
- Added an explicit localized carousel pause/resume control and kept autoplay disabled for reduced motion.
- Added `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and `X-Frame-Options`; disabled the Next.js powered-by header.
- Adjusted the existing apartment-detail timing breakpoint so the rules section does not overflow at 350px.
- Added a semantic main landmark to the root not-found page.

## Verification

- Responsive browser QA covered 10 representative RU/EN routes at all 17 requested viewport sizes, for 170 checks. No horizontal overflow or missing `alt` attributes remained after the mobile breakpoint fix.
- Locale route checks confirmed one `h1`, one `main`, one header, one footer, a localized skip link, and no browser console errors or warnings on the tested pages.
- The Home carousel exposed 12 logical slides, 12 pagination bullets, navigation controls, and a pause/resume button. Reduced-motion behavior remains code-configured with autoplay disabled.
- The confirmed legacy redirect allowlist contains 16 entries. All returned `308`; `/apartments.html` returned `404`; query parameters and browser hash fragments were preserved.
- `sitemap.xml` returned 32 localized URLs, `robots.txt` returned `200`, and `/api/health` returned `200` with the expected status.
- Docker Compose web and Mailpit services reached healthy status. One Home and one Reservation request were accepted, Mailpit contained exactly two messages, delivery failure returned a generic `503` while Mailpit was stopped, and delivery recovered after restart. The in-memory rate limiter returned `429` within its configured window.
- `npm run lint`, `npm run typecheck`, `npm run build`, `npm run verify`, `npm audit`, `npm audit --omit=dev`, and `git diff --check` passed after the final source and documentation changes.

## Tooling limits

The in-app Chromium browser was available for interactive checks. Lighthouse was not installed, so no Lighthouse score, Total Blocking Time, field INP, or lab performance grade is claimed. Performance review used production-browser resource and navigation observations only. No second browser engine was available for a cross-browser comparison.

This document records local engineering verification. It is not a WCAG certification, penetration test, production SMTP approval, field Core Web Vitals report, or production deployment sign-off.
