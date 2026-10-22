"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { Star, Check, MessageSquare, ChevronDown } from "lucide-react";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/products";
import { useCart } from "./cart-context";
import { useCustomerAuth } from "@/contexts/customer-auth-context";
import type { Review } from "@/types";

export function ProductDetail({ product }: { product: Product }) {
  if (!product.sizes?.length) return <section className="container-x py-24"><h1 className="text-3xl">{product.name}</h1><p className="mt-4">Ordering is currently unavailable for this artwork.</p><Link href="/shop" className="btn btn-accent mt-6">Browse the collection</Link></section>;
  return <LoadedProductDetail key={product.id} product={product} />;
}

function LoadedProductDetail({ product }: { product: Product }) {
  const images = product.images && product.images.length > 0 ? product.images : [product.image];
  const [selectedImage, setSelectedImage] = useState(images[0]);

  // Only offer the variants and prices saved in Firestore.
  const availableSizes = useMemo(() => {
    if (product.sizes && product.sizes.length > 0) {
      return product.sizes.map((s) => ({
        label: `${s.label} in`,
        priceWithout: s.priceWithoutFrame,
        priceWith: s.priceWithFrame,
      }));
    }
    return [];
  }, [product.sizes]);

  const [selectedSize, setSelectedSize] = useState(availableSizes[0]);
  const [framed, setFramed] = useState(false);
  const { add } = useCart();
  const { customer } = useCustomerAuth();

  // Price determination
  const price = useMemo(() => {
    return framed ? selectedSize.priceWith : selectedSize.priceWithout;
  }, [selectedSize, framed]);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [reviewName, setReviewName] = useState("");
  const [reviewPhone, setReviewPhone] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    if (customer) {
      if (!reviewName) setReviewName(customer.name);
      if (!reviewPhone) setReviewPhone(customer.phone);
    }
  }, [customer, reviewName, reviewPhone]);

  useEffect(() => {
    // Fetch reviews for this artwork
    fetch("/api/reviews")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          const matching = data.data.filter(
            (r: Review) =>
              r.status === "approved" &&
              (r.productId === product.id ||
                r.productName?.toLowerCase() === product.name.toLowerCase())
          );
          setReviews(matching);
        }
      })
      .catch((err) => console.error("Reviews load error", err));
  }, [product.id, product.name]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    setReviewSubmitting(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: reviewName || "Verified Collector",
          customerPhone: reviewPhone || "0770000000",
          rating: reviewRating,
          comment: reviewComment,
          productId: product.id,
          productName: product.name,
          isVerifiedPurchase: true,
          status: "approved", // auto-publish for smooth storefront preview
        }),
      });

      const data = await res.json();
      if (data.success) {
        setReviews([data.data, ...reviews]);
        setReviewComment("");
        setReviewSuccess(true);
        setTimeout(() => {
          setReviewSuccess(false);
          setReviewFormOpen(false);
        }, 2000);
      }
    } catch (e) {
      console.error("Failed to post review", e);
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="container-x py-12">
      <div className="grid gap-12 lg:grid-cols-[1.1fr_.9fr]">
        {/* Left: Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-[4/5] bg-[#F5F3F1] border border-[#EBE8E4] rounded-2xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.02)] elevenlabs-grain">
            <Image
              src={selectedImage}
              alt={product.name}
              fill
              priority
              className="object-cover transition-all duration-300"
            />
          </div>

          {/* Multiple Image Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`relative size-20 shrink-0 rounded-xl border overflow-hidden transition-all ${
                    selectedImage === img
                      ? "border-[#000000] ring-1 ring-[#000000]"
                      : "border-[#EBE8E4] opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Specifications & Purchasing Controls */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="flex items-center gap-2">
            <p className="eyebrow text-[#777169]">
              {product.style} · {product.room}
            </p>
            {product.sku && (
              <span className="text-[10px] text-[#777169] font-mono border-l border-[#EBE8E4] pl-2">
                {product.sku}
              </span>
            )}
          </div>

          <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-light text-[#000000] tracking-[-0.03em] leading-[1.05]">
            {product.name}
          </h1>

          <p className="mt-4 text-sm sm:text-[15px] text-[#59544F] leading-relaxed font-normal">
            {product.longDescription || product.description}
          </p>

          <p className="mt-6 text-3xl font-light text-[#000000] tracking-[-0.02em]">
            {formatPrice(price)}
          </p>

          {/* Size Variant Buttons */}
          <fieldset className="mt-8">
            <legend className="eyebrow mb-3 text-[#777169]">Select dimensions</legend>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableSizes.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => setSelectedSize(s)}
                  className={`py-2 px-3 rounded-full border text-xs font-mono text-center transition-all ${
                    selectedSize.label === s.label
                      ? "border-[#000000] bg-[#000000] text-white shadow-sm"
                      : "border-[#EBE8E4] hover:border-[#000000] text-[#000000] bg-white"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Framing Selector */}
          <fieldset className="mt-6">
            <legend className="eyebrow mb-3 text-[#777169]">Framing finish</legend>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFramed(false)}
                className={`border rounded-xl p-3 text-xs transition-all text-left ${
                  !framed
                    ? "border-[#000000] bg-[#F5F3F1] ring-1 ring-[#000000] text-[#000000]"
                    : "border-[#EBE8E4] hover:border-[#000000] text-[#59544F] bg-white"
                }`}
              >
                <div className="font-medium text-[#000000]">Without Frame</div>
                <div className="text-[11px] text-[#777169] mt-0.5">Raw canvas edges</div>
              </button>
              <button
                type="button"
                onClick={() => setFramed(true)}
                className={`border rounded-xl p-3 text-xs transition-all text-left ${
                  framed
                    ? "border-[#000000] bg-[#F5F3F1] ring-1 ring-[#000000] text-[#000000]"
                    : "border-[#EBE8E4] hover:border-[#000000] text-[#59544F] bg-white"
                }`}
              >
                <div className="font-medium text-[#000000]">With Floating Frame</div>
                <div className="text-[11px] text-[#777169] mt-0.5">
                  +{formatPrice(selectedSize.priceWith - selectedSize.priceWithout)}
                </div>
              </button>
            </div>
          </fieldset>

          {/* Actions */}
          <div className="mt-8 space-y-3">
            <button
              onClick={() =>
                add({
                  product,
                  size: selectedSize.label,
                  framed,
                  qty: 1,
                  unitPrice: price,
                })
              }
              className="btn btn-accent w-full justify-center text-xs font-medium"
            >
              Add to Cart · {formatPrice(price)}
            </button>

            <a
              className="btn btn-outline w-full justify-center text-xs"
              href={`https://wa.me/94782518184?text=${encodeURIComponent(
                `Hi Ceylon Wall Decor, I would like to order "${product.name}" (${selectedSize.label}, ${
                  framed ? "Framed" : "Unframed"
                }) for ${formatPrice(price)}.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Order via WhatsApp
            </a>
          </div>

          {/* Delivery & Material Specs */}
          <div className="mt-8 p-5 rounded-2xl border border-[#EBE8E4] bg-[#F5F3F1] space-y-2 text-xs text-[#59544F]">
            {product.material && (
              <p>
                <b className="text-[#000000] font-medium">Medium:</b> {product.material}
              </p>
            )}
            {product.technique && (
              <p>
                <b className="text-[#000000] font-medium">Technique:</b> {product.technique}
              </p>
            )}
            <p>
              <b className="text-[#000000] font-medium">Crafting Lead Time:</b>{" "}
              {product.leadTimeDays || 5} working days
            </p>
            <p>
              <b className="text-[#000000] font-medium">Delivery:</b> Island-wide Cash on Delivery (COD)
            </p>
            <p className="pt-2 border-t border-[#EBE8E4]">
              Need custom dimensions or palette?{" "}
              <Link href="/custom-order" className="underline text-[#000000] font-medium">
                Request a bespoke piece →
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Reviews & Ratings Section */}
      <section className="mt-20 pt-12 border-t border-[#EBE8E4]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <p className="eyebrow text-[#777169]">Collector Feedback</p>
            <h2 className="text-2xl font-light text-[#000000] mt-1 tracking-[-0.02em]">
              Collector Reviews ({reviews.length})
            </h2>
          </div>

          <button
            onClick={() => setReviewFormOpen(!reviewFormOpen)}
            className="pill-btn text-xs inline-flex items-center gap-2 self-start sm:self-auto"
          >
            <MessageSquare size={14} />
            {reviewFormOpen ? "Close Form" : "Write a Review"}
          </button>
        </div>

        {/* Review Form */}
        {reviewFormOpen && (
          <form
            onSubmit={handleReviewSubmit}
            className="mb-10 p-6 rounded-2xl border border-[#EBE8E4] bg-[#FFFFFF] max-w-xl space-y-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
          >
            <h3 className="text-base font-medium text-[#000000]">
              Share your experience with {product.name}
            </h3>

            {reviewSuccess && (
              <div className="p-3 rounded-xl border border-[var(--store-accent-border)] bg-[#F5F3F1] text-xs text-[#000000] flex items-center gap-2">
                <Check size={14} className="text-[var(--store-accent-ink)]" />
                Thank you! Your review has been submitted.
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-[11px] uppercase tracking-[0.05em] text-[#777169] mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  placeholder="e.g. Priyantha K."
                  className="input text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-[0.05em] text-[#777169] mb-1">Rating</label>
                <div className="flex items-center gap-1 py-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        size={18}
                        className={
                          star <= reviewRating
                            ? "fill-[var(--store-accent-ink)] text-[var(--store-accent-ink)]"
                            : "text-[#EBE8E4]"
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-[0.05em] text-[#777169] mb-1">
                Your Review
              </label>
              <textarea
                required
                rows={3}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="How does the texture, depth, and finish feel in your room?"
                className="input text-xs rounded-xl"
              />
            </div>

            <button
              type="submit"
              disabled={reviewSubmitting}
              className="btn btn-accent text-xs"
            >
              {reviewSubmitting ? "Publishing..." : "Submit Review"}
            </button>
          </form>
        )}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <p className="text-sm text-[#59544F] py-6">
            No reviews yet for this design. Be the first collector to share your thoughts!
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="p-5 rounded-2xl border border-[#EBE8E4] bg-white space-y-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={13}
                        className={
                          s <= r.rating
                            ? "fill-[var(--store-accent-ink)] text-[var(--store-accent-ink)]"
                            : "text-[#EBE8E4]"
                        }
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-[#777169] font-mono">
                    {new Date(r.createdAt).toLocaleDateString("en-LK", {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <p className="text-xs text-[#000000] leading-relaxed">
                  &ldquo;{r.comment}&rdquo;
                </p>
                <p className="text-xs text-[#59544F] font-normal pt-2 border-t border-[#EBE8E4]">
                  — {r.customerName}{" "}
                  {r.isVerifiedPurchase && (
                    <span className="text-[10px] text-[var(--store-accent-ink)]">✓ Verified Buyer</span>
                  )}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
