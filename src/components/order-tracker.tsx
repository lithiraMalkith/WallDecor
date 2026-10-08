"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Check,
  Truck,
  Search,
  AlertCircle,
  Clock,
  PackageCheck,
  Copy,
  ExternalLink,
  MessageCircle,
  Sparkles,
  MapPin,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { formatPrice } from "@/lib/products";
import type { Order } from "@/types";

const STAGES = [
  {
    key: "pending",
    label: "Order Recorded",
    desc: "Order confirmed in workshop queue. Wood stretchers & plaster batch prepared.",
  },
  {
    key: "confirmed",
    label: "Verified by Studio",
    desc: "Studio team verified dimensions, frame finish & COD delivery terms with collector.",
  },
  {
    key: "processing",
    label: "Artisan Sculpting",
    desc: "Dimensional mineral plaster layered by hand with palette knives. UV protective satin seal applied.",
  },
  {
    key: "dispatched",
    label: "Dispatched with Courier",
    desc: "Artwork securely boxed in protective wooden cradles and handed over to courier.",
  },
  {
    key: "delivered",
    label: "Delivered to Space",
    desc: "Handed over to collector with white-glove Cash on Delivery (COD).",
  },
];

const SAMPLE_ORDERS = [
  { ref: "CWD-000105", status: "Dispatched · Domex Courier" },
  { ref: "CWD-000108", status: "In Workshop Sculpting" },
  { ref: "CWD-000102", status: "Delivered · Kandy" },
  { ref: "CWD-000101", status: "Order Received" },
];

function getStageIndex(status: string): number {
  switch (status) {
    case "pending":
      return 0;
    case "confirmed":
      return 1;
    case "processing":
    case "ready_for_dispatch":
      return 2;
    case "dispatched":
      return 3;
    case "delivered":
    case "completed":
      return 4;
    default:
      return 0;
  }
}

function getStatusBadgeConfig(status: string) {
  switch (status) {
    case "delivered":
    case "completed":
      return {
        label: "Delivered",
        color: "bg-emerald-500",
        pillClass: "border-black bg-black text-white",
      };
    case "dispatched":
      return {
        label: "En Route · Dispatched",
        color: "bg-[#BA8E23]",
        pillClass: "border-[#BA8E23] bg-[#BA8E23] text-black font-medium",
      };
    case "processing":
    case "ready_for_dispatch":
      return {
        label: "In Studio Sculpting",
        color: "bg-[#BA8E23]",
        pillClass: "border-[#EBE8E4] bg-[#FFFFFF] text-[#000000]",
      };
    case "confirmed":
      return {
        label: "Verified by Workshop",
        color: "bg-[#BA8E23]",
        pillClass: "border-[#EBE8E4] bg-[#FFFFFF] text-[#000000]",
      };
    default:
      return {
        label: "Order Recorded",
        color: "bg-[#777169]",
        pillClass: "border-[#EBE8E4] bg-[#F5F3F1] text-[#777169]",
      };
  }
}

function TrackerContent() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get("ref") || "";
  const initialPhone = searchParams.get("phone") || "";

  const [orderRef, setOrderRef] = useState(initialRef);
  const [phone, setPhone] = useState(initialPhone);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [copiedTracking, setCopiedTracking] = useState(false);

  const searchOrder = async (queryRef: string, queryPhone: string) => {
    if (!queryRef.trim() && !queryPhone.trim()) return;
    setLoading(true);
    setErrorMsg("");
    setSearched(true);

    try {
      const q = queryRef.trim() || queryPhone.trim();
      const res = await fetch(`/api/orders?search=${encodeURIComponent(q)}`);
      const data = await res.json();

      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        const matched =
          data.data.find(
            (o: Order) =>
              o.orderRef.toLowerCase() === queryRef.trim().toLowerCase() ||
              (queryPhone && o.customer.phone.includes(queryPhone.trim()))
          ) || data.data[0];

        setOrder(matched);
      } else {
        setOrder(null);
        setErrorMsg(
          `No order found matching "${q}". Please double-check your order reference (e.g. CWD-000105) or phone number.`
        );
      }
    } catch {
      setOrder(null);
      setErrorMsg("Unable to connect to the studio workshop radar. Please try again shortly.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialRef || initialPhone) {
      searchOrder(initialRef, initialPhone);
    }
  }, [initialRef, initialPhone]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchOrder(orderRef, phone);
  };

  const handleCopyTracking = (trackNum: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(trackNum);
      setCopiedTracking(true);
      setTimeout(() => setCopiedTracking(false), 2000);
    }
  };

  const activeIndex = order ? getStageIndex(order.status) : -1;
  const statusCfg = order ? getStatusBadgeConfig(order.status) : null;

  return (
    <div className="mx-auto max-w-5xl text-[#000000] space-y-10">
      {/* 1. ElevenLabs-Style Search Radar Card */}
      <div className="bg-[#FFFFFF] border border-[#EBE8E4] p-6 sm:p-8 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="max-w-2xl">
          <p className="eyebrow text-[#777169]">Workshop Radar</p>
          <h2 className="text-2xl sm:text-3xl font-light text-[#000000] tracking-[-0.03em] mt-2">
            Track Handcrafted Order
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#59544F] font-normal leading-relaxed">
            Enter your order reference code or phone number to inspect the real-time carving,
            plaster curing, and courier dispatch timeline.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-[11px] uppercase tracking-[0.05em] text-[#777169] mb-1.5">
                Order Reference
              </label>
              <input
                value={orderRef}
                onChange={(e) => setOrderRef(e.target.value)}
                className="input text-xs font-mono rounded-xl border-[#EBE8E4] focus:border-black"
                placeholder="e.g. CWD-000105"
              />
            </div>

            <div>
              <label className="block font-mono text-[11px] uppercase tracking-[0.05em] text-[#777169] mb-1.5">
                Collector Phone Number
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input text-xs font-mono rounded-xl border-[#EBE8E4] focus:border-black"
                placeholder="07XXXXXXXX"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <button
              type="submit"
              disabled={loading || (!orderRef && !phone)}
              className="pill-btn pill-btn-active text-xs py-2.5 px-6 justify-center disabled:opacity-50 transition-all"
            >
              <Search size={14} />
              <span>{loading ? "Scanning Workshop Records..." : "Inspect Live Status"}</span>
            </button>

            {/* Quick Demo Order Chips */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] uppercase text-[#777169] tracking-wider">
                Quick Samples:
              </span>
              {SAMPLE_ORDERS.map((sample) => (
                <button
                  key={sample.ref}
                  type="button"
                  onClick={() => {
                    setOrderRef(sample.ref);
                    setPhone("");
                    searchOrder(sample.ref, "");
                  }}
                  className="pill-btn text-[10px] font-mono py-0.5 px-2.5 bg-[#FFFFFF] border-[#EBE8E4] hover:border-black transition-all"
                  title={sample.status}
                >
                  {sample.ref}
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>

      {/* Error / Not Found Alert */}
      {searched && errorMsg && (
        <div className="p-4 sm:p-5 rounded-2xl border border-[#000000] bg-[#F5F3F1] text-xs text-[#000000] flex items-start gap-3">
          <AlertCircle size={18} className="text-[#BA8E23] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-medium">{errorMsg}</p>
            <p className="text-[#59544F]">
              Need help finding your order? Check your WhatsApp confirmation or WhatsApp our concierge at{" "}
              <a
                href="https://wa.me/94782518184"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-black font-mono font-medium"
              >
                +94 78 251 8184
              </a>
              .
            </p>
          </div>
        </div>
      )}

      {/* 2. Tracking Result Bento Dashboard */}
      {order && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Header Banner */}
          <div className="bg-[#FFFFFF] border border-[#EBE8E4] rounded-2xl p-6 sm:p-8 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-mono text-xl sm:text-2xl font-light text-[#000000] tracking-tight">
                  {order.orderRef}
                </span>
                {statusCfg && (
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border ${statusCfg.pillClass}`}
                  >
                    <span className={`size-2 rounded-full ${statusCfg.color} animate-pulse`} />
                    {statusCfg.label}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#777169] mt-2 font-mono">
                Placed on{" "}
                <span className="text-[#000000]">
                  {new Date(order.createdAt).toLocaleDateString("en-LK", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>{" "}
                · Payment Method:{" "}
                <span className="text-[#000000] font-medium">Cash on Delivery (COD)</span>
              </p>
            </div>

            <div className="text-left md:text-right border-t md:border-t-0 pt-4 md:pt-0 border-[#EBE8E4]">
              <span className="font-mono text-[10px] uppercase text-[#777169] tracking-wider block">
                Total Due Upon Delivery
              </span>
              <p className="font-mono text-2xl sm:text-3xl font-light text-[#000000] tracking-tight mt-0.5">
                {formatPrice(order.total)}
              </p>
            </div>
          </div>

          {/* Asymmetric Bento Grid: Left (Timeline 7 cols) & Right (Specs 5 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Workshop Crafting Timeline (7 Columns) */}
            <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#EBE8E4] rounded-2xl p-6 sm:p-8 shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-6">
              <div>
                <p className="eyebrow text-[#777169]">Provenance Timeline</p>
                <h3 className="text-lg sm:text-xl font-light tracking-[-0.02em] text-[#000000] mt-1">
                  Handcrafting &amp; Dispatch Milestones
                </h3>
              </div>

              {/* Step Sequence */}
              <div className="relative pt-2 space-y-8">
                {STAGES.map((stage, i) => {
                  const isPastOrCurrent = i <= activeIndex;
                  const isCurrent = i === activeIndex;

                  // Find stage timestamp from history if available
                  const historyEntry = order.statusHistory?.find(
                    (h) => h.status === stage.key
                  );

                  return (
                    <div key={stage.key} className="flex gap-4 items-start relative">
                      {/* Vertical Connecting Line */}
                      {i < STAGES.length - 1 && (
                        <div
                          className={`absolute left-3.5 top-8 w-[1px] h-[calc(100%+8px)] transition-colors ${
                            i < activeIndex ? "bg-[#BA8E23]" : "bg-[#EBE8E4]"
                          }`}
                        />
                      )}

                      {/* Step Indicator Badge */}
                      <div
                        className={`grid size-7 rounded-full shrink-0 place-items-center text-xs font-mono transition-all z-10 ${
                          isCurrent
                            ? "bg-[#000000] text-white border-2 border-black ring-4 ring-black/10"
                            : isPastOrCurrent
                            ? "bg-[#BA8E23] text-black border border-[#BA8E23]"
                            : "bg-[#F5F3F1] text-[#777169] border border-[#EBE8E4]"
                        }`}
                      >
                        {isPastOrCurrent && !isCurrent ? (
                          <Check size={13} strokeWidth={2.5} />
                        ) : (
                          <span>{i + 1}</span>
                        )}
                      </div>

                      {/* Stage Information */}
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-baseline justify-between gap-2 flex-wrap">
                          <p
                            className={`text-sm tracking-tight ${
                              isCurrent
                                ? "font-medium text-[#000000]"
                                : isPastOrCurrent
                                ? "font-normal text-[#000000]"
                                : "font-normal text-[#777169]"
                            }`}
                          >
                            {stage.label}
                          </p>
                          {historyEntry && (
                            <span className="font-mono text-[10px] text-[#777169]">
                              {new Date(historyEntry.timestamp).toLocaleDateString("en-LK", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-[#59544F] mt-1 leading-relaxed font-normal">
                          {stage.desc}
                        </p>

                        {/* Artisan Note Callout */}
                        {historyEntry?.note && (
                          <div className="mt-2.5 p-2.5 rounded-xl bg-[#F5F3F1] border border-[#EBE8E4] text-[11px] text-[#000000] font-mono flex items-center gap-2">
                            <span className="text-[#BA8E23]">✦</span>
                            <span>{historyEntry.note}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Crafting Guarantee Footnote */}
              <div className="pt-4 border-t border-[#EBE8E4] flex items-center gap-2 text-xs text-[#777169]">
                <ShieldCheck size={14} className="text-[#BA8E23] shrink-0" />
                <span>
                  Every artwork undergoes 48-hour moisture curing and kiln-dried timber check before dispatch.
                </span>
              </div>
            </div>

            {/* Right Column: Order Blueprint & Logistics Specs (5 Columns) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Card 1: Artwork Items Blueprint */}
              <div className="bg-[#FFFFFF] border border-[#EBE8E4] rounded-2xl p-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-4">
                <div className="border-b border-[#EBE8E4] pb-3 flex items-center justify-between">
                  <p className="eyebrow text-[#777169]">Artworks in Order</p>
                  <span className="font-mono text-[11px] text-[#777169]">
                    {order.items.length} piece{order.items.length > 1 ? "s" : ""}
                  </span>
                </div>

                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 rounded-xl border border-[#EBE8E4] bg-[#FDFCFC]"
                    >
                      <div className="relative size-14 rounded-lg overflow-hidden bg-[#F5F3F1] border border-[#EBE8E4] shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.productName}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="size-full grid place-items-center text-xs font-mono">
                            CWD
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/product/${item.productSlug}`}
                          className="text-xs font-medium text-[#000000] hover:text-[#BA8E23] transition-colors truncate block"
                        >
                          {item.productName}
                        </Link>
                        <p className="text-[11px] font-mono text-[#777169] truncate mt-0.5">
                          {item.sizeLabel} · {item.withFrame ? "Floating Frame" : "Raw Canvas Edge"}
                        </p>
                        <p className="text-[11px] font-mono text-[#000000] mt-0.5">
                          Qty: {item.qty} · {formatPrice(item.totalPrice)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 2: Courier Logistics Information */}
              {order.trackingNumber && (
                <div className="bg-[#FFFFFF] border border-[#EBE8E4] rounded-2xl p-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-3">
                  <p className="eyebrow text-[#777169]">Courier Dispatch</p>
                  <div className="p-3.5 rounded-xl bg-[#F5F3F1] border border-[#EBE8E4] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-[#000000] font-medium">
                        <Truck size={14} className="text-[#BA8E23]" />
                        {order.courierName || "Express Courier"}
                      </span>
                      <span className="pill-btn text-[10px] py-0.5 px-2 bg-white">
                        Island-wide COD
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="font-mono text-xs font-semibold text-[#000000]">
                        {order.trackingNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyTracking(order.trackingNumber!)}
                        className="pill-btn text-[10px] py-0.5 px-2 bg-white flex items-center gap-1 hover:border-black transition-colors"
                      >
                        {copiedTracking ? (
                          <>
                            <Check size={11} className="text-emerald-600" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={11} />
                            <span>Copy Ref</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Card 3: Delivery Destination & Financials */}
              <div className="bg-[#FFFFFF] border border-[#EBE8E4] rounded-2xl p-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-4 text-xs">
                <div className="border-b border-[#EBE8E4] pb-3">
                  <p className="eyebrow text-[#777169]">Delivery Destination</p>
                  <p className="text-xs font-medium text-[#000000] mt-1">
                    {order.customer.name}
                  </p>
                  <p className="text-[11px] text-[#59544F] mt-0.5 font-normal">
                    {order.deliveryAddress.address}, {order.deliveryAddress.city},{" "}
                    {order.deliveryAddress.district}
                  </p>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between text-[#59544F]">
                    <span>Artwork Subtotal:</span>
                    <span className="font-mono text-[#000000]">{formatPrice(order.subtotal)}</span>
                  </div>
                  {order.frameCost > 0 && (
                    <div className="flex justify-between text-[#59544F]">
                      <span>Floating Frame Addition:</span>
                      <span className="font-mono text-[#000000]">{formatPrice(order.frameCost)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#59544F]">
                    <span>Courier Delivery (COD):</span>
                    <span className="font-mono text-[#000000]">
                      {order.deliveryFee === 0 ? "Free Island-Wide" : formatPrice(order.deliveryFee)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-[#EBE8E4] flex justify-between font-mono text-xs text-[#000000] font-medium">
                    <span>Cash on Delivery Due:</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                </div>

                {/* Direct WhatsApp Concierge */}
                <div className="pt-2">
                  <a
                    href={`https://wa.me/94782518184?text=${encodeURIComponent(
                      `Hello Ceylon Wall Decor! I am tracking my order ${order.orderRef}. Could you provide an update on its delivery?`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pill-btn w-full justify-center text-xs gap-1.5 hover:border-black transition-all"
                  >
                    <MessageCircle size={13} className="text-[#25D366]" />
                    <span>Inquire via WhatsApp Studio</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function OrderTracker() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-xs text-[#777169] font-mono">
          Scanning workshop records...
        </div>
      }
    >
      <TrackerContent />
    </Suspense>
  );
}
