import "server-only";
import { catalogDb } from "@/lib/catalog-server";
import type { StorefrontMedia } from "@/lib/storefront-media";

export async function getStorefrontMedia(): Promise<StorefrontMedia[]> {
  const snapshot = await catalogDb().collection("storefront_media").where("published", "==", true).get();
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as StorefrontMedia);
}
