# Firestore catalog and green media

Updated 22 October 2026.

The product list comes exclusively from the Firestore `products` collection. Server pages and product API routes query the Admin SDK directly. The browser refreshes published products through `/api/products?visibility=published` with `no-store`, on mount and window focus. An empty collection stays empty. Database failures return an unavailable state; there is no embedded or localStorage product catalog, in-memory product fallback, or automatic product seeding.

The mapper displays stored image URLs and descriptions directly. It does not substitute known seed URLs. Size variants and prices also come from Firestore. Cart persistence contains only product IDs, selected size, framing, and quantity. Legacy saved carts are reduced to these selections, then hydrated from Firestore; missing or unavailable variants cannot be restored as purchasable local snapshots.

Five existing product documents received the hosted green images. Product IDs, names, prices, stock, and visibility were preserved. Eight image records were added to `storefront_media`; their `galleryOrder` and `carouselOrder` fields determine the seven gallery photos and five carousel scenes. The generated artwork is hosted on Cloudinary, with those public URLs saved in Firestore. Gallery and carousel data are fetched on the server rather than defined in component arrays.

The explicit migration is `scripts/migrate-green-media.cjs`. Its `--apply` mode uploads the source assets, backs up the changed fields under `docs/migrations/`, and commits Firestore updates using document update-time preconditions. It only replaces recognized original seed URLs or the generated local asset paths; other uploaded images are preserved. Application requests never execute this migration.

Read-only verification against the running preview:

```powershell
node --env-file=.env.local scripts/migrate-green-media.cjs --verify
```

The migration uses the existing environment credentials without writing them to source or logs. Do not commit `.env.local`.

Validation: TypeScript passes. Twenty-seven scoped Playwright cases cover the API, Firestore response handling, empty and unavailable catalogs, local catalog spoofing, saved-cart hydration, deleted products, mobile navigation and overlap, hosted gallery images, and the existing storefront journeys. Tests simulate empty/error browser responses without deleting or modifying live products.

```powershell
npx playwright test tests/firestore-catalog.spec.ts tests/mobile-storefront.spec.ts --project=chromium --workers=1
npx playwright test tests/site-verification.spec.ts --project=chromium --workers=1 --grep '(Storefront Homepage|Catalog Browsing|Product Detail|Custom Commission|Room Inspiration)'
```
