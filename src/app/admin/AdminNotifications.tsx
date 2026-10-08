"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [newRequests, setNewRequests] = useState<CustomRequest[]>([]);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const prevCountRef = useRef<number>(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const loadNotifications = async () => {
    try {
      const orders = await fetchOrders({ status: "pending" });
      const requests = await fetchCustomRequests();
      const urgentRequests = requests.filter((r) => r.status === "new");

      setPendingOrders(orders);
      setNewRequests(urgentRequests);

      const totalUrgent = orders.length + urgentRequests.length;
      // Audio beep if new orders arrive
      if (
        totalUrgent > prevCountRef.current &&
        prevCountRef.current !== 0 &&
        audioEnabled
      ) {
        try {
          const ctx = new (
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext })
              .webkitAudioContext
          )();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 note
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.35);
        } catch {
          // Audio not allowed yet
        }
      }
      prevCountRef.current = totalUrgent;
    } catch {
      // Fallback silently if offline
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 20000);
    return () => clearInterval(interval);
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
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-surface transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {totalCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-gold px-1 text-[10px] font-bold text-white animate-pulse">
            {totalCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-brand-border bg-brand-surface shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-brand-border bg-brand-bg/50">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-brand-text text-sm">
                Action Items
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-brand-gold/10 text-brand-gold border border-brand-gold/20 font-medium">
                {totalCount} urgent
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-brand-muted hover:text-brand-text p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-brand-border/50">
            {totalCount === 0 ? (
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
                  <div
                    key={order.id}
                    onClick={() => {
                      setIsOpen(false);
                      router.push(`/admin/orders/${order.id}`);
                    }}
                    className="p-3.5 hover:bg-brand-surface-hover/70 cursor-pointer transition-colors flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand-gold/10 text-brand-gold flex items-center justify-center shrink-0 mt-0.5">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-semibold text-brand-gold">
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
                  </div>
                ))}

                {newRequests.map((req) => (
                  <div
                    key={req.id}
                    onClick={() => {
                      setIsOpen(false);
                      router.push(`/admin/custom-requests/${req.id}`);
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
                  </div>
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
              className="text-xs text-brand-gold hover:text-brand-gold-hover font-medium py-1 px-3"
            >
              View All Orders →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
