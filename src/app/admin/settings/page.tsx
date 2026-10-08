"use client";

import React, { useEffect, useState } from "react";
import {
  Settings,
  Save,
  CheckCircle2,
  DollarSign,
  Phone,
  Mail,
  Share2,
  Sparkles,
  Loader2,
} from "lucide-react";
import { fetchSiteSettings, updateSiteSettings } from "@/lib/admin-client";
import { formatPrice } from "@/lib/utils";
import type { SiteSettings } from "@/types";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [siteName, setSiteName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [frameRate, setFrameRate] = useState(6);
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [instaUrl, setInstaUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchSiteSettings();
        setSettings(data);
        setSiteName(data.siteName);
        setOwnerEmail(data.ownerEmail);
        setOwnerPhone(data.ownerPhone);
        setWhatsapp(data.whatsappNumber);
        setFrameRate(data.framePricePerSqInch || 6);
        setTiktokUrl(data.socialLinks?.tiktok || "");
        setInstaUrl(data.socialLinks?.instagram || "");
      } catch (err) {
        console.error("Failed to load settings:", err);
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
        siteName,
        ownerEmail,
        ownerPhone,
        whatsappNumber: whatsapp,
        framePricePerSqInch: frameRate,
        socialLinks: {
          tiktok: tiktokUrl,
          instagram: instaUrl,
        },
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch {
      alert("Failed to save settings");
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
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-brand-text font-serif">
            Store & Studio Configuration
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-1">
            Global business parameters, default framing formula, and direct
            customer contacts
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-gold hover:bg-brand-gold-hover text-brand-bg font-semibold text-xs sm:text-sm transition-colors shadow-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? "Updating..." : "Save Settings"}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-brand-gold/10 border border-brand-gold/30 text-brand-gold text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Global store settings and framing parameters updated!</span>
        </div>
      )}

      {/* Frame Pricing Formula Configuration */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-brand-border pb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-text flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-brand-gold" />
            <span>Global Frame Pricing Formula</span>
          </h2>
          <span className="text-xs font-mono text-brand-gold bg-brand-bg px-2.5 py-1 rounded border border-brand-border">
            Area × Rate Formula
          </span>
        </div>

        <p className="text-xs text-brand-muted">
          Sets the default baseline rate per square inch used for calculating
          wooden floater frame add-on pricing across all standard and custom
          size artworks.
        </p>

        <div className="max-w-xs">
          <label className="block text-xs font-medium text-brand-muted uppercase tracking-wider mb-1.5">
            Default Frame Rate per Square Inch (LKR)
          </label>
          <div className="flex items-center">
            <span className="text-xs font-bold text-brand-gold px-3 py-2 bg-brand-bg rounded-l-lg border border-brand-border">
              Rs.
            </span>
            <input
              type="number"
              min={1}
              max={25}
              value={frameRate}
              onChange={(e) => setFrameRate(Number(e.target.value))}
              className="form-input rounded-l-none text-base font-bold font-mono"
            />
          </div>
          <p className="text-[11px] text-brand-muted mt-1">
            Example: 12×12" piece = 144 sq in × Rs. {frameRate} ={" "}
            {formatPrice(144 * frameRate)} frame addon.
          </p>
        </div>
      </div>

      {/* Business Contacts */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 space-y-4 shadow-xl">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-text flex items-center gap-2">
          <Phone className="w-4 h-4 text-brand-gold" />
          <span>Customer Contact & Direct WhatsApp</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-brand-muted uppercase tracking-wider mb-1.5">
              Official WhatsApp Direct Number
            </label>
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="e.g. 94782518184"
              className="form-input font-mono"
            />
            <p className="text-[11px] text-brand-muted mt-1">
              Format: 94782518184 (with country code)
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-brand-muted uppercase tracking-wider mb-1.5">
              Customer Call Helpline
            </label>
            <input
              type="text"
              value={ownerPhone}
              onChange={(e) => setOwnerPhone(e.target.value)}
              placeholder="078 2518184"
              className="form-input font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-brand-muted uppercase tracking-wider mb-1.5">
              Studio Owner Email
            </label>
            <input
              type="email"
              value={ownerEmail}
              onChange={(e) => setOwnerEmail(e.target.value)}
              className="form-input"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-brand-muted uppercase tracking-wider mb-1.5">
              Store Brand Title
            </label>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="form-input"
            />
          </div>
        </div>
      </div>

      {/* Social Profiles */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 space-y-4 shadow-xl">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-text flex items-center gap-2">
          <Share2 className="w-4 h-4 text-brand-gold" />
          <span>Official Social Media Channels</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-brand-muted uppercase tracking-wider mb-1.5">
              TikTok Profile Link
            </label>
            <input
              type="url"
              value={tiktokUrl}
              onChange={(e) => setTiktokUrl(e.target.value)}
              placeholder="https://www.tiktok.com/@ceylonwalldecor"
              className="form-input"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-brand-muted uppercase tracking-wider mb-1.5">
              Instagram Profile Link
            </label>
            <input
              type="url"
              value={instaUrl}
              onChange={(e) => setInstaUrl(e.target.value)}
              placeholder="https://www.instagram.com/ceylonwalldecor"
              className="form-input"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
