"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Sparkles,
  Calculator,
  Plus,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { createProduct } from "@/lib/admin-client";
import { CloudinaryImageUploader } from "@/components/admin/cloudinary-image-uploader";
import { CLOUDINARY_SEED_IMAGES } from "@/lib/cloudinary";
import {
  calculateFramePrice,
  generateSKU,
  slugify,
  formatPrice,
} from "@/lib/utils";
import type {
  SizeVariant,
  FrameOption,
  StockType,
  VisibilityStatus,
} from "@/types";

const DEFAULT_9_SIZES: { w: number; h: number; label: string; base: number }[] =
  [
    { w: 6, h: 6, label: "6×6", base: 1800 },
    { w: 8, h: 8, label: "8×8", base: 2200 },
    { w: 8, h: 10, label: "8×10", base: 2600 },
    { w: 10, h: 10, label: "10×10", base: 2900 },
    { w: 10, h: 12, label: "10×12", base: 3200 },
    { w: 12, h: 12, label: "12×12", base: 3500 },
    { w: 12, h: 16, label: "12×16", base: 4350 },
    { w: 16, h: 20, label: "16×20", base: 6850 },
    { w: 20, h: 24, label: "20×24", base: 9800 },
  ];

export default function NewProductPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [longDesc, setLongDesc] = useState("");
  const [frameRate, setFrameRate] = useState(6);
  const [frameOption, setFrameOption] = useState<FrameOption>("optional");
  const [stockType, setStockType] = useState<StockType>("made_to_order");
  const [quantity, setQuantity] = useState<number>(5);
  const [leadTime, setLeadTime] = useState(5);
  const [visibility, setVisibility] = useState<VisibilityStatus>("published");
  const [isBestseller, setIsBestseller] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [rooms, setRooms] = useState<string[]>(["Living Room"]);
  const [styles, setStyles] = useState<string[]>(["Minimalist"]);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Sizes with live calculated frame costs
  const [sizes, setSizes] = useState<SizeVariant[]>(
    DEFAULT_9_SIZES.map((s) => {
      const frameCost = calculateFramePrice(s.w, s.h, frameRate);
      return {
        width: s.w,
        height: s.h,
        label: s.label,
        priceWithoutFrame: s.base,
        priceWithFrame: s.base + frameCost,
        sku: `CWD-NEW-${s.label.replace("×", "X")}`,
        inStock: true,
      };
    }),
  );

  const handleBasePriceChange = (index: number, newBase: number) => {
    setSizes((prev) => {
      const next = [...prev];
      const item = next[index];
      const frameCost = calculateFramePrice(item.width, item.height, frameRate);
      next[index] = {
        ...item,
        priceWithoutFrame: newBase,
        priceWithFrame: newBase + frameCost,
      };
      return next;
    });
  };

  const handleFrameRateChange = (newRate: number) => {
    setFrameRate(newRate);
    setSizes((prev) =>
      prev.map((item) => {
        const frameCost = calculateFramePrice(item.width, item.height, newRate);
        return {
          ...item,
          priceWithFrame: item.priceWithoutFrame + frameCost,
        };
      }),
    );
  };

  const toggleRoom = (room: string) => {
    setRooms((prev) =>
      prev.includes(room) ? prev.filter((r) => r !== room) : [...prev, room],
    );
  };

  const toggleStyle = (style: string) => {
    setStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Please enter an artwork design title");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const baseSku = generateSKU(name);
      // update SKUs on sizes
      const finalSizes = sizes.map((s) => ({
        ...s,
        sku: `${baseSku}-${s.label.replace("×", "X")}`,
      }));

      await createProduct({
        name,
        slug: slugify(name),
        sku: baseSku,
        shortDescription:
          shortDesc || "Hand-sculpted textured plaster on canvas.",
        longDescription:
          longDesc || "Crafted with premium materials and mineral pigments.",
        images: [imageUrl],
        tiktokVideoLink: tiktokUrl,
        room: rooms.length > 0 ? rooms : ["Living Room"],
        style: styles.length > 0 ? styles : ["Minimalist"],
        colourTags: ["Neutral", "Earth Tone"],
        sizes: finalSizes,
        frameOption,
        framePricePerSqInch: frameRate,
        stockType,
        quantity: stockType === "ready_stock" ? quantity : undefined,
        leadTimeDays: leadTime,
        visibility,
        isBestseller,
        isFeatured,
      });

      router.push("/admin/products");
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to save product",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 rounded-lg bg-brand-surface border border-brand-border text-brand-muted hover:text-brand-text transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-brand-text font-serif">
              Add New Artwork Design
            </h1>
            <p className="text-xs text-brand-muted">
              Configure 9 standard sizes, automatic frame pricing, and
              visibility
            </p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-accent hover:bg-brand-accent-hover text-brand-bg font-semibold text-xs sm:text-sm transition-colors shadow-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSubmitting ? "Saving..." : "Publish Design"}</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-brand-danger/10 border border-brand-danger/30 text-brand-danger text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Left Column (Main Information) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Details */}
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-text flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-accent" />
              <span>Design Identity</span>
            </h2>

            <div>
              <label className="block text-xs font-medium text-brand-muted uppercase tracking-wider mb-1.5">
                Artwork Design Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Golden Rise / Terracotta Waves"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input text-base font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-brand-muted uppercase tracking-wider mb-1.5">
                Short Caption / Hook
              </label>
              <input
                type="text"
                placeholder="e.g. Hand-sculpted sunrise relief in warm ivory and Ceylon yellow."
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                className="form-input"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-brand-muted uppercase tracking-wider mb-1.5">
                Full Description & Crafting Details
              </label>
              <textarea
                rows={4}
                placeholder="Describe texture relief technique, canvas preparation, and room ambiance..."
                value={longDesc}
                onChange={(e) => setLongDesc(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          {/* 9 Standard Sizes & Dynamic Frame Matrix */}
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-border pb-3">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-text flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-brand-accent" />
                  <span>Size & Frame Pricing Formula</span>
                </h2>
                <p className="text-xs text-brand-muted mt-0.5">
                  Frame cost = Width × Height × Rate per sq. inch
                </p>
              </div>

              {/* Rate configuration */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-brand-muted">Rate/Sq.in:</span>
                <div className="flex items-center">
                  <span className="text-xs text-brand-accent font-bold px-2 py-1 bg-brand-bg rounded-l-md border border-brand-border">
                    Rs.
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={frameRate}
                    onChange={(e) =>
                      handleFrameRateChange(Number(e.target.value))
                    }
                    className="form-input w-16 rounded-l-none text-xs text-center py-1 font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-brand-border text-brand-muted">
                    <th className="py-2 px-2">Size (in)</th>
                    <th className="py-2 px-2">Area</th>
                    <th className="py-2 px-2">Base Art (Rs.)</th>
                    <th className="py-2 px-2">Frame Cost</th>
                    <th className="py-2 px-2 text-right">With Frame Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/40">
                  {sizes.map((s, idx) => {
                    const area = s.width * s.height;
                    const frameCost = calculateFramePrice(
                      s.width,
                      s.height,
                      frameRate,
                    );

                    return (
                      <tr
                        key={s.label}
                        className="hover:bg-brand-surface-hover/50"
                      >
                        <td className="py-2.5 px-2 font-mono font-semibold text-brand-text">
                          {s.label}
                        </td>
                        <td className="py-2.5 px-2 text-brand-muted">
                          {area} sq in
                        </td>
                        <td className="py-2.5 px-2">
                          <input
                            type="number"
                            step={50}
                            value={s.priceWithoutFrame}
                            onChange={(e) =>
                              handleBasePriceChange(idx, Number(e.target.value))
                            }
                            className="form-input py-1 px-2 w-24 text-xs font-semibold"
                          />
                        </td>
                        <td className="py-2.5 px-2 text-brand-accent">
                          +{formatPrice(frameCost)}
                        </td>
                        <td className="py-2.5 px-2 text-right font-bold text-brand-text">
                          {formatPrice(s.priceWithFrame)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Media Section */}
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 space-y-5">
            <h2 className="text-xs font-semibold uppercase tracking-[0.05em] text-[#777169]">
              Artwork Media &amp; Showcase
            </h2>

            <div>
              <CloudinaryImageUploader
                value={imageUrl}
                onChange={setImageUrl}
                label="Artwork Photography"
                description="High-resolution image hosted on Cloudinary CDN with tactile ElevenLabs grain."
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-brand-muted uppercase tracking-wider mb-1.5">
                TikTok Video URL (For Product Page Showcase)
              </label>
              <input
                type="url"
                placeholder="https://www.tiktok.com/@ceylonwalldecor/video/..."
                value={tiktokUrl}
                onChange={(e) => setTiktokUrl(e.target.value)}
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Right Column (Fulfillment & Categorization) */}
        <div className="space-y-6">
          {/* Status & Visibility */}
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
              Visibility & Flags
            </h2>

            <div>
              <label className="block text-xs font-medium text-brand-text mb-1">
                Catalog Status
              </label>
              <select
                value={visibility}
                onChange={(e) =>
                  setVisibility(e.target.value as VisibilityStatus)
                }
                className="form-input"
              >
                <option value="published">Published (Live in Store)</option>
                <option value="draft">Draft (Hidden)</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="space-y-2 pt-2 border-t border-brand-border">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-brand-text">
                <input
                  type="checkbox"
                  checked={isBestseller}
                  onChange={(e) => setIsBestseller(e.target.checked)}
                  className="rounded border-brand-border text-brand-accent focus:ring-brand-accent"
                />
                <span>Badge as "Bestseller"</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-brand-text">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded border-brand-border text-brand-accent focus:ring-brand-accent"
                />
                <span>Pin to Homepage Featured</span>
              </label>
            </div>
          </div>

          {/* Fulfillment Model */}
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
              Production & Stock
            </h2>

            <div>
              <label className="block text-xs font-medium text-brand-text mb-1">
                Stock Type
              </label>
              <select
                value={stockType}
                onChange={(e) => setStockType(e.target.value as StockType)}
                className="form-input"
              >
                <option value="made_to_order">
                  Made-to-Order (Crafted upon request)
                </option>
                <option value="ready_stock">
                  Ready Stock (Physical units on hand)
                </option>
              </select>
            </div>

            {stockType === "ready_stock" && (
              <div>
                <label className="block text-xs font-medium text-brand-text mb-1">
                  Available Quantity
                </label>
                <input
                  type="number"
                  min={0}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="form-input"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-brand-text mb-1">
                Handcrafting Lead Time (Days)
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={leadTime}
                onChange={(e) => setLeadTime(Number(e.target.value))}
                className="form-input"
              />
              <p className="text-[11px] text-brand-muted mt-1">
                Average sculpting & curing days
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-brand-text mb-1">
                Frame Availability
              </label>
              <select
                value={frameOption}
                onChange={(e) => setFrameOption(e.target.value as FrameOption)}
                className="form-input"
              >
                <option value="optional">
                  Optional (Customer selects framed or unframed)
                </option>
                <option value="included">
                  Framed Only (Price includes frame)
                </option>
                <option value="none">No Frame (Canvas edge only)</option>
              </select>
            </div>
          </div>

          {/* Categories */}
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
              Room & Style Tags
            </h2>

            <div>
              <label className="block text-xs font-medium text-brand-text mb-2">
                Suitable Rooms
              </label>
              <div className="flex flex-wrap gap-1.5">
                {["Living Room", "Bedroom", "Dining", "Office", "Entryway"].map(
                  (r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => toggleRoom(r)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        rooms.includes(r)
                          ? "bg-brand-accent text-brand-bg font-semibold"
                          : "bg-brand-bg text-brand-muted hover:text-brand-text border border-brand-border"
                      }`}
                    >
                      {r}
                    </button>
                  ),
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-brand-text mb-2">
                Aesthetic Style
              </label>
              <div className="flex flex-wrap gap-1.5">
                {["Minimalist", "Boho", "Abstract", "Botanical", "Modern"].map(
                  (s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => toggleStyle(s)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        styles.includes(s)
                          ? "bg-brand-accent text-brand-bg font-semibold"
                          : "bg-brand-bg text-brand-muted hover:text-brand-text border border-brand-border"
                      }`}
                    >
                      {s}
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
