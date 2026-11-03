# Hosting, costs and iPhone preview

## Recommendation

Cloudflare Workers + D1 is the proposed free-tier architecture. Cloudflare's free Workers offering has historically allowed commercial use, unlike some personal-use-only hosting tiers. A commercial Airbnb guide should fit a low-traffic workload, but current eligibility, terms, free limits and regional requirements must be verified in the owner's account before any launch.

Official sources for review:

- https://developers.cloudflare.com/workers/platform/pricing/
- https://developers.cloudflare.com/d1/platform/pricing/
- https://www.cloudflare.com/terms/

These pages were blocked by this environment's network policy during implementation. No current numerical quota or guaranteed free commercial entitlement is asserted. No paid service is activated. On a free-only setup, quota exhaustion can make the service unavailable; do not enable automatic upgrades or paid billing. A custom domain can carry an annual registration cost and is optional. A provider subdomain can avoid that domain cost if available under current terms. Email/SMS automation is not required: share codes manually through Airbnb.

## Approval and account prerequisites

Nothing has been deployed. The checked-in Worker configuration disables `workers_dev` and preview URLs. The D1 database ID is a placeholder. For a real iPhone review, the owner must approve an access-protected **staging deployment**, and authorize a Cloudflare account through an approved connection/secure CLI flow. Do not send API keys or passwords in chat. No Cloudflare credentials are configured in this environment.

Staging exposes only the original branded sign-in screen, install icons and generic offline screen. All guest pages/assets and private data are gated. It is Internet-reachable behind booking/host authentication, not a secret unlisted URL and not the final public production site. Use an isolated staging database, synthetic labels and placeholder information.

## Deployment runbook — execute only after owner approval

1. Verify current terms/free-tier limits in the owner account. Keep the free plan and do not configure a production domain.
2. Create a staging D1 database, copy its actual ID into a staging-specific Worker config, and run `wrangler d1 migrations apply <staging-database-name> --remote` using that config.
3. Create a unique host passphrase of at least 16 characters in a password manager. Use `scripts/password-hash.mjs` locally with secure stdin to derive the hash; do not put the plaintext in a command argument, shell history, source file or deployment variable. The hash is itself sensitive to offline guessing; store it as the `ADMIN_PASSWORD_HASH` Worker secret.
4. Generate a random 32-byte or longer `SESSION_SECRET` and store it via the provider's secret settings. Never reuse local test credentials in staging/production. Rotating this secret invalidates all codes/sessions.
5. Build with `npm ci && npm run build`. Enable only the approved staging provider URL in the staging config, and deploy the Worker **with** D1 and assets. `run_worker_first: true` is essential: serving `dist` directly would bypass the static asset gate.
6. Check unauthenticated `/api/guest-info`, `/assets/main.js`, apartment photos and map return 401. Check the sign-in screen/CSS/icons load. Check cross-origin mutations fail. Check HTTPS cookies have Secure, HttpOnly, SameSite=Strict and the `__Host-` prefix.
7. Visit `/#admin`, create a short-lived staging booking, and send its code privately through an approved channel. Do not commit, log or put it into a QR/query string. Test activation, guest login, map, private instructions, expiry, logout and deactivation on a physical iPhone in Safari and Android in Chrome.
8. Open the staging HTTPS link directly on iPhone Safari and enter the staging booking code. Optional: Share → Add to Home Screen. This is the simplest working iPhone preview; no download or guest account is needed.
9. After review, disable staging access/URL or remove staging resources. Production deployment and any domain require a separate owner decision.

No live QR is included because no approved deployed address exists. The host UI can generate its PNG locally once that address exists, pointing to exactly the same guest entry origin as the Airbnb link.

## Compatibility and validation limits

Production build, local D1-compatible SQLite security tests, Chromium phone/Android/tablet/desktop journeys, dependency audit and Wrangler deployment dry-run and local Worker/D1 emulator smoke check were executed. WebKit/Firefox browser installation was attempted but blocked by network policy (cdn.playwright.dev and playwright.download.prss.microsoft.com); those engines and physical Safari remain unverified. Browser install support varies, especially in embedded Airbnb browsers. The guide always works as a normal website; open Safari/Chrome for install support.

The Worker bundle was validated without deploying. D1 edge behavior, real HTTPS cookies, Cloudflare account quotas and real-device install behavior require the approved staging step. Do not represent local tests as production verification.
