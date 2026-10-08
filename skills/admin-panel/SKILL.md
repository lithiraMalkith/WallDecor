---
name: ceylon-walldecor-admin-panel
description: >
  Build production-grade admin panel for Ceylon Wall Decor with Next.js App Router, Firebase Auth + Firestore,
  RBAC permissions (Owner/Manager/Order Staff/Content Editor), GSAP animations, Tailwind dark theme, and
  full CRUD for 12 admin modules: Dashboard, Products, Orders, Custom Requests, Customers, Categories,
  Delivery & COD Settings, Content CMS, Notifications, Promotions, Reviews, Marketing/Pixels, Users/Roles.
  Triggers on requests to create admin dashboards, admin pages, CRUD modules, role-based
  access control panels, order management, product management, or any back-office / internal tool UI.
---

# Ceylon Wall Decor — Admin Panel Builder Skill

You are building a **premium dark-themed admin panel** for managing a handmade textured wall art e-commerce business. This skill encodes every convention, pattern, and decision for the Ceylon Wall Decor back-office system.

> **Read `references/architecture.md` before writing any code.** It contains the full type system, API patterns, component anatomy, and file-by-file implementation guide.

> **Business Context**: Ceylon Wall Decor sells handmade textured / fabric wall art in standard sizes (6×6 to 20×24 inches) with optional framing. Products are mostly made-to-order. Orders come via website (COD checkout) and WhatsApp. The admin panel manages products (designs with size-price variants), orders (7-step COD fulfilment), custom design requests, customers, delivery zones, content, email templates, promotions, reviews, marketing pixels, and users/roles. One owner and 1-3 staff.

---

## 1. Tech Stack (Non-Negotiable)

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 15.x |
| Language | TypeScript | 5.x |
| Auth | Firebase Auth + Custom Claims | firebase 12.x / firebase-admin 14.x |
| Database | Firebase Firestore (Admin SDK) | firebase-admin 14.x |
| Storage | Cloud Storage for Firebase | firebase 12.x |
| Styling | Tailwind CSS v4 + custom `brand-*` tokens | tailwindcss 4.x |
| Animations | GSAP + `@gsap/react` (`useGSAP`) | gsap 3.x |
| Icons | Lucide React | lucide-react 1.x |
| Charts | Recharts | recharts 3.x |
| Validation | Zod | zod 4.x |
| Email | Brevo (Sendinblue) or Resend | brevo SDK or resend 6.x |
| Image Hosting | Cloudinary + Firebase Storage | cloudinary 2.x |
| Utilities | clsx, tailwind-merge | latest |

---

## 2. Design System — Brand Tokens

Every admin panel MUST use this dark-themed color palette. Define these in `tailwind.config.ts` under `theme.extend.colors.brand`:

```typescript
brand: {
  bg:             '#0D0D0D',    // Page background
  'bg-hover':     '#1A1A1A',
  surface:        '#161616',    // Cards, panels, sidebar
  'surface-hover':'#1E1E1E',
  border:         '#2A2A2A',    // Borders, dividers
  gold:           '#B88B5E',    // Primary accent — warm gold matching storefront
  'gold-muted':   '#3D3524',    // Active sidebar item background
  'gold-hover':   '#D4A66F',
  terracotta:     '#C4704B',    // Secondary accent for CTAs
  sage:           '#7A8C6E',    // Success / positive states
  muted:          '#6B6B6B',    // Secondary text
  text:           '#F0EDE8',    // Primary text — warm white
  danger:         '#C4524A',    // Error / destructive actions
  success:        '#5A8A5E',    // Success states
}
```

### Fonts
- **Serif**: Playfair Display for brand logo in sidebar (`font-serif`)
- **Sans**: Inter / system sans for all body text (`font-sans`)
- **Mono**: Fira Code for order refs (CWD-000123), SKUs, discount codes (`font-mono`)

### CSS Class Conventions
- Cards: `bg-brand-surface rounded-xl border border-brand-border p-6`
- Tables: `admin-table` class on `<table>`
- Form inputs: `form-input` class
- Status badges: `status-pending`, `status-confirmed`, `status-processing`, `status-ready`, `status-dispatched`, `status-delivered`, `status-completed`, `status-cancelled`, `status-on-hold`, `status-returned`
- Buttons primary: `bg-brand-gold text-brand-bg rounded-lg hover:bg-brand-gold-hover`
- Buttons secondary: `bg-brand-surface border border-brand-border text-brand-text hover:bg-brand-surface-hover`
- Card hover effect: `card-hover` class

---

## 3. Project Structure

```
src/
├── app/
│   ├── admin/
│   │   ├── layout.tsx                  # Sidebar + top-bar shell (client component)
│   │   ├── page.tsx                    # Dashboard: today's orders, revenue, COD cash to collect, best sellers, low-stock
│   │   ├── AdminNotifications.tsx      # Bell icon + pending/confirmed orders dropdown
│   │   ├── products/
│   │   │   ├── page.tsx                # Product list (designs with size variants, images, visibility)
│   │   │   ├── new/page.tsx            # Create product with sizes, prices, frame option, images
│   │   │   └── [id]/
│   │   │       ├── page.tsx            # Product detail view
│   │   │       └── edit/page.tsx       # Edit product
│   │   ├── orders/
│   │   │   ├── page.tsx                # Order list with status filters, search
│   │   │   └── [id]/page.tsx           # Order detail: items, status workflow, courier/tracking, invoice
│   │   ├── custom-requests/
│   │   │   ├── page.tsx                # Custom design request inbox
│   │   │   └── [id]/page.tsx           # Request detail: images, quote entry, approve/reject, convert to order
│   │   ├── customers/
│   │   │   ├── page.tsx                # Customer list from orders
│   │   │   └── [id]/page.tsx           # Customer detail: order history, contact, tags, notes
│   │   ├── categories/
│   │   │   └── page.tsx                # Category manager (room, style, size, collection) with drag-reorder
│   │   ├── delivery/
│   │   │   └── page.tsx                # Delivery zones (25 districts), fees, free threshold, courier list, COD settings
│   │   ├── content/
│   │   │   └── page.tsx                # CMS: homepage banners, hero, featured collections, about, FAQ, policies, gallery, media library
│   │   ├── notifications/
│   │   │   └── page.tsx                # Email template editor, toggle which statuses trigger emails, send log with failures
│   │   ├── promotions/
│   │   │   ├── page.tsx                # Discount code list
│   │   │   └── new/page.tsx            # Create discount (percentage/fixed/free delivery)
│   │   ├── reviews/
│   │   │   └── page.tsx                # Review moderation queue: approve/reject, feature on homepage
│   │   ├── marketing/
│   │   │   └── page.tsx                # Meta Pixel ID, TikTok Pixel ID, access tokens, GA4 ID, UTM/campaign data on orders
│   │   ├── users/
│   │   │   └── page.tsx                # Admin user management, roles, activity log
│   │   ├── roles/
│   │   │   └── page.tsx                # Custom role editor with permission checkboxes
│   │   ├── settings/
│   │   │   └── page.tsx                # Site name, description, owner contact, currency, frame pricing rate, social links
│   │   └── audit/
│   │       └── page.tsx                # Audit trail: who changed what (prices, statuses, deletions)
│   ├── api/
│   │   ├── [module]/
│   │   │   ├── route.ts                # GET (list), POST (create)
│   │   │   └── [id]/route.ts           # GET (single), PUT (update), PATCH (partial), DELETE
│   │   └── auth/
│   │       └── sync/route.ts           # POST — sync Firebase user role on login
│   ├── adminlogin/page.tsx             # Login page (email + Google OAuth)
│   └── layout.tsx                      # Root layout with AuthProvider
├── components/
│   ├── button.tsx                      # Reusable button
│   ├── modal.tsx                       # Reusable modal
│   └── storefront/                     # Customer-facing components (separate)
├── contexts/
│   ├── auth-context.tsx                # Firebase Auth context + role/permission resolution
│   └── cart-context.tsx                # (Storefront only)
├── lib/
│   ├── admin-client.ts                 # Client-side API wrapper functions (fetchApi<T>)
│   ├── admin-service.ts                # Server-side Firestore service helpers
│   ├── auth-middleware.ts              # withAuth() wrapper for API routes
│   ├── firebase.ts                     # Client-side Firebase init
│   ├── firebase-admin.ts              # Server-side Firebase Admin init
│   ├── permissions.ts                  # RBAC permission registry + built-in roles
│   ├── validations.ts                  # Zod schemas for all entities
│   ├── utils.ts                        # cn(), formatPrice(), generateSKU(), slugify(), calculateFramePrice()
│   ├── gsap-config.ts                  # GSAP plugin registration + animation presets
│   ├── email.ts                        # Email templates (order confirmation, status updates, custom request)
│   ├── cloudinary.ts                   # Cloudinary config
│   └── pixels.ts                       # Marketing pixel helpers (server-side events)
└── types/
    └── index.ts                        # ALL TypeScript interfaces and type unions
```

---

## 4. Admin Modules (12 Modules from Requirements Document)

### Module 1: Dashboard & Analytics (`/admin`)
- **Today's orders** count and list
- **Pending orders** count (needs attention)
- **Revenue**: today, this week, this month, total
- **COD cash to collect**: sum of delivered but unpaid orders
- **Best-selling designs**: top 5 by order count
- **Low-stock alerts**: ready-stock items below threshold
- **Traffic source summary**: orders by UTM source (if captured)
- **Conversion summary**: orders from website vs WhatsApp (manual tag)
- **Revenue chart**: last 7/30 days
- **Order status distribution**: pie/bar chart
- **CSV export** of reports

### Module 2: Product & Category Management (`/admin/products`)
- **Create/edit/publish/hide/archive** products (wall art designs)
- **Size variants and prices**: 9 standard sizes, each with its own price (with and without frame)
- **Frame pricing rule**: area × rate per square inch (editable global rate or per-product override)
- **Categories and tags**: room, style, colour tags (multi-select)
- **Multiple images** (Cloudinary upload) + video link (TikTok URL)
- **Stock type**: made-to-order (default, no stock tracking) or ready stock (with quantity)
- **SEO fields**: meta title, meta description per product
- **Bulk CSV import/export** of products
- **Product visibility**: draft → published → archived

### Module 3: Order Management (`/admin/orders`)
- **Order list** with search (by order ref, customer name, phone) and filters (by status, date range)
- **Order detail**: items with design, size, frame, price; customer info; delivery address
- **Status workflow** (7 steps + exceptions):
  1. **Pending** → Order placed on website
  2. **Confirmed** → Staff verified by phone/WhatsApp (protects against fake COD orders)
  3. **Processing** → Piece is being made/framed
  4. **Ready for Dispatch** → Finished, quality-checked, packed
  5. **Dispatched** → Courier name + tracking number saved; customer email sent
  6. **Delivered** → Courier confirms delivery
  7. **Completed** → COD cash received from courier and reconciled
  - Exception: On Hold, Cancelled, Delivery Failed, Returned
- **Status restrictions**: Steps cannot be skipped. Only Owner can reverse or cancel after dispatch.
- **Internal notes** per order
- **Printable invoice / packing slip**
- **COD cash-collected marking**
- **Status history** with timestamps and staff member who made each change

### Module 4: Custom Order / Design Request Management (`/admin/custom-requests`)
- **Inbox** of custom design requests with uploaded images
- **View uploaded designs** (from Firebase Storage)
- **Size and notes** from customer
- **Quote entry**: admin enters a price for the custom piece
- **Approve / Reject** with reason
- **Convert approved request into a formal order** (creates order in orders collection)
- **Link to WhatsApp chat** with customer (prefilled with quote message)

### Module 5: Customer Management (`/admin/customers`)
- **Customer list** built automatically from orders
- **Order history** per customer
- **Contact details**: name, email, phone, address, district
- **Notes and tags**: "repeat buyer", "custom order", etc.
- **Export for remarketing** (CSV, with consent compliance note)

### Module 6: Delivery & COD Settings (`/admin/delivery`)
- **Delivery fee rules by district**: all 25 Sri Lankan districts with configurable fees
- **Free-delivery threshold**: order value above which delivery is free
- **Estimated delivery times** per district/zone
- **Courier list**: name, contact, tracking URL template
- **COD enable/disable**
- **Order value limits** (min/max for COD if needed)

### Module 7: Content & Media Management (`/admin/content`)
- **Homepage hero**: banner image/video, heading, subheading, CTA text/link
- **Featured collections**: select which products appear in homepage carousels
- **About page content**: brand story, how-it's-made text
- **FAQ entries**: add/edit/reorder
- **Policy pages**: shipping & delivery, returns/damage, privacy, terms (rich text editor)
- **Gallery images**: upload customer photos, tag by room
- **TikTok video links**: embedded on gallery and product pages
- **Media library**: browse all uploaded images

### Module 8: Notifications & Email Templates (`/admin/notifications`)
- **Edit email templates**: order confirmation, admin alert, status updates (dispatched, delivered), custom request received, quote sent
- **Toggle which status changes send an email** to the customer
- **Send log**: view sent emails with timestamp, recipient, status (sent/failed)
- **Resend failed emails**
- **Email preview** before saving template changes

### Module 9: Promotions & Coupons (`/admin/promotions`)
- **Discount codes**: create, edit, enable/disable
- **Types**: percentage off, fixed amount off, free delivery
- **Validity dates**: start and end date
- **Usage limits**: max total uses, max per customer
- **Minimum order value**
- **Applicable categories** (optional: only certain rooms/styles)
- **Usage tracking**: used count, last used date

### Module 10: Reviews & Testimonials (`/admin/reviews`)
- **Moderation queue**: pending reviews requiring approval
- **Approve / Reject** with one click
- **View customer photos** (art on their wall)
- **Feature selected testimonials** on homepage
- **Verified purchase badge** (auto-checked against orders)

### Module 11: Marketing & Tracking Settings (`/admin/marketing`)
- **Meta Pixel ID** and Conversions API access token
- **TikTok Pixel ID** and Events API access token
- **Google Analytics 4 ID**
- **Google Search Console** verification
- **View UTM / ttclid campaign data** on orders
- **Campaign attribution report**: which campaigns/sources produce orders

### Module 12: Users, Roles & Activity Log (`/admin/users`, `/admin/roles`, `/admin/audit`)
- **Create staff accounts**: email + password or invite link
- **Assign roles**: Owner (superadmin), Manager, Order Staff, Content Editor
- **Custom roles**: create with permission checkboxes
- **Reset access / deactivate** staff
- **Activity log / Audit trail**: who changed what (prices, statuses, deletions) with timestamp
- **Role-based sidebar filtering**: staff only see menu items they have permission for

---

## 5. Authentication Architecture

### Client Side (`contexts/auth-context.tsx`)
- Wrap app in `<AuthProvider>`.
- Use `onIdTokenChanged` to listen for auth state.
- Extract `role` from custom claims: `tokenResult.claims.role`.
- Resolve permissions via `BUILT_IN_ROLE_PERMISSIONS[role]`.
- Expose: `user`, `role`, `permissions`, `hasPermission(p)`, `isAdmin`, `signInWithEmail()`, `signInWithGoogle()`, `signOut()`.
- On login, call `POST /api/auth/sync` to sync custom claims.

### Server Side (`lib/auth-middleware.ts`)
- `withAuth(req, handler, requiredPermission?)` — verifies Firebase ID token, optionally checks permission.
- Superadmin bypasses ALL permission checks.
- Built-in roles checked against `BUILT_IN_ROLE_PERMISSIONS`.
- Custom roles fetched from Firestore `/roles/{roleId}`.
- Attach decoded token to `req.user`.

### Permission System (`lib/permissions.ts`)
- Permissions follow `module:action` format
- Actions: `read`, `write`, `create`, `delete`
- Built-in roles from requirements Section 7.2:
  - **Owner / superadmin**: ALL permissions
  - **Manager**: Dashboard, Products, Categories, Orders, Custom Requests, Customers, Content, Promotions, Reviews, Featured, Delivery (read), Audit
  - **Order Staff**: Dashboard, Orders (view + move through fulfilment), Customers (read-only) — cannot edit prices, see revenue, export customers, or delete
  - **Content Editor**: Dashboard, Products (RW), Categories (RW), Content (RW), Media — no orders or customer data
- Roles assigned only by Owner
- Access checked in Firestore Security Rules AND server code (not just hidden UI)
- Admin sign-in: email/password with optional 2FA, session timeout
- Customers use guest checkout and never receive admin access

---

## 6. API Route Pattern

Every API route follows this exact structure:

```typescript
// GET /api/[module] — List all
export async function GET(req: NextRequest) {
  return withAuth(req, async (authedReq: AuthedRequest) => {
    try {
      // 1. Parse query params
      // 2. Build Firestore query
      // 3. Convert Firestore timestamps to ISO strings
      // 4. Return { success: true, data: [...] }
    } catch (error) {
      console.error('GET /api/[module] error:', error)
      return NextResponse.json({ success: false, error: 'Failed to fetch' }, { status: 500 })
    }
  }, 'module:read')
}
```

### Response envelope — ALWAYS:
```json
{ "success": true, "data": { ... } }
{ "success": false, "error": "Human-readable message" }
```

### Client-side API wrapper (`lib/admin-client.ts`):
```typescript
async function fetchApi<T>(path: string, token: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...options.headers,
  }
  const response = await fetch(path, { ...options, headers })
  const payload = await response.json()
  if (!response.ok || payload.success === false) {
    throw new Error(payload.error || `API fetch failed: ${response.statusText}`)
  }
  return payload.data as T
}
```

---

## 7. Admin Page Anatomy

### List Page Pattern
Every list page (`/admin/[module]/page.tsx`) follows this structure:

```
'use client'
1. Import hooks: useState, useEffect, useRef
2. Import navigation: useRouter from next/navigation
3. Import animations: useGSAP from @gsap/react, gsap from @/lib/gsap-config
4. Import auth: useAuth from @/contexts/auth-context
5. Import API: fetch functions from @/lib/admin-client
6. Import utils: cn, formatPrice from @/lib/utils
7. Import icons: from lucide-react
8. Import types: from @/types

Component:
  - containerRef = useRef<HTMLDivElement>(null)
  - State: items[], search, filter, loading, modals
  - useEffect: load data with user.getIdToken()
  - useGSAP: animate .page-header and .item-row elements
  - Filter logic: client-side filtering
  - Render: header + filters + search + table + modals + toasts
```

### Key UI Patterns:
1. **Page Header**: Title + count + primary action button (e.g., "Add Design", "Export CSV")
2. **Filter Tabs**: Horizontal pill buttons with active state using `bg-brand-gold/10 border-brand-gold/30 text-brand-gold`
3. **Search Bar**: `form-input pl-10` with Search icon absolutely positioned
4. **Data Table**: `admin-table` class, rows with hover states
5. **Action Menus**: 3-dot `MoreVertical` with dropdown (View / Edit / Delete / Archive)
6. **Delete Confirmation**: Modal overlay with `bg-black/60`, centered card
7. **Toast Notifications**: Fixed bottom-right, with success/error/info variants
8. **Empty States**: Icon + text centered in table cell
9. **Status Badges**: Colour-coded per order status (pending=amber, confirmed=blue, processing=purple, dispatched=cyan, delivered=green, completed=emerald, cancelled=red)

### Detail/View Page Pattern
- Back button with `ArrowLeft` icon
- Header: entity title + status badge
- Content grid: `grid grid-cols-1 lg:grid-cols-3 gap-6`
- Left column (2/3): main content cards
- Right column (1/3): metadata, status controls, actions
- Each section wrapped in: `form-section bg-brand-surface rounded-xl border border-brand-border p-6 space-y-4`

### Order Detail Page (Special)
- Customer info card: name, phone, email, address
- Order items table: design image, name, size, frame, qty, unit price, total
- Order summary: subtotal, frame costs, delivery fee, discount, grand total
- **Status workflow stepper**: Visual timeline showing completed and next steps
- **Status action buttons**: "Confirm Order", "Start Processing", "Mark Ready", "Mark Dispatched" (with courier/tracking input), etc.
- **Internal notes**: Add notes visible only to staff
- **Print Invoice** button
- **COD Collection**: Mark as cash collected (for delivered orders)

---

## 8. GSAP Animation Conventions

### Setup
```typescript
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap-config'
```

### List Page Animations
```typescript
useGSAP(() => {
  gsap.from('.page-header', { opacity: 0, y: -10, duration: 0.4, ease: 'power2.out' })
  const rows = document.querySelectorAll('.item-row')
  if (rows.length > 0) {
    gsap.from('.item-row', { opacity: 0, y: 15, stagger: 0.05, duration: 0.4, ease: 'power2.out', delay: 0.2 })
  }
}, { scope: containerRef })
```

### Detail Page Animations
```typescript
useGSAP(() => {
  const sections = document.querySelectorAll('.form-section')
  if (sections.length > 0) {
    gsap.from('.form-section', { opacity: 0, y: 20, stagger: 0.08, duration: 0.5, ease: 'power3.out' })
  }
}, { scope: containerRef, dependencies: [loading] })
```

### Dashboard Animations (Multi-layered Timeline)
Use `gsap.timeline()` with staggered sequences for stat cards, charts, activity items, and quick actions.

---

## 9. Data Flow Pattern

```
User Action → Component State → API Client (fetchApi<T>) 
    → Next.js API Route → withAuth() middleware 
    → Firebase Admin SDK → Firestore
    → JSON Response { success, data } → Component State Update → Re-render
```

### Token Management
```typescript
const token = await user.getIdToken()
const data = await fetchSomething(token)
```

### Date Handling
- Firestore stores `Timestamp` objects
- API routes convert to ISO strings: `data.createdAt?.toDate?.()?.toISOString()`
- Client components convert back: `new Date(data.createdAt)`

---

## 10. Admin Layout Architecture

### Sidebar (`layout.tsx`)
- Collapsible (72px collapsed / 260px expanded)
- Mobile: slide-out with overlay
- **Brand logo**: "Ceylon Wall Decor" in Playfair Display serif
- **Navigation items** (filtered by `hasPermission(item.permission)`):
  - Dashboard (Home icon)
  - Products (Package icon) — "Designs"
  - Orders (ShoppingBag icon)
  - Custom Requests (Palette icon)
  - Customers (Users icon)
  - Categories (Grid icon)
  - Delivery & COD (Truck icon)
  - Content / CMS (FileText icon)
  - Notifications (Bell icon)
  - Promotions (Tag icon)
  - Reviews (Star icon)
  - Marketing (BarChart icon)
  - Users & Roles (Shield icon)
  - Settings (Settings icon)
  - Audit Log (Clock icon)
- Active state detection: exact match for `/admin`, prefix match for sub-routes
- User section: email + role display + sign out
- Theme toggle: dark/light

### Top Bar
- Mobile menu toggle (hamburger)
- Notifications bell (`AdminNotifications` — shows pending orders count)
- User avatar (first letter of email)
- Sticky with backdrop blur: `bg-brand-bg/80 backdrop-blur-md sticky top-0 z-30`

### Content Area
- GSAP page transition on pathname change
- `flex-1 p-6` container

---

## 11. Validation Pattern (Zod)

Define schemas in `lib/validations.ts`:

```typescript
export const productSchema = z.object({
  name: z.string().min(2, 'Design name is required').max(120),
  sizes: z.array(sizeVariantSchema).min(1, 'At least one size is required'),
  frameOption: z.enum(['included', 'optional', 'none']),
  room: z.array(z.string()).min(1, 'Select at least one room'),
  style: z.array(z.string()).min(1, 'Select at least one style'),
  // ... more fields
})
```

Validate in API routes:
```typescript
const parsed = productSchema.safeParse(body)
if (!parsed.success) {
  return NextResponse.json(
    { success: false, error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
    { status: 400 }
  )
}
```

---

## 12. Notification System

### Toasts (In-page)
```typescript
interface Toast { id: string; type: 'success' | 'error' | 'info'; message: string }

const addToast = (type: Toast['type'], message: string) => {
  const id = Math.random().toString(36).substr(2, 9)
  setToasts(prev => [...prev, { id, type, message }])
  setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
}
```

### Real-time Notifications (AdminNotifications)
- Poll every 30 seconds via `setInterval`
- Track seen activities with `useRef<Set<string>>`
- Play Web Audio API beep for new orders
- Use `react-hot-toast` for system-wide toasts
- Dropdown shows: pending orders (need confirmation), new custom requests
- Click to navigate to order/request detail

---

## 13. Adding a New Module Checklist

When adding a new admin module:

1. **Types**: Add interfaces to `src/types/index.ts`
2. **Validation**: Add Zod schema to `src/lib/validations.ts`
3. **Permissions**: Add `module:read`, `module:write`, `module:delete` to `src/lib/permissions.ts`
4. **API Routes**: Create `src/app/api/[module]/route.ts` (GET, POST) and `[id]/route.ts` (GET, PUT, PATCH, DELETE)
5. **Client API**: Add fetch functions to `src/lib/admin-client.ts`
6. **List Page**: Create `src/app/admin/[module]/page.tsx` following the List Page Pattern
7. **Detail Page**: Create `src/app/admin/[module]/[id]/page.tsx`
8. **Create Page**: Create `src/app/admin/[module]/new/page.tsx` (if needed)
9. **Sidebar**: Add navigation item to `SIDEBAR_ITEMS` in `src/app/admin/layout.tsx`
10. **Roles**: Update `BUILT_IN_ROLE_PERMISSIONS` to grant appropriate access

---

## 14. Currency & Locale

- Currency: **LKR** (Sri Lankan Rupee)
- Locale: `en-LK`
- Format: `Rs. 12,500` via `formatPrice()` utility — **no decimal places**
- Phone validation: Sri Lankan format `^0\d{9}$` (10 digits starting with 0)
- Date format: `toLocaleDateString('en-LK', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })`
- Order ref format: `CWD-000123` (sequential, padded to 6 digits)

---

## 15. Critical Rules

1. **ALWAYS** use `'use client'` directive on admin pages (they use hooks, state, GSAP)
2. **NEVER** trust client-side prices — always re-fetch from Firestore and recalculate (base + frame)
3. **ALWAYS** wrap API calls in try/catch with proper error responses
4. **ALWAYS** convert Firestore `Timestamp` to ISO string in API responses
5. **ALWAYS** filter sidebar items by permission
6. **ALWAYS** use the `fetchApi<T>` wrapper — never raw `fetch` in admin pages
7. **ALWAYS** show loading spinners during data fetches (use `Loader2` from lucide with `animate-spin`)
8. **ALWAYS** include empty state UI when lists are empty
9. **ALWAYS** use `containerRef` + `useGSAP` for entrance animations
10. **NEVER** use inline styles — use Tailwind classes with brand tokens
11. **ALWAYS** handle the case where `user` is null (redirect to login)
12. **ALWAYS** use `cn()` for conditional class merging (clsx + tailwind-merge)
13. **ALWAYS** enforce order status workflow — steps cannot be skipped
14. **ALWAYS** log audit for price changes, status changes, deletions, and role changes
15. **ALWAYS** confirm by phone/WhatsApp before moving order to "Confirmed" (protect against fake COD)
16. **ONLY Owner** can reverse or cancel an order after dispatch
