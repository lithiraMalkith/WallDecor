"use client";

import React, { useEffect, useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap-config";
import {
  Tag,
  Plus,
  Trash2,
  CheckCircle2,
  Calendar,
  Percent,
  DollarSign,
  Truck,
  Loader2,
  X,
} from "lucide-react";
import {
  fetchPromotions,
  createPromotion,
  deletePromotion,
} from "@/lib/admin-client";
import { formatPrice } from "@/lib/utils";
import type { Promotion, DiscountType } from "@/types";

export default function AdminPromotionsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [code, setCode] = useState("");
  const [type, setType] = useState<DiscountType>("percentage");
  const [value, setValue] = useState<number>(10);
  const [minOrder, setMinOrder] = useState<number>(5000);
  const [maxDiscount, setMaxDiscount] = useState<number>(2000);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchPromotions();
      setPromotions(data);
    } catch (err) {
      console.error("Failed to load promotions:", err);
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
        gsap.from(".promo-card", {
          opacity: 0,
          y: 15,
          stagger: 0.05,
          duration: 0.4,
          ease: "power2.out",
        });
      }
    },
    { scope: containerRef, dependencies: [loading] },
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setIsSubmitting(true);
    try {
      const created = await createPromotion({
        code: code.toUpperCase().trim(),
        type,
        value,
        minOrderValue: minOrder,
        maxDiscount: type === "percentage" ? maxDiscount : undefined,
        startDate: new Date().toISOString().slice(0, 10),
        isActive: true,
      });
      setPromotions((prev) => [created, ...prev]);
      setModalOpen(false);
      setCode("");
    } catch {
      alert("Failed to create promotion");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this coupon code?")) return;
    try {
      await deletePromotion(id);
      setPromotions((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert("Failed to delete promotion");
    }
  };

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
            Promotions & Discount Codes
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-1">
            Create coupon offers for TikTok campaigns, influencer collabs &
            seasonal sales
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-accent hover:bg-brand-accent-hover text-brand-bg font-semibold text-xs sm:text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon Code</span>
        </button>
      </div>

      {/* Grid of Promotions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {promotions.map((promo) => (
          <div
            key={promo.id}
            className="promo-card bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-xl card-hover flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-base font-bold text-brand-accent bg-brand-bg px-2.5 py-1 rounded-lg border border-brand-border">
                  {promo.code}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    promo.isActive
                      ? "bg-brand-accent/10 text-brand-accent border border-brand-accent/30"
                      : "bg-black/5 text-brand-muted border border-black/10"
                  }`}
                >
                  {promo.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div>
                <p className="text-lg font-bold text-brand-text">
                  {promo.type === "percentage"
                    ? `${promo.value}% Off Entire Order`
                    : promo.type === "fixed"
                      ? `Rs. ${promo.value.toLocaleString("en-LK")} Off`
                      : "100% Free Island-wide Delivery"}
                </p>
                {promo.minOrderValue && (
                  <p className="text-xs text-brand-muted mt-0.5">
                    Min order: {formatPrice(promo.minOrderValue)}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-brand-border text-xs text-brand-muted space-y-1">
                <p>
                  Redemptions:{" "}
                  <span className="text-brand-text font-semibold">
                    {promo.usedCount || 0} times
                  </span>
                </p>
                <p className="flex items-center gap-1 text-[11px]">
                  <Calendar className="w-3 h-3 text-brand-muted" /> Started{" "}
                  {promo.startDate}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-brand-border flex items-center justify-end">
              <button
                onClick={() => handleDelete(promo.id)}
                className="text-brand-muted hover:text-brand-danger p-1 transition-colors"
                title="Delete Promotion"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <h3 className="text-base font-bold text-brand-text">
                Create Discount Code
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-brand-muted hover:text-brand-text"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-brand-muted uppercase tracking-wider mb-1.5">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  placeholder="e.g. TIKTOK15 / NEWYEAR"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="form-input font-mono font-bold uppercase"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-brand-muted uppercase tracking-wider mb-1.5">
                  Discount Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as DiscountType)}
                  className="form-input"
                >
                  <option value="percentage">Percentage (%) Off</option>
                  <option value="fixed">Fixed Amount (Rs.) Off</option>
                  <option value="free_delivery">
                    Free Delivery (100% Shipping Off)
                  </option>
                </select>
              </div>

              {type !== "free_delivery" && (
                <div>
                  <label className="block text-xs font-medium text-brand-muted uppercase tracking-wider mb-1.5">
                    {type === "percentage"
                      ? "Percentage (e.g. 10%)"
                      : "Fixed Rupee Amount (LKR)"}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="form-input"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-brand-muted uppercase tracking-wider mb-1.5">
                  Minimum Order Value (LKR)
                </label>
                <input
                  type="number"
                  min={0}
                  step={500}
                  value={minOrder}
                  onChange={(e) => setMinOrder(Number(e.target.value))}
                  className="form-input"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2 px-3 rounded-lg border border-brand-border text-xs font-semibold text-brand-text hover:bg-brand-surface-hover"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 px-3 rounded-lg bg-brand-accent hover:bg-brand-accent-hover text-brand-bg text-xs font-semibold"
                >
                  {isSubmitting ? "Creating..." : "Activate Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
