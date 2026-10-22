"use client";

import React, { useEffect, useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap-config";
import {
  Users,
  Search,
  Download,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  Sparkles,
  Loader2,
  Calendar,
} from "lucide-react";
import { fetchCustomers } from "@/lib/admin-client";
import { formatPrice, formatDateTime, formatPhone } from "@/lib/utils";
import type { Customer } from "@/types";

export default function AdminCustomersPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState("all");

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchCustomers();
      setCustomers(data);
    } catch (err) {
      console.error("Failed to load customers:", err);
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
        const rows = document.querySelectorAll(".customer-row");
        if (rows.length > 0) {
          gsap.from(".customer-row", {
            opacity: 0,
            y: 15,
            stagger: 0.05,
            duration: 0.4,
            ease: "power2.out",
          });
        }
      }
    },
    { scope: containerRef, dependencies: [loading, filterTag] },
  );

  const filtered = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
      (c.district && c.district.toLowerCase().includes(search.toLowerCase()));

    const matchesTag =
      filterTag === "all" ||
      (filterTag === "repeat" && c.isRepeat) ||
      (filterTag === "vip" && c.totalSpent > 25000);

    return matchesSearch && matchesTag;
  });

  const exportCSV = () => {
    const headers = [
      "Name",
      "Phone",
      "Email",
      "District",
      "Orders Count",
      "Total Spent LKR",
      "Tags",
    ];
    const rows = filtered.map((c) => [
      `"${c.name || "Customer"}"`,
      `"${c.phone || ""}"`,
      `"${c.email || ""}"`,
      `"${c.district || ""}"`,
      c.orderCount || 0,
      c.totalSpent || 0,
      `"${(c.tags || []).join(", ")}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `ceylon_wall_decor_customers_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-[450px] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-accent animate-spin" />
        <p className="text-xs uppercase tracking-widest text-brand-muted">
          Loading Customer CRM...
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
            Customer Directory (CRM)
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-1">
            Built automatically from order history • LKR lifetime spend &
            remarketing audiences
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-brand-surface border border-brand-border hover:bg-brand-surface-hover hover:border-brand-accent/30 text-xs font-semibold text-brand-text transition-colors shadow-sm"
        >
          <Download className="w-4 h-4 text-brand-accent" />
          <span>Export Remarketing CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
          <input
            type="text"
            placeholder="Search by customer name, phone (078...), or district..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input !pl-11 text-xs sm:text-sm"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilterTag("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterTag === "all"
                ? "bg-brand-accent text-brand-bg font-semibold"
                : "text-brand-muted hover:text-brand-text hover:bg-brand-surface"
            }`}
          >
            All Customers ({customers.length})
          </button>
          <button
            onClick={() => setFilterTag("repeat")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterTag === "repeat"
                ? "bg-brand-accent text-brand-bg font-semibold"
                : "text-brand-muted hover:text-brand-text hover:bg-brand-surface"
            }`}
          >
            Repeat Buyers ({customers.filter((c) => c.isRepeat).length})
          </button>
          <button
            onClick={() => setFilterTag("vip")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterTag === "vip"
                ? "bg-brand-accent text-brand-bg font-semibold"
                : "text-brand-muted hover:text-brand-text hover:bg-brand-surface"
            }`}
          >
            VIP (&gt;Rs.25k)
          </button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-brand-surface rounded-2xl border border-brand-border overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Contact & WhatsApp</th>
                <th>District / Location</th>
                <th>Orders Placed</th>
                <th>Lifetime Spend (LKR)</th>
                <th>Tags</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cust) => {
                const phoneStr = cust.phone || "";
                const formattedPhone = phoneStr
                  .replace(/\D/g, "")
                  .replace(/^0/, "94");
                const waUrl = `https://wa.me/${formattedPhone}`;

                return (
                  <tr
                    key={cust.id}
                    className="customer-row hover:bg-brand-surface-hover/70 transition-colors"
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-accent/15 text-brand-accent border border-brand-accent/30 flex items-center justify-center font-bold text-xs shrink-0">
                          {cust.name ? cust.name[0] : "C"}
                        </div>
                        <div>
                          <span className="font-semibold text-brand-text text-sm block">
                            {cust.name || "Customer"}
                          </span>
                          <span className="text-[11px] text-brand-muted">
                            First order:{" "}
                            {cust.firstOrderAt
                              ? formatDateTime(cust.firstOrderAt).slice(0, 11)
                              : "Recently"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="font-mono text-xs text-brand-text block">
                        {cust.phone ? formatPhone(cust.phone) : "N/A"}
                      </span>
                      {cust.email && (
                        <span className="text-xs text-brand-muted">
                          {cust.email}
                        </span>
                      )}
                    </td>

                    <td>
                      <span className="text-xs text-brand-text font-medium block">
                        {cust.district || "Colombo"}
                      </span>
                      <span className="text-[11px] text-brand-muted truncate max-w-[160px] block">
                        {cust.address || "Sri Lanka"}
                      </span>
                    </td>

                    <td>
                      <span className="text-xs font-semibold text-brand-text">
                        {cust.orderCount || 0}{" "}
                        {(cust.orderCount || 0) === 1 ? "order" : "orders"}
                      </span>
                    </td>

                    <td>
                      <span className="font-mono font-bold text-brand-accent text-sm">
                        {formatPrice(cust.totalSpent || 0)}
                      </span>
                    </td>

                    <td>
                      <div className="flex flex-wrap gap-1">
                        {(cust.tags || ["First Time Buyer"]).map((t) => (
                          <span
                            key={t}
                            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              t.includes("Repeat")
                                ? "bg-brand-accent/10 text-brand-accent border border-brand-accent/30"
                                : t.includes("VIP")
                                  ? "bg-black/5 text-brand-text border-black/15 font-semibold"
                                  : "bg-black/5 text-brand-muted border-black/10"
                            }`}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="text-right">
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/5 hover:bg-black/10 text-brand-text border border-brand-border text-xs font-semibold transition-colors"
                      >
                        <Phone className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </a>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <Users className="w-8 h-8 text-brand-muted mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium text-brand-text">
                      No customer profiles found
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
