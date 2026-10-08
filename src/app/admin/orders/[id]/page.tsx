"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Printer,
  Phone,
  MessageCircle,
  Truck,
  CheckCircle2,
  Clock,
  Hammer,
  Package,
  DollarSign,
  AlertCircle,
  Send,
  Loader2,
  X,
  FileText,
  User,
  MapPin,
  Calendar,
} from "lucide-react";
import { fetchOrder, updateOrderStatus } from "@/lib/admin-client";
import { formatPrice, formatDateTime, formatPhone } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types";

const STEP_ORDER: {
  key: OrderStatus;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
    {
      key: "pending",
      label: "1. Pending",
      desc: "Order placed via COD",
      icon: Clock,
    },
    {
      key: "confirmed",
      label: "2. Confirmed",
      desc: "Phone / WhatsApp verified",
      icon: Phone,
    },
    {
      key: "processing",
      label: "3. Crafting",
      desc: "Artisan plaster & framing",
      icon: Hammer,
    },
    {
      key: "ready_for_dispatch",
      label: "4. Ready",
      desc: "Quality checked & packed",
      icon: Package,
    },
    {
      key: "dispatched",
      label: "5. Dispatched",
      desc: "Handed to courier partner",
      icon: Truck,
    },
    {
      key: "delivered",
      label: "6. Delivered",
      desc: "Customer received package",
      icon: CheckCircle2,
    },
    {
      key: "completed",
      label: "7. Completed",
      desc: "COD cash reconciled",
      icon: DollarSign,
    },
  ];

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Modals
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [courierName, setCourierName] = useState("Domex Courier");
  const [trackingNumber, setTrackingNumber] = useState("");

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");

  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  const loadData = async () => {
    try {
      const data = await fetchOrder(orderId);
      setOrder(data);
    } catch {
      setErrorMsg("Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [orderId]);

  const handleStatusTransition = async (
    nextStatus: OrderStatus,
    extraPayload = {},
  ) => {
    setIsUpdating(true);
    setErrorMsg("");
    try {
      const updated = await updateOrderStatus(orderId, {
        status: nextStatus,
        ...extraPayload,
      });
      setOrder(updated);
      setDispatchModalOpen(false);
      setCancelModalOpen(false);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Status transition failed",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[450px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-12 text-center text-brand-muted">
        <p>Order not found.</p>
        <Link
          href="/admin/orders"
          className="text-xs text-brand-gold mt-2 inline-block"
        >
          Return to Fulfillment Board
        </Link>
      </div>
    );
  }

  const currentStepIndex = STEP_ORDER.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === "cancelled";
  const isCompleted = order.status === "completed";

  const formattedWhatsAppPhone = order.customer.phone
    .replace(/\D/g, "")
    .replace(/^0/, "94");
  const whatsappUrl = `https://wa.me/${formattedWhatsAppPhone}?text=${encodeURIComponent(
    `Hello ${order.customer.name}! This is Ceylon Wall Decor confirming your order ${order.orderRef} for ${formatPrice(order.total)}. Could you please confirm your delivery address: ${order.deliveryAddress.address}, ${order.deliveryAddress.city}?`,
  )}`;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24">
      {/* Top Navigation & Invoice Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-2 rounded-lg bg-brand-surface border border-brand-border text-brand-muted hover:text-brand-text transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-brand-text font-mono">
                {order.orderRef}
              </h1>
              <span
                className={`status-badge status-${order.status.replace(/_/g, "-")}`}
              >
                {order.status.replace(/_/g, " ")}
              </span>
            </div>
            <p className="text-xs text-brand-muted mt-0.5">
              Placed {formatDateTime(order.createdAt)} • Payment Method: Cash on
              Delivery (COD)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setInvoiceModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-brand-surface border border-brand-border hover:bg-brand-surface-hover text-xs font-semibold text-brand-text transition-colors"
          >
            <Printer className="w-4 h-4 text-brand-gold" />
            <span>Print Invoice / Slip</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-brand-danger/10 border border-brand-danger/30 text-brand-danger text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 7-STEP FULFILLMENT STEPPER TIMELINE                                  */}
      {/* ==================================================================== */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-xl overflow-hidden">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-muted mb-6">
          7-Step COD Fulfillment Pipeline
        </h2>

        {!isCancelled ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 relative">
            {STEP_ORDER.map((step, idx) => {
              const Icon = step.icon;
              const isPast = currentStepIndex > idx;
              const isCurrent = currentStepIndex === idx;

              return (
                <div
                  key={step.key}
                  className={`p-3 rounded-xl border text-center transition-all ${isCurrent
                    ? "bg-brand-gold/15 border-brand-gold text-brand-text shadow-md"
                    : isPast
                      ? "bg-brand-bg/60 border-brand-border/80 text-brand-muted"
                      : "bg-brand-bg/30 border-brand-border/40 text-brand-muted/50"
                    }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center font-bold text-xs ${isCurrent
                      ? "bg-brand-gold text-brand-bg"
                      : isPast
                        ? "bg-brand-gold/20 text-brand-gold"
                        : "bg-brand-surface text-brand-muted"
                      }`}
                  >
                    {isPast ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <p
                    className={`text-xs font-semibold truncate ${isCurrent ? "text-brand-gold" : "text-brand-text"}`}
                  >
                    {step.label}
                  </p>
                  <p className="text-[10px] text-brand-muted mt-0.5 line-clamp-1">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-brand-danger/10 border border-brand-danger/30 text-brand-danger text-xs">
            <span className="font-bold">Order Cancelled:</span>{" "}
            {order.cancellationReason || "No reason specified"}
          </div>
        )}

        {/* Action Controls Bar */}
        <div className="mt-6 pt-5 border-t border-brand-border flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-brand-muted">
              Next Recommended Step:
            </span>
            {order.status === "pending" && (
              <button
                onClick={() =>
                  handleStatusTransition("confirmed", {
                    phoneVerified: true,
                    note: "Confirmed with customer on call",
                  })
                }
                disabled={isUpdating}
                className="px-4 py-2 rounded-lg bg-brand-gold hover:bg-brand-gold-hover text-brand-bg font-semibold text-xs transition-colors shadow-sm"
              >
                Confirm Order (Phone/WhatsApp Verified)
              </button>
            )}

            {order.status === "confirmed" && (
              <button
                onClick={() =>
                  handleStatusTransition("processing", {
                    note: "Artisan crafting started",
                  })
                }
                disabled={isUpdating}
                className="px-4 py-2 rounded-lg bg-brand-gold hover:bg-brand-gold-hover text-brand-bg font-semibold text-xs transition-colors shadow-sm"
              >
                Start Crafting Piece
              </button>
            )}

            {order.status === "processing" && (
              <button
                onClick={() =>
                  handleStatusTransition("ready_for_dispatch", {
                    note: "Quality check passed and packed",
                  })
                }
                disabled={isUpdating}
                className="px-4 py-2 rounded-lg bg-brand-gold hover:bg-brand-gold-hover text-brand-bg font-semibold text-xs transition-colors shadow-sm"
              >
                Mark Ready for Dispatch
              </button>
            )}

            {order.status === "ready_for_dispatch" && (
              <button
                onClick={() => setDispatchModalOpen(true)}
                disabled={isUpdating}
                className="px-4 py-2 rounded-lg bg-brand-gold hover:bg-brand-gold-hover text-brand-bg font-semibold text-xs transition-colors shadow-sm"
              >
                Dispatch via Courier Partner →
              </button>
            )}

            {order.status === "dispatched" && (
              <button
                onClick={() =>
                  handleStatusTransition("delivered", {
                    note: "Courier reported delivery complete",
                  })
                }
                disabled={isUpdating}
                className="px-4 py-2 rounded-lg bg-brand-gold hover:bg-brand-gold-hover text-brand-bg font-semibold text-xs transition-colors shadow-sm"
              >
                Mark Delivered to Customer
              </button>
            )}

            {order.status === "delivered" && (
              <button
                onClick={() =>
                  handleStatusTransition("completed", {
                    cashCollected: true,
                    note: "COD cash collected and reconciled",
                  })
                }
                disabled={isUpdating}
                className="px-4 py-2 rounded-lg bg-brand-gold hover:bg-brand-gold-hover text-brand-bg font-semibold text-xs transition-colors shadow-sm"
              >
                Reconcile COD Cash (Mark Completed)
              </button>
            )}

            {order.status === "completed" && (
              <span className="text-xs font-semibold text-brand-gold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Order Fulfilled & COD Cash
                Reconciled
              </span>
            )}
          </div>

          {!isCompleted && !isCancelled && (
            <button
              onClick={() => setCancelModalOpen(true)}
              className="text-xs text-brand-danger hover:underline font-medium"
            >
              Cancel Order...
            </button>
          )}
        </div>
      </div>

      {/* Grid: Order Items & Customer Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Items Table & Pricing */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden shadow-xl">
            <div className="p-5 border-b border-brand-border">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-text">
                Ordered Artwork Items
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Art Piece</th>
                    <th>Size & Frame</th>
                    <th>Base Price</th>
                    <th>Frame Addon</th>
                    <th>Qty</th>
                    <th className="text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-brand-bg border border-brand-border overflow-hidden shrink-0">
                            <img
                              src={
                                item.image ||
                                "https://res.cloudinary.com/dtxw88le2/image/upload/e_noise:20,q_auto,f_auto/v1791451908/ceylon-wall-decor/products/hero.jpg"
                              }
                              alt={item.productName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "https://res.cloudinary.com/dtxw88le2/image/upload/e_noise:20,q_auto,f_auto/v1791451908/ceylon-wall-decor/products/hero.jpg";
                              }}
                            />
                          </div>
                          <div>
                            <span className="font-semibold text-brand-text text-sm block">
                              {item.productName}
                            </span>
                            <span className="text-xs text-brand-muted">
                              {item.sizeLabel} inches
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`text-xs px-2 py-0.5 rounded font-medium ${item.withFrame
                            ? "bg-brand-gold/10 text-brand-gold border border-brand-gold/20"
                            : "bg-black/5 text-brand-muted"
                            }`}
                        >
                          {item.withFrame ? "Framed Canvas" : "Unframed Canvas"}
                        </span>
                      </td>

                      <td className="text-xs text-brand-text font-medium">
                        {formatPrice(item.unitPrice)}
                      </td>

                      <td className="text-xs text-brand-gold font-medium">
                        {item.frameCost > 0
                          ? `+${formatPrice(item.frameCost)}`
                          : "Rs. 0"}
                      </td>

                      <td className="text-xs text-brand-text font-semibold">
                        {item.qty}
                      </td>

                      <td className="text-right text-xs font-bold text-brand-text">
                        {formatPrice(item.totalPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="p-5 border-t border-brand-border bg-brand-bg/30 flex justify-end">
              <div className="w-72 space-y-2 text-xs">
                <div className="flex justify-between text-brand-muted">
                  <span>Base Artwork Subtotal:</span>
                  <span className="text-brand-text font-medium">
                    {formatPrice(order.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-brand-muted">
                  <span>Total Framing Cost:</span>
                  <span className="text-brand-gold font-medium">
                    +{formatPrice(order.frameCost)}
                  </span>
                </div>
                <div className="flex justify-between text-brand-muted">
                  <span>
                    Island-wide Delivery ({order.deliveryAddress.district}):
                  </span>
                  <span className="text-brand-text font-medium">
                    +{formatPrice(order.deliveryFee)}
                  </span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-brand-gold">
                    <span>Discount ({order.discountCode || "Promo"}):</span>
                    <span>-{formatPrice(order.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-brand-text border-t border-brand-border pt-2">
                  <span>Total (Cash on Delivery):</span>
                  <span className="text-brand-gold font-mono text-base">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Timeline History */}
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-text">
              Fulfillment Audit & Status History
            </h2>

            <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-brand-border">
              {order.statusHistory.map((entry, idx) => (
                <div key={idx} className="flex items-start gap-4 relative pl-1">
                  <div className="w-5 h-5 rounded-full bg-brand-gold/20 text-brand-gold flex items-center justify-center shrink-0 border border-brand-gold/40 z-10">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-gold" />
                  </div>
                  <div className="flex-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-brand-text capitalize">
                        {entry.status.replace(/_/g, " ")}
                      </span>
                      <span className="text-brand-muted">
                        {formatDateTime(entry.timestamp)}
                      </span>
                    </div>
                    <p className="text-brand-muted mt-0.5">
                      Updated by:{" "}
                      <span className="text-brand-text">{entry.updatedBy}</span>
                    </p>
                    {entry.note && (
                      <p className="text-brand-gold bg-brand-gold/5 p-2 rounded-lg border border-brand-gold/10 mt-1">
                        {entry.note}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Customer & Delivery Info */}
        <div className="space-y-6">
          {/* Customer Profile Card */}
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 space-y-4 shadow-xl">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-muted flex items-center gap-2">
              <User className="w-4 h-4 text-brand-gold" />
              <span>Customer Details</span>
            </h2>

            <div className="space-y-2">
              <p className="text-base font-bold text-brand-text">
                {order.customer.name}
              </p>
              <div className="flex items-center gap-2 text-xs text-brand-muted">
                <Phone className="w-3.5 h-3.5 text-brand-gold" />
                <span className="font-mono text-brand-text font-medium">
                  {formatPhone(order.customer.phone)}
                </span>
              </div>
              {order.customer.email && (
                <p className="text-xs text-brand-muted">
                  {order.customer.email}
                </p>
              )}
            </div>

            {/* Direct WhatsApp Action Link */}
            <div className="pt-2 border-t border-brand-border">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white hover:bg-black/20 text-black font-semibold text-xs transition-colors shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp (Prefilled)</span>
              </a>
            </div>
          </div>

          {/* Delivery Address Card */}
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 space-y-4 shadow-xl">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-muted flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-gold" />
              <span>Delivery Address</span>
            </h2>

            <div className="space-y-1 text-xs">
              <p className="text-brand-text font-medium leading-relaxed">
                {order.deliveryAddress.address}
              </p>
              <p className="text-brand-text">
                {order.deliveryAddress.city},{" "}
                <span className="font-semibold">
                  {order.deliveryAddress.district} District
                </span>
              </p>
              {order.deliveryAddress.postalCode && (
                <p className="text-brand-muted font-mono">
                  {order.deliveryAddress.postalCode}
                </p>
              )}
              {order.deliveryAddress.notes && (
                <div className="p-2.5 rounded-lg bg-brand-bg border border-brand-border mt-2">
                  <span className="text-[10px] uppercase tracking-wider text-brand-muted block font-semibold">
                    Delivery Instructions:
                  </span>
                  <span className="text-brand-gold text-xs">
                    {order.deliveryAddress.notes}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Courier & Tracking Card */}
          {order.trackingNumber && (
            <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 space-y-3 shadow-xl">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-muted flex items-center gap-2">
                <Truck className="w-4 h-4 text-brand-gold" />
                <span>Courier Tracking</span>
              </h2>

              <div className="text-xs space-y-1">
                <p className="text-brand-text font-semibold">
                  {order.courierName}
                </p>
                <p className="font-mono text-brand-gold bg-brand-bg p-2 rounded-lg border border-brand-border">
                  {order.trackingNumber}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* DISPATCH MODAL                                                       */}
      {/* ==================================================================== */}
      {dispatchModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <h3 className="text-base font-bold text-brand-text flex items-center gap-2">
                <Truck className="w-5 h-5 text-brand-gold" />
                <span>Handover to Courier Partner</span>
              </h3>
              <button
                onClick={() => setDispatchModalOpen(false)}
                className="text-brand-muted hover:text-brand-text"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-brand-muted mb-1">
                  Select Courier
                </label>
                <select
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  className="form-input"
                >
                  <option value="Domex Courier">Domex Courier</option>
                  <option value="Pronto Lanka">Pronto Lanka</option>
                  <option value="Koombiyo Delivery">Koombiyo Delivery</option>
                  <option value="Prompt Xpress">Prompt Xpress</option>
                  <option value="Direct Studio Delivery">
                    Direct Studio Delivery
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-brand-muted mb-1">
                  Tracking Number / Waybill ID *
                </label>
                <input
                  type="text"
                  placeholder="e.g. DMX-889123"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="form-input font-mono"
                  required
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDispatchModalOpen(false)}
                className="flex-1 py-2 px-3 rounded-lg border border-brand-border text-xs font-semibold text-brand-text hover:bg-brand-surface-hover"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleStatusTransition("dispatched", {
                    courierName,
                    trackingNumber: trackingNumber || "DMX-PENDING",
                    note: `Handed over to ${courierName}. Waybill: ${trackingNumber || "Pending"}`,
                  })
                }
                disabled={isUpdating}
                className="flex-1 py-2 px-3 rounded-lg bg-brand-gold hover:bg-brand-gold-hover text-brand-bg font-semibold text-xs shadow-sm"
              >
                Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* CANCEL MODAL                                                         */}
      {/* ==================================================================== */}
      {cancelModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-brand-danger">
              Cancel Order {order.orderRef}
            </h3>
            <p className="text-xs text-brand-muted">
              Please provide the reason for cancellation:
            </p>
            <textarea
              rows={3}
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="e.g. Customer unreachable after 3 verification attempts / Change of mind"
              className="form-input"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="flex-1 py-2 px-3 rounded-lg border border-brand-border text-xs font-semibold text-brand-text"
              >
                Back
              </button>
              <button
                onClick={() =>
                  handleStatusTransition("cancelled", {
                    cancellationReason:
                      cancellationReason || "Cancelled by staff",
                  })
                }
                disabled={isUpdating}
                className="flex-1 py-2 px-3 rounded-lg bg-black hover:bg-black/80 text-white text-xs font-semibold"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* PRINTABLE INVOICE / PACKING SLIP MODAL                               */}
      {/* ==================================================================== */}
      {invoiceModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white text-black rounded-2xl max-w-2xl w-full p-8 shadow-2xl space-y-6 my-8 print:p-0">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-gray-200 pb-4">
              <div>
                <h2 className="text-2xl font-bold font-serif tracking-tight text-gray-900">
                  Ceylon Wall Decor
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Handcrafted Textured Wall Art • Colombo, Sri Lanka
                </p>
                <p className="text-xs text-gray-500">
                  Phone / WhatsApp: 078 2518184
                </p>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-lg text-black block">
                  {order.orderRef}
                </span>
                <span className="text-xs text-gray-500 block">
                  Date: {formatDateTime(order.createdAt)}
                </span>
                <span className="text-xs font-semibold uppercase px-2 py-0.5 bg-gray-100 rounded inline-block mt-1">
                  Cash on Delivery
                </span>
              </div>
            </div>

            {/* Customer & Shipping */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-bold text-gray-700 uppercase tracking-wider block mb-1">
                  Deliver To:
                </span>
                <p className="font-bold text-gray-900 text-sm">
                  {order.customer.name}
                </p>
                <p className="text-gray-700">{order.customer.phone}</p>
                {order.customer.email && (
                  <p className="text-gray-500">{order.customer.email}</p>
                )}
              </div>

              <div>
                <span className="font-bold text-gray-700 uppercase tracking-wider block mb-1">
                  Shipping Address:
                </span>
                <p className="text-gray-800">{order.deliveryAddress.address}</p>
                <p className="text-gray-800">
                  {order.deliveryAddress.city}, {order.deliveryAddress.district}{" "}
                  District
                </p>
                {order.courierName && (
                  <p className="text-black font-semibold mt-1">
                    Courier: {order.courierName}
                  </p>
                )}
              </div>
            </div>

            {/* Table */}
            <table className="w-full text-left text-xs border border-gray-200">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="p-2.5">Item & Size</th>
                  <th className="p-2.5">Frame Specification</th>
                  <th className="p-2.5 text-center">Qty</th>
                  <th className="p-2.5 text-right">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {order.items.map((i, idx) => (
                  <tr key={idx}>
                    <td className="p-2.5 font-medium">
                      {i.productName} ({i.sizeLabel}")
                    </td>
                    <td className="p-2.5 text-gray-600">
                      {i.withFrame
                        ? "Framed with Wooden Floater"
                        : "Unframed Canvas"}
                    </td>
                    <td className="p-2.5 text-center font-bold">{i.qty}</td>
                    <td className="p-2.5 text-right font-bold">
                      {formatPrice(i.totalPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end text-xs">
              <div className="w-64 space-y-1.5 text-right">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>{formatPrice(order.subtotal + order.frameCost)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee:</span>
                  <span>{formatPrice(order.deliveryFee)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-black font-medium">
                    <span>Discount:</span>
                    <span>-{formatPrice(order.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-300 pt-1.5">
                  <span>COD Cash to Collect:</span>
                  <span className="text-black font-bold">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer / Print Actions */}
            <div className="pt-4 border-t border-gray-200 flex items-center justify-between text-xs">
              <p className="text-gray-500">
                * Please inspect artwork upon delivery. Thank you for supporting
                local Sri Lankan art!
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setInvoiceModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-semibold"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-black hover:bg-black/80 text-white rounded-lg font-semibold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
