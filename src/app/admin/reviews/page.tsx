"use client";

import React, { useEffect, useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap-config";
import {
  Star,
  CheckCircle2,
  XCircle,
  Trash2,
  Sparkles,
  ShieldCheck,
  Loader2,
  Plus,
  X,
} from "lucide-react";
import {
  fetchReviews,
  updateReview,
  createReview,
  deleteReview,
} from "@/lib/admin-client";
import { formatDateTime } from "@/lib/utils";
import type { Review } from "@/types";

export default function AdminReviewsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    customerName: "",
    rating: 5,
    comment: "",
    productName: "",
    isVerifiedPurchase: true,
    isFeaturedHomepage: true,
    photoUrl: "",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchReviews();
      setReviews(data);
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useGSAP(
    () => {
      if (!loading) {
        gsap.from(".review-card", {
          opacity: 0,
          y: 15,
          stagger: 0.05,
          duration: 0.4,
          ease: "power2.out",
        });
      }
    },
    { scope: containerRef, dependencies: [loading, statusFilter] },
  );

  const handleApprove = async (id: string) => {
    try {
      const updated = await updateReview(id, { status: "approved" });
      setReviews((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch {
      alert("Failed to approve review");
    }
  };

  const handleReject = async (id: string) => {
    try {
      const updated = await updateReview(id, {
        status: "rejected",
        isFeaturedHomepage: false,
      });
      setReviews((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch {
      alert("Failed to reject review");
    }
  };

  const handleToggleFeature = async (id: string, current: boolean) => {
    try {
      const updated = await updateReview(id, {
        isFeaturedHomepage: !current,
        status: "approved",
      });
      setReviews((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch {
      alert("Failed to update featured flag");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      await deleteReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch {
      alert("Failed to delete review");
    }
  };

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName.trim() || !formData.comment.trim()) {
      alert("Please fill in customer name and comment.");
      return;
    }

    setSubmitting(true);
    try {
      const newRev = await createReview({
        customerName: formData.customerName.trim(),
        rating: Number(formData.rating),
        comment: formData.comment.trim(),
        productName: formData.productName.trim() || undefined,
        photoUrls: formData.photoUrl.trim() ? [formData.photoUrl.trim()] : [],
        isVerifiedPurchase: formData.isVerifiedPurchase,
        isFeaturedHomepage: formData.isFeaturedHomepage,
        status: "approved",
      });

      setReviews((prev) => [newRev, ...prev]);
      setIsAddModalOpen(false);
      setFormData({
        customerName: "",
        rating: 5,
        comment: "",
        productName: "",
        isVerifiedPurchase: true,
        isFeaturedHomepage: true,
        photoUrl: "",
      });
    } catch (err) {
      console.error("Create review error:", err);
      alert("Failed to create review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = reviews.filter(
    (r) => statusFilter === "all" || r.status === statusFilter,
  );

  if (loading) {
    return (
      <div className="min-h-[450px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-accent animate-spin" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="max-w-5xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-brand-text font-serif">
            Customer Reviews & Social Proof
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-1">
            Moderate testimonials, customer wall photos, and pin top ratings to
            storefront
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-accent text-white hover:opacity-90 transition-opacity shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Testimonial</span>
          </button>

          <div className="flex items-center gap-1 border border-brand-border rounded-lg p-0.5 bg-brand-surface">
            {["all", "approved", "pending", "rejected"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-colors ${
                  statusFilter === st
                    ? "bg-brand-accent text-brand-bg shadow-sm"
                    : "text-brand-muted hover:text-brand-text"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Add Testimonial Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-[#FFFFFF] text-black w-full max-w-lg rounded-2xl shadow-2xl border border-brand-border p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-brand-border/40 pb-3">
              <div>
                <h3 className="font-bold text-lg text-brand-text font-serif">
                  Add Collector Voice / Feedback
                </h3>
                <p className="text-xs text-brand-muted">
                  Adds feedback directly to the live Firestore database
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg hover:bg-black/5 text-brand-muted hover:text-black transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReview} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-brand-text mb-1">
                  Customer / Collector Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nadeesha S., Colombo 07"
                  value={formData.customerName}
                  onChange={(e) =>
                    setFormData({ ...formData, customerName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-brand-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-accent text-brand-text bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-brand-text mb-1">
                    Rating (Stars)
                  </label>
                  <select
                    value={formData.rating}
                    onChange={(e) =>
                      setFormData({ ...formData, rating: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-brand-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-accent text-brand-text bg-white"
                  >
                    <option value={5}>5 Stars ★★★★★</option>
                    <option value={4}>4 Stars ★★★★☆</option>
                    <option value={3}>3 Stars ★★★☆☆</option>
                    <option value={2}>2 Stars ★★☆☆☆</option>
                    <option value={1}>1 Star ★☆☆☆☆</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-brand-text mb-1">
                    Product / Design Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Quiet Contour"
                    value={formData.productName}
                    onChange={(e) =>
                      setFormData({ ...formData, productName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-brand-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-accent text-brand-text bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-brand-text mb-1">
                  Customer Testimonial Quote *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="e.g. It catches the light differently all day. The natural morning light reveals subtle knife ridges that change by sunset."
                  value={formData.comment}
                  onChange={(e) =>
                    setFormData({ ...formData, comment: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-brand-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-accent text-brand-text bg-white resize-none"
                />
              </div>

              <div>
                <label className="block font-medium text-brand-text mb-1">
                  Customer Wall Photo URL (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cloudinary or public image URL"
                  value={formData.photoUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, photoUrl: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-brand-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-accent text-brand-text bg-white"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-brand-text">
                  <input
                    type="checkbox"
                    checked={formData.isFeaturedHomepage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isFeaturedHomepage: e.target.checked,
                      })
                    }
                    className="rounded text-brand-accent focus:ring-brand-accent"
                  />
                  <span>Feature on Homepage Collector Voice</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium text-brand-text">
                  <input
                    type="checkbox"
                    checked={formData.isVerifiedPurchase}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isVerifiedPurchase: e.target.checked,
                      })
                    }
                    className="rounded text-brand-accent focus:ring-brand-accent"
                  />
                  <span>Verified Purchase</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-border/40">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-brand-border rounded-lg hover:bg-black/5 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-brand-accent text-white font-semibold rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Testimonial</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((rev) => (
          <div
            key={rev.id}
            className="review-card bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-xl card-hover flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              {/* Top Row: Stars & Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-brand-accent">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < rev.rating ? "fill-current text-brand-accent" : "text-brand-border"
                      }`}
                    />
                  ))}
                </div>

                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    rev.status === "approved"
                      ? "bg-brand-accent/10 text-brand-accent border border-brand-accent/30"
                      : rev.status === "pending"
                        ? "bg-black/5 text-brand-text border-black/10"
                        : "bg-black/10 text-brand-text border-black/20"
                  }`}
                >
                  {rev.status}
                </span>
              </div>

              {/* Customer Quote */}
              <p className="text-sm text-brand-text italic leading-relaxed">
                "{rev.comment}"
              </p>

              {/* Customer Photo on their wall */}
              {rev.photoUrls && rev.photoUrls.length > 0 && (
                <div className="rounded-xl overflow-hidden h-36 bg-brand-bg border border-brand-border">
                  <img
                    src={rev.photoUrls[0]}
                    alt="Customer artwork on wall"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://res.cloudinary.com/dtxw88le2/image/upload/e_noise:20,q_auto,f_auto/v1791451908/ceylon-wall-decor/products/hero.jpg";
                    }}
                  />
                </div>
              )}

              {/* Customer Meta */}
              <div className="pt-2 text-xs text-brand-muted space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-brand-text">
                    {rev.customerName}
                  </span>
                  {rev.isVerifiedPurchase && (
                    <span className="flex items-center gap-1 text-[10px] text-brand-accent font-medium">
                      <ShieldCheck className="w-3 h-3" /> Verified Collector
                    </span>
                  )}
                </div>
                {rev.productName && <p>Design: {rev.productName}</p>}
                <p className="text-[11px] text-brand-muted/70">
                  {formatDateTime(rev.createdAt)}
                </p>
              </div>
            </div>

            {/* Moderation Actions */}
            <div className="pt-4 border-t border-brand-border flex items-center justify-between gap-2">
              <button
                onClick={() =>
                  handleToggleFeature(rev.id, rev.isFeaturedHomepage)
                }
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  rev.isFeaturedHomepage
                    ? "bg-brand-accent text-brand-bg"
                    : "bg-brand-bg hover:bg-brand-surface-hover text-brand-muted hover:text-brand-text border border-brand-border"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {rev.isFeaturedHomepage
                    ? "Featured on Home"
                    : "Feature on Home"}
                </span>
              </button>

              <div className="flex items-center gap-1.5">
                {rev.status !== "approved" && (
                  <button
                    onClick={() => handleApprove(rev.id)}
                    className="p-2 rounded-lg bg-brand-accent/10 hover:bg-brand-accent/20 text-brand-accent border border-brand-accent/30 transition-colors"
                    title="Approve Review"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}

                {rev.status !== "rejected" && (
                  <button
                    onClick={() => handleReject(rev.id)}
                    className="p-2 rounded-lg bg-black/5 hover:bg-black/10 text-brand-text border border-black/15 transition-colors"
                    title="Reject Review"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => handleDelete(rev.id)}
                  className="p-2 rounded-lg text-black/40 hover:text-red-600 hover:bg-red-50 border border-brand-border transition-colors"
                  title="Delete Review"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
