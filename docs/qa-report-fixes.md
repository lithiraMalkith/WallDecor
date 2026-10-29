# QA report fixes and verification

Date: 29 October 2026

This update addresses the six failed cases in the supplied QA report for Ceylon Wall Decor. Verification uses the local optimized production build, the configured Firestore database, and Cloudinary. The hosted Vercel deployment needs a separate deployment and recheck before these results can be recorded as production passes.

| Report case | Defect | Change | Verification |
| --- | --- | --- | --- |
| TC-STORE-05 | BUG-CWD-01 | Selected reference files are validated, uploaded, and submitted using the returned URLs. Large accepted images are optimized below the hosting request limit. Failures preserve the form and completed uploads for retry. | Actual Cloudinary upload and Firestore request creation; test data cleaned up. Invalid files, oversized inputs, partial failure, retry, and removal covered by Playwright. |
| TC-STORE-06 | BUG-CWD-06 | Visible collection search and room/style filters share catalog filtering with the shop. Small product cards keep names readable. | Search, filters, empty results, and reset tested at 320, 390, and 1440 pixels. |
| TC-ADM-03 | BUG-CWD-02 | Viewport-bounded admin shell, internal table scrolling, bounded notification popup, focus containment, inert background, Escape close, and same-page navigation close. | All 15 main admin sections checked at 320, 390, and 768 pixels. |
| TC-ADM-04 | BUG-CWD-03 | Sidebar and header remain fixed while the main region scrolls independently. Sidebar navigation has its own scroll region. | Sidebar geometry, header position, and independent scrolling asserted in Playwright. |
| TC-ADM-05 | BUG-CWD-04 | Live Firestore order/request lists replace demo fallbacks. The badge counts pending orders; custom requests have a separate label. Refresh follows record changes, window focus, popup opening, and periodic polling. | Live API IDs compared with Firestore; stale, empty, unavailable, and changing notification states tested. |
| TC-NFN-01 | BUG-CWD-05 | Hero copy streams before the live queries finish; photographs render before hydration. Authentication code loads for returning customers, account routes, or interaction. Fonts, image sizes, texture rendering, catalog updates, and initial animation work optimized. | Standard mobile Lighthouse over local HTTPS/HTTP2: all three runs meet 90+ score and LCP below 2.5 seconds. Hosted deployment still requires recheck. |

All images and product records continue to come from Firestore. Browser storage holds cart selections and the existing customer session, not a product catalog.

## Performance measurements

The baseline mobile Lighthouse run measured 60/100, LCP 7.05 seconds, total blocking time 583 milliseconds, and approximately 814KB transferred. Audits use Lighthouse's standard simulated mobile settings. Raw JSON and HTML reports are written under the ignored `qa-artifacts` folder.

The final application was measured using a warm production server and a fresh browser for each run. Firestore queries remain uncached. No Lighthouse CPU or network throttling settings were relaxed.

| Transport / build | Mobile score | LCP | Total blocking time | Layout shift |
| --- | ---: | ---: | ---: | ---: |
| Original build, local HTTP/1.1 | 60 | 7.05s | 583ms | 0 |
| Final build, local HTTP/1.1 | 92 | 3.27s | 83.5ms | 0 |
| Final build, local HTTPS/HTTP2, run 1 | 97 | 2.255s | 140.5ms | 0 |
| Final build, local HTTPS/HTTP2, run 2 | 97 | 2.254s | 136ms | 0 |
| Final build, local HTTPS/HTTP2, run 3 | 97 | 2.254s | 137.5ms | 0 |

The median HTTP2 LCP is **2.254 seconds**, with a median score of **97/100**. Approximately 400KB transferred, versus approximately 814KB in the original local run. The ordinary `next start` HTTP/1.1 preview still exceeds the LCP threshold, and is reported above rather than counted as a pass. A read-only HEAD request confirmed that the report's hosted URL supports HTTP2 and returns 200; it does **not** establish that these changes are deployed or that the hosted site now passes PageSpeed.

HTTP2 was tested through the local-only TLS proxy in `scripts/qa-http2-preview.mjs`. Its temporary self-signed certificate is confined to the ignored QA artifacts folder; it was not installed in a trust store. Certificate validation is bypassed by the audit runner only for HTTPS targets on `localhost` or `127.0.0.1`. External audit targets retain normal validation.

Raw final reports: `qa-artifacts/mobile-http2-diagnostic.{json,html}`, `qa-artifacts/mobile-http2-final-2.{json,html}`, `qa-artifacts/mobile-http2-final-3.{json,html}`, and `qa-artifacts/mobile-final-rendering-2.{json,html}`. Earlier artifacts record the intermediate measurements.

## Regression verification

The optimized production build passes TypeScript validation. **All 52 Playwright tests passed**, with no retries, skips, or failures, in approximately 1.1 minutes. This includes the existing storefront/catalog/admin journeys and 19 additional defect regressions, live-service checks, and rendering/authentication checks. The suite covers 320, 390, 768, 1024, and desktop viewports where relevant. The standard-motion check verifies that revealed collection content becomes fully opaque, in addition to the reduced-motion mobile checks.

Machine-readable results are in `qa-artifacts/full-qa-results.json`; the interactive report is in `playwright-report/index.html`. These generated artifacts are ignored by Git. The original Word report was used as the defect specification and was not modified.

## Commands

```powershell
npm run build
npm run start -- --port 3000
npx playwright test --project=chromium --workers=1
node scripts/audit-performance.mjs http://localhost:3000/ qa-artifacts/mobile-performance
# Optional HTTP2 parity audit, using a temporary localhost key/certificate:
node scripts/qa-http2-preview.mjs qa-artifacts/local-only.key qa-artifacts/local-only.crt
node scripts/audit-performance.mjs https://127.0.0.1:3443/ qa-artifacts/mobile-http2
```

The live-upload regression creates a uniquely named test request and a small reference image, verifies both services, and removes only that test record and uploaded asset. No customer orders or messages are submitted by these regressions.

Vercel documents its function payload limit in the [function limits reference](https://vercel.com/docs/functions/limitations#request-body-size). The reference-photo preparation step keeps accepted large photos below that limit before they reach the upload route.
