"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  Clock,
  ShoppingBag,
  Palette,
  ChevronRight,
  X,
} from "lucide-react";
import { fetchOrders, fetchCustomRequests } from "@/lib/admin-client";
import type { Order, CustomRequest } from "@/types";
import { formatPrice } from "@/lib/utils";

export function AdminNotifications() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<{ orders: Order[]; requests: CustomRequest[]; loading: boolean; error: boolean }>({ orders: [], requests: [], loading: true, error: false });
  const pendingOrders = state.orders;
  const newRequests = state.requests;
  const dropdownRef = useRef<HTMLDivElement>(null);
  const refresh = useRef<() => void>(() => {});
  const router = useRouter();

  useEffect(() => {
    let disposed = false;
    let revision = 0;
    const load = async () => {
      const current = ++revision;
      try {
        const [orders, requests] = await Promise.all([fetchOrders({ status: "pending" }), fetchCustomRequests({ status: "new" })]);
        if (!disposed && revision === current) setState({ orders: orders.filter(order => order.status === "pending"), requests: requests.filter(request => request.status === "new"), loading: false, error: false });
      } catch {
        if (!disposed && revision === current) setState({ orders: [], requests: [], loading: false, error: true });
      }
    };
    const update = () => { void load(); };
    const visible = () => { if (!document.hidden) update(); };
    refresh.current = update;
    update();
    const interval = setInterval(visible, 20000);
    window.addEventListener("focus", update);
    window.addEventListener("admin-records-changed", update);
    document.addEventListener("visibilitychange", visible);
    return () => { disposed = true; clearInterval(interval); window.removeEventListener("focus", update); window.removeEventListener("admin-records-changed", update); document.removeEventListener("visibilitychange", visible); };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalCount = pendingOrders.length + newRequests.length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => { if (!isOpen) refresh.current(); setIsOpen(!isOpen); }}
        className="relative p-2 rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-surface transition-colors"
        aria-label="Notifications"
        aria-expanded={isOpen}
        aria-controls="admin-notifications"
      >
        <Bell className="w-5 h-5" />
        {pendingOrders.length > 0 && (
          <span data-testid="order-notification-count" aria-label={`${pendingOrders.length} pending orders`} className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-accent px-1 text-[10px] font-bold text-white">
            {pendingOrders.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div id="admin-notifications" role="region" aria-label="Order and custom request notifications" className="absolute right-0 mt-2 w-[min(24rem,calc(100vw-2rem))] rounded-xl border border-brand-border bg-brand-surface shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-brand-border bg-brand-bg/50">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-brand-text text-sm">
                Action Items
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-brand-accent/10 text-brand-accent border border-brand-accent/20 font-medium">
                {pendingOrders.length} orders · {newRequests.length} requests
              </span>
            </div>
            <button
              aria-label="Close notifications"
              onClick={() => setIsOpen(false)}
              className="text-brand-muted hover:text-brand-text p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* List */}
          <div className="max-h-[min(380px,calc(100dvh-200px))] overflow-y-auto divide-y divide-brand-border/50">
            {state.loading ? <p role="status" className="p-8 text-center text-sm">Checking notifications…</p> : state.error ? <div role="alert" className="p-6 text-sm"><p>Notifications are temporarily unavailable.</p><button type="button" onClick={() => refresh.current()} className="mt-3 underline">Retry notifications</button></div> : totalCount === 0 ? (
              <div className="p-8 text-center">
                <Clock className="w-8 h-8 text-brand-muted/40 mx-auto mb-2" />
                <p className="text-sm font-medium text-brand-text">
                  All caught up!
                </p>
                <p className="text-xs text-brand-muted mt-1">
                  No pending orders or custom requests require verification.
                </p>
              </div>
            ) : (
              <>
                {pendingOrders.map((order) => (
                  <Link
                    href={`/admin/orders/${order.id}`}
                    key={order.id}
                    onClick={() => {
                      setIsOpen(false);

                    }}
                    className="p-3.5 hover:bg-brand-surface-hover/70 cursor-pointer transition-colors flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand-accent/10 text-brand-accent flex items-center justify-center shrink-0 mt-0.5">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-semibold text-brand-accent">
                          {order.orderRef}
                        </span>
                        <span className="text-[11px] text-brand-muted">
                          Needs Call
                        </span>
                      </div>
                      <p className="text-sm font-medium text-brand-text truncate mt-0.5">
                        {order.customer.name}
                      </p>
                      <p className="text-xs text-brand-muted">
                        {order.deliveryAddress.city} •{" "}
                        <span className="text-brand-text font-medium">
                          {formatPrice(order.total)}
                        </span>
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-brand-muted shrink-0 self-center" />
                  </Link>
                ))}

                {newRequests.map((req) => (
                  <Link
                    href={`/admin/custom-requests/${req.id}`}
                    key={req.id}
                    onClick={() => {
                      setIsOpen(false);

                    }}
                    className="p-3.5 hover:bg-brand-surface-hover/70 cursor-pointer transition-colors flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-black/5 text-brand-text flex items-center justify-center shrink-0 mt-0.5">
                      <Palette className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-brand-text">
                          Custom Request
                        </span>
                        <span className="text-[11px] text-brand-muted">
                          New
                        </span>
                      </div>
                      <p className="text-sm font-medium text-brand-text truncate mt-0.5">
                        {req.customerName}
                      </p>
                      <p className="text-xs text-brand-muted truncate">
                        {req.notes}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-brand-muted shrink-0 self-center" />
                  </Link>
                ))}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-brand-border bg-brand-bg/40 text-center">
            <button
              onClick={() => {
                setIsOpen(false);
                router.push("/admin/orders");
              }}
              className="text-xs text-brand-accent hover:text-brand-accent-hover font-medium py-1 px-3"
            >
              View All Orders →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
