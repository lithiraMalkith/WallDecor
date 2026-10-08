---
name: ceylon-walldecor-storefront
description: >
  Build the complete Ceylon Wall Decor customer-facing storefront — Next.js 15 App Router with
  server components, GSAP scroll animations, Tailwind v4 earthy/boho design system, product catalog
  with room/style filtering, size and frame selection, cart/checkout with COD, custom design upload,
  customer gallery, reviews, and all storefront pages. Triggers on requests to create the storefront,
  shop pages, product pages, cart/checkout, custom order form, homepage, or any customer-facing UI.
---

# Ceylon Wall Decor — Storefront Builder Skill

This skill defines the **complete customer-facing storefront**. It covers every page, component, and interaction pattern. Follow the `ceylon-walldecor-foundation` skill first for infrastructure setup.

> **Design Philosophy**: Earthy, boho, handmade luxury aesthetic. Warm neutrals with terracotta and sage accents. Playfair Display for headings, Inter for body. GSAP scroll-triggered reveals. Image-led layout showcasing textured wall art in real rooms. Mobile-first for TikTok/Instagram traffic arriving via in-app browsers on mid-range Android phones.

---

## 1. Storefront Route Map

| Route | File | Type | Purpose |
|---|---|---|---|
| `/` | `app/page.tsx` | **Server Component** | Homepage with hero video loop, shop by room, best sellers, "how it works", customer gallery, reviews |
| `/shop` | `app/shop/page.tsx` | Server | Shop browser — redirects to `/shop/all` |
| `/shop/[category]` | `app/shop/[category]/page.tsx` | Server | Filtered shop (by-room/by-style/by-size/all/new/bestsellers/sale) |
| `/product/[slug]` | `app/product/[slug]/page.tsx` | Server | Product detail page with size selector, frame option, price calculator |
| `/custom-order` | `app/custom-order/page.tsx` | Client | Custom design request form with image upload |
| `/cart` | `app/cart/page.tsx` | Client | Full-page cart view |
| `/checkout` | `app/checkout/page.tsx` | Client | Checkout form (COD only, guest checkout) |
| `/order/confirmation/[id]` | `app/order/confirmation/[id]/page.tsx` | Client | Order success page |
| `/order/track` | `app/order/track/page.tsx` | Client | Order tracking lookup (order ref + phone) |
| `/gallery` | `app/gallery/page.tsx` | Server | Customer photos, real-room inspiration, TikTok embeds |
| `/about` | `app/about/page.tsx` | Server | Brand story, handmade process, "how our art is made" |
| `/contact` | `app/contact/page.tsx` | Client | Contact form |
| `/size-guide` | `app/size-guide/page.tsx` | Server | Visual size guide with wall mockup showing dimensions |
| `/policies/[slug]` | `app/policies/[slug]/page.tsx` | Server | Shipping & delivery, returns/damage, privacy, terms |
| `/faq` | `app/faq/page.tsx` | Server | Frequently asked questions |

---

## 2. Component Architecture

### Layout Components

#### `LayoutShell.tsx`
- Wraps children with `<Header>` + `<Footer>` + `<CartDrawer>` + `<WhatsAppFab>` + `<ConsentBanner>`
- **Hides** Header/Footer on `/admin*` and `/adminlogin` routes using `usePathname()`

#### `Header.tsx`
Premium **sticky header** with:

1. **Top promo bar**: Rotating messages with fade animation:
   - "✨ Handmade Textured Wall Art — Made in Sri Lanka"
   - "🚚 Island-wide COD Delivery"
   - "🎨 Custom Designs Available — Send Your Own Image"
   - "💰 Free Delivery on Orders Above Rs. X,XXX"
2. **Main nav bar**: Sticky, 60px height, backdrop blur on scroll
   - Logo: "Ceylon Wall Decor" text logo (Playfair Display) or client logo image, link to home
   - Desktop nav links: Shop by Room, Shop by Style, Custom Order, New Arrivals, Sale
   - Each "Shop by" link opens a **dropdown** on hover with:
     - Room: Living Room, Bedroom, Kitchen & Dining, Office & Restaurants
     - Style: Boho, Minimalist, Abstract & Modern, Nature-inspired
   - Icons: Search, Cart with item count badge
3. **Mobile nav**: Slide-in drawer from left
   - Accordion-style category tree (tap to expand rooms, styles)
   - Custom Order link, About, Contact, FAQ
4. **Search overlay**: Full-width search input, live product search results
5. **Category data**: Fetched from `/api/storefront/navigation` on mount

Key patterns:
- `useState` for hover state per category, mobile open, search open
- Category tree fetched client-side from API, cached
- `usePathname()` to auto-close mobile nav on route change
- Cart count from `CartProvider` context
- **No customer accounts in phase one** — no login/signup in header

#### `Footer.tsx`
- 4-column grid: Shop links (by room, by style), Customer Care (FAQ, size guide, shipping, returns), Contact info (phone, WhatsApp, email, address), Social & Follow (TikTok, Instagram links)
- Bottom bar: Copyright "© Ceylon Wall Decor", policy links
- WhatsApp contact link
- Earthy palette, warm fonts

#### `WhatsAppFab.tsx`
- Fixed bottom-right floating button
- Green WhatsApp icon
- Links to `wa.me/94782518184` with prefilled message: "Hi! I'm interested in your wall art 🎨"
- Pulse animation on mount
- Available on all pages — WhatsApp remains a parallel contact channel

#### `ConsentBanner.tsx`
- GDPR/privacy consent banner for marketing pixels
- "We use cookies for analytics and social media tracking" with Accept/Decline
- Stored in localStorage; controls Meta Pixel and TikTok Pixel loading
- Links to Privacy Policy page

### Homepage Components

#### `Hero.tsx`
- Full-viewport hero section with **muted auto-play video loop** of best-selling textured art piece (with poster image fallback for performance)
- Video loads only after poster image is visible (lazy)
- GSAP stagger animation: eyebrow ("Handmade in Sri Lanka") → heading ("Textured Wall Art for Every Space") → description → CTA buttons
- Two CTAs: "Shop Collection" (solid terracotta) + "Custom Order" (outline)
- Responsive: stacked on mobile, text overlay on desktop
- Dark gradient overlay on video/image for text readability
- Earthy, warm aesthetic

#### `ShopByRoom.tsx`
- **Bento grid** layout of room categories with large images of art in situ:
  - Large hero tile: Living Room (spans 2 cols)
  - Smaller tiles: Bedroom, Kitchen & Dining, Office & Commercial
- Each tile: background image, room name overlay, hover scale effect
- Links to `/shop/living-room`, `/shop/bedroom`, etc.
- GSAP reveal animation

#### `HowItWorks.tsx`
- 3-step horizontal process strip:
  1. "Choose Your Design" (browse icon) — "Pick from our collection or upload your own"
  2. "We Handcraft It" (craft icon) — "Each piece is hand-made with textured plaster"
  3. "Delivered to You" (delivery icon) — "Island-wide COD delivery in 5-10 days"
- Animated counter/icon reveals on scroll

#### `ProductCarousel.tsx`
- Horizontal scrollable product card row
- Section title + "View All →" link
- Left/right navigation arrows (hidden on mobile)
- Smooth scroll with `scroll-behavior: smooth`
- Shows 2 cards on mobile, 4 on desktop
- Uses `<ProductCard>` for each item

#### `ProductCard.tsx`
- Image with aspect ratio container (4:5), Next.js `<Image>` with WebP/AVIF
- Hover: subtle scale on image
- "New" badge (sage green) or "Sale" badge (terracotta)
- Product name (Playfair Display)
- Price range display: "Rs. 1,500 – Rs. 8,500" (showing min–max across sizes)
- Room/style tag
- "Starting from Rs. X,XXX" for made-to-order pieces
- Link wraps entire card to `/product/[slug]`

#### `CustomerGallery.tsx`
- Masonry grid of customer photos showing art on real walls
- Optional: embedded TikTok video tiles (lazy loaded)
- "As seen on TikTok" badge
- GSAP stagger reveal
- Link to full `/gallery` page: "See More Customer Photos →"

#### `PromoBanner.tsx`
- Full-width promotional section with background image
- Content overlay: badge, title, description, CTA
- Optional **countdown timer** for sales
- Configurable alignment: left or right
- GSAP reveal animation

#### `AnimatedCounter.tsx`
- Stats section with animated counters:
  - "X+ Happy Customers"
  - "X+ Designs Available"
  - "Island-wide Delivery"
  - "100% Handmade"
- Uses GSAP `snap` for integer counting
- Intersection Observer to trigger on scroll into view

#### `SocialProof.tsx`
- 3 featured review cards with star ratings, customer name, and testimonial
- Customer photo optional
- "Verified Purchase" badge

#### `Marquee.tsx`
- Infinite horizontal scroll ticker
- Messages: "Handmade With Love", "Textured Art", "Custom Designs", "COD Delivery", "Sri Lankan Craft"
- CSS animation, 40s cycle, pauses on hover

### Product Detail Components

#### `ProductDetail.tsx`
The core product page component:

1. **Image gallery**: Main image + thumbnail row, click to switch. Optional embedded TikTok video.
2. **Product info**: 
   - Breadcrumb: Home → Shop by Room → Living Room → Product Name
   - Product name (Playfair Display, large)
   - Short description
   - Material & technique note: "Hand-applied textured plaster on canvas"
   - Lead time: "Ready in X days" or "In Stock — Ships in 1-2 days"
3. **Size selector**: Grid of standard size buttons (6×6, 8×8, 10×8, 12×12, 12×16, 18×12, 20×18, 18×24, 20×24)
   - Each button shows label and price
   - Selected state: terracotta outline
   - Price updates live when size is selected
   - "Custom Size" option → links to Custom Order page
4. **Frame option**: Toggle or radio: "Without Frame" / "With Frame (+Rs. X)"
   - Frame price calculated: width × height × rate per sq inch
   - Price display updates live
5. **Total price display**: Bold, large — updates based on size + frame selection
6. **Add to Cart button**: Disabled if no size selected
7. **"Order via WhatsApp" button**: Secondary CTA that opens WhatsApp with prefilled message including product name, selected size, and frame option
8. **Delivery info**: 
   - "🚚 Island-wide COD Delivery"
   - "Estimated delivery: 5-10 working days"
   - "Free delivery on orders above Rs. X,XXX"
9. **Product details accordion**: Long description, materials, care instructions, handmade variation note
10. **Related products** section at bottom

#### `ReviewSection.tsx`
- Fetch reviews from API (approved only)
- Overall rating summary: average, total count, star distribution bar chart
- Individual review cards: customer name, rating, date, comment, customer photo
- **Write review form** (open to anyone, moderated):
  - Star rating selector
  - Comment textarea (min 10 chars)
  - Optional photo upload (their piece on the wall)
  - Submit to `POST /api/reviews` — requires at least name and email
- Eligibility: anyone can submit, verified purchase badge shown for confirmed buyers

#### `StarRating.tsx`
- Reusable star display: filled, half-filled, empty stars
- Configurable size and color (terracotta/gold stars)

### Cart & Checkout Components

#### `CartProvider.tsx` (Context)
- `CartLine[]` state persisted in localStorage (`ceylon.cart.v1`)
- `addLine(line)` — Adds or increments quantity
- `removeLine(productId, sizeLabel, withFrame)` — Remove specific item
- `updateQty(productId, sizeLabel, withFrame, qty)` — Update quantity
- `clearCart()` — Empty cart
- `cartCount` — Total item count
- `subtotal` — Sum of (price + frameCost) × qty

#### `CartDrawer.tsx`
- Slide-in drawer from right side
- Triggered by cart icon click in Header
- Shows cart items with: image, product name, size label, frame (Yes/No), qty, price
- Remove item button per line
- Subtotal display
- "View Cart" and "Checkout" CTAs
- Empty cart state with "Browse Collection" link

#### `CartView.tsx` (Full page cart)
- Table layout: Image, Design, Size, Frame, Quantity selector, Price, Remove
- Quantity +/- buttons
- Order summary sidebar: subtotal, frame costs, estimated delivery fee, total
- "Continue Shopping" + "Proceed to Checkout" buttons
- Empty cart state

#### `CheckoutForm.tsx`
**Guest checkout only** — no customer accounts in phase one.

Multi-section form:
1. **Contact Info**: Full name (required), phone (required, Sri Lankan 10-digit format), email (optional but recommended for confirmation)
2. **Delivery Address**: Address textarea, city input, district dropdown (25 Sri Lankan districts)
3. **Delivery Notes**: Optional (e.g. "call before delivery")
4. **Order Summary**: Line items with design, size, frame, qty, price. Subtotal, frame costs, delivery fee (calculated by district), discount, total
5. **Discount Code**: Input + "Apply" button, validates via `/api/discounts/validate`
6. **Payment Method**: COD displayed (the only option). Shows: "Cash on Delivery — Pay when you receive your order"
7. **Important Notes**: "Handmade pieces may have slight natural variations" disclaimer

- Submit: Validates with `checkoutSchema` (Zod), POSTs to `/api/orders`, saves to localStorage, redirects to confirmation
- **reCAPTCHA / App Check** on submit to prevent fake COD orders
- Phone number validated as Sri Lankan format

#### `OrderConfirmation.tsx`
- Success state with checkmark animation
- Order ref display: "CWD-000123"
- Item summary table (design, size, frame, price)
- Delivery info: address, district, estimated delivery time
- COD note: "Please keep Rs. X,XXX ready for the delivery person"
- WhatsApp contact link for queries
- "Continue Shopping" CTA
- Loads order from localStorage by ID

#### `OrderTracker.tsx`
- Order tracking page at `/order/track`
- Form: order reference number + phone number
- Displays order status timeline (pending → confirmed → processing → dispatched → delivered)
- Shows courier name and tracking number if dispatched

### Custom Order Components

#### `CustomOrderForm.tsx`
- **Custom Design Request** page at `/custom-order`
- Explains the process: "Send us your design or photo → we quote → you approve → we handcraft"
- Typical lead time: "7-14 working days depending on size"
- Form fields:
  - Name (required)
  - Phone (required, Sri Lankan)
  - Email (optional)
  - Upload design/photo (multiple images, up to 5MB each, stored in Firebase Storage)
  - Desired size: width × height in inches (or select from standard sizes)
  - Frame preference
  - Additional notes/instructions
- Submit to `POST /api/custom-requests`
- Confirmation message: "We've received your request! We'll send you a quote via WhatsApp/email within 24 hours."

### Shop Components

#### `ShopBrowser.tsx`
Full-featured product browser with:
1. **Category tabs**: All, by Room (Living Room, Bedroom, Kitchen, Office), by Style (Boho, Minimalist, Abstract, Nature)
2. **Sort options**: Featured, Price Low→High, Price High→Low, Newest, Best Selling
3. **Filters sidebar** (desktop) / bottom sheet (mobile):
   - Room filter (checkboxes)
   - Style filter (checkboxes)
   - Size filter (standard sizes as checkboxes)
   - Price range (min/max inputs)
   - "In Stock" toggle (ready stock only)
   - "On Sale" toggle
   - Clear all filters
4. **Product grid**: 2 cols mobile, 3 cols tablet, 4 cols desktop
5. **Results count**: "Showing X of Y designs"
6. **No results state**: "No designs match your filters"
- Data fetched from `/api/storefront/products` with query params
- Client-side filtering for instant feedback
- URL search params sync for shareable filter state

### Gallery & About Components

#### `GalleryPage.tsx`
- Masonry/grid layout of customer photos with art on their walls
- Embedded TikTok videos (lazy loaded with poster images for performance)
- "As Seen on TikTok" section
- Categories: Living Room, Bedroom, Kitchen, etc.
- Submit your photo CTA (links to WhatsApp or a simple upload form)

#### `AboutPage.tsx`
- Brand story: "Ceylon Wall Decor — Home of Textured Art, Sri Lanka"
- How our art is made: step-by-step with images/video
- Handmade note: "Each piece is individually hand-crafted, so slight variations are part of the charm"
- Team/maker spotlight (if client provides)
- TikTok link and social proof

#### `SizeGuidePage.tsx`
- Visual size guide with wall mockup showing all 9 standard sizes to scale
- Size comparison chart: dimensions in inches, approximate coverage
- "Not sure what size? Contact us on WhatsApp for advice"

---

## 3. Storefront API Routes

These are **public** (no auth required) or **semi-public** endpoints:

### `GET /api/storefront/products`
- Query params: room, style, size, search, sort, minPrice, maxPrice
- Returns published products only (visibility='published')
- Merges Firestore products with static fallback data
- Server-cached for 120s

### `GET /api/storefront/categories`
- Returns active categories only, ordered by `order` field
- Falls back to `DEFAULT_CATEGORIES` if Firestore empty

### `GET /api/storefront/navigation`
- Returns category structure for header navigation
- Room categories and Style categories for dropdown menus
- Optimized for navigation rendering

### `GET /api/storefront/featured`
- Returns featured products ordered by `featuredOrder`
- Falls back to bestsellers/new arrivals

### `POST /api/orders` ⭐ PUBLIC (guest checkout)
- Validates with `checkoutSchema`
- Creates order in Firestore with status 'pending'
- Generates sequential order ref: CWD-000001 (Firestore counter transaction)
- Server-side price recalculation (never trust client prices)
- Frame cost recalculated: width × height × framePricePerSqInch
- Delivery fee calculated from district
- Updates/creates customer record (upsert)
- Sends order confirmation email to customer
- Sends new order alert email to admin
- Fires server-side Meta Purchase event + TikTok PlaceAnOrder event (with de-duplication event_id)
- Captures and saves UTM params and ttclid from request
- Returns order with orderRef

### `POST /api/custom-requests` ⭐ PUBLIC
- Validates with `customRequestSchema`
- Handles file upload URLs (designs uploaded to Firebase Storage by client)
- Creates custom request with status 'new'
- Sends acknowledgment email to customer
- Sends alert to admin

### `POST /api/messages` ⭐ PUBLIC
- Contact form submission
- Validates with `messageSchema`
- Creates message in Firestore with status 'new'

### `GET /api/reviews/stats` ⭐ PUBLIC
- Query: `productId`
- Returns average rating, total count, rating distribution
- Only counts approved reviews

### `GET /api/reviews` (Public when status=approved)
- Query: `productId`, `status=approved`
- Returns approved reviews for a product

### `POST /api/reviews` (Semi-public — name and email required)
- Validates with `reviewSchema`
- Creates review with status 'pending' (requires admin approval)
- Checks `isVerifiedPurchase` by querying orders by email/phone

### `POST /api/discounts/validate` ⭐ PUBLIC
- Validates a discount code at checkout
- Checks: code exists, active status, date range, usage limits, min order amount
- Returns discount amount

### `GET /api/order/track` ⭐ PUBLIC
- Query: `orderRef`, `phone`
- Returns order status, timeline, tracking info
- Validates phone matches order customer phone

---

## 4. Homepage Architecture — `app/page.tsx`

**Server Component** with Firestore data fetching:

### Data fetching (`getHomeData()`)
1. Fetch published products, categories, featured products, and content blocks from Firestore in parallel
2. Cache results in memory for 120s via `server-cache`
3. Merge Firestore products with static fallback (dedup by slug)
4. Featured products: filter by `isFeatured=true`, sort by `featuredOrder`, fallback to bestsellers
5. Graceful degradation: if Firestore quota exhausted, serve static data
6. `export const revalidate = 60` — ISR every minute

### Page sections (top to bottom)
1. `<Hero />` — Full-viewport hero with muted video loop of textured art, CTA: "Shop Collection" + "Custom Order"
2. `<Marquee />` — Scrolling trust messages: "Handmade With Love ✦ Textured Art ✦ Custom Designs ✦ COD Delivery ✦ Sri Lankan Craft"
3. **Trust Strip** — 4-column grid: 🚚 COD Delivery, 🏝️ Island-wide Shipping, 🎨 Custom Designs, ✋ 100% Handmade
4. **Shop by Room** — Bento grid: Living Room (large tile), Bedroom, Kitchen & Dining, Office
5. **Best Sellers** carousel — `<ProductCarousel products={bestSellers}>`
6. **How It Works** — 3-step process: Choose → We Handcraft → Delivered
7. **New Arrivals** carousel — `<ProductCarousel products={newArrivals}>`
8. **Stats Counter** — Warm section: "X+ Happy Customers", "X+ Designs", "5-10 Day Delivery", "100% Handmade"
9. **Customer Gallery** — Masonry grid of art on real walls + TikTok embeds
10. **Promo Banner** — Sale or free delivery offer with optional countdown
11. **Social Proof** — 3 featured review cards with star ratings
12. **Custom Order CTA** — Full-width section: "Have Your Own Design? We'll Make It!" with link to `/custom-order`

---

## 5. Product Detail Page — `app/product/[slug]/page.tsx`

**Server Component** with dynamic metadata:

### Data fetching
1. Try Firestore by slug first
2. Fall back to static product data
3. Generate dynamic meta tags (title, description, OpenGraph image)
4. Product structured data (JSON-LD): Product, Offer with price range, Review aggregate

### Page layout
- Breadcrumb: Home → Shop by Room → Living Room → Product Name
- 2-column layout: Images/Video (left) + Info (right)
- `<ProductDetail product={product} />` — Client component with size/frame selectors
- `<ReviewSection productId={product.id} />` — Client component
- Related products grid at bottom ("You May Also Like")
- "Order via WhatsApp" alternative CTA

---

## 6. Shop Page — `app/shop/[category]/page.tsx`

**Server Component**:
1. Fetch products and categories from Firestore
2. Filter by room/style/size category if not 'all'
3. Dynamic metadata per category (e.g. "Living Room Wall Art | Ceylon Wall Decor")
4. Render `<ShopBrowser>` client component with initial data

Category landing pages written for SEO:
- `/shop/living-room` — "Living Room Wall Art — Handmade Textured Décor"
- `/shop/bedroom` — "Bedroom Wall Art — Cozy Textured Designs"
- `/shop/boho` — "Boho Wall Art — Earthy Textured Pieces"
- etc.

---

## 7. Cart & Checkout Flow

### Cart State (localStorage)
Key: `ceylon.cart.v1`
```typescript
CartLine = {
  productId, slug, name, image,
  sizeLabel, width, height,   // e.g. "12×16", 12, 16
  withFrame,                  // boolean
  price,                      // base price for this size
  frameCost,                  // calculated: width * height * ratePerSqInch (0 if no frame)
  qty
}
```

### Checkout Flow
1. User fills guest checkout form → validates with Zod
2. District selection → delivery fee calculated from delivery zones
3. Optional discount code → validate via API
4. reCAPTCHA verification
5. Submit → `POST /api/orders` (server recalculates all prices)
6. Server generates sequential order ref (CWD-000001)
7. On success: clear cart, save order locally, redirect to `/order/confirmation/[id]`
8. Order saved in Firestore AND localStorage (for guest access to confirmation)
9. Confirmation email sent, admin alerted
10. Meta Purchase + TikTok PlaceAnOrder pixel events fired

### Delivery Fee Logic
- 25 districts with specific fees (Rs.300 – Rs.600 range, configurable in admin)
- Free delivery on orders ≥ threshold (configurable, e.g. Rs. 5,000)
- Estimated delivery time shown per district (1-5 working days)
- Default fee for unknown districts

### Price Calculation (Server-Side)
- Base price looked up from product's sizes array by width/height
- Frame price calculated: width × height × framePricePerSqInch (from product or global setting)
- Total per item: (basePrice + frameCost) × qty
- Subtotal: sum of all items
- Delivery fee: by district or free if above threshold
- Discount: applied if valid code
- Grand total: subtotal + delivery - discount

---

## 8. Custom Order Flow

### Customer Side (`/custom-order`)
1. Customer uploads design/photo (Firebase Storage)
2. Selects desired size and frame preference
3. Submits form with contact details
4. Receives acknowledgment: "We'll send you a quote within 24 hours via WhatsApp/email"

### Admin Side (Admin Panel → Custom Requests module)
1. Admin sees new request with uploaded images
2. Reviews design, assesses feasibility
3. Enters a quoted price
4. Sends quote to customer (via WhatsApp link or email)
5. Customer approves → admin converts to a formal order
6. Order follows normal fulfilment workflow

---

## 9. Design Patterns

### Typography
- **Display / Headings**: Playfair Display — elegant serif for product names, section titles
- **Eyebrow / Labels**: Inter, 11px, semibold, 0.18em letter-spacing, uppercase, sand colour
- **Body**: Inter 400/500 weight
- **Price**: Inter bold, `Rs.` prefix, no decimals
- **Size labels**: Mono-style for dimensions: "12×16"

### Color Usage (Earthy Boho Palette)
- **Primary backgrounds**: paper (#faf8f5), cream (#f5efe6)
- **Primary text**: ink (#1a1410)
- **Muted text**: #8a7e6e
- **Accent / CTA**: terracotta (#c4704b), sage (#7a8c6e)
- **Gold accent**: #b88b5e (for highlights, icons)
- **Sale/error**: #c4524a
- **Success**: #5a8a5e
- **Borders**: #e2ddd5
- **Sand tones**: #c9b99a (tags, subtle elements)

### Buttons
- `btn btn-solid` — Terracotta fill, cream text, rounded-lg
- `btn btn-outline` — Transparent, ink border, fills on hover
- `btn btn-cream` — Cream fill, ink text
- `btn btn-whatsapp` — Green WhatsApp-branded CTA
- All: rounded-lg (not pill), py-3.5 px-7, active:scale(0.98), disabled:opacity-0.4

### Animations (GSAP)
- **Scroll reveals**: `<Reveal>` wrapper, opacity 0→1, y 30→0
- **Stagger**: `<Reveal stagger>` — children animate sequentially (0.08s gap)
- **Hero**: Timeline with stagger: eyebrow → title → description → buttons
- **Counter**: Animated number counting on scroll-in
- **Product image**: Subtle zoom on hover
- **Reduced motion**: Respects `prefers-reduced-motion`, forces visible

### Responsive Breakpoints
- Mobile: default (< 768px) — **primary target** (TikTok/Instagram in-app browser traffic)
- Tablet: `md` (768px+)
- Desktop: `lg` (1024px+)
- Max container: 1440px

### Image Handling
- Next.js `<Image>` with `sizes` prop for responsive loading
- Formats: AVIF + WebP (configured in next.config)
- Remote patterns: Cloudinary, Firebase Storage
- Aspect ratios: Product cards 4:5 (portrait, showcasing wall art), hero full-viewport, room tiles 16:9
- Product photos: consistent, well-lit on neutral walls or in-room mockups
- Video: muted auto-play loops with poster image fallback

---

## 10. Storefront-Specific Patterns

### Server Component Data Fetching
```typescript
export const revalidate = 60; // ISR

async function getData() {
  const cached = getCached<T>(CACHE_KEY);
  if (cached) return cached;
  try {
    const snap = await adminDb.collection('x').get();
    // process...
    setCached(CACHE_KEY, result, 120);
    return result;
  } catch (error) {
    // Graceful fallback to static data
    return staticFallback;
  }
}
```

### Firestore Quota Protection
Every server-side Firestore query has try/catch with:
- Detection of `RESOURCE_EXHAUSTED` error
- Fallback to static product/category data
- Console warning (not error) for expected quota limits

### Static Fallback Data
The store is always functional even without Firestore:
- Static products in `lib/products.ts`
- Static categories in `lib/category-tree.ts`
- Cart works entirely in localStorage
- Guest checkout saves to localStorage

### In-App Browser Testing
- All pages must be tested in TikTok in-app browser and Instagram in-app browser
- These browsers have limited JavaScript support and smaller viewports
- Avoid features that break in WebView (e.g. `window.open`, some OAuth flows)
- WhatsApp chat link must work from in-app browsers

### Marketing Pixel Events
| User Action | Meta Pixel Event | TikTok Pixel Event |
|---|---|---|
| Page load | PageView | — |
| View product | ViewContent (product name, price, category) | ViewContent |
| Add to cart | AddToCart (product, size, value) | AddToCart |
| Start checkout | InitiateCheckout (num items, value) | InitiateCheckout |
| Place order | Purchase (value, currency LKR, content IDs) | PlaceAnOrder (value, content IDs) |

Client-side events fire via consent-gated pixel scripts.
Server-side events fire via Meta Conversions API / TikTok Events API with shared `event_id` for de-duplication.

---

## 11. Critical Implementation Rules

1. **Homepage is a Server Component** — Use `async function` and fetch Firestore directly
2. **Product/Shop pages are Server Components** — Client interactivity via child client components
3. **Cart/Checkout/CustomOrder pages are Client Components** — `'use client'` with hooks
4. **ALWAYS merge Firestore + static data** — Dedup by slug, prefer Firestore
5. **ALWAYS handle Firestore errors gracefully** — Never show blank page
6. **ALWAYS use `formatPrice()` or `LKR()`** — Never raw number display
7. **ALWAYS calculate frame price server-side** — width × height × rate, never trust client
8. **ALWAYS recalculate prices server-side** — On order creation, re-read from Firestore
9. **ALWAYS calculate delivery fee from district** — Not hardcoded
10. **Cart persists in localStorage** — Works without auth
11. **Guest checkout is the default** — No customer accounts in phase one
12. **COD is the only payment method** — No payment gateway integration (designed for future addition)
13. **All prices in LKR** — Sri Lankan Rupees, no decimal places
14. **Phone format: Sri Lankan** — 10 digits starting with 0
15. **Video loads lazily** — Always behind a poster image for PageSpeed
16. **Marketing pixels load after consent** — Consent banner controls pixel loading
17. **Custom orders follow separate workflow** — Request → Quote → Approve → Order
18. **WhatsApp button always available** — Parallel contact channel on every page
19. **Order refs are sequential** — CWD-000001 format via Firestore counter transaction
20. **Handmade disclaimer** — Show on product pages and checkout: "Slight natural variations are part of the charm"
