# Add booking-secured mobile guest concierge

Base: `website-preview`
Head: `feature/secure-mobile-concierge`

Guests now enter using a host-issued, booking-specific code instead of accessing an unrestricted static guide. A server-side Worker validates activation and booking dates for protected pages, assets and private information. The host can create codes, revoke access and edit guest guidance through `/#admin` without hardcoded credentials.

The approved welcome artwork and existing assets remain unchanged. Adds private apartment guidance, Discover Northern Cyprus, Guest Assistance, installable PWA support with a non-sensitive offline screen, and host-side QR generation for the final approved URL. Removes the standalone HTML export because it cannot enforce guest access.

Validation: production build; 12 backend/security tests; 16 Chromium browser checks across iPhone, Android, tablet and desktop; npm audit (zero known vulnerabilities); Wrangler deploy dry-run and a local Worker/D1 emulator smoke check. Original asset hashes unchanged. No deployment or merge performed. WebKit/Firefox installation and official hosting documentation access were blocked by network policy; physical Safari and deployed D1/HTTPS validation require staging.

Review `docs/HOSTING.md` before deployment. Cloudflare Workers + D1 free tier is proposed, subject to current commercial-use terms and quotas verified in the owner's account. No account, database, paid plan, live domain or final QR is created by this PR. Secrets and private local databases are ignored and excluded from the branch.
