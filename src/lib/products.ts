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

export function mapAdminProductToStorefront(p: AdminProduct): Product {
  return {
    id: p.id, slug: p.slug, name: p.name, sku: p.sku,
    image: p.images?.[0] || "", images: p.images || [],
    room: p.room?.[0] || "", rooms: p.room || [],
    style: p.style?.[0] || "", styles: p.style || [],
    price: p.sizes?.length ? Math.min(...p.sizes.map(s => s.priceWithoutFrame)) : 0,
    description: p.shortDescription, longDescription: p.longDescription,
    material: p.material, technique: p.technique, leadTimeDays: p.leadTimeDays,
    badge: p.featuredBadge || (p.isBestseller ? "Bestseller" : p.isNew ? "New" : undefined),
    sizes: p.sizes,
  };
}
export const formatPrice = (n: number) => `Rs. ${n.toLocaleString("en-LK")}`;
