// ============================================================================
// Ceylon Wall Decor — Zod Validation Schemas
// ============================================================================

import { z } from "zod";

export const sizeVariantSchema = z.object({
  width: z.number().positive("Width must be greater than 0"),
  height: z.number().positive("Height must be greater than 0"),
  label: z.string().min(1, "Size label is required"),
  priceWithoutFrame: z.number().nonnegative("Price must be 0 or more"),
  priceWithFrame: z.number().nonnegative("Frame price must be 0 or more"),
  sku: z.string().min(1, "SKU is required"),
  inStock: z.boolean().optional(),
});

export const productSchema = z.object({
  name: z.string().min(2, "Design name is required").max(120),
  slug: z.string().min(2).optional(),
  sku: z.string().min(2, "Base SKU is required"),
  shortDescription: z.string().min(5, "Short description is required").max(300),
  longDescription: z.string().min(10, "Long description is required"),
  images: z.array(z.string().min(1)).min(1, "At least one image is required"),
  video: z.string().url().optional().or(z.literal("")),
  tiktokVideoLink: z.string().url().optional().or(z.literal("")),
  room: z.array(z.string()).min(1, "Select at least one room category"),
  style: z.array(z.string()).min(1, "Select at least one style category"),
  colourTags: z.array(z.string()).default([]),
  sizes: z
    .array(sizeVariantSchema)
    .min(1, "At least one size variant is required"),
  frameOption: z.enum(["included", "optional", "none"]),
  framePricePerSqInch: z.number().nonnegative().default(6),
  material: z.string().default("Textured plaster on canvas"),
  technique: z.string().default("Hand-sculpted relief"),
  leadTimeDays: z.number().int().positive().default(5),
  stockType: z.enum(["made_to_order", "ready_stock"]),
  quantity: z.number().int().nonnegative().optional(),
  isFeatured: z.boolean().default(false),
  isBestseller: z.boolean().default(false),
  isNew: z.boolean().default(false),
  featuredOrder: z.number().int().optional(),
  featuredBadge: z.string().optional(),
  visibility: z.enum(["published", "draft", "archived"]).default("published"),
  metaTitle: z.string().max(80).default(""),
  metaDescription: z.string().max(160).default(""),
});

export const orderItemSchema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(1),
  productSlug: z.string().min(1),
  image: z.string().min(1),
  sizeLabel: z.string().min(1),
  width: z.number().positive(),
  height: z.number().positive(),
  withFrame: z.boolean(),
  unitPrice: z.number().nonnegative(),
  frameCost: z.number().nonnegative(),
  qty: z.number().int().positive(),
  totalPrice: z.number().nonnegative(),
});

export const customerInfoSchema = z.object({
  name: z.string().min(2, "Customer name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z
    .string()
    .regex(
      /^0\d{9}$/,
      "Must be a 10-digit Sri Lankan phone number (e.g. 0782518184)",
    ),
});

export const deliveryAddressSchema = z.object({
  address: z.string().min(5, "Delivery address is required"),
  city: z.string().min(2, "City is required"),
  district: z.string().min(2, "District is required"),
  postalCode: z.string().optional(),
  notes: z.string().optional(),
});

export const orderCreateSchema = z.object({
  items: z
    .array(orderItemSchema)
    .min(1, "Order must contain at least one item"),
  deliveryFee: z.number().nonnegative().default(0),
  discountAmount: z.number().nonnegative().default(0),
  discountCode: z.string().optional(),
  customer: customerInfoSchema,
  deliveryAddress: deliveryAddressSchema,
  internalNotes: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  ttclid: z.string().optional(),
});

export const orderStatusUpdateSchema = z.object({
  status: z.enum([
    "pending",
    "confirmed",
    "processing",
    "ready_for_dispatch",
    "dispatched",
    "delivered",
    "completed",
    "on_hold",
    "cancelled",
    "delivery_failed",
    "returned",
  ]),
  trackingNumber: z.string().optional(),
  courierName: z.string().optional(),
  cancellationReason: z.string().optional(),
  note: z.string().optional(),
  phoneVerified: z.boolean().optional(),
  cashCollected: z.boolean().optional(),
});

export const customRequestSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  customerEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  customerPhone: z
    .string()
    .regex(/^0\d{9}$/, "Must be 10 digits starting with 0"),
  designUploadUrls: z.array(z.string()).default([]),
  sizeWidth: z.number().positive().optional(),
  sizeHeight: z.number().positive().optional(),
  sizeLabel: z.string().optional(),
  framePreference: z.string().optional(),
  notes: z.string().min(2, "Please provide design or room details"),
});

export const categorySchema = z.object({
  name: z.string().min(2, "Category name is required"),
  slug: z.string().min(2).optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  type: z.enum(["room", "style", "size", "collection"]),
  parentId: z.string().nullable().default(null),
  depth: z.number().int().default(0),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const promotionSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters").toUpperCase(),
  type: z.enum(["percentage", "fixed", "free_delivery"]),
  value: z.number().positive("Discount value must be greater than 0"),
  minOrderValue: z.number().nonnegative().optional(),
  maxDiscount: z.number().nonnegative().optional(),
  usageLimit: z.number().int().positive().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  isActive: z.boolean().default(true),
  applicableCategories: z.array(z.string()).optional(),
});

export const reviewSchema = z.object({
  customerName: z.string().min(2, "Customer name is required"),
  customerPhone: z.string().optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(3, "Review comment is required"),
  photoUrls: z.array(z.string()).optional(),
  productName: z.string().optional(),
  productId: z.string().optional(),
  orderRef: z.string().optional(),
  isVerifiedPurchase: z.boolean().default(true),
  isFeaturedHomepage: z.boolean().default(false),
  status: z.enum(["pending", "approved", "rejected"]).default("pending"),
});

export const messageSchema = z.object({
  name: z.string().min(2, "Name is required"),
  contact: z.string().min(3, "Phone number or email is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(5, "Message must be at least 5 characters"),
  status: z.enum(["unread", "read", "replied", "archived"]).default("unread"),
  adminNotes: z.string().optional(),
});

