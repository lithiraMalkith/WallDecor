# Mobile storefront verification

Verified on 22 October 2026 using Chromium against the local Next.js preview.

- Responsive header geometry on home, gallery, and shop at 320, 390, 768, and 1024 pixels.
- Carousel cards cannot cover the sticky navigation or intercept cart taps.
- Mobile menu fills the viewport, traps focus, blocks background scrolling, restores focus after Escape, and closes on navigation.
- All seven gallery photographs load; captions fit without horizontal overflow.
- Original sunrise and horizon seed photographs have been replaced with hosted green images in Firestore, including older saved cart items hydrated from the live catalog.
- Product descriptions match the replacement seed artwork.
- Existing homepage, catalog, product/cart, custom commission, and gallery journeys pass.

Results: 15 mobile/image regression cases, 7 Firestore catalog cases, and 5 existing storefront cases passed. TypeScript passed.

Run the mobile and seed regression suite:

```powershell
npx playwright test tests/mobile-storefront.spec.ts --project=chromium --workers=1
```

Run the existing storefront journey checks:

```powershell
npx playwright test tests/site-verification.spec.ts --project=chromium --workers=1 --grep '(Storefront Homepage|Catalog Browsing|Product Detail|Custom Commission|Room Inspiration)'
```

Generated image prompts and source asset locations are recorded in `green-gallery-image-prompts.json`. These are generated room studies, not customer-submitted photographs. Runtime image substitution has been removed; public image URLs and media order now live in Firestore. See `firestore-catalog.md` for migration details.
