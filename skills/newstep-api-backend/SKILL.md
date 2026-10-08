---
name: ceylon-walldecor-api-backend
description: >
  Complete API route blueprints for Ceylon Wall Decor — all API route files covering
  CRUD operations, authentication, dashboard analytics, order processing with 7-step COD workflow,
  custom design request management, product management with size/frame pricing, review moderation,
  discount validation, marketing pixel server-side events, delivery zone management, email notifications,
  audit logging, image upload, and storefront endpoints. Triggers on requests to create API routes,
  fix backend logic, add new endpoints, debug API errors, or understand the server-side data flow.
---

# Ceylon Wall Decor — API Backend Skill

This skill defines **every API route** in the application. Follow the `ceylon-walldecor-foundation` skill first for shared infrastructure.

---

## 1. API Architecture Overview

### Route File Map

```
src/app/api/
├── account/orders/route.ts             # GET — customer order lookup by ref + phone
├── audit/route.ts                      # GET (paginated), POST (create), DELETE (single/clear-all)
├── auth/sync/route.ts                  # POST — sync Firebase user → Firestore + custom claims
├── categories/
│   ├── route.ts                        # GET (list), POST (create)
│   ├── [id]/route.ts                   # GET, PUT, DELETE
│   └── reorder/route.ts               # POST — batch reorder categories
├── content/
│   ├── route.ts                        # GET (list blocks), PUT (update block)
│   └── [key]/route.ts                  # GET (single block), PUT (update)
├── custom-requests/
│   ├── route.ts                        # GET (list), POST (create — public)
│   ├── [id]/route.ts                   # GET, PUT (update status/quote), DELETE
│   └── [id]/convert/route.ts          # POST — convert approved request to order
├── customers/
│   ├── route.ts                        # GET (list), POST (export CSV)
│   └── [id]/route.ts                   # GET (with orders), PUT, DELETE
├── dashboard/route.ts                  # GET — analytics stats
├── debug/route.ts                      # GET — Firebase connection check (dev only)
├── delivery/
│   └── route.ts                        # GET (zones), PUT (update zones/settings)
├── discounts/
│   ├── route.ts                        # GET (list), POST (create)
│   ├── [id]/route.ts                   # GET, PUT, DELETE
│   └── validate/route.ts              # POST — validate discount code (public)
├── featured/route.ts                   # GET (list), POST (add), PUT (reorder), DELETE (remove)
├── marketing/
│   └── route.ts                        # GET (pixel settings), PUT (update)
├── messages/
│   ├── route.ts                        # GET (list), POST (create — public)
│   └── [id]/route.ts                   # PATCH (status), DELETE
├── notifications/
│   ├── route.ts                        # GET (email log), PUT (template settings)
│   └── resend/route.ts                # POST — resend failed email
├── orders/
│   ├── route.ts                        # GET (list), POST (create — public checkout)
│   └── [id]/route.ts                   # GET, PUT (status update)
├── order/
│   └── track/route.ts                  # GET — public order tracking (ref + phone)
├── products/
│   ├── route.ts                        # GET (list), POST (create)
│   └── [id]/route.ts                   # GET, PUT, DELETE
├── reports/route.ts                    # GET — export data (CSV/JSON)
├── reviews/
│   ├── route.ts                        # GET (list), POST (create — semi-public)
│   ├── [id]/route.ts                   # PUT (moderate), DELETE
│   └── stats/route.ts                 # GET — rating stats (public)
├── roles/
│   ├── route.ts                        # GET (list), POST (create)
│   └── [id]/route.ts                   # GET, PUT, DELETE
├── seed/route.ts                       # POST — seed Firestore with static data
├── server-events/route.ts             # POST — fire server-side Meta/TikTok pixel events
├── settings/route.ts                   # GET, PUT
├── storefront/
│   ├── categories/route.ts             # GET — public categories
│   ├── featured/route.ts              # GET — public featured products
│   ├── navigation/route.ts            # GET — category navigation structure
│   └── products/route.ts              # GET — public product listing
├── upload/route.ts                     # POST — Cloudinary image upload
└── users/
    ├── route.ts                        # GET (list), POST (create/invite)
    └── [id]/route.ts                   # GET, PUT, DELETE
```

---

## 2. Universal API Patterns

### Response Envelope (ALL routes)
```typescript
// Success
{ "success": true, "data": { ... } }
{ "success": true, "data": [...] }

// Error
{ "success": false, "error": "Human-readable message" }
{ "success": false, "error": "Validation failed", "details": { "field": ["error"] } }
```

### Auth Wrapper (admin routes)
```typescript
import { withAuth, type AuthedRequest } from '@/lib/auth-middleware'

export async function GET(req: NextRequest) {
  return withAuth(req, async (authedReq: AuthedRequest) => {
    // handler...
  }, 'module:read')
}
```

### Firestore Timestamp Serialization
```typescript
import { serializeDoc, serializeDocs, serverTimestamp } from '@/lib/admin-service'

const doc = await adminDb.collection('x').doc(id).get()
const data = serializeDoc(doc)
```

### Zod Validation
```typescript
import { entitySchema } from '@/lib/validations'

const body = await req.json()
const parsed = entitySchema.safeParse(body)
if (!parsed.success) {
  return NextResponse.json(
    { success: false, error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
    { status: 400 }
  )
}
```

### Firebase Admin Init Guard
```typescript
import { adminDb, firebaseAdminInitError } from '@/lib/firebase-admin'

if (firebaseAdminInitError) {
  return NextResponse.json({ success: false, error: firebaseAdminInitError }, { status: 503 })
}
```

---

## 3. Auth Routes

### `POST /api/auth/sync`
**Purpose**: Sync Firebase Auth user to Firestore `users` collection and set custom claims.

**Flow**:
1. `withAuth(req, handler)` — no permission check
2. Look up user doc in `users/{uid}` Firestore collection
3. If exists: update `lastLoginAt`, read role
4. If not exists: check if this is the FIRST user (collection empty) → assign `superadmin`, else assign `customer`
5. Set custom claims via `adminAuth.setCustomClaims(uid, { role })`
6. Create/update Firestore user doc with: uid, email, displayName, photoURL, role, createdAt, lastLoginAt, isActive:true
7. Return `{ role }`

---

## 4. Product Routes

### `GET /api/products`
**Auth**: `products:read`
- Query params: room, style, visibility, search, sort
- Firestore query with filters
- Return array of products with all size variants and prices

### `POST /api/products`
**Auth**: `products:write`
- Validate with `productSchema`
- Generate slug from name if not provided
- Generate SKUs for each size variant: `CWD-{SLUG}-{WxH}`
- Validate size variants: each must have valid dimensions and prices
- Calculate frame prices if frameOption is 'optional': width × height × framePricePerSqInch
- Set createdAt/updatedAt, createdBy from auth
- Upload images to Cloudinary if base64 provided
- Add to Firestore
- Log audit: `create:product`
- Invalidate server cache

### `GET /api/products/[id]`
**Auth**: `products:read`
- Fetch single product by ID with all size variants

### `PUT /api/products/[id]`
**Auth**: `products:write`
- Validate with `productSchema`
- Update Firestore doc
- Recalculate frame prices for updated sizes
- Handle image additions/removals (Cloudinary)
- Log audit: `update:product` (especially price changes)
- Invalidate server cache

### `DELETE /api/products/[id]`
**Auth**: `products:delete`
- **Archive instead of hard delete** (set visibility to 'archived') to preserve order history
- Delete Cloudinary images only on hard delete
- Log audit: `archive:product` or `delete:product`
- Invalidate server cache

---

## 5. Order Routes ⭐ Core Business Logic

### `GET /api/orders`
**Auth**: `orders:read`
- Query params: status, search (order ref, customer name, phone), dateRange
- Order by createdAt desc
- Return array of orders with items, customer, status history

### `POST /api/orders` ⭐ PUBLIC (no auth — guest checkout)
**Purpose**: Customer checkout — creates a COD order.

**Critical Flow**:
1. **Validate** with `checkoutSchema` (Zod)
2. **reCAPTCHA / App Check verification** — reject if fails
3. **Rate limiting** — prevent abuse (max X orders per IP per hour)
4. **Generate order ref**: Firestore transaction on `counters/orders` → `CWD-{padded6digits}`
5. **Server-side price recalculation** (NEVER trust client prices):
   - For each item: look up product in Firestore → find matching size variant → get base price
   - If `withFrame=true`: calculate frame cost = width × height × framePricePerSqInch
   - Item total = (basePrice + frameCost) × qty
6. **Calculate delivery fee** from district using delivery zones in settings
7. **Apply discount** if code provided: validate via discount logic (check active, date range, usage limits, min amount)
8. **Build order document** with:
   - items[] (snapshots with product name, slug, image, size, frame, unit price, frame cost)
   - subtotal, frameCost (total), deliveryFee, discountAmount, total
   - status: 'pending'
   - paymentMethod: 'COD', paymentStatus: 'pending'
   - currency: 'LKR'
   - customer: { name, email, phone }
   - deliveryAddress: { address, city, district, postalCode?, notes }
   - statusHistory: [{ status:'pending', timestamp:now, updatedBy:'system' }]
   - UTM params: utmSource, utmMedium, utmCampaign, ttclid (from request headers/body)
9. **Save to Firestore** `orders` collection
10. **Update customer record**: Upsert in `customers` collection (increment orderCount, totalSpent, set isRepeat if >1)
11. **Update stock** (for ready-stock items only): decrement quantity
12. **Increment discount usedCount** if discount applied
13. **Send emails** (fire-and-forget):
    - `sendOrderConfirmation(order)` to customer (order ref, items with sizes and frame, total, COD note, address)
    - `sendNewOrderAlert(order)` to admin/owner
14. **Fire server-side pixel events** (fire-and-forget):
    - Meta Conversions API: Purchase event (value, currency LKR, content_ids)
    - TikTok Events API: PlaceAnOrder event (value, content_ids)
    - With shared event_id for de-duplication with client-side pixels
15. **Return** created order with orderRef

### `GET /api/orders/[id]`
**Auth**: `orders:read`
- Full order detail with items, customer, status history, notes

### `PUT /api/orders/[id]`
**Auth**: `orders:write`
- Validate with `orderStatusSchema`
- **Status workflow enforcement**:
  - Normal flow: pending → confirmed → processing → ready_for_dispatch → dispatched → delivered → completed
  - Steps CANNOT be skipped
  - Exception statuses (on_hold, cancelled, delivery_failed, returned) allowed from certain states
  - Only superadmin (Owner) can reverse or cancel after dispatch
- **Status-specific actions**:
  - `confirmed`: Staff verified order by phone/WhatsApp (protects against fake COD)
  - `dispatched`: Requires courierName and trackingNumber
  - `delivered`: Marks as delivered by courier
  - `completed`: COD cash received from courier, reconciled
  - `cancelled`: Requires cancellationReason; **restore stock** for ready-stock items; restore discount usage
- **Append to statusHistory[]**: { status, timestamp, updatedBy (staff email), note }
- **Send status update email** to customer (e.g. "Your order has been dispatched! Courier: X, Tracking: Y")
- **Log audit**: `update:order:status`

### `GET /api/order/track` ⭐ PUBLIC
- Query: `orderRef`, `phone`
- Validates phone matches order's customer phone
- Returns: order status, status timeline, tracking number, courier name
- Does NOT expose full order details (only status + tracking)

---

## 6. Custom Request Routes

### `GET /api/custom-requests`
**Auth**: `custom_requests:read`
- List all custom design requests, ordered by createdAt desc
- Filter by status: new, quoted, approved, rejected, converted

### `POST /api/custom-requests` ⭐ PUBLIC
- Validate with `customRequestSchema`
- Customer uploads design images to Firebase Storage (client-side), sends URLs
- Create request with status 'new'
- Send acknowledgment email to customer
- Send alert email to admin

### `GET /api/custom-requests/[id]`
**Auth**: `custom_requests:read`
- Full request detail with uploaded image URLs

### `PUT /api/custom-requests/[id]`
**Auth**: `custom_requests:write`
- Update status: new → quoted → approved/rejected
- Set quotedPrice, adminNotes
- If quoting: send quote email/WhatsApp to customer
- Log audit: `update:custom_request`

### `POST /api/custom-requests/[id]/convert`
**Auth**: `custom_requests:write`
- Convert an approved custom request into a formal order
- Creates order in `orders` collection with custom-order details
- Sets request status to 'converted' with convertedOrderId
- Log audit: `convert:custom_request`

### `DELETE /api/custom-requests/[id]`
**Auth**: `custom_requests:delete`
- Soft delete or archive

---

## 7. Category Routes

### `GET /api/categories`
**Auth**: `categories:read`
- Return all categories ordered by `order` asc
- Group by type: room, style, size, collection

### `POST /api/categories`
**Auth**: `categories:write`
- Validate with `categorySchema`
- Calculate depth from parentId
- Set order (append to end of siblings)
- Log audit: `create:category`

### `PUT /api/categories/[id]`
**Auth**: `categories:write`
- Update fields
- Recalculate depth if parentId changed

### `DELETE /api/categories/[id]`
**Auth**: `categories:delete`
- Check for products using this category
- Delete all descendant categories (cascade)
- Log audit: `delete:category`

### `POST /api/categories/reorder`
**Auth**: `categories:write`
- Batch update: `[{ id, order, parentId? }]`
- Uses Firestore batch writes

---

## 8. Customer Routes

### `GET /api/customers`
**Auth**: `customers:read`
- List all customers, ordered by createdAt desc
- Search by name, email, phone
- Filter: repeat buyers, by district

### `GET /api/customers/[id]`
**Auth**: `customers:read`
- Single customer + their orders + custom requests

### `PUT /api/customers/[id]`
**Auth**: `customers:write`
- Update notes, tags

### `DELETE /api/customers/[id]`
**Auth**: `customers:write`
- Delete customer record (does NOT delete orders)

### `POST /api/customers` (Export)
**Auth**: `customers:read`
- Export customer list as CSV
- Includes consent compliance note

---

## 9. Delivery & Settings Routes

### `GET /api/delivery`
**Auth**: `delivery:read`
- Return delivery zones: 25 districts with fees, estimated days
- Free delivery threshold
- Courier list
- COD settings

### `PUT /api/delivery`
**Auth**: `delivery:write` (or `settings:write`)
- Update delivery zones, fees, threshold, couriers
- Log audit: `update:delivery_settings`

---

## 10. Message Routes

### `GET /api/messages`
**Auth**: `messages:read`

### `POST /api/messages` ⭐ PUBLIC
- Validate with `messageSchema`
- Create with status 'new'

### `PATCH /api/messages/[id]`
**Auth**: `messages:write`
- Update status to 'read' or 'replied'
- Set repliedBy if marking as replied

### `DELETE /api/messages/[id]`
**Auth**: `messages:delete`

---

## 11. Review Routes

### `GET /api/reviews`
**Auth**: `reviews:read` (admin) OR public with `status=approved`
- If query has `productId` + `status=approved` → public access
- Otherwise requires auth

### `POST /api/reviews` (Semi-public — requires name/email, not admin auth)
- Validate with `reviewSchema`
- Set customerName, customerEmail from body
- Set status: 'pending' (requires admin moderation)
- Check `isVerifiedPurchase` by querying orders by email/phone

### `PUT /api/reviews/[id]`
**Auth**: `reviews:write`
- Moderate: update status to 'approved' or 'rejected'
- If approved: update product rating/reviewCount aggregate

### `DELETE /api/reviews/[id]`
**Auth**: `reviews:delete`
- If was approved: recalculate product rating

### `GET /api/reviews/stats` ⭐ PUBLIC
- Query: `productId`
- Aggregate: average rating, total reviews, distribution {1:x, 2:x, 3:x, 4:x, 5:x}
- Only counts approved reviews

---

## 12. Discount Routes

### `GET /api/discounts`
**Auth**: `discounts:read`

### `POST /api/discounts`
**Auth**: `discounts:write`
- Validate with `discountSchema`
- Code auto-uppercased
- Types: 'percentage', 'fixed', 'free_delivery'
- Set usedCount: 0

### `PUT /api/discounts/[id]`
**Auth**: `discounts:write`

### `DELETE /api/discounts/[id]`
**Auth**: `discounts:delete`

### `POST /api/discounts/validate` ⭐ PUBLIC
- Validate with `discountValidateSchema`
- Check: code exists, status=active, within date range, usedCount < maxUses, orderTotal >= minOrderAmount
- If applicableCategories set: check cart items' categories match
- Calculate discount:
  - percentage: orderTotal × (value / 100)
  - fixed: value (capped at orderTotal)
  - free_delivery: returns deliveryFee amount as discount
- Return `{ valid: true, discount, discountAmount }` or `{ valid: false, error: "reason" }`

---

## 13. Featured Product Routes

### `GET /api/featured`
**Auth**: `featured:read`
- Products where `isFeatured=true`, ordered by `featuredOrder`

### `POST /api/featured`
**Auth**: `featured:write`
- Mark a product as featured: set `isFeatured=true`, `featuredOrder`, `featuredBadge`
- Log audit: `feature:product`

### `PUT /api/featured`
**Auth**: `featured:write`
- Batch update featured order

### `DELETE /api/featured?id=X`
**Auth**: `featured:write`
- Unmark product: set `isFeatured=false`

---

## 14. User & Role Routes

### `GET /api/users`
**Auth**: `users:read`
- List admin users from `users` collection

### `POST /api/users`
**Auth**: `users:write`
- Create Firebase Auth user with `adminAuth.createUser()`
- Set custom claims: `{ role }`
- Create Firestore user doc
- Roles: superadmin, manager, order_staff, content_editor

### `PUT /api/users/[id]`
**Auth**: `users:write`
- Update role → update custom claims
- Update displayName, isActive

### `DELETE /api/users/[id]`
**Auth**: `users:write` (superadmin only for other superadmins)
- Delete Firebase Auth user
- Delete Firestore user doc

### `GET /api/roles`
**Auth**: `roles:read`
- List custom roles + built-in role definitions

### `POST /api/roles`
**Auth**: `roles:write`
- Validate with `customRoleSchema`
- Save to Firestore `roles` collection

### `PUT /api/roles/[id]`
**Auth**: `roles:write`

### `DELETE /api/roles/[id]`
**Auth**: `roles:delete`
- Check no users assigned to this role before deleting

---

## 15. Dashboard Route

### `GET /api/dashboard`
**Auth**: `dashboard:read`

**Returns** `DashboardStats`:
- **Orders**: today, pending, confirmed, processing, dispatched — counts
- **Revenue**: today, this week, this month, total (from completed orders)
- **COD cash to collect**: sum of `total` for orders with status 'delivered' and paymentStatus 'pending'
- **Low stock count**: ready-stock products with quantity ≤ threshold
- **Best-selling designs**: top 5 by order count with design name, image, revenue
- **Total products and customers**
- **Revenue chart data**: last 7/30 days `{ day, revenue }`
- **Order status distribution**: `{ status, count }`
- **Traffic source breakdown**: orders grouped by utmSource
- **Recent orders**: latest 10 `{ orderRef, customerName, date, status, total }`
- **Recent activities**: latest admin actions `{ type, message, time }`
- **Trends**: revenue % change and order % change week-over-week

**Calculation approach**:
1. Fetch orders from Firestore (last 1000 or paginated)
2. Calculate date ranges: today, week start, month start
3. Aggregate in-memory for all metrics
4. Product count: query products collection (published only)
5. Customer count: count customers collection

---

## 16. Content / CMS Routes

### `GET /api/content`
**Auth**: `content:read`
- List all content blocks (hero, banners, gallery, about, faq, policies)

### `GET /api/content/[key]`
**Auth**: `content:read`
- Single content block by key

### `PUT /api/content/[key]`
**Auth**: `content:write`
- Update content block
- Log audit: `update:content:{key}`

---

## 17. Marketing Routes

### `GET /api/marketing`
**Auth**: `marketing:read`
- Return pixel IDs, API tokens, GA4 ID
- Return campaign attribution data (orders with UTM/ttclid)

### `PUT /api/marketing`
**Auth**: `marketing:write`
- Update pixel IDs and API tokens
- Stored in `settings/general` document
- Log audit: `update:marketing_settings`

### `POST /api/server-events`
**Internal** — called by order creation and other server-side code
- Fires Meta Conversions API event
- Fires TikTok Events API event
- De-duplication with shared event_id
- Body: `{ platform, eventName, params, eventId }`

---

## 18. Notification Routes

### `GET /api/notifications`
**Auth**: `notifications:read`
- Return email send log with timestamps, recipients, status (sent/failed)
- Return email template settings (which status changes trigger emails)

### `PUT /api/notifications`
**Auth**: `notifications:write`
- Update email template content
- Toggle which status changes send emails

### `POST /api/notifications/resend`
**Auth**: `notifications:write`
- Resend a failed email by ID
- Log attempt

---

## 19. Settings Route

### `GET /api/settings`
**Auth**: `settings:read`
- Read from `settings/general` document
- Return SiteSettings (site name, contact, delivery zones, frame pricing, social links, pixel IDs, policies)

### `PUT /api/settings`
**Auth**: `settings:write`
- Validate with `siteSettingsSchema`
- Update `settings/general` document
- Log audit: `update:settings`

---

## 20. Upload Route

### `POST /api/upload`
**Auth**: Required (any admin role)
- Body: `{ image: "base64_data", folder?: "products" | "gallery" | "content" }`
- Upload to Cloudinary via `uploadImage()`
- Return `{ url: "https://res.cloudinary.com/..." }`

---

## 21. Audit Route

### `GET /api/audit`
**Auth**: `audit:read`
- Paginated: `page`, `pageSize` params
- Filters: `action`, `resource`, `userId`, `dateRange`
- Return `PaginatedResult<AuditLog>`

### `POST /api/audit`
**Auth**: `audit:write`
- Create single audit log entry
- Validate with `auditCreateSchema`

### `DELETE /api/audit`
**Auth**: `audit:delete`
- If `clearAll=true`: delete ALL audit logs (batch delete in chunks of 500)
- If `id` param: delete single log

---

## 22. Reports Route

### `GET /api/reports`
**Auth**: `dashboard:read`
- Query: `type` (orders, products, customers, revenue, campaigns)
- Query: `format` (json, csv)
- Query: `dateRange` (today, week, month, all)
- Generate report data from Firestore
- Return JSON or CSV (with Content-Type header)

---

## 23. Storefront Public Routes

### `GET /api/storefront/products`
**No auth** — public
- Query: `room`, `style`, `size`, `search`, `sort`, `minPrice`, `maxPrice`
- Only returns `visibility=published` products
- Server-cached 120s
- Falls back to static products if Firestore unavailable

### `GET /api/storefront/categories`
**No auth** — public
- Returns `isActive=true` categories, ordered by `order`
- Grouped by type (room, style, size, collection)
- Falls back to `DEFAULT_CATEGORIES`

### `GET /api/storefront/navigation`
**No auth** — public
- Returns category structure for header navigation
- Room and style dropdowns
- Optimized: only returns id, name, slug, image, type, parentId, depth, order

### `GET /api/storefront/featured`
**No auth** — public
- Returns featured products (isFeatured=true, published)
- Sorted by featuredOrder
- Falls back to bestsellers

---

## 24. Seed Route

### `POST /api/seed`
**Auth**: `settings:write` (superadmin only)
- Seeds Firestore with:
  - Products from `lib/products.ts` (seed designs with sizes and prices)
  - Categories from `lib/category-tree.ts` (room, style, size, collection categories)
  - Delivery zones (25 Sri Lankan districts with default fees)
  - Settings defaults (site name, contact, frame pricing rate)
  - Order counter initial value
- Skips if documents already exist (idempotent)
- Returns count of seeded documents

---

## 25. Debug Route

### `GET /api/debug`
**No auth** — for troubleshooting
- Tests Firebase Admin connection
- Returns: Firebase init status, project ID, collection counts
- ONLY enabled in development

---

## 26. Critical Backend Rules

1. **ALWAYS validate input** with Zod before any database operation
2. **ALWAYS serialize Firestore Timestamps** to ISO strings before returning
3. **ALWAYS check `firebaseAdminInitError`** at route start
4. **ALWAYS use `serverTimestamp()`** for createdAt/updatedAt
5. **ALWAYS invalidate server cache** after mutations (products, categories, featured, settings)
6. **ALWAYS log audit** for create/update/delete operations on critical resources (products, orders, prices, roles)
7. **ALWAYS recalculate prices server-side** — base price from product, frame cost from dimensions × rate, delivery from district
8. **ALWAYS handle stock** for ready-stock items — decrement on order create, restore on cancel
9. **ALWAYS generate sequential order refs** via Firestore counter transaction (CWD-000001)
10. **ALWAYS enforce order status workflow** — steps cannot be skipped; only superadmin can reverse after dispatch
11. **ALWAYS send emails** fire-and-forget (don't block response on email delivery)
12. **ALWAYS fire server-side pixel events** with de-duplication event_id on order creation
13. **NEVER expose server env variables** (API keys, pixel tokens) in responses
14. **NEVER trust client-side prices** — always re-read from Firestore and recalculate
15. **NEVER hard-delete orders** — only status changes allowed; archived products kept for order history
16. **ALWAYS batch Firestore writes** when updating multiple docs (reorder, stock, etc.)
17. **Public routes** (checkout, messages, custom requests, discount validate, review stats, order track) must NOT require auth
18. **Semi-public routes** (review create) require name/email but NOT admin role
19. **Capture UTM and ttclid** from order creation requests for campaign attribution
20. **Log email failures** and flag orders with failed notifications for admin attention
