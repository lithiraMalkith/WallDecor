"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap-config";
import {
  Search,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  ArrowRight,
  Filter,
  PhoneCall,
  Loader2,
  Calendar,
} from "lucide-react";
import { fetchOrders } from "@/lib/admin-client";
import { formatPrice, formatDateTime } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types";

const STATUS_TABS: { label: string; value: string; countKey?: OrderStatus }[] =
  [
    { label: "All Orders", value: "all" },
    { label: "Pending Call", value: "pending" },
    { label: "Confirmed", value: "confirmed" },
    { label: "Crafting", value: "processing" },
    { label: "Ready", value: "ready_for_dispatch" },
    { label: "Dispatched", value: "dispatched" },
    { label: "Delivered", value: "delivered" },
    { label: "Completed", value: "completed" },
  ];

export default function AdminOrdersPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const router = useRouter();

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchOrders();
      setOrders(data);
    } catch (err) {
      console.error("Failed to load orders:", err);
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
        gsap.from(".page-header", {
          opacity: 0,
          y: -10,
          duration: 0.35,
          ease: "power2.out",
        });
        const rows = document.querySelectorAll(".order-row");
        if (rows.length > 0) {
          gsap.from(".order-row", {
            opacity: 0,
            y: 15,
            stagger: 0.04,
            duration: 0.35,
            ease: "power2.out",
          });
        }
      }
    },
    { scope: containerRef, dependencies: [loading, activeTab] },
  );

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderRef.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.phone.includes(search) ||
      o.deliveryAddress.district.toLowerCase().includes(search.toLowerCase()) ||
      (o.trackingNumber &&
        o.trackingNumber.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = activeTab === "all" || o.status === activeTab;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: OrderStatus) => {
    const map: Record<OrderStatus, { label: string; className: string }> = {
      pending: { label: "Pending Call", className: "status-pending" },
      confirmed: { label: "Confirmed", className: "status-confirmed" },
      processing: { label: "Crafting", className: "status-processing" },
      ready_for_dispatch: { label: "Ready to Ship", className: "status-ready" },
      dispatched: { label: "In Transit", className: "status-dispatched" },
      delivered: {
        label: "Delivered (COD Due)",
        className: "status-delivered",
      },
      completed: { label: "Paid & Reconciled", className: "status-completed" },
      cancelled: { label: "Cancelled", className: "status-cancelled" },
      on_hold: { label: "On Hold", className: "status-on-hold" },
      delivery_failed: {
        label: "Delivery Failed",
        className: "status-cancelled",
      },
      returned: { label: "Returned", className: "status-returned" },
    };
    const cfg = map[status] || { label: status, className: "status-pending" };
    return <span className={`status-badge ${cfg.className}`}>{cfg.label}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-[450px] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-accent animate-spin" />
        <p className="text-xs uppercase tracking-widest text-brand-muted">
          Loading Fulfillment Board...
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-6 pb-20">
      {/* Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-brand-text font-serif">
            Order Fulfillment Board
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-1">
            7-step Cash on Delivery pipeline • Phone confirmation to courier
            cash settlement
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-medium text-brand-accent bg-brand-accent/10 border border-brand-accent/20 px-3 py-1.5 rounded-lg">
            {orders.length} Total Orders
          </span>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-brand-border/60 scrollbar-none">
        {STATUS_TABS.map((tab) => {
          const count =
            tab.value === "all"
              ? orders.length
              : orders.filter((o) => o.status === tab.value).length;
          const active = activeTab === tab.value;

          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                active
                  ? "bg-brand-accent text-brand-bg font-semibold shadow-xs"
                  : "text-brand-muted hover:text-brand-text hover:bg-brand-surface"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  active
                    ? "bg-black/20 text-brand-bg font-bold"
                    : "bg-brand-bg text-brand-muted border border-brand-border"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
        <input
          type="text"
          placeholder="Search by CWD ref, customer, phone (078...), or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input !pl-11 text-xs sm:text-sm"
        />
      </div>

      {/* Orders Table */}
      <div className="bg-brand-surface rounded-2xl border border-brand-border overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order Ref & Date</th>
                <th>Customer & Contact</th>
                <th>Destination</th>
                <th>Items Ordered</th>
                <th>Fulfillment Stage</th>
                <th>Total (COD)</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => router.push(`/admin/orders/${order.id}`)}
                  className="order-row hover:bg-brand-surface-hover/70 cursor-pointer transition-colors"
                >
                  <td>
                    <span className="font-mono text-xs font-bold text-brand-accent block">
                      {order.orderRef}
                    </span>
                    <span className="text-[11px] text-brand-muted flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3 text-brand-muted" />
                      {formatDateTime(order.createdAt)}
                    </span>
                  </td>

                  <td>
                    <span className="font-medium text-brand-text text-sm block">
                      {order.customer.name}
                    </span>
                    <span className="text-xs text-brand-muted font-mono">
                      {order.customer.phone}
                    </span>
                  </td>

                  <td>
                    <span className="text-xs text-brand-text block">
                      {order.deliveryAddress.city}
                    </span>
                    <span className="text-[11px] text-brand-muted">
                      {order.deliveryAddress.district}
                    </span>
                  </td>

                  <td>
                    <span className="text-xs text-brand-text font-medium block">
                      {order.items.length}{" "}
                      {order.items.length === 1 ? "piece" : "pieces"}
                    </span>
                    <span className="text-[11px] text-brand-muted truncate max-w-[180px] block">
                      {order.items
                        .map((i) => `${i.productName} (${i.sizeLabel})`)
                        .join(", ")}
                    </span>
                  </td>

                  <td>
                    <div className="space-y-1">
                      {getStatusBadge(order.status)}
                      {order.trackingNumber && (
                        <span className="text-[11px] font-mono text-brand-muted block">
                          {order.courierName}: {order.trackingNumber}
                        </span>
                      )}
                    </div>
                  </td>

                  <td>
                    <span className="font-bold text-brand-text text-sm block">
                      {formatPrice(order.total)}
                    </span>
                    <span className="text-[10px] uppercase font-mono text-brand-muted">
                      {order.paymentMethod} • {order.paymentStatus}
                    </span>
                  </td>

                  <td className="text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/admin/orders/${order.id}`);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-bg hover:bg-brand-surface-hover border border-brand-border text-xs font-medium text-brand-accent transition-colors"
                    >
                      <span>Inspect</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <ShoppingBag className="w-8 h-8 text-brand-muted mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium text-brand-text">
                      No orders found
                    </p>
                    <p className="text-xs text-brand-muted mt-1">
                      Try selecting a different status filter
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
