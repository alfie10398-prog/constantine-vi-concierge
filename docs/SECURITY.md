# Guest access security

## Boundaries

The public entry bundle contains the branded access screen, API helper and stylesheet. A Worker runs before all asset requests; only an exact public-file allowlist is available anonymously. The guest bundle, map, apartment photos and private API require a valid server session. No private Wi-Fi, contact or arrival data is built into JavaScript. Do not host the build as an ordinary unprotected static site.

There is no guest account. The access code is a booking-scoped bearer credential: anyone given the code can enter during its active window. Codes cannot prevent guests sharing access or saving information they have already seen. Use anonymous booking labels and share credentials only in the actual Airbnb conversation.

## Implemented controls

- 96-bit random booking codes; HMAC-SHA256 code lookup with a separate random server secret. Raw codes appear once in the host response and are never stored or logged by this application.
- Random 256-bit session tokens, stored only as keyed hashes server-side. Role, expiry, booking activation and booking dates are checked on every protected request. Revocation removes sessions; reactivation does not resurrect them.
- Host passphrase verification uses PBKDF2-SHA256, 100,000 iterations and random 128-bit salt. Provision a unique 16+ character passphrase and keep its derived hash in provider secrets. No default password or public bootstrap endpoint exists. The host credential is single-host, not multi-admin or MFA; do not claim otherwise. Recovery/rotation uses provider secret settings.
- HTTPS uses host-scoped Secure, HttpOnly, SameSite=Strict cookies. Only the loopback development adapter uses a non-Secure local cookie. Production must remain HTTPS.
- Mutations require matching Origin, a custom request header and JSON content type. Guest permissions do not grant host API access.
- Parameterized SQL, validated field lengths/date windows, bounded request bodies and escaped server-managed text in the UI.
- Per-IP/per-role persistent login throttling: at most 20 attempts per 15-minute window. Edge-supplied IP is keyed-hashed before storage. Expired throttling/session rows are opportunistically cleaned; free-tier quotas still require monitoring. Distributed denial of service is not solved by application throttling alone.
- Cache-Control: no-store for API and asset responses; CSP, framing restrictions, no-referrer, no-sniff, restricted browser permissions and HTTPS HSTS. No analytics or sensitive request-body logging.
- Service worker caches only the generic offline screen and install icons. It never caches guest pages, code, private details or guest assets. Revalidation occurs on foregrounding, at most every 60 seconds, and on protected requests. The app clears private UI when offline. Browser history screenshots and information a guest already saved cannot be remotely erased.

## Operational requirements

Keep the provider account and host passphrase protected. Back up D1 securely using provider-supported procedures. Purge old booking labels/records according to an owner-approved retention policy; automatic deletion of booking records is not implemented. Store no names, payment details or Airbnb reservation numbers. Lost codes require deactivation and replacement. Rotating SESSION_SECRET invalidates all access; rotating the host passphrase hash does not automatically revoke existing one-hour host sessions, so delete admin sessions if immediate host revocation is needed.

No real guest data or production credentials are part of this repository. `.local`, `.dev.vars*`, `.env*` and `.wrangler` are ignored. Local randomly generated credentials are for development only. Tests do not constitute an independent penetration test or a guarantee of production security.
