# Constantine VI — The Private Concierge

A mobile guest concierge for Caesar Resort, Northern Cyprus, preserving the approved Roman column welcome artwork, palette and existing supporting typography. No guest accounts, app download, public codes or hardcoded administrator credentials.

## Local development

Requires Node 24 (the local adapter uses built-in SQLite), npm and Chromium for browser tests.

```sh
npm ci
npm run setup:local
npm run dev
```

`setup:local` generates random development-only secrets in ignored `.local/secrets.json` and an initial host passphrase in ignored `.local/host-password.txt`. It preserves existing credentials. Never commit these files. Open the local server on port 8787; use `/#admin` for the host interface. Rebuild and restart after edits. `npm run preview` uses the same protected local server; do not serve `dist` directly as a static site.

```sh
npm run build
npm test
npm audit --audit-level=high
npx wrangler deploy --dry-run --outdir .local/worker-build
```

The security suite must report **12 named tests**, not merely one file-level result. This managed command sandbox can suppress execution of nested Node test processes; run with the supported execution permission when required. Browser tests start a dedicated local SQLite database and run four journeys in each of four Chromium profiles (iPhone, Android, tablet, desktop): **16 browser tests**. Local test records and credentials never enter Git.

## Guest and host journeys

- QR and private Airbnb link open the **same HTTPS origin**. Guests enter the booking code shared by the host; there is no registration.
- The host uses `/#admin` with a unique passphrase, creates an anonymous booking label and access window, copies the one-time-displayed random code, and activates/deactivates it. Access ends automatically at the chosen time. Do not use names or Airbnb reservation numbers as labels.
- Revocation deletes existing guest sessions immediately. Every protected request checks the booking window. An already open screen clears on the next session check (up to 60 seconds), foregrounding, refresh or private API request. Expiry also has a client-side timer. Previously seen information cannot be made unseen.
- The host edits Wi-Fi details, arrival, checkout, appliance/house guidance, host/reception contacts and emergency instructions server-side. Blank fields show a truthful placeholder.
- Codes cannot be retrieved from the database. If a guest loses one, deactivate the old booking access and create a replacement.
- Guest sessions last at most 24 hours or until booking expiry, whichever comes first; the code can sign in again during the active window. Host sessions last one hour. Logout invalidates the server session.
- QR generation happens in the host interface only after entering the approved final HTTPS origin. QR/link never contain booking codes. Verify the URL and scan-test before printing.

## Application structure

- `server/worker.js`: same-origin API, authentication, authorization, throttling, response security headers and gated static assets.
- `server/local.mjs`: local-only Node/SQLite adapter using the same worker handler; **not the production hosting server**.
- `migrations/0001_access.sql`: D1 schema; booking codes and session tokens are stored as keyed hashes.
- `src/access.js`: public access screen and session lifecycle. `src/main.js` and guest assets require authentication at the worker.
- `src/admin.js`: host access management, private guest guidance editor and QR generation.
- `src/content.js`: supplied resort locations, host recommendations and original apartment photos. Never place secrets or private instructions here.
- `public/assets`: original approved art and supplied map/photos, unchanged.
- `public/manifest.webmanifest`, `public/sw.js`: install support. Only a generic offline screen and icons are cached; no private information or guest assets are cached.

See [hosting and iPhone preview](docs/HOSTING.md), [security design](docs/SECURITY.md), [source handover](docs/HANDOVER.md), and [prepared PR description](docs/PR.md).

No service, paid plan, production domain, live QR or public deployment is created by these changes. The previous standalone HTML export has been removed because it cannot enforce booking access. Existing screenshots are review artifacts, not a live website.
