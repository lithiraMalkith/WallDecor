// ============================================================================
// Ceylon Wall Decor — In-Memory Store & Seed Data Service
// ============================================================================

import type {
  Product,
  Order,
  CustomRequest,
  Customer,
  CategoryNode,
  DeliveryZone,
  SiteSettings,
  Promotion,
  Review,
  EmailTemplate,
  EmailLog,
  AuditLog,
  DashboardStats,
  UserProfile,
  CustomRole,
  UserMessage,
} from "@/types";
import { CLOUDINARY_SEED_IMAGES } from "@/lib/cloudinary";

export const initialOrders: Order[] = [
  {
    id: "ord_101",
    orderRef: "CWD-000101",
    items: [
      {
        productId: "prod_01",
        productName: "Golden Rise",
        productSlug: "golden-rise",
        image: CLOUDINARY_SEED_IMAGES.sunrise,
        sizeLabel: "12×16",
        width: 12,
        height: 16,
        withFrame: true,
        unitPrice: 4350,
        frameCost: 1150,
        qty: 1,
        totalPrice: 5500,
      },
      {
        productId: "prod_02",
        productName: "Quiet Contour",
        productSlug: "quiet-contour",
        image: CLOUDINARY_SEED_IMAGES.contour,
        sizeLabel: "10×12",
        width: 10,
        height: 12,
        withFrame: false,
        unitPrice: 3400,
        frameCost: 0,
        qty: 1,
        totalPrice: 3400,
      },
    ],
    subtotal: 7750,
    frameCost: 1150,
    deliveryFee: 450,
    discountAmount: 0,
    total: 9350,
    status: "pending",
    paymentMethod: "COD",
    paymentStatus: "pending",
    amountPaid: 0,
    currency: "LKR",
    customer: {
      name: "Niluka Senanayake",
      email: "niluka.s@gmail.com",
      phone: "0781234567",
    },
    deliveryAddress: {
      address: "No. 45/2, Alfred House Gardens",
      city: "Colombo 03",
      district: "Colombo",
      postalCode: "00300",
      notes: "Call before arriving. Ring apartment bell 4B.",
    },
    statusHistory: [
      {
        status: "pending",
        timestamp: "2026-10-02T08:15:00Z",
        updatedBy: "system",
        note: "Order placed via website checkout (COD)",
      },
    ],
    phoneVerified: false,
    cashCollected: false,
    utmSource: "tiktok",
    utmCampaign: "bedroom_decor_sep",
    createdAt: "2026-10-02T08:15:00Z",
    updatedAt: "2026-10-02T08:15:00Z",
  },
  {
    id: "ord_102",
    orderRef: "CWD-000102",
    items: [
      {
        productId: "prod_03",
        productName: "Ceylon Botanica",
        productSlug: "ceylon-botanica",
        image: CLOUDINARY_SEED_IMAGES.botanica,
        sizeLabel: "16×20",
        width: 16,
        height: 20,
        withFrame: true,
        unitPrice: 7550,
        frameCost: 1920,
        qty: 1,
        totalPrice: 9470,
      },
    ],
    subtotal: 7550,
    frameCost: 1920,
    deliveryFee: 650,
    discountAmount: 500,
    discountCode: "WELCOME500",
    total: 9620,
    status: "confirmed",
    paymentMethod: "COD",
    paymentStatus: "pending",
    amountPaid: 0,
    currency: "LKR",
    customer: {
      name: "Charith Weerasinghe",
      email: "charith.w@outlook.com",
      phone: "0773344556",
    },
    deliveryAddress: {
      address: "18/A, Peradeniya Road",
      city: "Kandy",
      district: "Kandy",
      postalCode: "20000",
    },
    statusHistory: [
      {
        status: "pending",
        timestamp: "2026-10-01T14:20:00Z",
        updatedBy: "system",
      },
      {
        status: "confirmed",
        timestamp: "2026-10-01T16:00:00Z",
        updatedBy: "fulfillment@ceylonwalldecor.lk",
        note: "Verified with customer on WhatsApp. Frame color selected: Natural Teak.",
      },
    ],
    phoneVerified: true,
    cashCollected: false,
    utmSource: "whatsapp",
    createdAt: "2026-10-01T14:20:00Z",
    updatedAt: "2026-10-01T16:00:00Z",
  },
  {
    id: "ord_103",
    orderRef: "CWD-000103",
    items: [
      {
        productId: "prod_04",
        productName: "Sun Room Horizon",
        productSlug: "sun-room",
        image: CLOUDINARY_SEED_IMAGES.hero,
        sizeLabel: "20×24",
        width: 20,
        height: 24,
        withFrame: true,
        unitPrice: 13750,
        frameCost: 2880,
        qty: 1,
        totalPrice: 16630,
      },
    ],
    subtotal: 13750,
    frameCost: 2880,
    deliveryFee: 500,
    discountAmount: 0,
    total: 17130,
    status: "processing",
    paymentMethod: "COD",
    paymentStatus: "pending",
    amountPaid: 0,
    currency: "LKR",
    customer: {
      name: "Sanduni Gamage",
      email: "sanduni.g@gmail.com",
      phone: "0712233445",
    },
    deliveryAddress: {
      address: "240/1, Kandy Road",
      city: "Kadawatha",
      district: "Gampaha",
      postalCode: "11850",
    },
    statusHistory: [
      {
        status: "pending",
        timestamp: "2026-09-29T10:00:00Z",
        updatedBy: "system",
      },
      {
        status: "confirmed",
        timestamp: "2026-09-29T11:30:00Z",
        updatedBy: "fulfillment@ceylonwalldecor.lk",
      },
      {
        status: "processing",
        timestamp: "2026-09-30T09:00:00Z",
        updatedBy: "fulfillment@ceylonwalldecor.lk",
        note: "Plaster layers curing. Frame assembly in progress.",
      },
    ],
    phoneVerified: true,
    cashCollected: false,
    createdAt: "2026-09-29T10:00:00Z",
    updatedAt: "2026-09-30T09:00:00Z",
  },
  {
    id: "ord_104",
    orderRef: "CWD-000104",
    items: [
      {
        productId: "prod_01",
        productName: "Golden Rise",
        productSlug: "golden-rise",
        image: CLOUDINARY_SEED_IMAGES.sunrise,
        sizeLabel: "12×12",
        width: 12,
        height: 12,
        withFrame: false,
        unitPrice: 3500,
        frameCost: 0,
        qty: 2,
        totalPrice: 7000,
      },
    ],
    subtotal: 7000,
    frameCost: 0,
    deliveryFee: 500,
    discountAmount: 700,
    discountCode: "TIKTOK10",
    total: 6800,
    status: "ready_for_dispatch",
    paymentMethod: "COD",
    paymentStatus: "pending",
    amountPaid: 0,
    currency: "LKR",
    customer: {
      name: "Chamara Perera",
      email: "chamara.p@gmail.com",
      phone: "0765544332",
    },
    deliveryAddress: {
      address: "77, Sea Street",
      city: "Negombo",
      district: "Gampaha",
      postalCode: "11500",
    },
    statusHistory: [
      {
        status: "pending",
        timestamp: "2026-09-28T16:00:00Z",
        updatedBy: "system",
      },
      {
        status: "confirmed",
        timestamp: "2026-09-28T17:00:00Z",
        updatedBy: "fulfillment@ceylonwalldecor.lk",
      },
      {
        status: "processing",
        timestamp: "2026-09-29T08:30:00Z",
        updatedBy: "fulfillment@ceylonwalldecor.lk",
      },
      {
        status: "ready_for_dispatch",
        timestamp: "2026-10-01T15:00:00Z",
        updatedBy: "fulfillment@ceylonwalldecor.lk",
        note: "Quality check passed, bubble wrapped and double boxed.",
      },
    ],
    phoneVerified: true,
    cashCollected: false,
    createdAt: "2026-09-28T16:00:00Z",
    updatedAt: "2026-10-01T15:00:00Z",
  },
  {
    id: "ord_105",
    orderRef: "CWD-000105",
    items: [
      {
        productId: "prod_02",
        productName: "Quiet Contour",
        productSlug: "quiet-contour",
        image: CLOUDINARY_SEED_IMAGES.contour,
        sizeLabel: "16×20",
        width: 16,
        height: 20,
        withFrame: true,
        unitPrice: 6850,
        frameCost: 1920,
        qty: 1,
        totalPrice: 8770,
      },
    ],
    subtotal: 6850,
    frameCost: 1920,
    deliveryFee: 650,
    discountAmount: 0,
    total: 9420,
    status: "dispatched",
    paymentMethod: "COD",
    paymentStatus: "pending",
    amountPaid: 0,
    currency: "LKR",
    customer: {
      name: "Dilshan Fernando",
      email: "dilshan.f@yahoo.com",
      phone: "0701122334",
    },
    deliveryAddress: {
      address: "14, Lighthouse Road",
      city: "Galle Fort",
      district: "Galle",
      postalCode: "80000",
    },
    trackingNumber: "DMX-982314",
    courierName: "Domex Courier",
    statusHistory: [
      {
        status: "pending",
        timestamp: "2026-09-26T11:00:00Z",
        updatedBy: "system",
      },
      {
        status: "confirmed",
        timestamp: "2026-09-26T12:00:00Z",
        updatedBy: "fulfillment@ceylonwalldecor.lk",
      },
      {
        status: "processing",
        timestamp: "2026-09-27T08:00:00Z",
        updatedBy: "fulfillment@ceylonwalldecor.lk",
      },
      {
        status: "ready_for_dispatch",
        timestamp: "2026-09-29T16:00:00Z",
        updatedBy: "fulfillment@ceylonwalldecor.lk",
      },
      {
        status: "dispatched",
        timestamp: "2026-09-30T10:30:00Z",
        updatedBy: "fulfillment@ceylonwalldecor.lk",
        note: "Handed over to Domex. Tracking sent via SMS/Email.",
      },
    ],
    phoneVerified: true,
    cashCollected: false,
    createdAt: "2026-09-26T11:00:00Z",
    updatedAt: "2026-09-30T10:30:00Z",
  },
  {
    id: "ord_106",
    orderRef: "CWD-000106",
    items: [
      {
        productId: "prod_04",
        productName: "Sun Room Horizon",
        productSlug: "sun-room",
        image: CLOUDINARY_SEED_IMAGES.hero,
        sizeLabel: "16×20",
        width: 16,
        height: 20,
        withFrame: true,
        unitPrice: 9900,
        frameCost: 1920,
        qty: 1,
        totalPrice: 11820,
      },
    ],
    subtotal: 9900,
    frameCost: 1920,
    deliveryFee: 650,
    discountAmount: 0,
    total: 12470,
    status: "delivered",
    paymentMethod: "COD",
    paymentStatus: "pending",
    amountPaid: 0,
    currency: "LKR",
    customer: {
      name: "Ruwan Bandara",
      email: "ruwan.b@gmail.com",
      phone: "0778899001",
    },
    deliveryAddress: {
      address: "55, Circular Road",
      city: "Kurunegala",
      district: "Kurunegala",
      postalCode: "60000",
    },
    trackingNumber: "PRT-55441",
    courierName: "Pronto Lanka",
    statusHistory: [
      {
        status: "pending",
        timestamp: "2026-09-24T09:00:00Z",
        updatedBy: "system",
      },
      {
        status: "confirmed",
        timestamp: "2026-09-24T10:00:00Z",
        updatedBy: "fulfillment@ceylonwalldecor.lk",
      },
      {
        status: "processing",
        timestamp: "2026-09-25T08:00:00Z",
        updatedBy: "fulfillment@ceylonwalldecor.lk",
      },
      {
        status: "ready_for_dispatch",
        timestamp: "2026-09-27T14:00:00Z",
        updatedBy: "fulfillment@ceylonwalldecor.lk",
      },
      {
        status: "dispatched",
        timestamp: "2026-09-28T09:00:00Z",
        updatedBy: "fulfillment@ceylonwalldecor.lk",
      },
      {
        status: "delivered",
        timestamp: "2026-09-30T14:20:00Z",
        updatedBy: "system",
        note: "Pronto courier reported package delivered. Awaiting cash settlement.",
      },
    ],
    phoneVerified: true,
    cashCollected: false,
    createdAt: "2026-09-24T09:00:00Z",
    updatedAt: "2026-09-30T14:20:00Z",
  },
  {
    id: "ord_107",
    orderRef: "CWD-000107",
    items: [
      {
        productId: "prod_01",
        productName: "Golden Rise",
        productSlug: "golden-rise",
        image: CLOUDINARY_SEED_IMAGES.sunrise,
        sizeLabel: "12×16",
        width: 12,
        height: 16,
        withFrame: true,
        unitPrice: 4350,
        frameCost: 1150,
        qty: 1,
        totalPrice: 5500,
      },
    ],
    subtotal: 4350,
    frameCost: 1150,
    deliveryFee: 700,
    discountAmount: 0,
    total: 6200,
    status: "completed",
    paymentMethod: "COD",
    paymentStatus: "paid",
    amountPaid: 6200,
    currency: "LKR",
    customer: {
      name: "Tharindu Jayawardena",
      email: "tharindu.j@gmail.com",
      phone: "0756677889",
    },
    deliveryAddress: {
      address: "102, Beach Road",
      city: "Matara",
      district: "Matara",
      postalCode: "81000",
    },
    trackingNumber: "KMB-44219",
    courierName: "Koombiyo Delivery",
    statusHistory: [
      {
        status: "pending",
        timestamp: "2026-09-20T10:00:00Z",
        updatedBy: "system",
      },
      {
        status: "dispatched",
        timestamp: "2026-09-23T11:00:00Z",
        updatedBy: "fulfillment@ceylonwalldecor.lk",
      },
      {
        status: "delivered",
        timestamp: "2026-09-25T13:00:00Z",
        updatedBy: "system",
      },
      {
        status: "completed",
        timestamp: "2026-09-28T16:00:00Z",
        updatedBy: "owner@ceylonwalldecor.lk",
        note: "COD payment Rs. 6,200 deposited and reconciled in bank.",
      },
    ],
    phoneVerified: true,
    cashCollected: true,
    createdAt: "2026-09-20T10:00:00Z",
    updatedAt: "2026-09-28T16:00:00Z",
  },
];

export const initialCustomRequests: CustomRequest[] = [
  {
    id: "req_01",
    customerName: "Minoli Perera",
    customerEmail: "minoli.p@gmail.com",
    customerPhone: "0779887766",
    designUploadUrls: [CLOUDINARY_SEED_IMAGES.contour],
    sizeWidth: 18,
    sizeHeight: 24,
    sizeLabel: "18×24",
    framePreference: "Natural Teak wood frame",
    notes:
      "I saw a curved neutral arch on Pinterest. Want this in soft beige and sandy white to hang above our 6-seater dining table.",
    status: "new",
    createdAt: "2026-10-02T09:10:00Z",
    updatedAt: "2026-10-02T09:10:00Z",
  },
  {
    id: "req_02",
    customerName: "Dinesh Silva",
    customerEmail: "dinesh.silva@gmail.com",
    customerPhone: "0714455667",
    designUploadUrls: [CLOUDINARY_SEED_IMAGES.sunrise],
    sizeWidth: 20,
    sizeHeight: 24,
    sizeLabel: "20×24",
    framePreference: "Black Floating frame",
    notes:
      "Need a large focal artwork for our master bedroom wall with high texture and subtle gold leaf accents.",
    status: "quoted",
    quotedPrice: 18500,
    adminNotes:
      "Spoke on WhatsApp. Offered standard 20x24 at Rs. 18,500 including custom black frame. Waiting for confirmation.",
    createdAt: "2026-10-01T11:45:00Z",
    updatedAt: "2026-10-01T15:20:00Z",
  },
  {
    id: "req_03",
    customerName: "Shangri-La Residences Interior",
    customerEmail: "projects@interiordesign.lk",
    customerPhone: "0773322110",
    designUploadUrls: [CLOUDINARY_SEED_IMAGES.hero],
    sizeWidth: 36,
    sizeHeight: 48,
    sizeLabel: "36×48 (Extra Large)",
    framePreference: "Natural Oak",
    notes:
      "Three matching textured panels for a luxury living area. Need samples and quote.",
    status: "approved",
    quotedPrice: 58000,
    adminNotes:
      "Approved by designer. Deposit received. Converting to order next week.",
    createdAt: "2026-09-28T14:00:00Z",
    updatedAt: "2026-09-30T10:00:00Z",
  },
];

export const initialCategories: CategoryNode[] = [
  // Room categories
  {
    id: "cat_01",
    name: "Living Room",
    slug: "living-room",
    type: "room",
    parentId: null,
    depth: 0,
    order: 1,
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "cat_02",
    name: "Bedroom",
    slug: "bedroom",
    type: "room",
    parentId: null,
    depth: 0,
    order: 2,
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "cat_03",
    name: "Dining",
    slug: "dining",
    type: "room",
    parentId: null,
    depth: 0,
    order: 3,
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "cat_04",
    name: "Office & Studio",
    slug: "office",
    type: "room",
    parentId: null,
    depth: 0,
    order: 4,
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  // Style categories
  {
    id: "cat_05",
    name: "Minimalist",
    slug: "minimalist",
    type: "style",
    parentId: null,
    depth: 0,
    order: 1,
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "cat_06",
    name: "Boho & Organic",
    slug: "boho",
    type: "style",
    parentId: null,
    depth: 0,
    order: 2,
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "cat_07",
    name: "Abstract Relief",
    slug: "abstract",
    type: "style",
    parentId: null,
    depth: 0,
    order: 3,
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "cat_08",
    name: "Botanical",
    slug: "botanical",
    type: "style",
    parentId: null,
    depth: 0,
    order: 4,
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  // Collections
  {
    id: "cat_09",
    name: "Island Earth Collection",
    slug: "island-earth",
    type: "collection",
    parentId: null,
    depth: 0,
    order: 1,
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "cat_10",
    name: "Gold Horizon Series",
    slug: "gold-horizon",
    type: "collection",
    parentId: null,
    depth: 0,
    order: 2,
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
];

export const SRI_LANKA_25_DISTRICTS: DeliveryZone[] = [
  { district: "Colombo", fee: 450, estimatedDays: "1-2 days", isActive: true },
  { district: "Gampaha", fee: 500, estimatedDays: "1-3 days", isActive: true },
  { district: "Kalutara", fee: 550, estimatedDays: "2-3 days", isActive: true },
  { district: "Kandy", fee: 650, estimatedDays: "2-4 days", isActive: true },
  { district: "Matale", fee: 700, estimatedDays: "3-4 days", isActive: true },
  {
    district: "Nuwara Eliya",
    fee: 750,
    estimatedDays: "3-5 days",
    isActive: true,
  },
  { district: "Galle", fee: 650, estimatedDays: "2-3 days", isActive: true },
  { district: "Matara", fee: 700, estimatedDays: "2-4 days", isActive: true },
  {
    district: "Hambantota",
    fee: 750,
    estimatedDays: "3-5 days",
    isActive: true,
  },
  { district: "Jaffna", fee: 900, estimatedDays: "4-6 days", isActive: true },
  {
    district: "Kilinochchi",
    fee: 900,
    estimatedDays: "4-6 days",
    isActive: true,
  },
  { district: "Mannar", fee: 900, estimatedDays: "4-6 days", isActive: true },
  { district: "Vavuniya", fee: 850, estimatedDays: "4-5 days", isActive: true },
  {
    district: "Mullaitivu",
    fee: 900,
    estimatedDays: "4-6 days",
    isActive: true,
  },
  {
    district: "Batticaloa",
    fee: 850,
    estimatedDays: "3-5 days",
    isActive: true,
  },
  { district: "Ampara", fee: 850, estimatedDays: "3-5 days", isActive: true },
  {
    district: "Trincomalee",
    fee: 850,
    estimatedDays: "3-5 days",
    isActive: true,
  },
  {
    district: "Kurunegala",
    fee: 650,
    estimatedDays: "2-4 days",
    isActive: true,
  },
  { district: "Puttalam", fee: 700, estimatedDays: "3-4 days", isActive: true },
  {
    district: "Anuradhapura",
    fee: 750,
    estimatedDays: "3-5 days",
    isActive: true,
  },
  {
    district: "Polonnaruwa",
    fee: 800,
    estimatedDays: "3-5 days",
    isActive: true,
  },
  { district: "Badulla", fee: 800, estimatedDays: "3-5 days", isActive: true },
  {
    district: "Monaragala",
    fee: 850,
    estimatedDays: "4-5 days",
    isActive: true,
  },
  {
    district: "Ratnapura",
    fee: 700,
    estimatedDays: "2-4 days",
    isActive: true,
  },
  { district: "Kegalle", fee: 650, estimatedDays: "2-3 days", isActive: true },
];

export const initialSiteSettings: SiteSettings = {
  siteName: "Ceylon Wall Decor",
  siteDescription:
    "Minimal handmade textured wall art, crafted in Sri Lanka and delivered island-wide.",
  ownerEmail: "owner@ceylonwalldecor.lk",
  ownerPhone: "0782518184",
  whatsappNumber: "94782518184",
  currency: "LKR",
  codEnabled: true,
  freeDeliveryThreshold: 15000,
  framePricePerSqInch: 6,
  deliveryZones: SRI_LANKA_25_DISTRICTS,
  couriers: [
    {
      name: "Pronto Lanka",
      contact: "0112345678",
      trackingUrlTemplate: "https://prontolanka.lk/track?ref={tracking}",
    },
    {
      name: "Domex Courier",
      contact: "0117709500",
      trackingUrlTemplate: "https://domex.lk/tracking?track={tracking}",
    },
    {
      name: "Koombiyo Delivery",
      contact: "0114777555",
      trackingUrlTemplate: "https://koombiyodelivery.lk/tracking?id={tracking}",
    },
    {
      name: "Prompt Xpress",
      contact: "0114888999",
      trackingUrlTemplate: "https://promptxpress.lk/track/{tracking}",
    },
  ],
  socialLinks: {
    tiktok: "https://www.tiktok.com/@ceylonwalldecor",
    instagram: "https://www.instagram.com/ceylonwalldecor",
    whatsapp: "https://wa.me/94782518184",
  },
  metaPixelId: "128493029482910",
  tiktokPixelId: "C9DK10293KDLA",
  googleAnalyticsId: "G-CWD9928123",
  aboutContent:
    "Ceylon Wall Decor was founded in 2024 to bring tactile, minimalist textured art directly into Sri Lankan homes. Every piece is hand-sculpted in our studio in Colombo using durable mineral plaster on heavy-gauge gallery canvas.",
  faqEntries: [
    {
      question: "How long does hand-made art take to craft?",
      answer:
        "Our standard lead time is 5-7 business days for hand-sculpting, curing, and framing, plus 1-3 days for island-wide courier delivery.",
    },
    {
      question: "How does Cash on Delivery (COD) work?",
      answer:
        "You pay cash directly to the courier delivery agent when your safely packaged artwork arrives at your doorstep.",
    },
    {
      question: "Are frames included in the prices?",
      answer:
        "Frames are optional. You can choose un-framed stretched canvas or select our premium wooden floater frames for a tailored finish.",
    },
  ],
  consentBannerText:
    "We use cookies and marketing pixels to enhance your shopping experience and measure ad conversions.",
};

export const initialPromotions: Promotion[] = [
  {
    id: "promo_01",
    code: "TIKTOK10",
    type: "percentage",
    value: 10,
    minOrderValue: 5000,
    maxDiscount: 2000,
    usageLimit: 200,
    usedCount: 42,
    startDate: "2026-09-01",
    endDate: "2026-12-31",
    isActive: true,
    createdAt: "2026-09-01T00:00:00Z",
    updatedAt: "2026-09-01T00:00:00Z",
  },
  {
    id: "promo_02",
    code: "WELCOME500",
    type: "fixed",
    value: 500,
    minOrderValue: 8000,
    usedCount: 19,
    startDate: "2026-09-15",
    isActive: true,
    createdAt: "2026-09-15T00:00:00Z",
    updatedAt: "2026-09-15T00:00:00Z",
  },
  {
    id: "promo_03",
    code: "FREESHIP",
    type: "free_delivery",
    value: 0,
    minOrderValue: 12000,
    usedCount: 8,
    startDate: "2026-09-20",
    isActive: true,
    createdAt: "2026-09-20T00:00:00Z",
    updatedAt: "2026-09-20T00:00:00Z",
  },
];

export const initialReviews: Review[] = [
  {
    id: "rev_01",
    customerName: "Ayesha Jayasuriya",
    rating: 5,
    comment:
      "The Golden Rise piece looks breathtaking on our living room wall! The texture and gold details catch the sunlight beautifully.",
    photoUrls: [CLOUDINARY_SEED_IMAGES.sunrise],
    productName: "Golden Rise",
    productId: "prod_01",
    orderRef: "CWD-000088",
    isVerifiedPurchase: true,
    isFeaturedHomepage: true,
    status: "approved",
    createdAt: "2026-09-25T11:00:00Z",
  },
  {
    id: "rev_02",
    customerName: "Dr. Rohan Mendis",
    rating: 5,
    comment:
      "Ordered Quiet Contour for our clinic reception. Super clean lines, securely packed, and delivered on time. Highly recommended!",
    productName: "Quiet Contour",
    productId: "prod_02",
    orderRef: "CWD-000092",
    isVerifiedPurchase: true,
    isFeaturedHomepage: true,
    status: "approved",
    createdAt: "2026-09-28T14:30:00Z",
  },
  {
    id: "rev_03",
    customerName: "Keshini De Alwis",
    rating: 5,
    comment:
      "Loved having COD! Was hesitant ordering handmade art online but the piece exceeded expectations.",
    photoUrls: [CLOUDINARY_SEED_IMAGES.botanica],
    productName: "Ceylon Botanica",
    productId: "prod_03",
    isVerifiedPurchase: true,
    isFeaturedHomepage: true,
    status: "approved",
    createdAt: "2026-10-01T09:15:00Z",
  },
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: "aud_01",
    userId: "usr_owner_001",
    userEmail: "owner@ceylonwalldecor.lk",
    userRole: "superadmin",
    action: "order:status_change",
    entityType: "order",
    entityId: "ord_107",
    details:
      "Marked order CWD-000107 as completed (COD cash collected Rs. 6,200)",
    timestamp: "2026-09-28T16:00:00Z",
  },
  {
    id: "aud_02",
    userId: "usr_stf_003",
    userEmail: "fulfillment@ceylonwalldecor.lk",
    userRole: "order_staff",
    action: "order:dispatched",
    entityType: "order",
    entityId: "ord_105",
    details: "Dispatched CWD-000105 via Domex Courier (Tracking: DMX-982314)",
    timestamp: "2026-09-30T10:30:00Z",
  },
  {
    id: "aud_03",
    userId: "usr_mgr_002",
    userEmail: "manager@ceylonwalldecor.lk",
    userRole: "manager",
    action: "product:create",
    entityType: "product",
    entityId: "prod_02",
    details: 'Created product "Quiet Contour" with 9 size variants',
    timestamp: "2026-02-18T14:30:00Z",
  },
];

export const initialMessages: UserMessage[] = [
  {
    id: "msg_01",
    name: "Dr. Kusal Perera",
    contact: "0771239874",
    phone: "0771239874",
    email: "kusal.perera@gmail.com",
    subject: "Art consultation for clinic lobby",
    message: "Hello Ceylon Wall Decor team, I am looking for 3 large framed pieces for my medical clinic lobby. Can we arrange a WhatsApp consultation to discuss size 30x40 and lighting options?",
    status: "unread",
    createdAt: "2026-10-06T11:20:00Z",
  },
  {
    id: "msg_02",
    name: "Minoli Senaratne",
    contact: "minoli.s@outlook.com",
    email: "minoli.s@outlook.com",
    subject: "Custom plaster color palette query",
    message: "Hi, I really love the Sun Room Horizon design, but our living room wall has a warm greige wallpaper. Can the plaster relief be tinted with warm beige pigment instead of pure white?",
    status: "read",
    createdAt: "2026-10-04T15:45:00Z",
  },
  {
    id: "msg_03",
    name: "Ravin Mendis",
    contact: "0714455667",
    phone: "0714455667",
    subject: "COD Delivery to Galle Fort",
    message: "Can you confirm if Domex or your courier offers Cash on Delivery service inside Galle Fort? Planning to place an order for Quiet Contour tomorrow.",
    status: "replied",
    adminNotes: "Contacted on WhatsApp & confirmed COD is available to Galle Fort.",
    repliedAt: "2026-10-03T16:00:00Z",
    repliedBy: "manager@ceylonwalldecor.lk",
    createdAt: "2026-10-03T14:10:00Z",
  },
];

// ----------------------------------------------------------------------------
// In-Memory Mutable State Container (Singleton for dev runtime)
// ----------------------------------------------------------------------------
class AdminDataStore {
  orders: Order[] = [...initialOrders];
  customRequests: CustomRequest[] = [...initialCustomRequests];
  categories: CategoryNode[] = [...initialCategories];
  settings: SiteSettings = { ...initialSiteSettings };
  promotions: Promotion[] = [...initialPromotions];
  reviews: Review[] = [...initialReviews];
  messages: UserMessage[] = [...initialMessages];
  auditLogs: AuditLog[] = [...initialAuditLogs];

  // Dashboard Stats Aggregator
  getDashboardStats(products: Product[]): DashboardStats {
    const today = new Date().toISOString().slice(0, 10);
    const todayOrders = this.orders.filter((o) =>
      o.createdAt.startsWith(today),
    );
    const pendingOrders = this.orders.filter((o) => o.status === "pending");
    const confirmedOrders = this.orders.filter((o) => o.status === "confirmed");
    const processingOrders = this.orders.filter(
      (o) => o.status === "processing",
    );
    const dispatchedOrders = this.orders.filter(
      (o) => o.status === "dispatched",
    );

    const revenueToday = todayOrders.reduce(
      (sum, o) => sum + (o.status !== "cancelled" ? o.total : 0),
      0,
    );
    const revenueTotal = this.orders.reduce(
      (sum, o) => sum + (o.status !== "cancelled" ? o.total : 0),
      0,
    );
    const codCashToCollect = this.orders
      .filter(
        (o) =>
          (o.status === "delivered" || o.status === "dispatched") &&
          !o.cashCollected,
      )
      .reduce((sum, o) => sum + o.total, 0);

    const orderStatusCounts: Record<string, number> = {
      pending: 0,
      confirmed: 0,
      processing: 0,
      ready_for_dispatch: 0,
      dispatched: 0,
      delivered: 0,
      completed: 0,
      cancelled: 0,
    };

    this.orders.forEach((o) => {
      if (orderStatusCounts[o.status] !== undefined) {
        orderStatusCounts[o.status]++;
      }
    });

    const statusColors: Record<string, string> = {
      pending: "#104F37",
      confirmed: "#D4AF37",
      processing: "#1F6748",
      ready_for_dispatch: "#104F37",
      dispatched: "#C89D2B",
      delivered: "#45654C",
      completed: "#104F37",
      cancelled: "#111111",
    };

    const orderStatusData = Object.entries(orderStatusCounts).map(
      ([status, count]) => ({
        status: status.replace(/_/g, " ").toUpperCase(),
        count,
        color: statusColors[status] || "#104F37",
      }),
    );

    // Simulated 7-day revenue trend
    const revenueData = [
      { day: "Mon", revenue: 16500 },
      { day: "Tue", revenue: 24000 },
      { day: "Wed", revenue: 19500 },
      { day: "Thu", revenue: 32000 },
      { day: "Fri", revenue: 28500 },
      { day: "Sat", revenue: 42000 },
      { day: "Sun", revenue: 38000 },
    ];

    const topDesigns = products.slice(0, 4).map((p, idx) => ({
      name: p.name,
      orders: 18 - idx * 3,
      revenue: (18 - idx * 3) * 6500,
      image: p.images[0] || CLOUDINARY_SEED_IMAGES.hero,
    }));

    const trafficSources = [
      { source: "TikTok Videos", orders: 48, revenue: 280000 },
      { source: "WhatsApp Direct", orders: 22, revenue: 145000 },
      { source: "Instagram Reels", orders: 14, revenue: 88000 },
      { source: "Google Search", orders: 6, revenue: 42000 },
    ];

    const recentOrders = this.orders.slice(0, 5).map((o) => ({
      id: o.id,
      orderRef: o.orderRef,
      customerName: o.customer.name,
      date: o.createdAt,
      status: o.status,
      total: o.total,
    }));

    const recentActivities = this.auditLogs.slice(0, 6).map((a) => ({
      id: a.id,
      type: a.action,
      message: a.details,
      time: a.timestamp,
    }));

    return {
      ordersToday: todayOrders.length,
      ordersPending: pendingOrders.length,
      ordersConfirmed: confirmedOrders.length,
      ordersProcessing: processingOrders.length,
      ordersDispatched: dispatchedOrders.length,
      revenueToday: revenueToday || 9350,
      revenueThisWeek: 142500,
      revenueThisMonth: 585000,
      revenueTotal,
      codCashToCollect,
      lowStockProducts: 1,
      totalProducts: products.length,
      totalCustomers: 45,
      newCustomRequests: this.customRequests.filter((r) => r.status === "new")
        .length,
      revenueData,
      orderStatusData,
      topDesigns,
      trafficSources,
      recentOrders,
      recentActivities,
      revenueTrend: 18.5,
      ordersTrend: 12.0,
    };
  }

  // Get aggregated customer list from orders
  getCustomers(): Customer[] {
    const customerMap = new Map<string, Customer>();

    this.orders.forEach((order) => {
      const phone = order.customer.phone;
      if (!customerMap.has(phone)) {
        customerMap.set(phone, {
          id: `cust_${phone}`,
          name: order.customer.name,
          email: order.customer.email,
          phone: order.customer.phone,
          address: order.deliveryAddress.address,
          district: order.deliveryAddress.district,
          orderCount: 1,
          totalSpent: order.total,
          isRepeat: false,
          tags: ["First Time Buyer"],
          firstOrderAt: order.createdAt,
          lastOrderAt: order.createdAt,
          createdAt: order.createdAt,
        });
      } else {
        const existing = customerMap.get(phone)!;
        existing.orderCount += 1;
        existing.totalSpent += order.total;
        existing.isRepeat = true;
        existing.lastOrderAt = order.createdAt;
        if (!existing.tags.includes("Repeat Buyer")) {
          existing.tags.push("Repeat Buyer");
        }
        if (
          existing.totalSpent > 25000 &&
          !existing.tags.includes("VIP / High Value")
        ) {
          existing.tags.push("VIP / High Value");
        }
      }
    });

    return Array.from(customerMap.values());
  }
}

// Global singleton instance
export const adminStore = new AdminDataStore();
