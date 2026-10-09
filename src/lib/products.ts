import { adminStore } from "@/lib/admin-data";
import type { Product as AdminProduct, SizeVariant } from "@/types";

export type Product = {
  id: string;
  slug: string;
  name: string;
  sku?: string;
  image: string;
  images?: string[];
  room: string;
  rooms?: string[];
  style: string;
  styles?: string[];
  price: number;
  description: string;
  longDescription?: string;
  material?: string;
  technique?: string;
  leadTimeDays?: number;
  badge?: string;
  sizes?: SizeVariant[];
};

import { CLOUDINARY_SEED_IMAGES } from "@/lib/cloudinary";

export function mapAdminProductToStorefront(p: AdminProduct): Product {
  const minPrice =
    p.sizes && p.sizes.length > 0
      ? Math.min(...p.sizes.map((s) => s.priceWithoutFrame))
      : 3500;

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    sku: p.sku,
    image: p.images?.[0] || CLOUDINARY_SEED_IMAGES.sunrise,
    images:
      p.images && p.images.length > 0
        ? p.images
        : [CLOUDINARY_SEED_IMAGES.sunrise],

    room: p.room?.[0] || "Living Room",
    rooms: p.room || ["Living Room"],
    style: p.style?.[0] || "Minimal",
    styles: p.style || ["Minimal"],
    price: minPrice,
    description: p.shortDescription || p.name,
    longDescription: p.longDescription,
    material: p.material,
    technique: p.technique,
    leadTimeDays: p.leadTimeDays,
    badge:
      p.featuredBadge ||
      (p.isBestseller ? "Bestseller" : p.isNew ? "New" : undefined),
    sizes: p.sizes,
  };
}

export function getLiveProducts(): Product[] {
  return adminStore.products
    .filter((p) => p.visibility === "published")
    .map(mapAdminProductToStorefront);
}

export function getProduct(slugOrId: string): Product | undefined {
  const p = adminStore.products.find(
    (item) => item.slug === slugOrId || item.id === slugOrId,
  );
  return p ? mapAdminProductToStorefront(p) : undefined;
}

/**
 * Asynchronous lookup that queries Firestore to ensure latest published products
 */
export async function getProductAsync(slugOrId: string): Promise<Product | undefined> {
  try {
    await syncProductsFromFirestore();
  } catch (err) {
    console.warn("Failed to fetch product asynchronously from Firestore:", err);
  }
  return getProduct(slugOrId);
}

/**
 * Explicit catalog synchronizer with Firestore DB
 */
export async function syncProductsFromFirestore(): Promise<Product[]> {
  try {
    const { getProductsFromFirestore } = await import("@/lib/firestore-service");
    const remote = await getProductsFromFirestore();
    if (remote && remote.length > 0) {
      adminStore.products = remote;
    }
  } catch (err) {
    console.warn("Could not sync products from Firestore:", err);
  }
  return getLiveProducts();
}

export async function getLiveProductsAsync(): Promise<Product[]> {
  return syncProductsFromFirestore();
}

export const formatPrice = (n: number) => `Rs. ${n.toLocaleString("en-LK")}`;

// Dynamic proxy array ensuring all callers of `products` get the latest live data from adminStore
export const products: Product[] = new Proxy([] as Product[], {
  get(_target, prop) {
    const live = getLiveProducts();
    if (prop === "length") return live.length;
    if (prop === Symbol.iterator) return live[Symbol.iterator].bind(live);
    if (typeof prop === "string" && !isNaN(Number(prop))) {
      return live[Number(prop)];
    }
    const val = (live as any)[prop];
    if (typeof val === "function") {
      return val.bind(live);
    }
    return val;
  },
});

