"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap-config";
import {
  ShoppingBag,
  Clock,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Package,
  Palette,
  ArrowUpRight,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  Truck,
  Sparkles,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { fetchDashboardStats } from "@/lib/admin-client";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { CLOUDINARY_SEED_IMAGES } from "@/lib/cloudinary";
import type { DashboardStats, OrderStatus } from "@/types";

export default function AdminDashboardPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchDashboardStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to load dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useGSAP(
    () => {
      if (!loading) {
        gsap.from(".stat-card", {
          opacity: 0,
          y: 20,
          stagger: 0.08,
          duration: 0.45,
          ease: "power2.out",
        });
        gsap.from(".chart-card", {
          opacity: 0,
          y: 20,
          stagger: 0.1,
          duration: 0.5,
          delay: 0.2,
          ease: "power2.out",
        });
        gsap.from(".table-section", {
          opacity: 0,
          y: 20,
          duration: 0.5,
          delay: 0.3,
          ease: "power2.out",
        });
      }
    },
    { scope: containerRef, dependencies: [loading] },
  );

  const getStatusBadge = (status: OrderStatus) => {
    const map: Record<OrderStatus, { label: string; className: string }> = {
      pending: { label: "Pending Call", className: "status-pending" },
      confirmed: { label: "Confirmed", className: "status-confirmed" },
      processing: { label: "Crafting", className: "status-processing" },
      ready_for_dispatch: { label: "Ready to Ship", className: "status-ready" },
      dispatched: { label: "In Transit", className: "status-dispatched" },
      delivered: { label: "Delivered", className: "status-delivered" },
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

  if (loading || !stats) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-xs uppercase tracking-widest text-brand-muted">
          Loading Live Store Analytics...
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-brand-text font-serif">
            Executive Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-1">
            Real-time fulfillment, COD revenue, and Sri Lanka sales pipeline
            overview.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-brand-surface border border-brand-border text-xs font-semibold text-brand-text hover:bg-brand-surface-hover hover:border-brand-accent/30 transition-colors"
          >
            <ShoppingBag className="w-4 h-4 text-brand-accent" />
            <span>Manage Orders</span>
          </Link>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-brand-accent hover:bg-brand-accent-hover text-brand-bg text-xs font-semibold transition-colors shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>Add New Design</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Today's Orders */}
        <div className="stat-card bg-brand-surface border border-brand-border rounded-2xl p-5 card-hover relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
              Today's Orders
            </span>
            <div className="w-9 h-9 rounded-xl bg-brand-accent/10 text-brand-accent flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-brand-text">
              {stats.ordersToday}
            </span>
            <span className="text-xs font-medium text-brand-accent flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +{stats.ordersTrend}%
            </span>
          </div>
          <p className="text-xs text-brand-muted mt-2">
            Value:{" "}
            <span className="text-brand-text font-medium">
              {formatPrice(stats.revenueToday)}
            </span>
          </p>
        </div>

        {/* Needs Phone Verification / Pending */}
        <div className="stat-card bg-brand-surface border border-brand-border rounded-2xl p-5 card-hover relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
              Pending Attention
            </span>
            <div className="w-9 h-9 rounded-xl bg-brand-accent/10 text-brand-accent flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-brand-text">
              {stats.ordersPending}
            </span>
            <span className="text-xs text-brand-text bg-black/5 px-2 py-0.5 rounded-full font-medium">
              Needs Call
            </span>
          </div>
          <p className="text-xs text-brand-muted mt-2">
            Protecting against fake COD orders
          </p>
        </div>

        {/* COD Cash to Collect */}
        <div className="stat-card bg-brand-surface border border-brand-border rounded-2xl p-5 card-hover relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
              COD Cash to Collect
            </span>
            <div className="w-9 h-9 rounded-xl bg-brand-accent/10 text-brand-accent flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold text-brand-accent">
              {formatPrice(stats.codCashToCollect)}
            </span>
          </div>
          <p className="text-xs text-brand-muted mt-2">
            Delivered/dispatched courier settlements
          </p>
        </div>

        {/* Active Pipeline */}
        <div className="stat-card bg-brand-surface border border-brand-border rounded-2xl p-5 card-hover relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
              Crafting & Transit
            </span>
            <div className="w-9 h-9 rounded-xl bg-black/5 text-brand-text flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-brand-text">
              {stats.ordersProcessing + stats.ordersDispatched}
            </span>
            <span className="text-xs text-brand-muted">
              ({stats.ordersProcessing} crafting, {stats.ordersDispatched}{" "}
              shipped)
            </span>
          </div>
          <p className="text-xs text-brand-muted mt-2">
            {stats.newCustomRequests} custom design quotes pending
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Revenue Trend Area Chart */}
        <div className="chart-card lg:col-span-2 bg-brand-surface border border-brand-border rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="text-base font-semibold text-brand-text">
                Weekly Revenue Performance
              </h2>
              <p className="text-xs text-brand-muted">
                Daily cash-on-delivery order volume in LKR
              </p>
            </div>
            <span className="text-xs font-mono font-medium text-brand-accent bg-brand-accent/10 border border-brand-accent/20 px-2.5 py-1 rounded-lg">
              This Week: {formatPrice(stats.revenueThisWeek)}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.revenueData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-brand-accent)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--color-brand-accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  stroke="#6B6B6B"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  stroke="#6B6B6B"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(val) => `Rs.${val / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#E5E5E5",
                    borderRadius: "0.5rem",
                    color: "#111111",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                    fontSize: "12px",
                  }}
                  formatter={(val: unknown) => [
                    formatPrice(val as number),
                    "Revenue",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-brand-accent)"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#revenueGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="chart-card bg-brand-surface border border-brand-border rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-brand-text">
              Order Status Pipeline
            </h2>
            <p className="text-xs text-brand-muted mb-4">
              Current order distribution across fulfillment
            </p>

            <div className="space-y-3">
              {stats.orderStatusData.map((item) => (
                <div key={item.status} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-brand-muted font-medium capitalize">
                      {item.status.toLowerCase()}
                    </span>
                    <span className="font-semibold text-brand-text">
                      {item.count}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-brand-bg rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        backgroundColor: item.color,
                        width: `${Math.min(100, (item.count / Math.max(stats.ordersToday + 1, 6)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/admin/orders"
            className="mt-6 flex items-center justify-between py-2 text-xs font-semibold text-brand-accent hover:text-brand-accent-hover transition-colors border-t border-brand-border pt-4"
          >
            <span>Open Order Fulfillment Board</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Two Column Layout: Recent Orders & Top Selling Art Pieces */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table */}
        <div className="table-section lg:col-span-2 bg-brand-surface border border-brand-border rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-brand-border flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-brand-text">
                Recent Orders
              </h2>
              <p className="text-xs text-brand-muted">
                Latest purchases across Sri Lanka
              </p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-brand-accent hover:text-brand-accent-hover"
            >
              View All →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-brand-surface-hover/60"
                  >
                    <td>
                      <span className="font-mono text-xs font-bold text-brand-accent">
                        {order.orderRef}
                      </span>
                    </td>
                    <td>
                      <span className="font-medium text-brand-text">
                        {order.customerName}
                      </span>
                    </td>
                    <td>{getStatusBadge(order.status)}</td>
                    <td>
                      <span className="font-semibold text-brand-text">
                        {formatPrice(order.total)}
                      </span>
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => router.push(`/admin/orders/${order.id}`)}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-brand-surface hover:bg-brand-surface-hover border border-brand-border text-brand-text transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Designs & Traffic Sources */}
        <div className="table-section space-y-6">
          {/* Top Designs */}
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-brand-text uppercase tracking-wider mb-4">
              Top Selling Designs
            </h2>
            <div className="space-y-3.5">
              {stats.topDesigns.map((design, idx) => (
                <div key={design.name} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-bg border border-brand-border overflow-hidden shrink-0">
                    <img
                      src={design.image}
                      alt={design.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          CLOUDINARY_SEED_IMAGES.hero;
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-brand-text truncate">
                      {design.name}
                    </p>
                    <p className="text-[11px] text-brand-muted">
                      {design.orders} orders • {formatPrice(design.revenue)}
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-brand-accent">
                    #{idx + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Traffic Attribution */}
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-brand-text uppercase tracking-wider mb-4">
              Channel Attribution
            </h2>
            <div className="space-y-3">
              {stats.trafficSources.map((source) => (
                <div
                  key={source.source}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-brand-text font-medium">
                    {source.source}
                  </span>
                  <div className="text-right">
                    <span className="font-semibold text-brand-text">
                      {source.orders} orders
                    </span>
                    <span className="text-[11px] text-brand-muted block">
                      {formatPrice(source.revenue)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
