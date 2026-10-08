"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart3,
  Save,
  CheckCircle2,
  TrendingUp,
  Share2,
  ShieldCheck,
  Eye,
  Loader2,
} from "lucide-react";
import { fetchSiteSettings, updateSiteSettings } from "@/lib/admin-client";
import type { SiteSettings } from "@/types";

export default function AdminMarketingPage() {
  const [metaPixel, setMetaPixel] = useState("");
  const [metaToken, setMetaToken] = useState("");
  const [tiktokPixel, setTiktokPixel] = useState("");
  const [tiktokToken, setTiktokToken] = useState("");
  const [ga4Id, setGa4Id] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchSiteSettings();
        setMetaPixel(data.metaPixelId || "");
        setMetaToken(data.metaConversionsApiToken || "");
        setTiktokPixel(data.tiktokPixelId || "");
        setTiktokToken(data.tiktokEventsApiToken || "");
        setGa4Id(data.googleAnalyticsId || "");
      } catch (err) {
        console.error("Failed to load marketing settings:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSavedSuccess(false);
    try {
      await updateSiteSettings({
        metaPixelId: metaPixel,
        metaConversionsApiToken: metaToken,
        tiktokPixelId: tiktokPixel,
        tiktokEventsApiToken: tiktokToken,
        googleAnalyticsId: ga4Id,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch {
      alert("Failed to save pixel configuration");
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
    <div className="max-w-5xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-brand-text font-serif">
            Marketing & Tracking Pixels
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-1">
            Meta & TikTok Conversion APIs, Google Analytics 4, and server-side
            tracking
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-gold hover:bg-brand-gold-hover text-brand-bg font-semibold text-xs sm:text-sm transition-colors shadow-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? "Saving Pixels..." : "Save Tracking Keys"}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-brand-gold/10 border border-brand-gold/30 text-brand-gold text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>
            Marketing pixels updated and server-side conversion dispatchers
            active!
          </span>
        </div>
      )}

      {/* Grid: Meta & TikTok */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* TikTok Pixel (Critical for Ceylon Wall Decor) */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-brand-border pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold text-xs">
                TT
              </div>
              <div>
                <h2 className="text-sm font-semibold text-brand-text">
                  TikTok Pixel & Events API
                </h2>
                <span className="text-[11px] text-brand-muted">
                  Primary discovery channel (@ceylonwalldecor)
                </span>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-gold/10 text-brand-gold border border-brand-gold/30">
              Active
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium text-brand-muted uppercase tracking-wider mb-1.5">
              TikTok Pixel ID
            </label>
            <input
              type="text"
              placeholder="e.g. C9DK10293KDLA"
              value={tiktokPixel}
              onChange={(e) => setTiktokPixel(e.target.value)}
              className="form-input font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-brand-muted uppercase tracking-wider mb-1.5">
              TikTok Events API Access Token (Server-Side)
            </label>
            <input
              type="password"
              placeholder="••••••••••••••••••••••••••••••••••••"
              value={tiktokToken}
              onChange={(e) => setTiktokToken(e.target.value)}
              className="form-input font-mono text-xs"
            />
          </div>

          <div className="p-3 rounded-xl bg-brand-bg border border-brand-border text-xs text-brand-muted space-y-1">
            <span className="font-semibold text-brand-text block">
              Events Tracked:
            </span>
            <p>• ViewContent (Art piece details)</p>
            <p>• AddToCart & InitiateCheckout</p>
            <p>
              • PlaceAnOrder (Fires on Cash on Delivery placement with ttclid)
            </p>
          </div>
        </div>

        {/* Meta (Facebook/Instagram) Pixel */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-brand-border pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold text-xs">
                M
              </div>
              <div>
                <h2 className="text-sm font-semibold text-brand-text">
                  Meta Pixel & Conversions API
                </h2>
                <span className="text-[11px] text-brand-muted">
                  Instagram Reels & Facebook ads
                </span>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-gold/10 text-brand-gold border border-brand-gold/30">
              Active
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium text-brand-muted uppercase tracking-wider mb-1.5">
              Meta Pixel ID
            </label>
            <input
              type="text"
              placeholder="e.g. 128493029482910"
              value={metaPixel}
              onChange={(e) => setMetaPixel(e.target.value)}
              className="form-input font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-brand-muted uppercase tracking-wider mb-1.5">
              Conversions API System Token
            </label>
            <input
              type="password"
              placeholder="••••••••••••••••••••••••••••••••••••"
              value={metaToken}
              onChange={(e) => setMetaToken(e.target.value)}
              className="form-input font-mono text-xs"
            />
          </div>

          <div className="p-3 rounded-xl bg-brand-bg border border-brand-border text-xs text-brand-muted space-y-1">
            <span className="font-semibold text-brand-text block">
              De-duplication Protection:
            </span>
            <p>
              Shared event_id passed between browser and server to prevent
              duplicate purchase events on iOS 14+.
            </p>
          </div>
        </div>
      </div>

      {/* Google Analytics 4 */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 space-y-4 shadow-xl">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-text flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-brand-gold" />
          <span>Google Analytics 4 & Search Console</span>
        </h2>

        <div>
          <label className="block text-xs font-medium text-brand-muted uppercase tracking-wider mb-1.5">
            GA4 Measurement ID
          </label>
          <input
            type="text"
            placeholder="G-XXXXXXXXXX"
            value={ga4Id}
            onChange={(e) => setGa4Id(e.target.value)}
            className="form-input font-mono w-full sm:w-80"
          />
        </div>
      </div>
    </div>
  );
}
