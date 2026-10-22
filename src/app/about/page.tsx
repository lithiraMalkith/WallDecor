import type { Metadata } from "next";
import Image from "next/image";
import { PageShell } from "@/components/page-shell";

import { getStorefrontMedia } from "@/lib/storefront-media-server";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Our Story",
  description: "Meet the hands behind Ceylon Wall Decor.",
};

export default async function Page() {
  const [scene] = await getStorefrontMedia();
  return (
    <PageShell
      eyebrow="About the Atelier"
      title="Texture, shaped slowly by hand."
      intro="Small-batch textured plaster wall sculptures, handcrafted in Sri Lanka with mineral earth paste and palette knives."
    >
      <div className="grid gap-12 lg:grid-cols-[1.1fr_.9fr] items-center">
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-[#EBE8E4] bg-[#F5F3F1] shadow-[0_1px_2px_rgba(0,0,0,0.02)] elevenlabs-grain">
          {scene && <Image
            src={scene.image}
            alt={scene.alt}
            fill
            className="object-cover"
          />}
        </div>

        <div className="space-y-6 text-base sm:text-lg text-[#59544F] font-normal leading-relaxed">
          <p>
            Ceylon Wall Decor began with a quiet belief: a wall should feel as
            considered and tactile as everything else in your living space.
          </p>
          <p>
            Every canvas is built deliberately in Sri Lanka. We sculpt dense mineral plaster
            with hand palette knives, creating dimensional ridges that respond dynamically to
            shifting natural morning and evening sunlight.
          </p>
          <p>
            No two pieces are ever identical. Subtle knife marks and textural depth are not
            imperfections—they are the indelible signature of hand craftsmanship.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
