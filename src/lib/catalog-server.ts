import "server-only";
import { adminDb } from "@/lib/firebase-admin";
import { mapAdminProductToStorefront } from "@/lib/products";
import type { Product } from "@/types";

export function catalogDb() {
  if (!adminDb) throw new Error("Firestore catalog is not configured");
  return adminDb;
}

export async function readProducts(): Promise<Product[]> {
  const snapshot = await catalogDb().collection("products").get();
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Product);
}

export async function findProduct(idOrSlug: string) {
  const collection = catalogDb().collection("products");
  const direct = await collection.doc(idOrSlug).get();
  if (direct.exists) return direct;
  const result = await collection.where("slug", "==", idOrSlug).limit(1).get();
  return result.docs[0];
}

export async function getLiveProductsAsync() {
  return (await readProducts()).filter(product => product.visibility === "published").map(mapAdminProductToStorefront);
}

export async function getProductAsync(idOrSlug: string) {
  const doc = await findProduct(idOrSlug);
  if (!doc?.exists) return undefined;
  const product = { ...doc.data(), id: doc.id } as Product;
  return product.visibility === "published" ? mapAdminProductToStorefront(product) : undefined;
}
