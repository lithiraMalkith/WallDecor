"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Palette,
  MessageCircle,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  Loader2,
  ExternalLink,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import {
  fetchCustomRequest,
  updateCustomRequest,
  convertCustomRequestToOrder,
} from "@/lib/admin-client";
import { formatPrice, formatDateTime, formatPhone } from "@/lib/utils";
import type { CustomRequest } from "@/types";

export default function CustomRequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const requestId = params.id as string;

  const [request, setRequest] = useState<CustomRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [quotedPrice, setQuotedPrice] = useState<number>(0);
  const [adminNotes, setAdminNotes] = useState("");
  const [status, setStatus] = useState<CustomRequest["status"]>("new");
  const [isSaving, setIsSaving] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [msg, setMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const loadData = async () => {
    try {
      const data = await fetchCustomRequest(requestId);
      setRequest(data);
      setQuotedPrice(data.quotedPrice || 0);
      setAdminNotes(data.adminNotes || "");
      setStatus(data.status);
    } catch {
      setMsg({ type: "error", text: "Failed to load request details" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [requestId]);

  const handleSaveQuote = async () => {
    setIsSaving(true);
    setMsg(null);
    try {
      const updated = await updateCustomRequest(requestId, {
        quotedPrice,
        adminNotes,
        status: quotedPrice > 0 && status === "new" ? "quoted" : status,
      });
      setRequest(updated);
      setStatus(updated.status);
      setMsg({ type: "success", text: "Quote details saved successfully" });
    } catch (err: unknown) {
      setMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to update quote",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleConvertToOrder = async () => {
    if (!quotedPrice || quotedPrice <= 0) {
      setMsg({
        type: "error",
        text: "Please enter a valid quoted price before converting to an order",
      });
      return;
    }

    setIsConverting(true);
    setMsg(null);
    try {
      const newOrder = await convertCustomRequestToOrder(requestId, {
        quotedPrice,
        deliveryFee: 650,
      });
      setMsg({
        type: "success",
        text: `Successfully converted to Order ${newOrder.orderRef}!`,
      });
      setTimeout(() => {
        router.push(`/admin/orders/${newOrder.id}`);
      }, 1200);
    } catch (err: unknown) {
      setMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to convert to order",
      });
      setIsConverting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[450px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-accent animate-spin" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="p-12 text-center text-brand-muted">
        <p>Custom request not found.</p>
        <Link
          href="/admin/custom-requests"
          className="text-xs text-brand-accent mt-2 inline-block"
        >
          Return to Inbox
        </Link>
      </div>
    );
  }

  const formattedWhatsAppPhone = request.customerPhone
    .replace(/\D/g, "")
    .replace(/^0/, "94");
  const whatsappQuoteMsg = `Hello ${request.customerName}! Ceylon Wall Decor has reviewed your custom art request (${request.sizeLabel || "custom size"}). Our quote is ${formatPrice(quotedPrice || 12000)} including hand-sculpted texture plaster and optional framing. Production time is 5-7 days. Would you like us to proceed?`;
  const whatsappUrl = `https://wa.me/${formattedWhatsAppPhone}?text=${encodeURIComponent(whatsappQuoteMsg)}`;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/custom-requests"
            className="p-2 rounded-lg bg-brand-surface border border-brand-border text-brand-muted hover:text-brand-text transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-brand-text font-serif">
              Custom Inquiry: {request.customerName}
            </h1>
            <p className="text-xs text-brand-muted mt-0.5">
              Received {formatDateTime(request.createdAt)} • Status:{" "}
              {request.status}
            </p>
          </div>
        </div>

        {/* Convert to Order CTA */}
        {request.status !== "converted" ? (
          <button
            onClick={handleConvertToOrder}
            disabled={isConverting || isSaving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-accent hover:bg-brand-accent-hover text-brand-bg font-semibold text-xs sm:text-sm transition-colors shadow-sm disabled:opacity-50"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>
              {isConverting
                ? "Converting to Order..."
                : "Convert to Formal Order"}
            </span>
          </button>
        ) : (
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-accent bg-brand-accent/10 border border-brand-accent/20 px-3 py-1.5 rounded-lg">
            <CheckCircle2 className="w-4 h-4" />
            <span>Converted to Formal Order</span>
          </div>
        )}
      </div>

      {msg && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
            msg.type === "success"
              ? "bg-brand-accent/10 border border-brand-accent/30 text-brand-accent"
              : "bg-black/5 border border-black/15 text-brand-text"
          }`}
        >
          {msg.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{msg.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Photo Preview & Specifications */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Upload Photo */}
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 space-y-4 shadow-xl">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-text">
              Customer Reference Photo
            </h2>
            <div className="rounded-xl overflow-hidden bg-brand-bg border border-brand-border max-h-[450px]">
              <img
                src={
                  request.designUploadUrls[0] ||
                  "https://res.cloudinary.com/dtxw88le2/image/upload/e_noise:20,q_auto,f_auto/v1791451908/ceylon-wall-decor/products/hero.jpg"
                }
                alt="Uploaded reference design"
                className="w-full h-full object-contain max-h-[450px]"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://res.cloudinary.com/dtxw88le2/image/upload/e_noise:20,q_auto,f_auto/v1791451908/ceylon-wall-decor/products/hero.jpg";
                }}
              />
            </div>
          </div>

          {/* Customer Design Notes */}
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 space-y-4 shadow-xl">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-text">
              Customer Requirements
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-brand-bg border border-brand-border">
                <span className="text-brand-muted block">
                  Requested Dimensions:
                </span>
                <span className="text-sm font-bold text-brand-accent mt-1 block">
                  {request.sizeLabel ||
                    `${request.sizeWidth || 16}×${request.sizeHeight || 20}`}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-brand-bg border border-brand-border">
                <span className="text-brand-muted block">Framing Style:</span>
                <span className="text-sm font-bold text-brand-text mt-1 block">
                  {request.framePreference || "Unframed Canvas"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-brand-bg border border-brand-border">
                <span className="text-brand-muted block">
                  Estimated Lead Time:
                </span>
                <span className="text-sm font-bold text-brand-text mt-1 block">
                  5 - 7 Days
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-brand-bg border border-brand-border">
              <span className="text-xs font-semibold text-brand-muted uppercase tracking-wider block mb-1">
                Client Notes & Vision:
              </span>
              <p className="text-xs text-brand-text leading-relaxed italic">
                "{request.notes}"
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Quoting & Actions */}
        <div className="space-y-6">
          {/* Quote Entry Card */}
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 space-y-4 shadow-xl">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-text flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-brand-accent" />
              <span>Quote Entry</span>
            </h2>

            <div>
              <label className="block text-xs font-medium text-brand-muted uppercase tracking-wider mb-1.5">
                Quoted Price (LKR) *
              </label>
              <div className="flex items-center">
                <span className="text-xs text-brand-accent font-bold px-3 py-2 bg-brand-bg rounded-l-lg border border-brand-border">
                  Rs.
                </span>
                <input
                  type="number"
                  step={100}
                  value={quotedPrice}
                  onChange={(e) => setQuotedPrice(Number(e.target.value))}
                  placeholder="e.g. 14500"
                  className="form-input rounded-l-none text-base font-bold font-mono"
                />
              </div>
              <p className="text-[11px] text-brand-muted mt-1">
                Recommendation: Material base + (Area × Rs. 6 frame)
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-brand-muted uppercase tracking-wider mb-1.5">
                Inquiry Status
              </label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as CustomRequest["status"])
                }
                className="form-input"
              >
                <option value="new">New Inquiry</option>
                <option value="quoted">Quote Provided</option>
                <option value="approved">Approved by Customer</option>
                <option value="rejected">Declined / Not Possible</option>
                <option value="converted">Converted to Order</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-brand-muted uppercase tracking-wider mb-1.5">
                Internal Studio Notes
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Texture paste mixed with fine marble dust for smooth curves..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="form-input"
              />
            </div>

            <button
              onClick={handleSaveQuote}
              disabled={isSaving}
              className="w-full py-2.5 px-4 rounded-lg bg-brand-accent hover:bg-brand-accent-hover text-brand-bg font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
            >
              {isSaving ? "Saving Quote..." : "Update & Save Quote"}
            </button>
          </div>

          {/* Quick WhatsApp Prefill Link */}
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 space-y-4 shadow-xl">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
              Client Communication
            </h2>

            <div className="text-xs space-y-1">
              <p className="font-bold text-brand-text">
                {request.customerName}
              </p>
              <p className="font-mono text-brand-muted">
                {formatPhone(request.customerPhone)}
              </p>
              {request.customerEmail && (
                <p className="text-brand-muted">{request.customerEmail}</p>
              )}
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-black hover:bg-black/80 text-white font-semibold text-xs transition-colors shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Send Quote on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
