import { Home } from "@/components/home";
import { getLiveProductsAsync } from "@/lib/catalog-server";

import { getStorefrontMedia } from "@/lib/storefront-media-server";
import { Suspense } from "react";
import { ArtworkHero } from "@/components/artwork-hero";
import { ArtworkCarousel } from "@/components/artwork-carousel";
import type { StorefrontMedia } from "@/lib/storefront-media";

export const dynamic = "force-dynamic";

async function LiveCarousel({ media }: { media: Promise<StorefrontMedia[]> }) {
  const scenes = (await media).filter(scene => scene.carouselOrder !== undefined).sort((a, b) => a.carouselOrder! - b.carouselOrder!);
  return <ArtworkCarousel scenes={scenes} />;
}

async function LiveCollection({ products, media }: { products: ReturnType<typeof getLiveProductsAsync>; media: Promise<StorefrontMedia[]> }) {
  const [liveProducts, liveMedia] = await Promise.all([products, media]);
  return <Home initialProducts={liveProducts} media={liveMedia} />;
}

export default function Page() {
  const products = getLiveProductsAsync();
  const media = getStorefrontMedia();
  return <>
    <ArtworkHero>
      <Suspense fallback={<div className="art-carousel" aria-busy="true"><span className="sr-only">Loading artwork inspiration…</span></div>}>
        <LiveCarousel media={media} />
      </Suspense>
    </ArtworkHero>
    <Suspense fallback={<div className="container-x min-h-96 py-20" role="status">Loading the collection…</div>}>
      <LiveCollection products={products} media={media} />
    </Suspense>
  </>;
}
