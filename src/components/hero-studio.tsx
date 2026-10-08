"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { products, formatPrice, type Product } from "@/lib/products";
import { CLOUDINARY_SEED_IMAGES } from "@/lib/cloudinary";
import { useCart } from "./cart-context";

// Curated architectural wall palettes
const WALL_SURFACES = [
  { id: "linen", name: "Linen White", hex: "#FAF8F5", darkText: true },
  { id: "plaster", name: "Warm Plaster", hex: "#ECE8E1", darkText: true },
  { id: "terracotta", name: "Earth Terracotta", hex: "#876052", darkText: false },
  { id: "charcoal", name: "Deep Charcoal", hex: "#222225", darkText: false },
  { id: "sage", name: "Olive Sage", hex: "#596353", darkText: false },
];

// Frame finishes
const FRAME_OPTIONS = [
  { id: "none", name: "Unframed Edge", surcharge: 0 },
  { id: "teak", name: "Natural Teak Float", surcharge: 1600 },
  { id: "black", name: "Matte Black Float", surcharge: 1400 },
];

export function HeroStudio() {
  const { add } = useCart();

  // Selected artwork (defaults to first bestseller)
  const [selectedProduct, setSelectedProduct] = useState<Product>(
    products[0] || {
      id: "prod_01",
      slug: "golden-rise",
      name: "Golden Rise",
      image: CLOUDINARY_SEED_IMAGES.sunrise,
      price: 3900,
      room: "Living Room",
      style: "Minimalist",
      description: "Hand-sculpted sunrise relief in warm ivory and Ceylon yellow.",
    }
  );

  const [activeWall, setActiveWall] = useState(WALL_SURFACES[1]);
  const [activeFrame, setActiveFrame] = useState(FRAME_OPTIONS[0]);

  // Curated representative standard sizes for architectural visualizer
  const PREFERRED_LABELS = ["8×10", "12×16", "16×20", "20×24"];

  // Sizes available for selected product
  const sizeOptions = useMemo(() => {
    let chosen: any[] = [];
    if (selectedProduct.sizes && selectedProduct.sizes.length > 0) {
      // Find the 4 standard sizes
      chosen = selectedProduct.sizes.filter((s) =>
        PREFERRED_LABELS.includes(s.label.replace(/\s+/g, ""))
      );
      // Fallback if not all preferred sizes exist
      if (chosen.length < 3) {
        if (selectedProduct.sizes.length <= 4) {
          chosen = selectedProduct.sizes;
        } else {
          const s = selectedProduct.sizes;
          chosen = [
            s[0],
            s[Math.floor(s.length * 0.33)],
            s[Math.floor(s.length * 0.66)],
            s[s.length - 1],
          ];
        }
      }
    } else {
      chosen = [
        { width: 8, height: 10, label: "8×10", priceWithoutFrame: 2650 },
        { width: 12, height: 16, label: "12×16", priceWithoutFrame: 4400 },
        { width: 16, height: 20, label: "16×20", priceWithoutFrame: 6300 },
        { width: 20, height: 24, label: "20×24", priceWithoutFrame: 8750 },
      ];
    }

    return chosen.map((s) => {
      const w = s.width || 12;
      const h = s.height || 16;
      const diagonal = Math.hypot(w, h);
      // Subtle, natural visual scale progression across standard dimensions
      // 8×10 -> 0.92, 12×16 -> 0.98, 16×20 -> 1.04, 20×24 -> 1.09
      const scale = Number((0.82 + (diagonal / 25.61) * 0.22).toFixed(2));
      const cleanLabel = s.label.includes("×")
        ? s.label.replace("×", " × ")
        : s.label.includes("x")
          ? s.label.replace("x", " × ")
          : s.label;

      return {
        rawLabel: s.label,
        label: `${cleanLabel} in`,
        width: w,
        height: h,
        aspectRatio: `${w} / ${h}`,
        basePrice: s.priceWithoutFrame,
        scale,
      };
    });
  }, [selectedProduct]);

  const [activeSize, setActiveSize] = useState(sizeOptions[1] || sizeOptions[0]);

  // Keep size updated when product changes while preserving selected dimension if possible
  React.useEffect(() => {
    if (sizeOptions.length > 0) {
      setActiveSize((prev) => {
        const found = sizeOptions.find(
          (s) => s.rawLabel === prev?.rawLabel || s.label === prev?.label
        );
        return found || sizeOptions[1] || sizeOptions[0];
      });
    }
  }, [sizeOptions]);

  // Calculated live price
  const calculatedPrice = useMemo(() => {
    return activeSize.basePrice + activeFrame.surcharge;
  }, [activeSize, activeFrame]);

  const [addedToast, setAddedToast] = useState(false);

  const handleAddToCart = () => {
    add({
      product: selectedProduct,
      size: activeSize.label,
      framed: activeFrame.id !== "none",
      qty: 1,
      unitPrice: calculatedPrice,
    });
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  return (
    <section className="relative pt-8 pb-16 md:pt-14 md:pb-24 overflow-hidden bg-[#FDFCFC]">
      <div className="container-x">
        {/* ElevenLabs-style Hero Title & Subheader */}
        <div className="max-w-4xl mx-auto text-center mb-10 md:mb-14">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-light tracking-[-0.035em] text-[#000000] leading-[0.98]">
            Walls worth feeling.
          </h1>

          <p className="mt-5 text-base sm:text-lg text-[#59544F] max-w-2xl mx-auto leading-relaxed font-normal">
            Dimensional plaster reliefs hand-sculpted in Sri Lanka.
            Preview artwork textures on your interior wall surface before ordering.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#studio"
              className="h-10 px-5 inline-flex items-center justify-center rounded-full text-xs font-medium bg-[#000000] !text-white hover:bg-[#222222] transition-colors shadow-xs"
              style={{ color: "#FFFFFF" }}
            >
              Virtual Wall Studio
            </a>
            <Link
              href="/custom-order"
              className="h-10 px-5 inline-flex items-center justify-center rounded-full text-xs font-medium bg-white text-[#000000] border border-[#EBE8E4] hover:border-black transition-all shadow-xs"
            >
              Bespoke Custom Orders
            </Link>
          </div>
        </div>

        {/* ElevenLabs-Style Interactive Hero Studio Widget */}
        <div
          id="studio"
          className="border border-[#EBE8E4] rounded-2xl md:rounded-3xl bg-[#FFFFFF] shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden"
        >
          {/* Top Bar of the Studio */}
          <div className="border-b border-[#EBE8E4] px-5 py-3.5 bg-[#F5F3F1] flex items-center justify-between text-xs">
            <span className="font-medium text-[#000000]">Virtual Wall Visualizer</span>
          </div>

          {/* Main Studio Body: 2 Columns */}
          <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
            {/* Visualizer Canvas (Interactive Wall Backdrop) */}
            <div
              className="relative min-h-[420px] sm:min-h-[500px] lg:min-h-[580px] p-8 sm:p-12 flex items-center justify-center transition-colors duration-500 overflow-hidden"
              style={{ backgroundColor: activeWall.hex }}
            >
              {/* Subtle architectural wall texture overlay */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

              {/* Framed Artwork Display with Dynamic Scale Animation */}
              <div
                className="relative transition-all duration-500 ease-out flex items-center justify-center"
                style={{
                  transform: `scale(${activeSize.scale})`,
                  transformOrigin: "center center",
                }}
              >
                {/* Frame border wrapper */}
                <div
                  className={`relative overflow-hidden transition-all duration-500 ease-out ${activeFrame.id === "teak"
                    ? "p-3 bg-[#B08968] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.35)] ring-1 ring-black/20"
                    : activeFrame.id === "black"
                      ? "p-3 bg-[#111111] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.45)] ring-1 ring-black/40"
                      : "shadow-[0_20px_40px_-12px_rgba(0,0,0,0.25)] ring-1 ring-black/10"
                    }`}
                  style={{
                    borderRadius: activeFrame.id !== "none" ? "4px" : "2px",
                  }}
                >
                  {/* Floating shadow gap between frame and canvas with dynamic aspect ratio */}
                  <div
                    className="relative w-[210px] sm:w-[260px] md:w-[290px] overflow-hidden bg-[#FAFAFA] transition-all duration-500 ease-out elevenlabs-grain"
                    style={{
                      aspectRatio: activeSize.aspectRatio,
                    }}
                  >
                    <Image
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      fill
                      priority
                      className="object-cover transition-opacity duration-300"
                    />
                    {/* Natural directional light glaze */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-white/10 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Studio Controls & Ordering Panel */}
            <div className="p-6 sm:p-8 bg-[#FFFFFF] border-t lg:border-t-0 lg:border-l border-[#EBE8E4] flex flex-col justify-between">
              <div className="space-y-6">
                {/* 1. Artwork Selector */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-[11px] uppercase font-medium tracking-[0.05em] text-[#777169]">
                      1. Choose Artwork Design
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {products.slice(0, 4).map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedProduct(p)}
                        className={`flex items-center gap-2.5 p-2 h-14 rounded-xl border text-left transition-all ${selectedProduct.id === p.id
                          ? "border-[#000000] bg-[#F5F3F1] ring-1 ring-[#000000]"
                          : "border-[#EBE8E4] hover:border-[#000000] bg-white"
                          }`}
                      >
                        <div className="relative size-10 rounded-lg overflow-hidden shrink-0 border border-[#EBE8E4]">
                          <Image
                            src={p.image}
                            alt={p.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-normal text-[#000000] truncate">
                            {p.name}
                          </p>
                          <p className="text-[10px] text-[#777169] truncate">
                            {p.room}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Wall Tone Selector */}
                <div>
                  <label className="block text-[11px] uppercase font-medium tracking-[0.05em] text-[#777169] mb-2.5">
                    2. Select Wall Surface Tone
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {WALL_SURFACES.map((w) => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => setActiveWall(w)}
                        className={`h-9 px-3.5 rounded-full border text-xs font-normal flex items-center justify-center gap-2 transition-all ${activeWall.id === w.id
                          ? "border-[#000000] bg-[#F5F3F1] ring-1 ring-[#000000] text-[#000000] font-medium"
                          : "border-[#EBE8E4] hover:border-[#000000] text-[#000000] bg-white"
                          }`}
                      >
                        <span
                          className="size-2.5 rounded-full border border-black/20 shrink-0"
                          style={{ backgroundColor: w.hex }}
                        />
                        <span className="whitespace-nowrap">{w.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Dimensions Selector */}
                <div>
                  <label className="block text-[11px] uppercase font-medium tracking-[0.05em] text-[#777169] mb-2.5">
                    3. Dimensions (Inches)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {sizeOptions.map((s) => (
                      <button
                        key={s.label}
                        type="button"
                        onClick={() => setActiveSize(s)}
                        className={`h-9 px-3.5 rounded-full border text-xs font-normal text-center transition-all flex items-center justify-center ${activeSize.label === s.label
                          ? "border-[#000000] bg-[#F5F3F1] ring-1 ring-[#000000] text-[#000000] font-medium"
                          : "border-[#EBE8E4] hover:border-[#000000] text-[#000000] bg-white"
                          }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Frame Finish */}
                <div>
                  <label className="block text-[11px] uppercase font-medium tracking-[0.05em] text-[#777169] mb-2.5">
                    4. Framing Finish
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {FRAME_OPTIONS.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setActiveFrame(f)}
                        className={`h-9 px-3.5 rounded-full border text-xs font-normal transition-all flex items-center justify-center gap-1.5 ${activeFrame.id === f.id
                          ? "border-[#000000] bg-[#F5F3F1] ring-1 ring-[#000000] text-[#000000] font-medium"
                          : "border-[#EBE8E4] hover:border-[#000000] text-[#000000] bg-white"
                          }`}
                      >
                        <span className="whitespace-nowrap">{f.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Price & Checkout CTA */}
              <div className="mt-8 pt-6 border-t border-[#EBE8E4]">
                {addedToast && (
                  <div className="mb-3 p-2.5 rounded-xl border border-[#BA8E23] bg-[#F5F3F1] text-xs text-[#000000] flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-normal">
                      <Check size={14} className="text-[#BA8E23]" /> Added to cart!
                    </span>
                    <Link
                      href="/checkout"
                      className="font-medium underline hover:text-[#BA8E23]"
                    >
                      Checkout now →
                    </Link>
                  </div>
                )}

                <div className="flex items-baseline justify-between mb-4">
                  <div>
                    <span className="text-[11px] uppercase tracking-[0.05em] text-[#777169]">
                      Total Handmade Value (COD)
                    </span>
                    <p className="text-2xl sm:text-3xl font-light text-[#000000] tracking-[-0.02em]">
                      {formatPrice(calculatedPrice)}
                    </p>
                  </div>
                  <span className="text-xs text-[#777169]">
                    Lead time: 5–7 days
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="h-11 px-5 rounded-full bg-[#BA8E23] text-black hover:bg-[#A87F1E] font-medium text-xs flex items-center justify-center transition-all"
                  >
                    Add to Cart · {formatPrice(calculatedPrice)}
                  </button>

                  <a
                    href={`https://wa.me/94782518184?text=${encodeURIComponent(
                      `Hi Ceylon Wall Decor, I customized "${selectedProduct.name}" in ${activeSize.label} with ${activeFrame.name} on ${activeWall.name} wall for ${formatPrice(calculatedPrice)}. Can you confirm availability?`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-11 px-5 rounded-full bg-white text-[#000000] border border-[#EBE8E4] hover:border-[#000000] font-medium text-xs flex items-center justify-center transition-all"
                  >
                    Order via WhatsApp
                  </a>
                </div>

                <p className="mt-3 text-[11px] text-[#777169] text-center">
                  Free island-wide delivery on orders over Rs. 10,000.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
