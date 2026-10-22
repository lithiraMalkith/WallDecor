# Full project verification

Verified on 22 October 2026 against the optimized Next.js production build at localhost:3000 using Chromium.

**Result: 33/33 Playwright tests passed, zero failures and zero skipped tests.** The full run took 45.2 seconds. Production compilation, TypeScript, and whitespace checks passed.

The admin secondary palette is forest green (`#104F37`), with green hover states (`#1F6748`) and soft green surfaces. Shared accent tokens drive navigation, badges, buttons, form focus, and charts. White labels keep solid green buttons readable. Global base link styles allow component accent colors to apply.

Coverage includes 20 admin routes (15 main sections, product creation/editing, notifications, existing order details, and existing custom-request details), admin navigation at 390 and 768 pixels, storefront layout at 320/390/768/1024 pixels, staff sign-in, media URL/grain controls, gallery images, product/cart journeys, and Firestore empty/error responses. Catalog refreshes cancel obsolete requests and update data/error state together. Custom-request detail reads and quote updates use the live Firestore document rather than memory.

These tests exercise browsing, controls, and existing records without placing orders, deleting records, sending messages, or submitting admin saves. They do not exhaust every external integration or administrative mutation.

Run the complete suite against a running preview:

```powershell
npx playwright test --project=chromium --workers=1
```

The complete machine-readable report is in `test-results/full-project-results.json`; the interactive report is in `playwright-report/index.html`.

| Test | Result | Duration |
| --- | --- | --- |
| every admin section loads with green accents and working navigation | Passed | 13.4s |
| the API returns hosted Firestore images with caching disabled | Passed | 0.8s |
| /: an empty Firestore response does not restore demo products or local catalog data | Passed | 0.6s |
| /: a failed refresh clears stale products and shows an unavailable state | Passed | 0.6s |
| /shop: an empty Firestore response does not restore demo products or local catalog data | Passed | 0.5s |
| /shop: a failed refresh clears stale products and shows an unavailable state | Passed | 0.6s |
| saved carts store selections only and hydrate details and prices from Firestore | Passed | 0.6s |
| deleted products cannot return through a saved cart snapshot | Passed | 0.3s |
| a slow older catalog response cannot replace the latest failed refresh | Passed | 0.7s |
| header controls and page content fit on home, gallery, and shop | Passed | 1.0s |
| carousel cannot paint or intercept taps over the sticky header | Passed | 0.6s |
| mobile menu covers the viewport, locks scrolling, closes with Escape, and navigates | Passed | 0.9s |
| header controls and page content fit on home, gallery, and shop | Passed | 0.9s |
| carousel cannot paint or intercept taps over the sticky header | Passed | 0.6s |
| mobile menu covers the viewport, locks scrolling, closes with Escape, and navigates | Passed | 0.9s |
| header controls and page content fit on home, gallery, and shop | Passed | 1.1s |
| carousel cannot paint or intercept taps over the sticky header | Passed | 0.6s |
| mobile menu covers the viewport, locks scrolling, closes with Escape, and navigates | Passed | 0.9s |
| header controls and page content fit on home, gallery, and shop | Passed | 1.1s |
| carousel cannot paint or intercept taps over the sticky header | Passed | 0.7s |
| all seven gallery photographs load and their captions fit | Passed | 0.6s |
| the original sunrise seed is replaced on product detail | Passed | 0.5s |
| the horizon seed image and its material description agree | Passed | 0.5s |
| an old saved cart also displays the new sage seed image | Passed | 0.5s |
| 1. Storefront Homepage & Hero Wall Studio | Passed | 0.7s |
| 2. Catalog Browsing & Category Filtering (/shop) | Passed | 0.9s |
| 3. Product Detail & Add to Cart Flow (/product/golden-rise) | Passed | 0.7s |
| 4. Custom Commission Atelier (/custom-order) | Passed | 0.3s |
| 5. Room Inspiration Gallery (/gallery) | Passed | 0.5s |
| 6. Staff Sign In with Seeded Role Credentials (/adminlogin) | Passed | 2.5s |
| 7. Admin Dashboard & Navigation (/admin) | Passed | 2.5s |
| 8. Admin Catalog Table & Cloudinary Thumbnails (/admin/products) | Passed | 2.8s |
| 9. Admin Minimalist Artwork Media Uploader (/admin/products/new) | Passed | 3.8s |
