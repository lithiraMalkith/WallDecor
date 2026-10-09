"use client";

import Image from "next/image";
import Link from "next/link";
import { products, formatPrice, type Product } from "@/lib/products";

export function BentoShowcase({ products: propProducts }: { products?: Product[] } = {}) {
  const activeProducts = propProducts && propProducts.length > 0 ? propProducts : products;
  const featured =
    activeProducts.find((p) => p.badge === "Bestseller" || p.badge === "Featured") ||
    activeProducts[0];

  return (
    <section className="py-16 md:py-24 bg-[#F5F3F1] border-y border-[#EBE8E4]">
      <div className="container-x">
        {/* Section Header */}
        <div className="max-w-2xl mb-12">
          <p className="eyebrow text-[#777169]">Curated Atelier</p>
          <h2 className="text-3xl sm:text-5xl font-light tracking-[-0.03em] text-[#000000] mt-2 leading-[1.04]">
            Form, shadow &amp; quiet substance.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#59544F] font-normal leading-relaxed">
            Every piece is sculpted by hand with palette knives, layered with mineral
            plaster, and sealed against tropical moisture.
          </p>
        </div>

        {/* Asymmetric Bento Grid (ElevenLabs-style) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6">
          {/* Card 1: Masterpiece Spotlight (7 Columns) */}
          <div className="bento-card md:col-span-7 flex flex-col justify-between overflow-hidden relative group">
            <div className="flex items-center justify-between mb-4">
              <span className="pill-btn text-[11px] py-1 px-3 bg-white border-[#EBE8E4] text-[#000000]">
                Featured Masterpiece
              </span>
              <span className="font-mono text-xs text-[#777169]">
                From {formatPrice(featured ? featured.price : 3900)}
              </span>
            </div>

            <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-[#EFECE6] my-2 border border-[#EBE8E4] elevenlabs-grain">
              {featured && (
                <Image
                  src={featured.image}
                  alt={featured.name}
                  fill
                  className="object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 text-white">
                <p className="text-lg font-light tracking-wide">
                  {featured?.name}
                </p>
                <p className="text-xs text-white/80">
                  {featured?.style} · {featured?.room}
                </p>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-[#EBE8E4] mt-2">
              <p className="text-xs text-[#59544F] max-w-sm">
                Deep textural waves sculpted to catch ambient light and shifting shadows.
              </p>
              {featured && (
                <Link
                  href={`/product/${featured.slug}`}
                  className="pill-btn pill-btn-active text-xs shrink-0"
                >
                  Inspect Piece
                </Link>
              )}
            </div>
          </div>

          {/* Card 2: Hand-Crafted Technique (5 Columns) */}
          <div className="bento-card md:col-span-5 flex flex-col justify-between bg-[#FFFFFF]">
            <div>
              <span className="pill-btn text-[11px] py-1 px-3 bg-[#F5F3F1] border-[#EBE8E4] mb-4 text-[#000000]">
                The Plaster Medium
              </span>
              <h3 className="text-xl sm:text-2xl font-light text-[#000000] mt-2 tracking-[-0.02em]">
                Real Mineral Plaster on Reinforced Canvas
              </h3>
              <p className="text-xs sm:text-sm text-[#59544F] mt-2 leading-relaxed font-normal">
                Unlike mass-produced prints, our relief surfaces feature real dimensional
                relief up to 25mm thick, hand-moulded with palette knives and natural earth
                pigments.
              </p>
            </div>

            <div className="my-6 p-4 rounded-xl bg-[#F5F3F1] border border-[#EBE8E4] space-y-2.5 text-xs text-[#000000]">
              <div className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-[#BA8E23] shrink-0" />
                <span>3-layer dimensional relief plaster</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-[#BA8E23] shrink-0" />
                <span>UV-resistant satin protective seal</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-[#BA8E23] shrink-0" />
                <span>Solid pine kiln-dried stretchers</span>
              </div>
            </div>

            <Link
              href="/gallery"
              className="pill-btn text-xs w-full justify-center hover:border-black"
            >
              Explore Texture Gallery
            </Link>
          </div>

          {/* Card 3: Bespoke Sizing Atelier (4 Columns) */}
          <div className="bento-card md:col-span-4 flex flex-col justify-between">
            <div>
              <span className="pill-btn text-[11px] py-1 px-3 bg-[#F5F3F1] border-[#EBE8E4] mb-4 text-[#000000]">
                Bespoke Sizing
              </span>
              <h3 className="text-lg font-normal text-[#000000] tracking-[-0.01em]">
                Custom Architectural Scale
              </h3>
              <p className="text-xs text-[#59544F] mt-1.5 leading-relaxed font-normal">
                Have a double-height wall or specific dining room nook? We sculpt custom sizes
                up to 8 feet with 24-hour quotation.
              </p>
            </div>

            <div className="pt-6">
              <Link
                href="/custom-order"
                className="pill-btn pill-btn-active text-xs w-full justify-center"
              >
                Request Custom Size
              </Link>
            </div>
          </div>

          {/* Card 4: Curated Room Aesthetics (4 Columns) */}
          <div className="bento-card md:col-span-4 flex flex-col justify-between">
            <div>
              <span className="pill-btn text-[11px] py-1 px-3 bg-[#F5F3F1] border-[#EBE8E4] mb-4 text-[#000000]">
                Interiors
              </span>
              <h3 className="text-lg font-normal text-[#000000] tracking-[-0.01em]">
                Room Harmonization
              </h3>
              <p className="text-xs text-[#59544F] mt-1.5 leading-relaxed font-normal">
                Curated relief styles developed for modern Sri Lankan living rooms,
                serene bedrooms, and executive dining spaces.
              </p>
            </div>

            <div className="pt-6">
              <Link
                href="/shop"
                className="pill-btn text-xs w-full justify-center hover:border-black"
              >
                Filter by Room Space
              </Link>
            </div>
          </div>

          {/* Card 5: Island-Wide White-Glove COD (4 Columns) */}
          <div className="bento-card md:col-span-4 flex flex-col justify-between">
            <div>
              <span className="pill-btn text-[11px] py-1 px-3 bg-[#F5F3F1] border-[#EBE8E4] mb-4 text-[#000000]">
                Service
              </span>
              <h3 className="text-lg font-normal text-[#000000] tracking-[-0.01em]">
                Island-Wide Delivery &amp; COD
              </h3>
              <p className="text-xs text-[#59544F] mt-1.5 leading-relaxed font-normal">
                Pay cash or bank transfer only after safely inspecting your packaged
                textured artwork upon arrival.
              </p>
            </div>

            <div className="pt-6">
              <Link
                href="/order/track"
                className="pill-btn text-xs w-full justify-center hover:border-black"
              >
                Live Order Tracking
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
