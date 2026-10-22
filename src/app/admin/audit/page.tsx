"use client";

import React, { useEffect, useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap-config";
import {
  History,
  Search,
  ShieldCheck,
  Clock,
  User,
  Filter,
  Loader2,
} from "lucide-react";
import { fetchAuditLogs } from "@/lib/admin-client";
import { formatDateTime } from "@/lib/utils";
import type { AuditLog } from "@/types";

export default function AdminAuditPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
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
        gsap.from(".audit-row", {
          opacity: 0,
          y: 12,
          stagger: 0.04,
          duration: 0.35,
          ease: "power2.out",
        });
      }
    },
    { scope: containerRef, dependencies: [loading] },
  );

  const filtered = logs.filter(
    (l) =>
      l.details.toLowerCase().includes(search.toLowerCase()) ||
      l.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.entityId.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="min-h-[450px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-accent animate-spin" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="max-w-6xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-brand-text font-serif">
            Activity Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-1">
            Immutable system event logs for order status changes, price
            adjustments, and administrative actions
          </p>
        </div>

        <span className="text-xs font-mono text-brand-accent bg-brand-accent/10 border border-brand-accent/20 px-3 py-1.5 rounded-lg">
          {logs.length} Total Audit Records
        </span>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
        <input
          type="text"
          placeholder="Search by staff email, action, order ref, or details..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input !pl-11 text-xs sm:text-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-brand-surface rounded-2xl border border-brand-border overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Staff Account & Role</th>
                <th>Action Type</th>
                <th>Entity Reference</th>
                <th>Operation Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  className="audit-row hover:bg-brand-surface-hover/70 transition-colors"
                >
                  <td>
                    <span className="font-mono text-xs text-brand-muted block">
                      {formatDateTime(item.timestamp)}
                    </span>
                  </td>

                  <td>
                    <span className="font-semibold text-brand-text text-xs block">
                      {item.userEmail}
                    </span>
                    <span className="text-[10px] uppercase font-mono text-brand-accent">
                      {item.userRole}
                    </span>
                  </td>

                  <td>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-brand-bg border border-brand-border text-brand-text">
                      {item.action}
                    </span>
                  </td>

                  <td>
                    <span className="font-mono text-xs text-brand-accent">
                      {item.entityId}
                    </span>
                  </td>

                  <td>
                    <span className="text-xs text-brand-text font-medium leading-relaxed">
                      {item.details}
                    </span>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-12 text-xs text-brand-muted"
                  >
                    No matching audit trail logs found.
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
