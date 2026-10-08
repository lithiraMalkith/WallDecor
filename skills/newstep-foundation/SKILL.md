---
name: ceylon-walldecor-foundation
description: >
  Project infrastructure and data layer for Ceylon Wall Decor — Next.js 15 App Router,
  Firebase Auth + Firestore, Cloudinary image hosting, Brevo/Resend email, RBAC permission system,
  Zod validations, GSAP animations, Tailwind v4 design tokens, and all shared utilities.
  Triggers on requests to set up the project, configure Firebase, define types/schemas,
  create the auth system, build the RBAC layer, or establish the data models and utilities
  that both admin and storefront depend on.
---

# Ceylon Wall Decor — Foundation & Infrastructure Skill

This skill defines the **complete project foundation** — everything that must exist before either the admin panel or storefront can function. Follow this **before** using the `ceylon-walldecor-api-backend`, `ceylon-walldecor-admin-panel`, or `ceylon-walldecor-storefront` skills.

> **Business Context**: Ceylon Wall Decor is a Sri Lankan small business that hand-makes textured / fabric wall art and custom canvas décor for homes, bedrooms, kitchens and restaurants. Orders currently come via TikTok → WhatsApp. This website replaces that manual workflow with a searchable catalog, size and frame selection, custom-design upload, COD checkout, and an admin panel.

---

## 1. Tech Stack (Exact Versions)

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Framework | Next.js (App Router) | 15.x | SSR + RSC + API routes |
| Language | TypeScript | 5.7+ | Strict mode enabled |
| Auth | Firebase Auth + Custom Claims | firebase 12.x client / firebase-admin 14.x server | Google OAuth + email/password, role in JWT |
| Database | Firebase Firestore | firebase-admin 14.x | NoSQL document store, all collections |
| Storage | Cloud Storage for Firebase | firebase 12.x | Product images and customer design uploads |
| Styling | Tailwind CSS v4 | tailwindcss 4.x via `@tailwindcss/postcss` | Utility-first, `@import "tailwindcss"` syntax |
| Animations | GSAP + `@gsap/react` | gsap 3.12+ | Scroll reveals, counters, page transitions |
| Icons | Lucide React | 1.32+ | Consistent icon set |
| Charts | Recharts | 3.x | Admin dashboard charts |
| Validation | Zod | 4.x | Schema validation for forms and API |
| Email | Brevo (Sendinblue) transactional API or Resend | brevo SDK or resend 6.x | Transactional emails (order confirmation, alerts, status updates) |
| Image Hosting | Cloudinary | 2.x | Product image upload/transform/CDN |
| Utilities | clsx + tailwind-merge | latest | `cn()` class merging |
| Date | date-fns | 4.x | Date formatting |
| Toast | react-hot-toast | 2.x | System-wide notifications |
| Forms | React Hook Form + Zod resolver | latest | Form state management with Zod validation |

---

## 2. Project Initialization

```bash
npx -y create-next-app@latest ./ --typescript --app --tailwind --src-dir --no-import-alias --eslint
```

### package.json scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

### Dependencies to install
```bash
npm install firebase firebase-admin cloudinary resend gsap @gsap/react lucide-react recharts react-hot-toast clsx tailwind-merge date-fns zod react-hook-form @hookform/resolvers
npm install -D @tailwindcss/postcss @types/node @types/react @types/react-dom tailwindcss typescript
```

### Critical: Add jose override in package.json
```json
{
  "overrides": {
    "jose": "5.9.6"
  }
}
```

---

## 3. Environment Variables

Create `.env.local` with these **required variables**:

```env
# Firebase Client SDK (public — exposed to browser)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin SDK (server-only — never exposed to browser)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Cloudinary (server-only)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email Service (server-only) — Brevo or Resend
BREVO_API_KEY=
# OR
RESEND_API_KEY=
RESEND_FROM_EMAIL=orders@ceylonwalldecor.lk

# Marketing Pixels (stored in admin settings, but can be overridden here)
NEXT_PUBLIC_META_PIXEL_ID=
NEXT_PUBLIC_TIKTOK_PIXEL_ID=
META_CONVERSIONS_API_ACCESS_TOKEN=
TIKTOK_EVENTS_API_ACCESS_TOKEN=

# reCAPTCHA / App Check
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 4. Configuration Files

### next.config.mjs
```javascript
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "*.googleusercontent.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
    ],
  },
  async headers() {
    return [{
      source: "/(.*)",
      headers: [{ key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" }],
    }];
  },
};
export default nextConfig;
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "strict": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "incremental": true,
    "paths": { "@/*": ["./src/*"] },
    "plugins": [{ "name": "next" }]
  }
}
```

### postcss.config.mjs
```javascript
export default { plugins: { "@tailwindcss/postcss": {} } };
```

---

## 5. Firebase Setup

### Client SDK — `src/lib/firebase.ts`
```typescript
import { initializeApp, getApps } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const googleProvider = new GoogleAuthProvider()
```

### Admin SDK — `src/lib/firebase-admin.ts`
- Parse FIREBASE_PRIVATE_KEY: strip quotes, replace literal `\\n` with real newlines
- Initialize once with `getApps().length` guard
- Export `adminAuth`, `adminDb`, `adminStorage`, and `firebaseAdminInitError` string
- Never throw at module level — return descriptive error strings for 503 responses
- Private key normalisation: `raw.startsWith('"') ? raw.slice(1,-1) : raw` then `.replace(/\\\\n/g, '\n')`

---

## 6. Firestore Collections Schema

| Collection | Key Fields | Notes |
|---|---|---|
| `products` | name, slug, sku, shortDescription, longDescription, images[], video?, tiktokVideoLink?, room[], style[], colourTags[], sizes[] (embedded array of {width, height, priceWithoutFrame, priceWithFrame}), frameOption ('included'\|'optional'\|'none'), framePricePerSqInch (default Rs.6), material, technique, leadTimeDays, stockType ('made_to_order'\|'ready_stock'), quantity?, isFeatured, isBestseller, isNew, featuredOrder?, featuredBadge?, visibility ('published'\|'draft'\|'archived'), metaTitle, metaDescription, createdAt, updatedAt, createdBy | Each product is a design; sizes are embedded as an array of dimension+price objects. Archived products kept for order history. |
| `categories` | name, slug, description, image, type ('room'\|'style'\|'size'\|'collection'), parentId, depth (0/1), order, isActive, createdAt, updatedAt | Flat or 2-level. Types: Shop by Room, Shop by Style, Shop by Size, Collections & Offers |
| `orders` | orderRef (CWD-000123), items[] (snapshots with design, size, frame, unitPrice), subtotal, frameCost, deliveryFee, discountAmount, total, status, paymentMethod ('COD'), paymentStatus ('pending'\|'paid'\|'failed'\|'refunded'), amountPaid, transactionReference?, currency ('LKR'), customer{name, email, phone}, deliveryAddress{address, city, district, postalCode?, notes}, statusHistory[], trackingNumber, courierName, cancellationReason, utmSource?, utmMedium?, utmCampaign?, ttclid?, createdAt, updatedAt | Status: pending→confirmed→processing→ready_for_dispatch→dispatched→delivered→completed. Exception: on_hold, cancelled, delivery_failed, returned. Items store snapshot of name, size, frame, price so later changes never alter existing orders. |
| `customers` | name, email, phone, address, district, orderCount, totalSpent, isRepeat, tags[], firstOrderAt, lastOrderAt, notes, createdAt | Auto-created/updated on order placement. Tags: 'repeat_buyer', 'custom_order' etc. |
| `customRequests` | customerName, customerEmail, customerPhone, designUploadUrls[], sizeWidth, sizeHeight, notes, status ('new'\|'quoted'\|'approved'\|'rejected'\|'converted'), quotedPrice?, adminNotes, convertedOrderId?, createdAt, updatedAt | Custom design request workflow |
| `messages` | name, contact, message, status('new'\|'read'\|'replied'), repliedBy, createdAt, updatedAt | From contact form |
| `reviews` | productId, productName, productSlug, customerId?, customerName, customerEmail, rating, title?, comment, customerPhotoUrl?, status('pending'\|'approved'\|'rejected'), isVerifiedPurchase, createdAt, updatedAt | Moderation queue. Customer photos of art on their walls. |
| `discounts` | code, description, type('percentage'\|'fixed'\|'free_delivery'), value, minOrderAmount, maxUses, usedCount, startDate, endDate, status('active'\|'expired'\|'disabled'), applicableCategories[], createdBy, createdAt, updatedAt | Auto-validate on checkout. TikTok campaign codes. |
| `roles` | name, permissions[], createdBy, createdAt, isCustom:true | Custom roles beyond built-in |
| `users` | uid, email, displayName, photoURL, role, phone, createdAt, lastLoginAt, isActive | Admin users synced from Firebase Auth |
| `settings` | siteName, siteDescription, ownerEmail, ownerPhone, whatsappNumber, currency ('LKR'), codEnabled, deliveryZones[] ({district, fee, estimatedDays}), freeDeliveryThreshold, framePricePerSqInch, socialLinks{tiktok, instagram, facebook, whatsapp}, metaPixelId, metaConversionsApiToken, tiktokPixelId, tiktokEventsApiToken, googleAnalyticsId, aboutContent, faqContent, shippingPolicy, returnsPolicy, privacyPolicy, termsOfService, consentBannerText, emailTemplates{} | Single document: `settings/general` |
| `audit_logs` | userId, userEmail, action, resource, resourceId, resourceName, details, ip, createdAt | Immutable log of admin actions |
| `counters` | orderCounter (for sequential CWD-000001 format) | Single document: `counters/orders` — uses Firestore transaction to increment |
| `contentBlocks` | key (hero, banners, gallery, howItWorks), content (JSON), images[], isActive, updatedAt, updatedBy | CMS blocks for homepage, banners, gallery |

---

## 7. Complete Type System — `src/types/index.ts`

Define ALL these interfaces. Every type used by admin and storefront exists here:

### Auth & Roles
- `BuiltInRole`: `'superadmin' | 'manager' | 'order_staff' | 'content_editor'`
- `UserProfile`: uid, email, displayName, photoURL?, role, phone?, createdAt, lastLoginAt?, isActive
- `CustomRole`: id, name, permissions[], createdBy, createdAt, isCustom:true

### Products (Wall Art Designs)
- `VisibilityStatus`: `'published' | 'draft' | 'archived'`
- `StockType`: `'made_to_order' | 'ready_stock'`
- `FrameOption`: `'included' | 'optional' | 'none'`
- `SizeVariant`: width (inches), height (inches), label (e.g. "12×12"), priceWithoutFrame (LKR), priceWithFrame (LKR), sku
- `StandardSize`: Predefined — 6×6, 8×8, 10×8, 12×12, 12×16, 18×12, 20×18, 18×24, 20×24
- `Product`: id, name, slug, sku, shortDescription, longDescription, images[], video?, tiktokVideoLink?, room[] (string tags), style[] (string tags), colourTags[], sizes (SizeVariant[]), frameOption, framePricePerSqInch, material, technique, leadTimeDays, stockType, quantity?, isFeatured, isBestseller, isNew, featuredOrder?, featuredBadge?, visibility, metaTitle, metaDescription, createdAt, updatedAt, createdBy

### Categories
- `CategoryType`: `'room' | 'style' | 'size' | 'collection'`
- `CategoryNode`: id, name, slug, description?, image?, type, parentId(null=root), depth(0/1), order, isActive, createdAt, updatedAt
- `CategoryTreeNode extends CategoryNode`: children: CategoryTreeNode[]

### Orders
- `OrderStatus`: `'pending' | 'confirmed' | 'processing' | 'ready_for_dispatch' | 'dispatched' | 'delivered' | 'completed' | 'on_hold' | 'cancelled' | 'delivery_failed' | 'returned'`
- `PaymentStatus`: `'pending' | 'paid' | 'failed' | 'refunded'`
- `OrderItem`: productId, productName, productSlug, image, sizeLabel, width, height, withFrame (boolean), unitPrice, frameCost, qty, totalPrice
- `CustomerInfo`: name, email, phone
- `DeliveryAddress`: address, city, district, postalCode?, notes?
- `StatusHistoryEntry`: status, timestamp, updatedBy, note?
- `Order`: id, orderRef (CWD-XXXXXX), items[], subtotal, frameCost, deliveryFee, discountAmount, discountCode?, total, status, paymentMethod, paymentStatus, amountPaid, transactionReference?, currency, customer, deliveryAddress, statusHistory[], trackingNumber?, courierName?, cancellationReason?, utmSource?, utmMedium?, utmCampaign?, ttclid?, createdAt, updatedAt

### Custom Design Requests
- `CustomRequestStatus`: `'new' | 'quoted' | 'approved' | 'rejected' | 'converted'`
- `CustomRequest`: id, customerName, customerEmail, customerPhone, designUploadUrls[], sizeWidth?, sizeHeight?, notes, status, quotedPrice?, adminNotes?, convertedOrderId?, createdAt, updatedAt

### Other Entities
- `Customer` with orderCount, totalSpent, isRepeat, tags[], notes
- `Message` with status:'new'|'read'|'replied'
- `Review` with status:'approved'|'pending'|'rejected', isVerifiedPurchase, customerPhotoUrl?
- `Discount` with type('percentage'|'fixed'|'free_delivery'), value, date range, usage tracking
- `DashboardStats` with revenue/order breakdowns, trends, charts data, COD cash to collect, low-stock alerts
- `SiteSettings` with delivery zones (district, fee, estimatedDays), frame pricing, social links, pixel IDs, email templates, policy content
- `AuditLog` with action, resource, details
- `ContentBlock` for CMS (hero, banners, gallery, howItWorks)

### API Envelope
- `ApiResponse<T>`: success, data?, error?, message?, details?
- `PaginatedResult<T>`: items[], total, page, pageSize, hasMore

### Storefront Types — `src/lib/types.ts`
Separate lighter types for storefront:
- `StorefrontProduct` (no admin fields like createdBy, visibility)
- `SizeVariant`
- `CartLine`: productId, slug, name, image, sizeLabel, width, height, withFrame, price, frameCost, qty
- `CheckoutOrder`: id, createdAt, customer{}, lines[], subtotal, frameCost, delivery, discountAmount, total, paymentMethod:'COD', status:'pending'

---

## 8. RBAC Permission System — `src/lib/permissions.ts`

### Permission Registry
Format: `module:action` — e.g., `products:read`, `orders:write`, `categories:delete`

Modules: dashboard, products, orders, customers, custom_requests, categories, messages, reviews, discounts, content, delivery, notifications, marketing, roles, users, settings, featured, audit

### Built-in Roles (from requirements document Section 7.2)
| Role | Access Level |
|---|---|
| `superadmin` (Owner) | ALL permissions — users, roles, settings, pixels, financial reports, deletions, order reversals |
| `manager` | Dashboard, Products (CRUD), Orders (RW), Customers (R), Categories (CRUD), Custom Requests (RW), Messages (RW), Reviews (RW), Discounts (RW), Content (RW), Delivery settings (R), Featured (RW) |
| `order_staff` | Dashboard, Orders (view + move through fulfilment statuses only: processing→dispatched), Customers (R) — cannot edit prices, see revenue, export customers, or delete anything |
| `content_editor` | Dashboard, Products (RW), Categories (RW), Content (RW), Media — no access to orders or customer data |

### Permission Groups (for role editor UI)
Array of `{ label, permissions[] }` — groups for the role creation/edit form covering all modules.

---

## 9. Auth Context — `src/contexts/auth-context.tsx`

A `'use client'` context provider that wraps the entire app:

### State
- `user: User | null` — Firebase User object
- `role: string` — From JWT custom claims
- `permissions: Permission[]` — Resolved from role
- `loading: boolean` — Initial auth check

### Key behaviors
1. Uses `onIdTokenChanged` (not `onAuthStateChanged`) to catch token refreshes
2. 400ms fallback timeout to prevent infinite loading on slow Firebase networks
3. Reads role from `tokenResult.claims.role`, defaults to `'customer'`
4. Resolves permissions via `BUILT_IN_ROLE_PERMISSIONS[role]`
5. Avatar override: stores long data URLs in localStorage, patches `user.photoURL` via `Object.defineProperty`
6. On every sign-in (email, signup, Google), calls `POST /api/auth/sync` then force-refreshes token
7. `isAdmin` = role exists AND is not empty AND is not 'customer'

### Exports
`useAuth()` — throws if used outside provider. Returns: user, role, permissions, loading, hasPermission(), isAdmin, signInWithEmail(), signUpWithEmail(), signInWithGoogle(), sendPasswordReset(), updateUser(), signOut()

---

## 10. Auth Middleware — `src/lib/auth-middleware.ts`

`withAuth(req, handler, requiredPermission?)` — wraps any API route:

1. Extract `Bearer` token from Authorization header
2. Verify with `adminAuth.verifyIdToken(token)`
3. Read `role` from decoded claims (default: 'customer')
4. If `requiredPermission` given: superadmin bypasses, built-in roles checked against map, custom roles fetched from Firestore `roles/{roleId}`
5. Attach decoded token + role to `req.user`
6. Return 401 for missing/invalid token, 403 for insufficient permissions

---

## 11. Validation Schemas — `src/lib/validations.ts`

Define Zod schemas for all entities with strict validation:

| Schema | Key rules |
|---|---|
| `productSchema` | name min 2, slug min 2, shortDescription 10-500 chars, sizes min 1 with valid width/height/prices, frameOption enum, room[] min 1, style[] min 1 |
| `sizeVariantSchema` | width positive int, height positive int, priceWithoutFrame positive, priceWithFrame positive or 0, sku optional |
| `checkoutSchema` | fullName min 3, phone regex `^0\d{9}$` (Sri Lankan 10-digit), email optional, address min 8, district from valid list, items min 1 with size and frame selection |
| `customRequestSchema` | customerName min 2, customerPhone regex `^0\d{9}$`, sizeWidth positive optional, sizeHeight positive optional, notes 10-2000, designUploadUrls[] |
| `categorySchema` | name 2-60, slug min 2, type enum, depth 0-1, parentId nullable |
| `customRoleSchema` | name 2-40, permissions min 1 |
| `userInviteSchema` | email valid, displayName min 2, role min 1 |
| `siteSettingsSchema` | siteName min 1, ownerEmail valid, ownerPhone min 1, deliveryZones[] with district+fee+estimatedDays, framePricePerSqInch positive |
| `messageSchema` | name min 2, contact min 5, message 10-2000 |
| `orderStatusSchema` | status enum (pending/confirmed/processing/ready_for_dispatch/dispatched/delivered/completed/on_hold/cancelled/delivery_failed/returned), optional note/cancellationReason/trackingNumber/courierName |
| `reviewSchema` | productId min 1, rating 1-5, comment 10-1000, customerPhotoUrl optional |
| `reviewModerationSchema` | status enum approved/pending/rejected |
| `discountSchema` | code 3+ (auto-uppercase), type enum (percentage/fixed/free_delivery), value positive, date range required |
| `discountValidateSchema` | code min 1, orderTotal positive |
| `featuredUpdateSchema` | featured array with id, featuredOrder, optional badge |
| `auditCreateSchema` | action min 1, resource min 1 |
| `contentBlockSchema` | key min 1, content object, images[] optional |

---

## 12. Utility Modules

### `src/lib/utils.ts`
- `cn(...inputs)` — clsx + tailwind-merge
- `formatPrice(amount)` — `'Rs. ' + amount.toLocaleString('en-LK')` — no decimal places
- `generateSKU(designName, sizeLabel)` — `CWD-{DESIGN}-{SIZE}`
- `generateOrderRef(counter)` — `CWD-{padded6digits}` using Firestore counter transaction
- `slugify(str)` — lowercase, strip special chars, hyphenate
- `truncate(str, length)` — with ellipsis
- `formatDate(date)` — `en-LK` short month + day + time
- `formatSizeLabel(width, height)` — `"12×16"` with × symbol
- `calculateFramePrice(width, height, ratePerSqInch)` — `width * height * rate`
- `calculateTotalPrice(basePrice, withFrame, framePrice)` — base + optional frame cost

### `src/lib/format.ts`
- `LKR(value)` — Sri Lankan Rupee formatter — `Rs. X,XXX` (no decimals)
- `DELIVERY_ZONES` — Record of all 25 Sri Lankan districts with delivery fees and estimated days
  - Example: `{ colombo: { fee: 350, days: '1-2' }, gampaha: { fee: 350, days: '1-2' }, kandy: { fee: 450, days: '2-3' }, ... }`
- `DISTRICTS` — Sorted list of all 25 Sri Lankan district names
- `FREE_DELIVERY_THRESHOLD` — configurable, loaded from settings (default Rs. 5,000 or as set by client)
- `deliveryFeeFor(district, subtotal, threshold)` — Free if above threshold, else zone fee
- `STANDARD_SIZES` — The 9 standard sizes: 6×6, 8×8, 10×8, 12×12, 12×16, 18×12, 20×18, 18×24, 20×24

### `src/lib/config.ts`
- `STORE_CONTACT` — phone: '078 2518184', whatsapp: '94782518184', whatsappCatalog: 'https://wa.me/c/94782518184', whatsappChat: 'https://wa.me/message/UR66GOPVEOV6L1', email (TBD), address (TBD with client)
- `SOCIAL_LINKS` — tiktok: 'https://www.tiktok.com/@ceylonwalldecor', instagram (TBD), facebook (TBD)
- `BRAND` — name: 'Ceylon Wall Decor', tagline: 'Home of Textured Art, Sri Lanka', currency: 'LKR'
- `getWhatsAppLink(message?)` — Generates wa.me link with prefilled message

### `src/lib/server-cache.ts`
- In-memory TTL cache for server-side requests
- Stored on `globalThis` to persist across dev fast-refreshes
- `getCached<T>(key)`, `setCached<T>(key, data, ttlSeconds=120)`, `invalidateCache(prefix?)`

### `src/lib/gsap-config.ts`
- Suppress nullTargetWarn for SSR
- Export animation presets: fadeInUp, fadeIn, scaleIn, slideInRight/Left, staggerChildren, counterUp

### `src/lib/admin-service.ts`
- `serializeDoc(doc)` — Converts Firestore Timestamps to ISO strings (handles nested arrays)
- `serializeDocs(snapshot)` — Map + filter
- `serverTimestamp()`, `increment(n)` — Firestore FieldValue wrappers
- `collection(name)`, `doc(collection, id)` — Type-safe refs
- `fetchPaginated(collection, options)` — Reusable paginated query
- `getNextOrderNumber()` — Firestore transaction on `counters/orders` to get next CWD-XXXXXX

### `src/lib/audit.ts`
- `logAudit(params)` — Fire-and-forget audit log writer (never breaks main flow)

### `src/lib/email.ts`
- `sendOrderConfirmation(order)` — HTML email to customer: order number, items (design, size, frame), totals, COD note, delivery address, contact details
- `sendNewOrderAlert(order)` — Email to admin/owner with order summary
- `sendStatusUpdate(order, newStatus, note?)` — Status change notification to customer (e.g. "dispatched" with courier name and tracking number)
- `sendCustomRequestReceived(request)` — Acknowledge custom design request to customer
- `sendCustomRequestQuote(request)` — Send quote for custom design
- Templates stored in admin settings and editable
- Deliverability: SPF, DKIM, DMARC verification on sending domain
- All fire-and-forget with `.catch()` error swallowing; failures logged and order flagged

### `src/lib/cloudinary.ts`
- Config from env vars
- `uploadImage(base64Data, folder='ceylon-wall-decor')` — 1200x1200 limit, auto quality/format, WebP/AVIF output
- `deleteImage(publicId)`
- `extractPublicId(url)` — Parse Cloudinary URL for deletion

### `src/lib/auth-errors.ts`
- `getFriendlyAuthErrorMessage(error, fallback)` — Maps all Firebase Auth error codes to human-friendly messages

### `src/lib/pixels.ts` (Marketing Pixel Helpers)
- `fireMetaPixelEvent(eventName, params)` — PageView, ViewContent, AddToCart, InitiateCheckout, Purchase
- `fireTikTokPixelEvent(eventName, params)` — ViewContent, AddToCart, InitiateCheckout, PlaceAnOrder
- `fireServerSideEvent(platform, eventName, params, eventId)` — Server-side Meta Conversions API / TikTok Events API with de-duplication event_id
- Consent banner integration: pixels load only after consent
- UTM and ttclid capture from URL params, saved on each order

### `src/lib/orders.ts` (Client-side localStorage)
- `saveOrder(order)` / `readOrders()` / `readOrder(id)` — localStorage persistence for guest checkout

### `src/lib/policies.ts`
- `Policy` type: slug, title, description, updated, sections[]
- Policies: shipping-delivery, returns-damage, privacy, terms
- Sri Lanka specific: COD, district-based delivery, handmade variation disclaimer, custom order terms
- Content loaded from admin settings if available, else defaults
- `getPolicy(slug)` — lookup function

### `src/lib/category-tree.ts`
- `buildCategoryTree(nodes)` — Flat CategoryNode[] → nested CategoryTreeNode[]
- `flattenTree(tree)` — Reverse operation
- `findNodeInTree(tree, id)` — Deep search
- `getDescendantIds(tree, nodeId)` — All child IDs for cascade operations
- `MAX_CATEGORY_DEPTH = 1` (two-level max: Room → Sub-room)
- `DEFAULT_CATEGORIES` — Pre-built categories:
  - **Shop by Room**: Living Room, Bedroom, Kitchen & Dining, Office & Restaurants / Commercial
  - **Shop by Style**: Boho, Minimalist / Neutral, Abstract & Modern, Nature-inspired
  - **Shop by Size**: Small (up to 10×8), Medium (12×12 to 12×16), Large (18×12 and above)
  - **Collections**: New Arrivals, Best Sellers, Gift Ideas, Sale

---

## 13. Static Product Seed Data — `src/lib/products.ts`

Seed data for approximately 15–20 wall art designs to populate the store at launch. Each product has:
- id, slug, name, sku
- room, style, colourTags
- sizes array with all 9 standard size variants (width, height, prices)
- frameOption, framePricePerSqInch
- material (e.g. "Textured plaster on canvas"), technique (e.g. "Hand-applied textured plaster")
- leadTimeDays (e.g. 5-7)
- stockType ('made_to_order')
- images (placeholder Cloudinary URLs)
- description, shortDescription
- isBestseller, isNew flags
- metaTitle, metaDescription

Example designs:
- **Boho Sunrise** — Earthy tones, textured boho sun design
- **Ocean Waves** — Blue textured wave pattern
- **Neutral Circles** — Minimalist neutral concentric circles
- **Palm Leaf** — Nature-inspired tropical leaf texture
- **Abstract Flow** — Modern abstract flowing lines
- etc.

Export: `products`, `getProduct(slug)`, `byCategory(slug)`, `bestSellers`, `newArrivals`

---

## 14. Root Layout — `src/app/layout.tsx`

- Metadata: title template `%s | Ceylon Wall Decor`, description: "Handmade textured wall art and custom canvas décor for homes, bedrooms, kitchens and restaurants in Sri Lanka"
- OpenGraph: type:website, siteName: "Ceylon Wall Decor", locale:en_LK
- Google Fonts preconnect: Inter (300-700) + Playfair Display (400-700) for brand headings
- Wrap body in `<AuthProvider>` → `<LayoutShell>`
- `LayoutShell` conditionally hides Header/Footer on admin routes
- Consent banner for marketing pixels

---

## 15. Global CSS Design System — `src/app/globals.css`

### Design Tokens (via `@theme`)
Earthy, boho, warm palette reflecting handmade textured art:
```
ink: #1a1410            paper: #faf8f5
cream: #f5efe6          cream-soft: #faf7f2   cream-deep: #ede4d4   cream-border: #e0d5c4   cream-dark: #d4c6b0
sand: #c9b99a           sand-light: #e8dcc8
terracotta: #c4704b     terracotta-light: #d4926f
sage: #7a8c6e           sage-light: #a3b396
mist: #f5f3f0           mist-2: #ebe8e3
line: #e2ddd5           muted: #8a7e6e
accent: #b88b5e         accent-hover: #d4a36f
ok: #5a8a5e             sale: #c4524a
ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1)
```

### Custom Utilities (via `@utility`)
- `container-x` — Responsive container (max-1440px, px-4 / md:px-10)
- `display` — Brand display text: Playfair Display, tight tracking, line-height 0.95
- `eyebrow` — Small caps 11px, 0.18em letter-spacing, uppercase, sand colour
- `btn` — Rounded button base (rounded-lg, transitions, active:scale)
- `btn-solid` — Terracotta/accent fill, light text
- `btn-outline` — Transparent with border, fill on hover
- `btn-cream` — Cream background
- `link-underline` — Animated underline on hover (scaleX)
- `no-scrollbar` — Hide scrollbar

### GSAP Reveal System
- `.reveal` starts `opacity:0`, animated by GSAP
- `.reveal-children > *` — Children start hidden
- `prefers-reduced-motion` — Forces visible, no transforms

### Admin Theme System
- Dark mode default (for admin panel)
- Light mode via `[data-admin-theme="light"]` CSS overrides
- ~40 CSS rules mapping dark colors → light equivalents
- Smooth 200ms transitions on admin shell elements

---

## 16. Admin Theme Context — `src/contexts/admin-theme-context.tsx`

- `AdminTheme = 'dark' | 'light'`
- Persisted in localStorage key `ceylon_admin_theme`
- Sets `data-admin-theme` attribute on `document.documentElement`
- `useAdminTheme()` hook: theme, setTheme, toggleTheme

---

## 17. SEO Files

### `src/app/robots.ts`
Allow all crawlers, link to sitemap, disallow `/admin`, `/api`

### `src/app/sitemap.ts`
Dynamic sitemap including:
- Home, shop, shop/room/*, shop/style/*, product/slug
- Custom order page
- About, gallery, contact, size-guide
- Policy pages (shipping, returns, privacy, terms)
- Structured data: Product, Offer, Review, Organization

### `src/app/not-found.tsx`
Custom 404 page with link back to home

### OpenGraph & Meta
- Unique title and meta description per page
- Clean slugs
- One H1 per page
- Open Graph tags optimised for WhatsApp and social app previews
- Canonical URLs
- XML sitemap and robots.txt

---

## 18. Consent & Privacy

### Cookie Consent Banner
- Controls when Meta Pixel and TikTok Pixel scripts load
- Respects user consent choice stored in localStorage
- Privacy Policy discloses all tracking

### Marketing Pixel Loading
- Meta Pixel: loaded only after consent, fires PageView, ViewContent, AddToCart, InitiateCheckout, Purchase
- TikTok Pixel: loaded only after consent, fires ViewContent, AddToCart, InitiateCheckout, PlaceAnOrder
- Server-side events fire regardless (with shared event_id for de-duplication)
- UTM parameters and ttclid captured from URL on first load, persisted in sessionStorage
