"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Sparkles,
  Calculator,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";
import { fetchProduct, updateProduct } from "@/lib/admin-client";
import { CloudinaryImageUploader } from "@/components/admin/cloudinary-image-uploader";
import { CLOUDINARY_SEED_IMAGES } from "@/lib/cloudinary";
import { calculateFramePrice, formatPrice } from "@/lib/utils";
import type {
  Product,
  SizeVariant,
  FrameOption,
  StockType,
  VisibilityStatus,
} from "@/types";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [name, setName] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [longDesc, setLongDesc] = useState("");
  const [frameRate, setFrameRate] = useState(6);
  const [frameOption, setFrameOption] = useState<FrameOption>("optional");
  const [stockType, setStockType] = useState<StockType>("made_to_order");
  const [quantity, setQuantity] = useState<number>(0);
  const [leadTime, setLeadTime] = useState(5);
  const [visibility, setVisibility] = useState<VisibilityStatus>("published");
  const [isBestseller, setIsBestseller] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [rooms, setRooms] = useState<string[]>([]);
  const [styles, setStyles] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [sizes, setSizes] = useState<SizeVariant[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchProduct(productId);
        setProduct(data);
        setName(data.name);
        setShortDesc(data.shortDescription);
        setLongDesc(data.longDescription);
        setFrameRate(data.framePricePerSqInch || 6);
        setFrameOption(data.frameOption);
        setStockType(data.stockType);
        setQuantity(data.quantity || 0);
        setLeadTime(data.leadTimeDays);
        setVisibility(data.visibility);
        setIsBestseller(data.isBestseller);
        setIsFeatured(data.isFeatured);
        setRooms(data.room);
        setStyles(data.style);
        setImageUrl(data.images[0] || CLOUDINARY_SEED_IMAGES.hero);
        setSizes(data.sizes);
      } catch (err) {
        setErrorMsg("Failed to load product details");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [productId]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      await updateProduct(productId, {
        name,
        shortDescription: shortDesc,
        longDescription: longDesc,
        images: [imageUrl],
        room: rooms,
        style: styles,
        sizes,
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
        err instanceof Error ? err.message : "Failed to update product",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[450px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-accent animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-8 text-center text-brand-muted">
        <p>Product not found.</p>
        <Link
          href="/admin/products"
          className="text-xs text-brand-accent mt-2 inline-block"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

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
              Edit Artwork Design: {name}
            </h1>
            <p className="text-xs text-brand-muted">SKU: {product.sku}</p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-accent hover:bg-brand-accent-hover text-brand-bg font-semibold text-xs sm:text-sm transition-colors shadow-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSubmitting ? "Saving..." : "Update Design"}</span>
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
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-text">
              Design Identity
            </h2>

            <div>
              <label className="block text-xs font-medium text-brand-muted uppercase tracking-wider mb-1.5">
                Artwork Title
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input text-base font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-brand-muted uppercase tracking-wider mb-1.5">
                Short Caption
              </label>
              <input
                type="text"
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                className="form-input"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-brand-muted uppercase tracking-wider mb-1.5">
                Full Description
              </label>
              <textarea
                rows={4}
                value={longDesc}
                onChange={(e) => setLongDesc(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          {/* Size & Frame Matrix */}
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-text">
                  Size & Frame Matrix
                </h2>
                <p className="text-xs text-brand-muted">
                  Update base prices; frame cost recalculates automatically
                </p>
              </div>

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

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-brand-border text-brand-muted">
                    <th className="py-2 px-2">Size</th>
                    <th className="py-2 px-2">Base Art (Rs.)</th>
                    <th className="py-2 px-2">Frame Cost</th>
                    <th className="py-2 px-2 text-right">With Frame Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/40">
                  {sizes.map((s, idx) => {
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

          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
            <CloudinaryImageUploader
              value={imageUrl}
              onChange={setImageUrl}
              label="Artwork Photography"
              description="High-resolution image hosted on Cloudinary CDN with tactile ElevenLabs grain."
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
              Visibility
            </h2>
            <div>
              <select
                value={visibility}
                onChange={(e) =>
                  setVisibility(e.target.value as VisibilityStatus)
                }
                className="form-input"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="space-y-2 pt-2 border-t border-brand-border">
              <label className="flex items-center gap-2 text-xs text-brand-text">
                <input
                  type="checkbox"
                  checked={isBestseller}
                  onChange={(e) => setIsBestseller(e.target.checked)}
                  className="rounded text-brand-accent"
                />
                <span>Bestseller Badge</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-brand-text">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded text-brand-accent"
                />
                <span>Pin to Homepage</span>
              </label>
            </div>
          </div>

          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
              Stock & Production
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
                <option value="made_to_order">Made-to-Order</option>
                <option value="ready_stock">Ready Stock</option>
              </select>
            </div>

            {stockType === "ready_stock" && (
              <div>
                <label className="block text-xs font-medium text-brand-text mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="form-input"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-brand-text mb-1">
                Lead Time (Days)
              </label>
              <input
                type="number"
                value={leadTime}
                onChange={(e) => setLeadTime(Number(e.target.value))}
                className="form-input"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
