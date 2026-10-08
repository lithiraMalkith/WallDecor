"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap-config";
import {
  Palette,
  Search,
  MessageCircle,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Eye,
  Loader2,
  Calendar,
  Sparkles,
} from "lucide-react";
import { fetchCustomRequests } from "@/lib/admin-client";
import { formatPrice, formatDateTime } from "@/lib/utils";
import type { CustomRequest } from "@/types";

export default function AdminCustomRequestsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [requests, setRequests] = useState<CustomRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const router = useRouter();

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchCustomRequests();
      setRequests(data);
    } catch (err) {
      console.error("Failed to load custom requests:", err);
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
        const cards = document.querySelectorAll(".request-card");
        if (cards.length > 0) {
          gsap.from(".request-card", {
            opacity: 0,
            y: 15,
            stagger: 0.05,
            duration: 0.4,
            ease: "power2.out",
          });
        }
      }
    },
    { scope: containerRef, dependencies: [loading, statusFilter] },
  );

  const filtered = requests.filter((r) => {
    const matchesSearch =
      r.customerName.toLowerCase().includes(search.toLowerCase()) ||
      r.customerPhone.includes(search) ||
      r.notes.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: CustomRequest["status"]) => {
    switch (status) {
      case "new":
        return (
          <span className="status-badge bg-black/5 text-brand-muted border-black/10">
            New Inquiry
          </span>
        );
      case "quoted":
        return (
          <span className="status-badge bg-black/5 text-brand-text border-black/10">
            Quote Sent
          </span>
        );
      case "approved":
        return (
          <span className="status-badge bg-brand-gold/10 text-brand-gold border-brand-gold/30">
            Client Approved
          </span>
        );
      case "converted":
        return (
          <span className="status-badge bg-brand-gold/10 text-brand-gold border-brand-gold/30">
            Converted to Order
          </span>
        );
      case "rejected":
        return (
          <span className="status-badge bg-black/10 text-brand-text border-black/20">
            Declined
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[450px] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
        <p className="text-xs uppercase tracking-widest text-brand-muted">
          Loading Custom Requests Inbox...
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
            Custom Design Requests
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-1">
            Customer-submitted Pinterest / TikTok design uploads • Dimensions,
            quotes & 1-click order conversion
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-medium text-brand-gold bg-brand-gold/10 border border-brand-gold/20 px-3 py-1.5 rounded-lg">
            {requests.filter((r) => r.status === "new").length} Needs Quote
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
          <input
            type="text"
            placeholder="Search by customer name, phone, or requirements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input !pl-11 text-xs sm:text-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {["all", "new", "quoted", "approved", "converted", "rejected"].map(
            (st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors whitespace-nowrap ${
                  statusFilter === st
                    ? "bg-brand-gold text-brand-bg font-semibold"
                    : "text-brand-muted hover:text-brand-text hover:bg-brand-surface"
                }`}
              >
                {st}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Request Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((req) => {
          const formattedPhone = req.customerPhone
            .replace(/\D/g, "")
            .replace(/^0/, "94");
          const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(
            `Hi ${req.customerName}! This is Ceylon Wall Decor regarding your custom wall art request for size ${req.sizeLabel || "custom"}.`,
          )}`;

          return (
            <div
              key={req.id}
              className="request-card bg-brand-surface border border-brand-border rounded-2xl overflow-hidden card-hover flex flex-col justify-between"
            >
              <div>
                {/* Photo Preview Banner */}
                <div className="h-44 w-full bg-brand-bg relative overflow-hidden group">
                  <img
                    src={
                      req.designUploadUrls[0] ||
                      "https://res.cloudinary.com/dtxw88le2/image/upload/e_noise:20,q_auto,f_auto/v1791451908/ceylon-wall-decor/products/hero.jpg"
                    }
                    alt="Custom design request"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://res.cloudinary.com/dtxw88le2/image/upload/e_noise:20,q_auto,f_auto/v1791451908/ceylon-wall-decor/products/hero.jpg";
                    }}
                  />
                  <div className="absolute top-3 left-3">
                    {getStatusBadge(req.status)}
                  </div>
                  {req.quotedPrice && (
                    <div className="absolute bottom-3 right-3 bg-brand-bg/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-brand-border font-mono text-xs font-bold text-brand-gold">
                      Quote: {formatPrice(req.quotedPrice)}
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-bold text-brand-text text-base">
                      {req.customerName}
                    </h3>
                    <p className="text-xs font-mono text-brand-muted">
                      {req.customerPhone}
                    </p>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="text-brand-text font-medium">
                      Dimensions:{" "}
                      <span className="text-brand-gold">
                        {req.sizeLabel || "Custom sizing"}
                      </span>
                    </p>
                    {req.framePreference && (
                      <p className="text-brand-muted">
                        Frame:{" "}
                        <span className="text-brand-text">
                          {req.framePreference}
                        </span>
                      </p>
                    )}
                    <p className="text-brand-muted mt-2 line-clamp-2 italic">
                      "{req.notes}"
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-brand-border bg-brand-bg/40 flex items-center justify-between gap-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg bg-black/5 hover:bg-black/10 text-brand-text border border-brand-border text-xs font-medium flex items-center gap-1.5 transition-colors"
                  title="Open WhatsApp Chat"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>

                <button
                  onClick={() =>
                    router.push(`/admin/custom-requests/${req.id}`)
                  }
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-brand-surface hover:bg-brand-surface-hover border border-brand-border text-xs font-semibold text-brand-text transition-colors"
                >
                  <span>Review & Quote</span>
                  <ArrowRight className="w-3.5 h-3.5 text-brand-gold" />
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full bg-brand-surface border border-brand-border rounded-2xl p-12 text-center">
            <Palette className="w-10 h-10 text-brand-muted mx-auto mb-3 opacity-40" />
            <h3 className="text-base font-semibold text-brand-text">
              No custom design requests found
            </h3>
            <p className="text-xs text-brand-muted mt-1">
              Check back as customers submit uploads via website or WhatsApp
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
