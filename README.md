# Constantine VI — The Private Concierge

Private guest concierge for Constantine Building 10, Apartment 6, Caesar Resort & Spa, Northern Cyprus. Built with Vite and plain JavaScript, with content separated from presentation. No account, backend, analytics or third-party runtime dependencies.

## Develop and review

Node.js 22.12+ or 24 LTS; this environment was validated with Node 24.19.0 and npm 11.9.0.

```sh
npm ci
npm run dev
```

```sh
npm run build
npm run preview -- --port 4173
npm test
```

`npm test` uses Playwright and `/usr/bin/chromium` in this environment. Elsewhere, set `executablePath` in `playwright.config.js` to an installed Chromium, or remove that setting and run `npx playwright install chromium`. The tests cover the welcome artwork, direct map entry, marker selection, zoom, section navigation, apartment photos, guest notes, responsive overflow and the self-contained offline preview. Device profiles run in Chromium, not physical iOS Safari.

The build creates `dist/Constantine-VI-Private-Preview.html`, a standalone review file with all assets embedded. Download it and open it in a desktop browser; no server or public deployment is needed. External recommendation links still need Internet access. Mobile file viewers may show a document preview instead of executing HTML; use a browser or the local Vite server for full interaction. Managed Chromium blocks `file:` navigation in this environment, so the file's contents are tested as an offline browser document instead.

## Edit content

- `src/content.js`: facilities, provisional map coordinates, host recommendations, apartment photo captions and guest notes.
- `src/main.js`: page sections and interactions. Hash links work with static hosting and browser back/forward navigation.
- `src/style.css`: responsive layout and the burgundy, ivory and antique-gold palette.
- `public/assets`: original supplied welcome artwork and assets recovered from the legacy prototype.
- `docs/HANDOVER.md`: provenance, missing source materials and publication prerequisites.
- `docs/screenshots`: current browser screenshots at phone, tablet and desktop sizes.

Do not add Wi-Fi passwords, key codes, personal contact information or other private guest details to this public client bundle. Send those through the guest's booking thread or scope a secure backend separately.

## Hosting after review

`npm run build` produces the static site in `dist`. Deploy that directory to a static host only after the host approves the visuals, content and asset permissions. Hash navigation needs no server rewrite. Use HTTPS. The standalone preview is a review artifact and may be excluded from public hosting. `noindex,nofollow` currently discourages indexing but is not access control. A genuinely private hosted guest guide requires a separately configured access layer; no authentication is claimed here.

No website has been publicly deployed, and no public URL or QR code has been created.
