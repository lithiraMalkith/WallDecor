"use client";

import Image from "next/image";
import Link from "next/link";
import type { StorefrontMedia } from "@/lib/storefront-media";
import type { Product } from "@/lib/products";
import { useCatalog } from "@/lib/use-catalog";
import { ProductCard } from "./product-card";
import { Reveal } from "./reveal";
import { HeroStudio } from "./hero-studio";
import { BentoShowcase } from "./bento-showcase";
import { CraftTicker } from "./craft-ticker";
import { CollectorVoice } from "./collector-voice";
import { ArtworkCarousel } from "./artwork-carousel";

export function Home({ initialProducts, media }: { initialProducts?: Product[]; media: StorefrontMedia[] }) {
  const { catalog, catalogError } = useCatalog(initialProducts);

  return (
    <>
      <ArtworkCarousel scenes={media.filter(scene => scene.carouselOrder !== undefined).sort((a,b) => a.carouselOrder! - b.carouselOrder!)} />

      {/* 2. Micro Ticker / Craft Provenance Bar (GSAP Text Rotator) */}
      <CraftTicker />

      {/* 3. Asymmetric Bento Grid Showcase (ElevenLabs Inspired) */}
      <BentoShowcase products={catalog} />

      {/* 4. The Artwork Collection Catalog */}
      <section id="collection" className="container-x py-20 bg-[#FDFCFC] scroll-mt-20">
        <Reveal>
          <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#EBE8E4] pb-6">
            <div>
              <p className="eyebrow text-[#777169]">The Collection</p>
              <h2 className="text-3xl sm:text-5xl font-light tracking-[-0.03em] text-[#000000] mt-2 leading-[1.04]">
                Sculpted Artwork Designs
              </h2>
            </div>
            <Link
              href="/shop"
              className="pill-btn pill-btn-active text-xs shrink-0"
            >
              Browse All Artworks
            </Link>
          </div>
        </Reveal>

        {catalog.length === 0 && <p role="status">{catalogError ? "The collection is unavailable. Please try again shortly." : "No artworks are available yet."}</p>}
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
          {catalog.map((p) => (
            <Reveal key={p.id}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </section>

      <HeroStudio products={catalog} />

      {/* 5. Minimalist Crafting Principles */}
      <section className="storefront-dark bg-[#10271B] py-20 text-[#FFFFFF]">
        <div className="container-x">
          <Reveal>
            <p className="eyebrow text-[var(--store-accent-ink)]">Made Slowly &amp; Deliberately</p>
            <h2 className="text-3xl sm:text-5xl font-light tracking-[-0.03em] mt-3 max-w-3xl leading-[1.05]">
              One piece at a time. Shaped, textured and sealed by hand.
            </h2>
          </Reveal>

          <div className="mt-14 grid border-y border-white/10 md:grid-cols-3">
            {[
              [
                "01",
                "Choose or Customize",
                "Select from our curated collection designs or submit reference photos for custom sizing.",
              ],
              [
                "02",
                "Artisan Sculpting",
                "Crafted with palette knives on gallery canvas using dense mineral plaster paste.",
              ],
              [
                "03",
                "White-Glove COD",
                "Securely boxed in protective wooden cradles and delivered island-wide with COD.",
              ],
            ].map(([n, t, d], i) => (
              <Reveal
                key={String(t)}
                className={`py-8 md:p-8 ${i < 2 ? "md:border-r md:border-white/10" : ""}`}
              >
                <p className="font-mono text-sm text-[var(--store-accent-ink)] font-medium">{String(n)}</p>
                <h3 className="mt-3 text-xl font-light tracking-[-0.015em]">{String(t)}</h3>
                <p className="mt-2 text-xs text-white/70 leading-relaxed font-normal">
                  {String(d)}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Bespoke Atelier Callout */}
      <section className="container-x grid gap-10 py-20 lg:grid-cols-[1.1fr_.9fr] items-center">
        <Reveal>
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-[#EBE8E4] bg-[#F5F3F1] shadow-[0_1px_2px_rgba(0,0,0,0.02)] elevenlabs-grain">
            {media[0] && <Image
              src={media[0].image}
              alt={media[0].alt}
              fill
              className="object-cover"
            />}
          </div>
        </Reveal>

        <Reveal className="flex flex-col justify-center">
          <p className="eyebrow text-[#777169]">Bespoke Commission Atelier</p>
          <h2 className="text-3xl sm:text-5xl font-light text-[#000000] mt-3 tracking-[-0.03em] leading-[1.04]">
            Not in the catalog?
          </h2>
          <p className="mt-4 text-sm text-[#59544F] leading-relaxed font-normal max-w-lg">
            Have a photo of a textured wall relief you love on Pinterest or Instagram?
            Our studio sculpts custom pieces tailored to your exact wall dimensions,
            surrounding furniture, and lighting conditions.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/custom-order" className="btn btn-accent text-xs">
              Request a Custom Quote
            </Link>
            <a
              href="https://wa.me/94782518184"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline text-xs"
            >
              Consult via WhatsApp
            </a>
          </div>
        </Reveal>
      </section>

      {/* 7. Collector Voice (GSAP Animated Social Proof & Database Testimonials) */}
      <CollectorVoice />
    </>
  );
}
