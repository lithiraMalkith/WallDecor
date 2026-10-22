import { Home } from "@/components/home";
import { getLiveProductsAsync } from "@/lib/catalog-server";

import { getStorefrontMedia } from "@/lib/storefront-media-server";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [liveProducts, media] = await Promise.all([getLiveProductsAsync(), getStorefrontMedia()]);
  return <Home initialProducts={liveProducts} media={media} />;
}
