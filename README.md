<div align="center">

# 🏛️ Ceylon Wall Decor
### Premium Textured Artwork & Architectural Wall Sculptures E-Commerce Atelier

<p align="center">
  <em>Handcrafted dimensional plaster wall art made to order in Sri Lanka. Blending timeless artisanal textures with modern digital commerce.</em>
</p>

<!-- Animated Tech Stack Banner -->
<p align="center">
  <a href="https://skillicons.dev">
    <img src="https://skillicons.dev/icons?i=nextjs,react,ts,tailwind,firebase,cloudinary&theme=dark" alt="Core Technologies" />
  </a>
</p>

<!-- Live Animated Status Badges -->
<p align="center">
  <img src="https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19" />
  <img src="https://img.shields.io/badge/Tailwind_CSS_v4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/Firebase_Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=000000" alt="Cloud Firestore" />
  <img src="https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white" alt="Cloudinary Media" />
  <img src="https://img.shields.io/badge/TypeScript_5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript 5" />
  <img src="https://img.shields.io/badge/GSAP_3-88CE02?style=for-the-badge&logo=greensock&logoColor=white" alt="GSAP Animation" />
</p>

<p align="center">
  <a href="#-key-features"><b>Explore Features</b></a> •
  <a href="#-tech-stack-breakdown"><b>Tech Stack</b></a> •
  <a href="#-system-architecture"><b>Architecture</b></a> •
  <a href="#-quick-start"><b>Quick Start</b></a> •
  <a href="#-admin-atelier"><b>Admin Portal</b></a>
</p>

---

</div>

## 🌟 Overview

**Ceylon Wall Decor** is an ultra-premium storefront and administrative management suite designed specifically for bespoke textured wall art and plaster sculptures. Crafted with deliberate minimalism inspired by ElevenLabs aesthetics, the application combines rich interactive client visualizers with high-performance server-side rendering, real-time Firestore persistence, and automated Cloudinary asset optimization.

---

## ✨ Key Features

### 🎨 1. Interactive Architectural Wall Studio
- **Dynamic Surface Simulation**: Preview artworks on real architectural wall tones (*Linen White, Warm Plaster, Earth Terracotta, Deep Charcoal, Olive Sage*).
- **Float Framing Atelier**: Real-time toggling between *Unframed Edge*, *Natural Teak Float*, and *Matte Black Float* with instant dimension-based surcharge calculations.
- **Accurate Proportional Scaling**: Visual scaling calculated dynamically across standard dimensions (`6×6` up to `20×24`).

### ⚡ 2. Real-Time Cloud Firestore Sync
- **Server & Client Dual-Layer Synchronization**: Powered by **Firebase Admin SDK** on the server for server-rendered pages (SEO & zero initial latency) and **Client SDK** for reactive browser interactions.
- **Dynamic Catalog Publishing**: Newly added or edited artworks in the Admin Portal appear live on the storefront without rebuilds.
- **Automated Pricing & Stock Engine**: Supports both `ready_stock` with inventory decrements and `made_to_order` with customizable artisan lead times.

### 🖼️ 3. Cloudinary CDN & Plaster Grain Effects
- High-res artwork delivery with automated WebP/AVIF format conversion, responsive srcset generation, and subtle organic texture overlays (`e_noise`).
- Instant image uploads from the Admin panel with automatic folder organization (`ceylon-wall-decor/products`).

### 🪄 4. GSAP Kinetic Motion & ElevenLabs-Style Bento Grid
- Smooth kinetic text tickers showcasing artisanal craftsmanship provenance.
- Curated asymmetric Bento Showcase highlighting bestseller artworks, tactile plaster mediums, and bespoke commissions.
- Scroll-triggered reveals and seamless cart transitions.

### 🛍️ 5. Seamless Cart & Island-Wide Checkout Flow
- **Persistent Local Cart**: Browser storage hydration with frame customizations and size variant selection.
- **Cash on Delivery (COD) & Bank Transfer**: Native checkout tailored for the Sri Lankan logistics ecosystem.
- **Live Order Tracking**: Customer portal with visual 5-stage status progress bar (*Pending &rarr; Confirmed &rarr; Processing &rarr; Dispatched &rarr; Delivered*).

### 🛠️ 6. Full-Throttle Admin Atelier (`/admin`)
- **Interactive KPI Dashboard**: Daily, weekly, and monthly revenue analytics, COD cash collection tracking, and Recharts order status distributions.
- **Artwork Catalog Management**: Multi-size SKU generator, frame surcharge rate manager, visibility switcher (`published` / `draft`), and Cloudinary media upload.
- **Order Processing Pipeline**: Status transitions, courier tracking number assignment (Domex, Pronto, Prompt), and phone verification flags.
- **Custom Bespoke Requests**: Customer reference photo viewer and 1-click conversion into direct quote orders.
- **Audit Logs**: Tamper-evident logging of administrative actions.

---

## 🛠️ Tech Stack Breakdown

| Technology | Role | Icon |
| :--- | :--- | :---: |
| **Next.js 16** | App Router, Server Actions, Dynamic Route Handlers, SSR/SSG | <img src="https://skillicons.dev/icons?i=nextjs" width="32" height="32" /> |
| **React 19** | Concurrent rendering, Server & Client Components, useActionState | <img src="https://skillicons.dev/icons?i=react" width="32" height="32" /> |
| **Tailwind CSS v4** | Modern utility styling, custom typography, grain effects, tokens | <img src="https://skillicons.dev/icons?i=tailwind" width="32" height="32" /> |
| **Google Cloud Firestore** | NoSQL database for Products, Orders, Customers, Custom Requests | <img src="https://skillicons.dev/icons?i=firebase" width="32" height="32" /> |
| **Cloudinary** | Media CDN, texture transformations, and cloud asset storage | <img src="https://skillicons.dev/icons?i=cloudinary" width="32" height="32" /> |
| **TypeScript 5.7** | End-to-end type safety, Zod schema validation, unified types | <img src="https://skillicons.dev/icons?i=ts" width="32" height="32" /> |
| **GSAP & @gsap/react** | Timeline animations, text tickers, smooth interactive physics | <img src="https://img.shields.io/badge/GSAP-88CE02?style=flat-square&logo=greensock&logoColor=white" height="24" /> |
| **Recharts** | Business intelligence data visualization for admin analytics | <img src="https://img.shields.io/badge/Recharts-22b5bf?style=flat-square&logo=chartdotjs&logoColor=white" height="24" /> |
| **Playwright** | End-to-End browser test automation | <img src="https://img.shields.io/badge/Playwright-2EAD33?style=flat-square&logo=playwright&logoColor=white" height="24" /> |

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Client Browser
        Storefront[🛍️ Storefront Application]
        Studio[🎨 Interactive Wall Studio]
        AdminUI[🛠️ Admin Atelier Dashboard]
    end

    subgraph Next.js 16 Server
        AppRouter[⚡ Next.js App Router]
        APIRoutes[🔌 REST API Handlers /api/products, /api/orders]
        AdminSDK[🛡️ Firebase Admin SDK Node.js]
    end

    subgraph External Cloud Services
        Firestore[(🔥 Google Cloud Firestore)]
        Cloudinary[☁️ Cloudinary Media CDN]
    end

    Storefront -->|SSR / Fetch| AppRouter
    Studio -->|Live Pricing / State| Storefront
    AdminUI -->|REST Operations| APIRoutes

    AppRouter -->|Server Sync| AdminSDK
    APIRoutes -->|CRUD Queries| AdminSDK
    AdminSDK -->|Privileged Access| Firestore
    
    Storefront -.->|Client SDK Fallback| Firestore
    Storefront -->|Stream Optimized Assets| Cloudinary
    AdminUI -->|Upload Artwork Images| Cloudinary
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: `v20.x` or `v22.x`+ recommended
- **npm**: `v10.x`+

### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/lithiraMalkith/WallDecor.git

# Navigate to project directory
cd ceylon-wall-decor-package

# Install dependencies
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the project root:

```env
# ============================================================================
# Firebase Client SDK Configuration
# ============================================================================
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_ga4_measurement_id

# ============================================================================
# Firebase Admin SDK (Server-Side Only - Service Account)
# ============================================================================
FIREBASE_ADMIN_PROJECT_ID=your_firebase_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxx@your_project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQ...\n-----END PRIVATE KEY-----\n"

# ============================================================================
# Cloudinary Media Configuration
# ============================================================================
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 3. Run the Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the storefront.  
Visit [http://localhost:3000/admin](http://localhost:3000/admin) to access the administrative dashboard.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 📂 Project Directory Structure

```text
├── src/
│   ├── app/                         # Next.js 16 App Router Routes
│   │   ├── (storefront)/            # Client storefront pages
│   │   │   ├── page.tsx             # Home page (Hero Studio, Bento Grid, Collection)
│   │   │   ├── shop/page.tsx        # Dynamic Catalog with filters & search
│   │   │   ├── product/[slug]/      # Individual artwork detail & dimensions
│   │   │   ├── cart/                # Persistent shopping bag
│   │   │   ├── checkout/            # Island-wide COD & transfer checkout
│   │   │   ├── order/track/         # Real-time order progress tracker
│   │   │   ├── custom-order/        # Bespoke sculpture commission form
│   │   │   ├── gallery/             # Architectural collector photo gallery
│   │   │   └── ...                  # About, FAQ, Contact, Policy pages
│   │   ├── admin/                   # Admin Portal
│   │   │   ├── page.tsx             # Executive KPI analytics dashboard
│   │   │   ├── products/            # Catalog manager & new artwork creator
│   │   │   ├── orders/              # Order lifecycle & courier dispatch
│   │   │   ├── custom-requests/     # Bespoke commission conversion
│   │   │   ├── customers/           # Repeat buyer & VIP intelligence
│   │   │   ├── audit-logs/          # Staff action audit log
│   │   │   └── settings/            # Delivery fees, VAT, and store switches
│   │   └── api/                     # REST Route Handlers
│   │       ├── products/            # Product CRUD & Firestore queries
│   │       ├── orders/              # Order placement & status updates
│   │       ├── upload/              # Cloudinary signed media uploading
│   │       └── ...
│   ├── components/                  # Reusable UI Components
│   │   ├── hero-studio.tsx          # Interactive 2.5D architectural wall visualizer
│   │   ├── bento-showcase.tsx       # ElevenLabs-inspired curated gallery
│   │   ├── shop-browser.tsx         # Live search, room & style filtering
│   │   ├── product-detail.tsx       # Variant selection, framing, & reviews
│   │   ├── cart-context.tsx         # Global shopping bag state & localStorage
│   │   └── ...
│   ├── lib/                         # Core Utilities & Services
│   │   ├── firebase.ts              # Firebase Client SDK init & configuration
│   │   ├── firebase-admin.ts        # Firebase Admin SDK singleton & auth
│   │   ├── firestore-service.ts     # Firestore database operations & queries
│   │   ├── products.ts              # Catalog synchronizer & storefront format mapper
│   │   ├── cloudinary.ts            # Dynamic CDN URLs & plaster filters
│   │   └── utils.ts                 # Frame price math, SKU generator, formatting
│   └── types/                       # Shared TypeScript definitions
│       └── index.ts                 # Products, Sizes, Orders, Customers, Roles
├── public/                          # Static assets, fonts, & fallback images
├── firestore.rules                  # Firestore security access control rules
└── playwright.config.ts             # E2E test configuration
```

---

## 🔒 Firestore Collections & Security Rules

The database structure is strictly typed and governed by declarative rules defined in [`firestore.rules`](file:///d:/Downloads/CodeZela%20Projects/ceylon-wall-decor/ceylon-wall-decor-package/firestore.rules):

| Collection | Description | Access Rules |
| :--- | :--- | :--- |
| `products` | Artwork catalog, sizes, prices, images, stock | **Public read**, Staff write |
| `orders` | Customer purchases, COD amounts, shipping addresses | **Customer/Staff read**, Public create |
| `custom_requests` | Bespoke size and design inquiries with attachments | **Public create**, Staff read/update |
| `reviews` | Customer ratings, verified purchase tags | **Public read**, Public submit, Staff manage |
| `settings` | Delivery fees, district thresholds, banner toggles | **Public read**, Staff update |

---

## 🎨 Design Philosophy & Brand Tokens

- **Minimalist Atelier Luxury**: Inspired by Swiss architectural typography and natural materials.
- **Palette**:
  - `Canvas White` (`#FDFCFC`)
  - `Warm Plaster` (`#ECE8E1`)
  - `Ceylon Gold / Ochre` (`#BA8E23`)
  - `Deep Obsidian Charcoal` (`#111111`)
- **Typography**: Inter (100–700) with generous tracking and fine hairline borders (`#EBE8E4`).

---

<div align="center">

**Handcrafted with pride in Sri Lanka 🇱🇰**  
*Ceylon Wall Decor © 2026. All rights reserved.*

</div>
