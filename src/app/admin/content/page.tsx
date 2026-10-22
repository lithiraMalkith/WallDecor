"use client";

import React, { useEffect, useState } from "react";
import {
  FileText,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  HelpCircle,
  Sparkles,
  Loader2,
} from "lucide-react";
import { fetchSiteSettings, updateSiteSettings } from "@/lib/admin-client";
import type { SiteSettings } from "@/types";

export default function AdminContentPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [aboutText, setAboutText] = useState("");
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([]);
  const [heroHeading, setHeroHeading] = useState(
    "Tactile Minimalist Relief Art for Sri Lankan Homes",
  );
  const [heroSub, setHeroSub] = useState(
    "Hand-sculpted in Colombo using natural mineral plaster. Standard and custom sizes with island-wide Cash on Delivery.",
  );
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchSiteSettings();
        setSettings(data);
        setAboutText(data.aboutContent || "");
        setFaqs(data.faqEntries || []);
      } catch (err) {
        console.error("Failed to load content settings:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleAddFaq = () => {
    setFaqs((prev) => [
      ...prev,
      { question: "New Question", answer: "Enter answer details here..." },
    ]);
  };

  const handleUpdateFaq = (
    idx: number,
    field: "question" | "answer",
    value: string,
  ) => {
    setFaqs((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const handleRemoveFaq = (idx: number) => {
    setFaqs((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSavedSuccess(false);
    try {
      await updateSiteSettings({
        aboutContent: aboutText,
        faqEntries: faqs,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch {
      alert("Failed to save content");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[450px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-brand-text font-serif">
            Content & Media CMS
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-1">
            Manage storefront hero messaging, FAQ accordions, brand story, and
            policies
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-accent hover:bg-brand-accent-hover text-brand-bg font-semibold text-xs sm:text-sm transition-colors shadow-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? "Publishing Changes..." : "Save CMS Content"}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-brand-accent/10 border border-brand-accent/30 text-brand-accent text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>
            Content blocks saved and synchronized across the storefront!
          </span>
        </div>
      )}

      {/* Hero Headline Editor */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 space-y-4 shadow-xl">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-text flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-accent" />
          <span>Homepage Hero Section</span>
        </h2>

        <div>
          <label className="block text-xs font-medium text-brand-muted uppercase tracking-wider mb-1.5">
            Main Eyebrow & Hero Heading
          </label>
          <input
            type="text"
            value={heroHeading}
            onChange={(e) => setHeroHeading(e.target.value)}
            className="form-input text-base font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-brand-muted uppercase tracking-wider mb-1.5">
            Hero Subtitle / Supporting Copy
          </label>
          <textarea
            rows={2}
            value={heroSub}
            onChange={(e) => setHeroSub(e.target.value)}
            className="form-input"
          />
        </div>
      </div>

      {/* About Brand Story */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 space-y-4 shadow-xl">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-text flex items-center gap-2">
          <FileText className="w-4 h-4 text-brand-accent" />
          <span>Brand Story & "How It's Made"</span>
        </h2>

        <textarea
          rows={5}
          value={aboutText}
          onChange={(e) => setAboutText(e.target.value)}
          placeholder="Share Ceylon Wall Decor craftsmanship story..."
          className="form-input leading-relaxed"
        />
      </div>

      {/* FAQ Entries */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-brand-border pb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-text flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-brand-accent" />
            <span>Store FAQ Entries</span>
          </h2>
          <button
            onClick={handleAddFaq}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-bg hover:bg-brand-surface-hover border border-brand-border text-xs font-semibold text-brand-accent transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add FAQ</span>
          </button>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-brand-bg border border-brand-border space-y-2 relative"
            >
              <button
                onClick={() => handleRemoveFaq(idx)}
                className="absolute top-3 right-3 text-brand-muted hover:text-brand-danger p-1"
                title="Remove FAQ"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div>
                <label className="block text-[11px] font-semibold text-brand-muted uppercase tracking-wider mb-1">
                  Question #{idx + 1}
                </label>
                <input
                  type="text"
                  value={faq.question}
                  onChange={(e) =>
                    handleUpdateFaq(idx, "question", e.target.value)
                  }
                  className="form-input text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-brand-muted uppercase tracking-wider mb-1">
                  Answer
                </label>
                <textarea
                  rows={2}
                  value={faq.answer}
                  onChange={(e) =>
                    handleUpdateFaq(idx, "answer", e.target.value)
                  }
                  className="form-input text-xs"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
