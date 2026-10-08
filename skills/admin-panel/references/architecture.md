# Ceylon Wall Decor — Admin Panel Architecture Reference

This document is the exhaustive reference for implementing the Ceylon Wall Decor admin panel. Read this BEFORE writing any code.

---

## 1. Complete Type System

All types live in `src/types/index.ts`. Here is the complete type registry:

### Auth & Roles
```typescript
type BuiltInRole = 'superadmin' | 'manager' | 'order_staff' | 'content_editor'

interface UserProfile {
  uid: string
  email: string
  displayName: string
  photoURL?: string
  role: BuiltInRole | string   // string for custom roles
  phone?: string
  createdAt: Date
  lastLoginAt?: Date
  isActive: boolean
}

interface CustomRole {
  id: string
  name: string
  permissions: string[]
  createdBy: string
  createdAt: Date
  isCustom: true
}
```

### Products (Wall Art Designs)
```typescript
type VisibilityStatus = 'published' | 'draft' | 'archived'
type StockType = 'made_to_order' | 'ready_stock'
type FrameOption = 'included' | 'optional' | 'none'

interface SizeVariant {
  width: number              // inches
  height: number             // inches
  label: string              // e.g. "12×16"
  priceWithoutFrame: number  // LKR
  priceWithFrame: number     // LKR (0 if frame not applicable)
  sku: string                // e.g. "CWD-BOHO-SUNRISE-12x16"
}

interface Product {
  id: string
  name: string
  slug: string
  sku: string                // base SKU for the design
  shortDescription: string
  longDescription: string
  images: string[]
  video?: string             // video URL
  tiktokVideoLink?: string
  room: string[]             // e.g. ['living-room', 'bedroom']
  style: string[]            // e.g. ['boho', 'minimalist']
  colourTags: string[]       // e.g. ['earthy', 'neutral', 'blue']
  sizes: SizeVariant[]       // 9 standard sizes + custom
  frameOption: FrameOption
  framePricePerSqInch: number // default Rs.6, overridable per product
  material: string            // e.g. "Textured plaster on canvas"
  technique: string           // e.g. "Hand-applied textured plaster"
  leadTimeDays: number        // e.g. 5-7
  stockType: StockType
  quantity?: number           // only for ready_stock
  isFeatured: boolean
  isBestseller: boolean
  isNew: boolean
  featuredOrder?: number
  featuredBadge?: string
  visibility: VisibilityStatus
  metaTitle: string
  metaDescription: string
  createdAt: Date
  updatedAt: Date
  createdBy: string
}
```

### Categories
```typescript
type CategoryType = 'room' | 'style' | 'size' | 'collection'

interface CategoryNode {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  type: CategoryType
  parentId: string | null    // null for root categories
  depth: number              // 0 or 1
  order: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

### Orders
```typescript
type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'ready_for_dispatch' | 'dispatched' | 'delivered' | 'completed' | 'on_hold' | 'cancelled' | 'delivery_failed' | 'returned'
type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

interface OrderItem {
  productId: string
  productName: string
  productSlug: string
  image: string
  sizeLabel: string          // e.g. "12×16"
  width: number
  height: number
  withFrame: boolean
  unitPrice: number          // base price for this size
  frameCost: number          // width * height * rate (0 if no frame)
  qty: number
  totalPrice: number         // (unitPrice + frameCost) * qty
}

interface Order {
  id: string
  orderRef: string           // Format: "CWD-000123" (sequential)
  items: OrderItem[]
  subtotal: number
  frameCost: number          // total frame costs across all items
  deliveryFee: number
  discountAmount: number
  discountCode?: string
  total: number
  status: OrderStatus
  paymentMethod: 'COD'
  paymentStatus: PaymentStatus
  amountPaid: number
  transactionReference?: string
  currency: 'LKR'
  customer: CustomerInfo
  deliveryAddress: DeliveryAddress
  statusHistory: StatusHistoryEntry[]
  trackingNumber?: string
  courierName?: string
  cancellationReason?: string
  internalNotes?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  ttclid?: string
  createdAt: Date
  updatedAt: Date
}

interface CustomerInfo {
  name: string
  email?: string             // optional (guest checkout)
  phone: string
}

interface DeliveryAddress {
  address: string
  city: string
  district: string
  postalCode?: string
  notes?: string
}

interface StatusHistoryEntry {
  status: OrderStatus
  timestamp: Date
  updatedBy: string          // staff email or 'system'
  note?: string
}
```

### Custom Design Requests
```typescript
type CustomRequestStatus = 'new' | 'quoted' | 'approved' | 'rejected' | 'converted'

interface CustomRequest {
  id: string
  customerName: string
  customerEmail?: string
  customerPhone: string
  designUploadUrls: string[]
  sizeWidth?: number
  sizeHeight?: number
  framePreference?: string
  notes: string
  status: CustomRequestStatus
  quotedPrice?: number
  adminNotes?: string
  convertedOrderId?: string
  createdAt: Date
  updatedAt: Date
}
```

### Customers
```typescript
interface Customer {
  id: string
  name: string
  email?: string
  phone: string
  address?: string
  district?: string
  orderCount: number
  totalSpent: number
  isRepeat: boolean
  tags: string[]             // 'repeat_buyer', 'custom_order', etc.
  notes?: string
  firstOrderAt?: Date
  lastOrderAt?: Date
  createdAt: Date
}
```

### Dashboard
```typescript
interface DashboardStats {
  ordersToday: number
  ordersPending: number
  ordersConfirmed: number
  ordersProcessing: number
  ordersDispatched: number
  revenueToday: number
  revenueThisWeek: number
  revenueThisMonth: number
  revenueTotal: number
  codCashToCollect: number   // delivered but unpaid orders
  lowStockProducts: number   // ready-stock below threshold
  totalProducts: number
  totalCustomers: number
  newCustomRequests: number
  revenueData: { day: string; revenue: number }[]
  orderStatusData: { status: string; count: number }[]
  topDesigns: { name: string; orders: number; revenue: number; image: string }[]
  trafficSources: { source: string; orders: number; revenue: number }[]
  recentOrders: { orderRef: string; customerName: string; date: string; status: string; total: number }[]
  recentActivities: { id: string; type: string; message: string; time: string }[]
  revenueTrend: number       // % change week-over-week
  ordersTrend: number        // % change week-over-week
}
```

### Settings
```typescript
interface DeliveryZone {
  district: string
  fee: number
  estimatedDays: string      // e.g. "1-2", "2-3", "3-5"
  isActive: boolean
}

interface SiteSettings {
  siteName: string
  siteDescription: string
  ownerEmail: string
  ownerPhone: string
  whatsappNumber: string
  currency: 'LKR'
  codEnabled: boolean
  freeDeliveryThreshold: number
  framePricePerSqInch: number   // global default, e.g. 6
  deliveryZones: DeliveryZone[]
  couriers: { name: string; contact: string; trackingUrlTemplate?: string }[]
  socialLinks: {
    tiktok?: string
    instagram?: string
    facebook?: string
    whatsapp?: string
  }
  metaPixelId?: string
  metaConversionsApiToken?: string
  tiktokPixelId?: string
  tiktokEventsApiToken?: string
  googleAnalyticsId?: string
  aboutContent?: string
  faqEntries?: { question: string; answer: string }[]
  consentBannerText?: string
}
```

### API Response Envelope
```typescript
interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
  details?: Record<string, string[]>
}

interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}
```

---

## 2. Permission Registry — Complete

```typescript
const PERMISSIONS = {
  DASHBOARD_READ:         'dashboard:read',
  PRODUCTS_READ:          'products:read',
  PRODUCTS_WRITE:         'products:write',
  PRODUCTS_DELETE:        'products:delete',
  ORDERS_READ:            'orders:read',
  ORDERS_WRITE:           'orders:write',
  CUSTOM_REQUESTS_READ:   'custom_requests:read',
  CUSTOM_REQUESTS_WRITE:  'custom_requests:write',
  CUSTOMERS_READ:         'customers:read',
  CUSTOMERS_WRITE:        'customers:write',
  CATEGORIES_READ:        'categories:read',
  CATEGORIES_WRITE:       'categories:write',
  CATEGORIES_DELETE:      'categories:delete',
  DELIVERY_READ:          'delivery:read',
  DELIVERY_WRITE:         'delivery:write',
  CONTENT_READ:           'content:read',
  CONTENT_WRITE:          'content:write',
  NOTIFICATIONS_READ:     'notifications:read',
  NOTIFICATIONS_WRITE:    'notifications:write',
  DISCOUNTS_READ:         'discounts:read',
  DISCOUNTS_WRITE:        'discounts:write',
  DISCOUNTS_DELETE:       'discounts:delete',
  REVIEWS_READ:           'reviews:read',
  REVIEWS_WRITE:          'reviews:write',
  REVIEWS_DELETE:         'reviews:delete',
  MARKETING_READ:         'marketing:read',
  MARKETING_WRITE:        'marketing:write',
  MESSAGES_READ:          'messages:read',
  MESSAGES_WRITE:         'messages:write',
  MESSAGES_DELETE:        'messages:delete',
  FEATURED_READ:          'featured:read',
  FEATURED_WRITE:         'featured:write',
  ROLES_READ:             'roles:read',
  ROLES_WRITE:            'roles:write',
  ROLES_DELETE:           'roles:delete',
  USERS_READ:             'users:read',
  USERS_WRITE:            'users:write',
  SETTINGS_READ:          'settings:read',
  SETTINGS_WRITE:         'settings:write',
  AUDIT_READ:             'audit:read',
  AUDIT_WRITE:            'audit:write',
  AUDIT_DELETE:           'audit:delete',
} as const

type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]
```

### Built-In Role Matrix

| Permission | superadmin (Owner) | manager | order_staff | content_editor |
|---|---|---|---|---|
| dashboard:read | ✅ | ✅ | ✅ | ✅ |
| products:read | ✅ | ✅ | ❌ | ✅ |
| products:write | ✅ | ✅ | ❌ | ✅ |
| products:delete | ✅ | ✅ | ❌ | ❌ |
| orders:read | ✅ | ✅ | ✅ | ❌ |
| orders:write | ✅ | ✅ | ✅ (limited*) | ❌ |
| custom_requests:read | ✅ | ✅ | ❌ | ❌ |
| custom_requests:write | ✅ | ✅ | ❌ | ❌ |
| customers:read | ✅ | ✅ | ✅ | ❌ |
| customers:write | ✅ | ✅ | ❌ | ❌ |
| categories:read | ✅ | ✅ | ❌ | ✅ |
| categories:write | ✅ | ✅ | ❌ | ✅ |
| categories:delete | ✅ | ✅ | ❌ | ❌ |
| delivery:read | ✅ | ✅ | ❌ | ❌ |
| delivery:write | ✅ | ❌ | ❌ | ❌ |
| content:read | ✅ | ✅ | ❌ | ✅ |
| content:write | ✅ | ✅ | ❌ | ✅ |
| notifications:read | ✅ | ✅ | ❌ | ❌ |
| notifications:write | ✅ | ✅ | ❌ | ❌ |
| discounts:read | ✅ | ✅ | ❌ | ❌ |
| discounts:write | ✅ | ✅ | ❌ | ❌ |
| discounts:delete | ✅ | ❌ | ❌ | ❌ |
| reviews:read | ✅ | ✅ | ❌ | ❌ |
| reviews:write | ✅ | ✅ | ❌ | ❌ |
| reviews:delete | ✅ | ❌ | ❌ | ❌ |
| marketing:read | ✅ | ❌ | ❌ | ❌ |
| marketing:write | ✅ | ❌ | ❌ | ❌ |
| messages:read | ✅ | ✅ | ❌ | ❌ |
| messages:write | ✅ | ✅ | ❌ | ❌ |
| messages:delete | ✅ | ❌ | ❌ | ❌ |
| featured:read | ✅ | ✅ | ❌ | ❌ |
| featured:write | ✅ | ✅ | ❌ | ❌ |
| roles:* | ✅ | ❌ | ❌ | ❌ |
| users:* | ✅ | ❌ | ❌ | ❌ |
| settings:* | ✅ | ❌ | ❌ | ❌ |
| audit:read | ✅ | ✅ | ❌ | ❌ |
| audit:write/delete | ✅ | ❌ | ❌ | ❌ |

*Order Staff can only move orders through fulfilment statuses (processing → dispatched). Cannot edit prices, see revenue reports, export customers, or delete anything. Only the Owner (superadmin) can reverse or cancel an order after it has been dispatched.

---

## 3. Order Status State Machine

```
pending → confirmed → processing → ready_for_dispatch → dispatched → delivered → completed

Exception branches:
  pending → on_hold / cancelled
  confirmed → on_hold / cancelled
  processing → on_hold / cancelled
  ready_for_dispatch → on_hold / cancelled
  dispatched → delivery_failed / returned (Owner only can cancel after dispatch)
  delivered → completed (after COD cash collected)
  delivery_failed → dispatched (re-attempt) / cancelled
```

Valid transitions:
```typescript
const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending:            ['confirmed', 'on_hold', 'cancelled'],
  confirmed:          ['processing', 'on_hold', 'cancelled'],
  processing:         ['ready_for_dispatch', 'on_hold', 'cancelled'],
  ready_for_dispatch: ['dispatched', 'on_hold', 'cancelled'],
  dispatched:         ['delivered', 'delivery_failed', 'returned'],  // cancel: owner only
  delivered:          ['completed'],
  completed:          [],           // terminal
  on_hold:            ['confirmed', 'processing', 'cancelled'],  // resume to previous step
  cancelled:          [],           // terminal
  delivery_failed:    ['dispatched', 'cancelled'],  // re-dispatch or cancel
  returned:           ['cancelled'], // terminal after return processed
}
```

Cancellation REQUIRES a reason string.
Dispatched REQUIRES courierName and trackingNumber.
Completed marks COD cash as collected/reconciled.

Status display config:
```typescript
const STATUS_CONFIG: Record<OrderStatus, { label: string; class: string; icon: ReactNode }> = {
  pending:            { label: 'Pending',           class: 'status-pending',    icon: <Clock /> },
  confirmed:          { label: 'Confirmed',         class: 'status-confirmed',  icon: <CheckCircle2 /> },
  processing:         { label: 'Processing',        class: 'status-processing', icon: <Hammer /> },
  ready_for_dispatch: { label: 'Ready to Ship',     class: 'status-ready',      icon: <Package /> },
  dispatched:         { label: 'Dispatched',         class: 'status-dispatched', icon: <Truck /> },
  delivered:          { label: 'Delivered',          class: 'status-delivered',  icon: <PackageCheck /> },
  completed:          { label: 'Completed',         class: 'status-completed',  icon: <CheckCircle /> },
  on_hold:            { label: 'On Hold',           class: 'status-on-hold',    icon: <Pause /> },
  cancelled:          { label: 'Cancelled',         class: 'status-cancelled',  icon: <XCircle /> },
  delivery_failed:    { label: 'Delivery Failed',   class: 'status-cancelled',  icon: <AlertTriangle /> },
  returned:           { label: 'Returned',          class: 'status-cancelled',  icon: <RotateCcw /> },
}
```

---

## 4. Client API Wrapper — Complete Function List

All functions in `src/lib/admin-client.ts`:

```typescript
// Core wrapper
fetchApi<T>(path, token, options?)

// Dashboard
fetchDashboardStats(token): Promise<DashboardStats>

// Products
fetchProducts(token, params?): Promise<Product[]>
fetchProduct(token, productId): Promise<Product>
createProduct(token, product): Promise<Product>
updateProduct(token, productId, product): Promise<Product>
deleteProduct(token, productId): Promise<void>

// Orders
fetchOrders(token, params?): Promise<Order[]>
fetchOrder(token, orderId): Promise<Order>
updateOrderStatus(token, orderId, { status, note?, cancellationReason?, trackingNumber?, courierName? })

// Custom Requests
fetchCustomRequests(token, params?): Promise<CustomRequest[]>
fetchCustomRequest(token, requestId): Promise<CustomRequest>
updateCustomRequest(token, requestId, { status, quotedPrice?, adminNotes? })
convertCustomRequestToOrder(token, requestId): Promise<Order>

// Customers
fetchCustomers(token): Promise<Customer[]>
fetchCustomer(token, customerId): Promise<Customer>
updateCustomer(token, customerId, { notes?, tags? })
deleteCustomer(token, customerId)
exportCustomers(token): Promise<Blob>   // CSV export

// Categories
fetchCategories(token): Promise<CategoryNode[]>
createCategory(token, category): Promise<CategoryNode>
updateCategory(token, categoryId, category): Promise<CategoryNode>
deleteCategory(token, categoryId)
reorderCategories(token, items: { id: string; order: number }[])

// Delivery & COD
fetchDeliverySettings(token): Promise<{ zones: DeliveryZone[]; ... }>
updateDeliverySettings(token, settings)

// Content / CMS
fetchContentBlocks(token): Promise<ContentBlock[]>
updateContentBlock(token, key, content)

// Notifications
fetchEmailLog(token): Promise<EmailLogEntry[]>
updateEmailTemplates(token, templates)
resendEmail(token, emailId)

// Discounts
fetchDiscounts(token): Promise<Discount[]>
createDiscount(token, discount): Promise<Discount>
updateDiscount(token, discountId, discount)
deleteDiscount(token, discountId)

// Reviews
fetchReviews(token, params?): Promise<Review[]>
moderateReview(token, reviewId, { status })
deleteReview(token, reviewId)

// Marketing
fetchMarketingSettings(token): Promise<MarketingSettings>
updateMarketingSettings(token, settings)

// Messages
fetchMessages(token): Promise<Message[]>
updateMessageStatus(id, status, token)
deleteMessage(id, token)

// Featured
fetchFeatured(token): Promise<Product[]>
addFeatured(token, productId, order, badge?)
removeFeatured(token, productId)
reorderFeatured(token, items: { id: string; featuredOrder: number }[])

// Users & Roles
fetchUsers(token): Promise<UserProfile[]>
createUser(token, { email, displayName, role })
updateUser(token, userId, { role?, displayName?, isActive? })
deleteUser(token, userId)
fetchRoles(token): Promise<CustomRole[]>
createRole(token, { name, permissions })
updateRole(token, roleId, { name?, permissions? })
deleteRole(token, roleId)

// Settings
fetchSettings(token): Promise<SiteSettings>
updateSettings(token, settings)

// Audit
fetchAuditLogs(token, params?): Promise<PaginatedResult<AuditLog>>
clearAuditLogs(token)

// Upload
uploadImage(token, base64Data, folder?): Promise<{ url: string }>

// Reports
fetchReport(token, type, format, dateRange): Promise<any>
```

---

## 5. Utility Functions

```typescript
// Class merging (clsx + tailwind-merge)
cn(...inputs: ClassValue[]): string

// Currency formatting — NO DECIMALS
formatPrice(amount?: number | null): string
// Output: "Rs. 12,500"

// SKU generation
generateSKU(designSlug: string, sizeLabel: string): string
// Output: "CWD-BOHO-SUNRISE-12x16"

// Order reference — sequential via Firestore counter
generateOrderRef(counter: number): string
// Output: "CWD-000123"

// Frame price calculation
calculateFramePrice(width: number, height: number, ratePerSqInch: number): number
// Output: 12 * 16 * 6 = 1,152

// Size label formatting
formatSizeLabel(width: number, height: number): string
// Output: "12×16"

// Text truncation
truncate(str: string, length: number): string

// URL slug generation
slugify(str: string): string

// Date formatting
formatDate(date: Date | string): string
```

---

## 6. Sidebar Navigation Items

```typescript
const SIDEBAR_ITEMS: SidebarItem[] = [
  { label: 'Dashboard',        href: '/admin',                 permission: 'dashboard:read',        icon: <LayoutDashboard /> },
  { label: 'Designs',          href: '/admin/products',        permission: 'products:read',         icon: <Palette /> },
  { label: 'Orders',           href: '/admin/orders',          permission: 'orders:read',           icon: <ShoppingBag /> },
  { label: 'Custom Requests',  href: '/admin/custom-requests', permission: 'custom_requests:read',  icon: <Upload /> },
  { label: 'Customers',        href: '/admin/customers',       permission: 'customers:read',        icon: <Users /> },
  { label: 'Categories',       href: '/admin/categories',      permission: 'categories:read',       icon: <FolderTree /> },
  { label: 'Delivery & COD',   href: '/admin/delivery',        permission: 'delivery:read',         icon: <Truck /> },
  { label: 'Content / CMS',    href: '/admin/content',         permission: 'content:read',          icon: <FileText /> },
  { label: 'Notifications',    href: '/admin/notifications',   permission: 'notifications:read',    icon: <Bell /> },
  { label: 'Promotions',       href: '/admin/promotions',      permission: 'discounts:read',        icon: <Tag /> },
  { label: 'Reviews',          href: '/admin/reviews',         permission: 'reviews:read',          icon: <Star /> },
  { label: 'Marketing',        href: '/admin/marketing',       permission: 'marketing:read',        icon: <BarChart3 /> },
  { label: 'Messages',         href: '/admin/messages',        permission: 'messages:read',         icon: <MessageSquare /> },
  { label: 'Users & Roles',    href: '/admin/users',           permission: 'users:read',            icon: <Shield /> },
  { label: 'Settings',         href: '/admin/settings',        permission: 'settings:read',         icon: <Settings /> },
  { label: 'Audit Log',        href: '/admin/audit',           permission: 'audit:read',            icon: <Clock /> },
]
```

---

## 7. GSAP Animation Presets

Defined in `src/lib/gsap-config.ts`:

```typescript
const ANIMATION_PRESETS = {
  fadeInUp:        { opacity: 0, y: 30,     duration: 0.6, ease: 'power3.out' },
  fadeIn:          { opacity: 0,            duration: 0.4, ease: 'power2.out' },
  scaleIn:         { scale: 0.95, opacity: 0, duration: 0.3, ease: 'back.out(1.4)' },
  slideInRight:    { x: '100%',             duration: 0.4, ease: 'expo.out' },
  slideInLeft:     { x: '-100%',            duration: 0.4, ease: 'expo.out' },
  staggerChildren: { opacity: 0, y: 30, stagger: 0.08, duration: 0.6, ease: 'power3.out' },
  counterUp:       { snap: { innerText: 1 }, duration: 1.2, ease: 'power2.out' },
}
```

---

## 8. Zod Validation Schemas — Complete

```typescript
// Size Variant
const sizeVariantSchema = z.object({
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  label: z.string().min(1),
  priceWithoutFrame: z.number().positive(),
  priceWithFrame: z.number().min(0),
  sku: z.string().optional(),
})

// Products (Wall Art Designs)
const productSchema = z.object({
  name: z.string().min(2, 'Design name is required').max(120),
  shortDescription: z.string().min(10).max(500),
  longDescription: z.string().max(2000).optional(),
  sizes: z.array(sizeVariantSchema).min(1, 'At least one size variant required'),
  frameOption: z.enum(['included', 'optional', 'none']),
  framePricePerSqInch: z.number().min(0).optional(),
  room: z.array(z.string()).min(1, 'Select at least one room category'),
  style: z.array(z.string()).min(1, 'Select at least one style'),
  colourTags: z.array(z.string()).optional(),
  material: z.string().optional(),
  technique: z.string().optional(),
  leadTimeDays: z.number().int().positive().optional(),
  stockType: z.enum(['made_to_order', 'ready_stock']),
  quantity: z.number().int().min(0).optional(),
  visibility: z.enum(['published', 'draft', 'archived']),
  images: z.array(z.string()).optional(),
  video: z.string().url().optional(),
  tiktokVideoLink: z.string().url().optional(),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
})

// Checkout (guest COD order)
const checkoutSchema = z.object({
  fullName: z.string().min(3, 'Full name is required'),
  phone: z.string().regex(/^0\d{9}$/, 'Enter a valid 10-digit Sri Lankan phone number'),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().min(8, 'Enter your full delivery address'),
  city: z.string().min(2, 'City is required'),
  district: z.string().min(2, 'Select your district'),
  notes: z.string().max(500).optional(),
  items: z.array(z.object({
    productId: z.string().min(1),
    sizeLabel: z.string().min(1),
    width: z.number().positive(),
    height: z.number().positive(),
    withFrame: z.boolean(),
    qty: z.number().int().positive(),
  })).min(1, 'Cart is empty'),
  discountCode: z.string().optional(),
})

// Custom Design Request
const customRequestSchema = z.object({
  customerName: z.string().min(2, 'Name is required'),
  customerPhone: z.string().regex(/^0\d{9}$/, 'Enter a valid phone number'),
  customerEmail: z.string().email().optional().or(z.literal('')),
  designUploadUrls: z.array(z.string().url()).min(0),
  sizeWidth: z.number().positive().optional(),
  sizeHeight: z.number().positive().optional(),
  framePreference: z.string().optional(),
  notes: z.string().min(10, 'Describe your request').max(2000),
})

// Categories
const categorySchema = z.object({
  name: z.string().min(2).max(60),
  slug: z.string().min(2).optional(),
  description: z.string().max(200).optional(),
  type: z.enum(['room', 'style', 'size', 'collection']),
  depth: z.number().int().min(0).max(1),
  parentId: z.string().nullable().optional(),
})

// Custom Roles
const customRoleSchema = z.object({
  name: z.string().min(2).max(40),
  permissions: z.array(z.string()).min(1),
})

// User Invites
const userInviteSchema = z.object({
  email: z.string().email(),
  displayName: z.string().min(2),
  role: z.string().min(1),
})

// Order Status Update
const orderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'ready_for_dispatch', 'dispatched', 'delivered', 'completed', 'on_hold', 'cancelled', 'delivery_failed', 'returned']),
  note: z.string().max(500).optional(),
  cancellationReason: z.string().min(5).optional(),
  trackingNumber: z.string().optional(),
  courierName: z.string().optional(),
})

// Settings
const siteSettingsSchema = z.object({
  siteName: z.string().min(1),
  siteDescription: z.string().max(300),
  ownerEmail: z.string().email(),
  ownerPhone: z.string().min(1),
  whatsappNumber: z.string().min(1),
  codEnabled: z.boolean(),
  freeDeliveryThreshold: z.number().min(0),
  framePricePerSqInch: z.number().positive(),
  deliveryZones: z.array(z.object({
    district: z.string().min(1),
    fee: z.number().min(0),
    estimatedDays: z.string().min(1),
    isActive: z.boolean(),
  })),
  socialLinks: z.object({
    tiktok: z.string().optional(),
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    whatsapp: z.string().optional(),
  }),
  metaPixelId: z.string().optional(),
  tiktokPixelId: z.string().optional(),
  googleAnalyticsId: z.string().optional(),
})

// Discounts
const discountSchema = z.object({
  code: z.string().min(3).transform(v => v.toUpperCase()),
  description: z.string().max(200).optional(),
  type: z.enum(['percentage', 'fixed', 'free_delivery']),
  value: z.number().positive(),
  minOrderAmount: z.number().min(0).optional(),
  maxUses: z.number().int().positive().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  applicableCategories: z.array(z.string()).optional(),
})

// Reviews
const reviewSchema = z.object({
  productId: z.string().min(1),
  customerName: z.string().min(2),
  customerEmail: z.string().email().optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10).max(1000),
  customerPhotoUrl: z.string().url().optional(),
})

// Messages
const messageSchema = z.object({
  name: z.string().min(2),
  contact: z.string().min(5),
  message: z.string().min(10).max(2000),
})
```

---

## 9. Email Template Structure

Emails are sent via Brevo (or Resend). Key templates:

1. **Order Confirmation** — sent to customer on order placement (order ref, items with design/size/frame, total, COD note, delivery address)
2. **New Order Alert** — sent to admin/owner when a new order is placed
3. **Order Status Update** — sent to customer when status changes (especially "Dispatched" with courier + tracking)
4. **Custom Request Received** — acknowledgment to customer
5. **Custom Request Quote** — quote sent to customer for approval
6. **Order Cancellation** — sent to customer with cancellation reason

All email functions are fire-and-forget (`.catch()` to prevent blocking the API response).
Failed emails are logged and the order is flagged in admin.
Templates are editable from the admin Notifications module.

---

## 10. Dashboard Stat Cards Pattern

```typescript
const statCards = [
  { label: 'Revenue Today',     value: stats.revenueToday,     format: 'currency', icon: <Banknote />,       color: 'text-brand-gold',      bgColor: 'bg-brand-gold/10' },
  { label: 'Orders Today',      value: stats.ordersToday,      format: 'number',   icon: <ShoppingBag />,    color: 'text-brand-gold',      bgColor: 'bg-brand-gold/10' },
  { label: 'Pending Orders',    value: stats.ordersPending,    format: 'number',   icon: <Clock />,          color: 'text-amber-400',       bgColor: 'bg-amber-400/10' },
  { label: 'COD to Collect',    value: stats.codCashToCollect, format: 'currency', icon: <Wallet />,         color: 'text-brand-terracotta', bgColor: 'bg-brand-terracotta/10' },
  { label: 'Custom Requests',   value: stats.newCustomRequests, format: 'number',  icon: <Palette />,        color: 'text-brand-sage',      bgColor: 'bg-brand-sage/10' },
  { label: 'Low Stock Alert',   value: stats.lowStockProducts, format: 'number',   icon: <AlertTriangle />,  color: 'text-brand-danger',    bgColor: 'bg-brand-danger/10' },
]
```

---

## 11. Chart Configuration (Recharts)

### Line Chart (Revenue)
```tsx
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={stats.revenueData}>
    <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
    <XAxis dataKey="day" stroke="#6B6B6B" style={{ fontSize: '12px' }} />
    <YAxis stroke="#6B6B6B" style={{ fontSize: '12px' }} />
    <Tooltip
      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #3a3a3a', borderRadius: '8px' }}
      labelStyle={{ color: '#B88B5E', fontWeight: 'bold' }}
      formatter={(value) => `Rs. ${Number(value).toLocaleString()}`}
    />
    <Line type="monotone" dataKey="revenue" stroke="#B88B5E" strokeWidth={3}
      dot={{ fill: '#B88B5E', r: 5 }} activeDot={{ r: 7, fill: '#D4A66F' }} />
  </LineChart>
</ResponsiveContainer>
```

### Bar Chart (Orders by Status)
```tsx
<BarChart data={stats.orderStatusData}>
  <Bar dataKey="count" fill="#B88B5E" radius={[8, 8, 0, 0]} />
</BarChart>
```

---

## 12. Firebase Configuration

### Client (`lib/firebase.ts`)
```typescript
import { initializeApp, getApps } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = { /* from env */ }
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const googleProvider = new GoogleAuthProvider()
```

### Admin (`lib/firebase-admin.ts`)
```typescript
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'

if (!getApps().length) {
  initializeApp({ credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  })})
}

export const adminAuth = getAuth()
export const adminDb = getFirestore()
export const adminStorage = getStorage()
```

---

## 13. Firestore Collection Structure

```
/products/{productId}           # Wall art designs with size variants
/categories/{categoryId}        # Room, style, size, collection categories
/orders/{orderId}               # Customer orders (COD)
/customers/{customerId}         # Auto-built from orders
/customRequests/{requestId}     # Custom design requests
/reviews/{reviewId}             # Product reviews (moderated)
/discounts/{discountId}         # Promotional codes
/messages/{messageId}           # Contact form messages
/users/{uid}                    # Admin users
/roles/{roleId}                 # Custom roles
/settings/general               # Site settings, delivery zones, pixel IDs
/counters/orders                # Sequential order number counter
/contentBlocks/{key}            # CMS content (hero, banners, gallery, etc.)
/audit_logs/{logId}             # Admin activity audit trail
```

---

## 14. Dependency Install Command

```bash
npm install next react react-dom firebase firebase-admin lucide-react gsap @gsap/react recharts zod resend clsx tailwind-merge cloudinary react-hot-toast date-fns react-hook-form @hookform/resolvers
npm install -D tailwindcss @tailwindcss/postcss @types/react @types/react-dom typescript
```
