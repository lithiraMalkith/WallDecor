"use client";

import React, { useEffect, useState } from "react";
import {
  Truck,
  Save,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  Clock,
  ShieldCheck,
  Plus,
  Loader2,
} from "lucide-react";
import { fetchSiteSettings, updateSiteSettings } from "@/lib/admin-client";
import { formatPrice } from "@/lib/utils";
import type { SiteSettings, DeliveryZone } from "@/types";

export default function AdminDeliveryPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [freeThreshold, setFreeThreshold] = useState<number>(15000);
  const [codEnabled, setCodEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchSiteSettings();
        setSettings(data);
        setZones(data.deliveryZones || []);
        setFreeThreshold(data.freeDeliveryThreshold || 15000);
        setCodEnabled(data.codEnabled);
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleZoneFeeChange = (district: string, newFee: number) => {
    setZones((prev) =>
      prev.map((z) => (z.district === district ? { ...z, fee: newFee } : z)),
    );
  };

  const handleZoneDaysChange = (district: string, newDays: string) => {
    setZones((prev) =>
      prev.map((z) =>
        z.district === district ? { ...z, estimatedDays: newDays } : z,
      ),
    );
  };

  const handleToggleZone = (district: string) => {
    setZones((prev) =>
      prev.map((z) =>
        z.district === district ? { ...z, isActive: !z.isActive } : z,
      ),
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSavedSuccess(false);
    try {
      await updateSiteSettings({
        deliveryZones: zones,
        freeDeliveryThreshold: freeThreshold,
        codEnabled,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert("Failed to save delivery parameters");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[450px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-brand-text font-serif">
            Delivery Zones & COD Settings
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-1">
            Configure courier fees and transit estimates across all 25 Sri
            Lankan districts
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-gold hover:bg-brand-gold-hover text-brand-bg font-semibold text-xs sm:text-sm transition-colors shadow-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? "Saving Parameters..." : "Save Settings"}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-brand-gold/10 border border-brand-gold/30 text-brand-gold text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Delivery rules and COD threshold updated successfully!</span>
        </div>
      )}

      {/* Top Global Rules Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Free Delivery Threshold */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
              Free Delivery Threshold
            </span>
            <DollarSign className="w-4 h-4 text-brand-gold" />
          </div>
          <p className="text-xs text-brand-muted">
            Orders above this cart value receive 100% free island-wide delivery.
          </p>
          <div className="flex items-center pt-2">
            <span className="text-xs font-bold text-brand-gold px-3 py-2 bg-brand-bg rounded-l-lg border border-brand-border">
              Rs.
            </span>
            <input
              type="number"
              step={500}
              value={freeThreshold}
              onChange={(e) => setFreeThreshold(Number(e.target.value))}
              className="form-input rounded-l-none text-base font-bold font-mono"
            />
          </div>
        </div>

        {/* Cash on Delivery (COD) Master Toggle */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 space-y-3 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
                Cash on Delivery (COD) Checkout
              </span>
              <ShieldCheck className="w-4 h-4 text-brand-gold" />
            </div>
            <p className="text-xs text-brand-muted mt-2">
              Enable customer doorstep cash payment upon delivery. Orders will
              default to payment status "Pending – collect on delivery".
            </p>
          </div>

          <label className="flex items-center gap-3 cursor-pointer pt-3 border-t border-brand-border">
            <input
              type="checkbox"
              checked={codEnabled}
              onChange={(e) => setCodEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-brand-gold"
            />
            <span className="text-xs font-semibold text-brand-text">
              Accept Cash on Delivery in Storefront Checkout
            </span>
          </label>
        </div>
      </div>

      {/* 25 Districts Table */}
      <div className="bg-brand-surface rounded-2xl border border-brand-border overflow-hidden shadow-xl">
        <div className="p-5 border-b border-brand-border flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-brand-text">
              All 25 Sri Lankan Districts
            </h2>
            <p className="text-xs text-brand-muted">
              Configure zone shipping fee and courier transit time per district
            </p>
          </div>
          <span className="text-xs font-mono text-brand-gold bg-brand-gold/10 px-2.5 py-1 rounded border border-brand-gold/20">
            25 Districts Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>District Name</th>
                <th>Standard Delivery Fee (LKR)</th>
                <th>Estimated Transit Days</th>
                <th>Service Status</th>
              </tr>
            </thead>
            <tbody>
              {zones.map((z) => (
                <tr
                  key={z.district}
                  className="hover:bg-brand-surface-hover/70 transition-colors"
                >
                  <td>
                    <span className="font-semibold text-brand-text text-sm">
                      {z.district}
                    </span>
                  </td>

                  <td>
                    <div className="flex items-center w-36">
                      <span className="text-xs font-bold text-brand-muted px-2 py-1 bg-brand-bg rounded-l border border-brand-border">
                        Rs.
                      </span>
                      <input
                        type="number"
                        step={50}
                        value={z.fee}
                        onChange={(e) =>
                          handleZoneFeeChange(
                            z.district,
                            Number(e.target.value),
                          )
                        }
                        className="form-input rounded-l-none text-xs font-mono font-bold py-1 w-24"
                      />
                    </div>
                  </td>

                  <td>
                    <input
                      type="text"
                      value={z.estimatedDays}
                      onChange={(e) =>
                        handleZoneDaysChange(z.district, e.target.value)
                      }
                      className="form-input text-xs py-1 w-32"
                    />
                  </td>

                  <td>
                    <button
                      type="button"
                      onClick={() => handleToggleZone(z.district)}
                      className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                        z.isActive
                          ? "bg-brand-gold/10 text-brand-gold border border-brand-gold/30"
                          : "bg-black/5 text-brand-muted border-black/10"
                      }`}
                    >
                      {z.isActive ? "Active" : "Disabled"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
