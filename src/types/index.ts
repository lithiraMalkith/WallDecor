// ============================================================================
// Ceylon Wall Decor — Type Definitions (Admin Panel & Shared)
// ============================================================================

export type BuiltInRole =
  "superadmin" | "manager" | "order_staff" | "content_editor";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: BuiltInRole | string;
  phone?: string;
  createdAt: string;
  lastLoginAt?: string;
  isActive: boolean;
}

export interface CustomRole {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  createdBy: string;
  createdAt: string;
  isCustom: true;
}

// ----------------------------------------------------------------------------
// Products & Variants
// ----------------------------------------------------------------------------
export type VisibilityStatus = "published" | "draft" | "archived";
export type StockType = "made_to_order" | "ready_stock";
export type FrameOption = "included" | "optional" | "none";

export interface SizeVariant {
  width: number; // inches (e.g. 12)
  height: number; // inches (e.g. 16)
  label: string; // e.g. "12×16"
  priceWithoutFrame: number; // LKR (e.g. 3500)
  priceWithFrame: number; // LKR (e.g. 4650)
  sku: string; // e.g. "CWD-SUNRISE-12X16"
  inStock?: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  shortDescription: string;
  longDescription: string;
  images: string[];
  video?: string;
  tiktokVideoLink?: string;
  room: string[]; // e.g. ['Living Room', 'Bedroom']
  style: string[]; // e.g. ['Minimalist', 'Boho']
  colourTags: string[]; // e.g. ['Ivory', 'Gold', 'Neutral']
  sizes: SizeVariant[];
  frameOption: FrameOption;
  framePricePerSqInch: number; // default Rs. 6 per sq inch
  material: string; // e.g. "Textured plaster on canvas"
  technique: string; // e.g. "Hand-sculpted relief"
  leadTimeDays: number; // e.g. 5
  stockType: StockType;
  quantity?: number; // only for ready_stock
  isFeatured: boolean;
  isBestseller: boolean;
  isNew: boolean;
  featuredOrder?: number;
  featuredBadge?: string;
  visibility: VisibilityStatus;
  metaTitle: string;
  metaDescription: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

// ----------------------------------------------------------------------------
// Categories
// ----------------------------------------------------------------------------
export type CategoryType = "room" | "style" | "size" | "collection";

export interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  type: CategoryType;
  parentId: string | null;
  depth: number;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------------
// Orders
// ----------------------------------------------------------------------------
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "ready_for_dispatch"
  | "dispatched"
  | "delivered"
  | "completed"
  | "on_hold"
  | "cancelled"
  | "delivery_failed"
  | "returned";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface OrderItem {
  productId: string;
  productName: string;
  productSlug: string;
  image: string;
  sizeLabel: string; // e.g. "12×16"
  width: number;
  height: number;
  withFrame: boolean;
  unitPrice: number;
  frameCost: number;
  qty: number;
  totalPrice: number;
}

export interface CustomerInfo {
  name: string;
  email?: string;
  phone: string;
}

export interface DeliveryAddress {
  address: string;
  city: string;
  district: string;
  postalCode?: string;
  notes?: string;
}

export interface StatusHistoryEntry {
  status: OrderStatus;
  timestamp: string;
  updatedBy: string; // staff email or 'system'
  note?: string;
}

export interface Order {
  id: string;
  orderRef: string; // Format: "CWD-000123"
  items: OrderItem[];
  subtotal: number;
  frameCost: number;
  deliveryFee: number;
  discountAmount: number;
  discountCode?: string;
  total: number;
  status: OrderStatus;
  paymentMethod: "COD";
  paymentStatus: PaymentStatus;
  amountPaid: number;
  transactionReference?: string;
  currency: "LKR";
  customer: CustomerInfo;
  deliveryAddress: DeliveryAddress;
  statusHistory: StatusHistoryEntry[];
  trackingNumber?: string;
  courierName?: string;
  cancellationReason?: string;
  internalNotes?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  ttclid?: string;
  phoneVerified?: boolean;
  cashCollected?: boolean;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------------
// Custom Design Requests
// ----------------------------------------------------------------------------
export type CustomRequestStatus =
  "new" | "quoted" | "approved" | "rejected" | "converted";

export interface CustomRequest {
  id: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  designUploadUrls: string[];
  sizeWidth?: number;
  sizeHeight?: number;
  sizeLabel?: string;
  framePreference?: string;
  notes: string;
  status: CustomRequestStatus;
  quotedPrice?: number;
  adminNotes?: string;
  convertedOrderId?: string;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------------
// Customers CRM
// ----------------------------------------------------------------------------
export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  district?: string;
  orderCount: number;
  totalSpent: number;
  isRepeat: boolean;
  tags: string[];
  notes?: string;
  firstOrderAt?: string;
  lastOrderAt?: string;
  createdAt: string;
}

// ----------------------------------------------------------------------------
// Delivery Zones & Settings
// ----------------------------------------------------------------------------
export interface DeliveryZone {
  district: string;
  fee: number;
  estimatedDays: string; // e.g. "1-2 days"
  isActive: boolean;
}

export interface CourierPartner {
  name: string;
  contact: string;
  trackingUrlTemplate?: string;
}

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  ownerEmail: string;
  ownerPhone: string;
  whatsappNumber: string;
  currency: "LKR";
  codEnabled: boolean;
  freeDeliveryThreshold: number;
  framePricePerSqInch: number; // default Rs. 6
  deliveryZones: DeliveryZone[];
  couriers: CourierPartner[];
  socialLinks: {
    tiktok?: string;
    instagram?: string;
    facebook?: string;
    whatsapp?: string;
  };
  metaPixelId?: string;
  metaConversionsApiToken?: string;
  tiktokPixelId?: string;
  tiktokEventsApiToken?: string;
  googleAnalyticsId?: string;
  aboutContent?: string;
  faqEntries?: { question: string; answer: string }[];
  consentBannerText?: string;
}

// ----------------------------------------------------------------------------
// Promotions & Discounts
// ----------------------------------------------------------------------------
export type DiscountType = "percentage" | "fixed" | "free_delivery";

export interface Promotion {
  id: string;
  code: string; // e.g. "TIKTOK10"
  type: DiscountType;
  value: number; // % or LKR
  minOrderValue?: number; // LKR
  maxDiscount?: number; // LKR cap for %
  usageLimit?: number;
  usedCount: number;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  applicableCategories?: string[];
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------------
// Reviews & Testimonials
// ----------------------------------------------------------------------------
export interface Review {
  id: string;
  customerName: string;
  customerPhone?: string;
  rating: number; // 1-5
  comment: string;
  photoUrls?: string[];
  productName?: string;
  productId?: string;
  orderRef?: string;
  isVerifiedPurchase: boolean;
  isFeaturedHomepage: boolean;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

// ----------------------------------------------------------------------------
// Customer Inquiries & User Messages
// ----------------------------------------------------------------------------
export type MessageStatus = "unread" | "read" | "replied" | "archived";

export interface UserMessage {
  id: string;
  name: string;
  contact: string; // phone or email
  email?: string;
  phone?: string;
  subject?: string;
  message: string;
  status: MessageStatus;
  adminNotes?: string;
  repliedAt?: string;
  repliedBy?: string;
  createdAt: string;
  updatedAt?: string;
}

// ----------------------------------------------------------------------------
// Email & Notifications
// ----------------------------------------------------------------------------
export interface EmailTemplate {
  id: string;
  name: string;
  slug: string;
  subject: string;
  bodyHtml: string;
  variables: string[];
  isActive: boolean;
}

export interface EmailLog {
  id: string;
  to: string;
  subject: string;
  templateSlug: string;
  status: "sent" | "failed";
  orderRef?: string;
  error?: string;
  sentAt: string;
}

// ----------------------------------------------------------------------------
// Audit Trail
// ----------------------------------------------------------------------------
export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  userRole: string;
  action: string; // e.g. "order:update_status", "product:price_change"
  entityType: string; // "order", "product", "setting"
  entityId: string;
  details: string;
  ipAddress?: string;
  timestamp: string;
}

// ----------------------------------------------------------------------------
// Dashboard Analytics
// ----------------------------------------------------------------------------
export interface DashboardStats {
  ordersToday: number;
  ordersPending: number;
  ordersConfirmed: number;
  ordersProcessing: number;
  ordersDispatched: number;
  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  revenueTotal: number;
  codCashToCollect: number; // delivered but unpaid orders
  lowStockProducts: number;
  totalProducts: number;
  totalCustomers: number;
  newCustomRequests: number;
  revenueData: { day: string; revenue: number }[];
  orderStatusData: { status: string; count: number; color: string }[];
  topDesigns: {
    name: string;
    orders: number;
    revenue: number;
    image: string;
  }[];
  trafficSources: { source: string; orders: number; revenue: number }[];
  recentOrders: {
    id: string;
    orderRef: string;
    customerName: string;
    date: string;
    status: OrderStatus;
    total: number;
  }[];
  recentActivities: {
    id: string;
    type: string;
    message: string;
    time: string;
  }[];
  revenueTrend: number; // % change
  ordersTrend: number; // % change
}

// ----------------------------------------------------------------------------
// API Envelopes
// ----------------------------------------------------------------------------
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: Record<string, string[]>;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ----------------------------------------------------------------------------
// Customer Storefront Account & Authentication
// ----------------------------------------------------------------------------
export interface CustomerUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  notes?: string;
  avatarUrl?: string;
  provider?: "phone" | "email" | "google";
  createdAt: string;
}

export interface CustomerSession {
  user: CustomerUser;
  token?: string;
  expiresAt?: string;
}
