"use client";

import { useState, useEffect, useRef } from "react";
import { Check, Upload, Sparkles, User, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCustomerAuth } from "@/contexts/customer-auth-context";
import { imageFileError, MAX_REFERENCE_IMAGES, prepareImageUpload } from "@/lib/image-upload";

type ReferencePhoto = { id: string; file: File; preview: string };

export function CustomOrderForm() {
  const { customer, isAuthenticated } = useCustomerAuth();

  const [done, setDone] = useState(false);
  const [createdId, setCreatedId] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [width, setWidth] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [framePreference, setFramePreference] = useState("Without frame");
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<ReferencePhoto[]>([]);
  const [progress, setProgress] = useState("");
  const previews = useRef(new Set<string>());
  const uploaded = useRef(new Map<string, string>());
  const fileInput = useRef<HTMLInputElement>(null);
  useEffect(() => () => { previews.current.forEach(url => URL.revokeObjectURL(url)); }, []);

  const selectPhotos = (files: File[]) => {
    setErrorMsg("");
    if (photos.length + files.length > MAX_REFERENCE_IMAGES) { setErrorMsg(`Choose up to ${MAX_REFERENCE_IMAGES} reference photos.`); return; }
    const invalid = files.map(file => imageFileError(file)).find(Boolean);
    if (invalid) { setErrorMsg(invalid); return; }
    setPhotos(current => [...current, ...files.map(file => {
      const preview = URL.createObjectURL(file);
      previews.current.add(preview);
      return { id: crypto.randomUUID(), file, preview };
    })]);
  };

  const removePhoto = (photo: ReferencePhoto) => {
    URL.revokeObjectURL(photo.preview);
    previews.current.delete(photo.preview);
    uploaded.current.delete(photo.id);
    setPhotos(current => current.filter(item => item.id !== photo.id));
  };

  useEffect(() => {
    if (customer) {
      if (customer.name) setName(customer.name);
      if (customer.phone) setPhone(customer.phone);
      if (customer.email) setEmail(customer.email);
    }
  }, [customer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setBusy(true);

    try {
      const designUploadUrls: string[] = [];
      for (const [index, photo] of photos.entries()) {
        setProgress(`Uploading photo ${index + 1} of ${photos.length}…`);
        let url = uploaded.current.get(photo.id);
        if (!url) {
          const body = new FormData();
          body.append('file', await prepareImageUpload(photo.file));
          body.append('folder', 'ceylon-wall-decor/custom-requests');
          body.append('applyNoise', 'false');
          const response = await fetch('/api/upload', { method: 'POST', body });
          const result = await response.json().catch(() => null);
          if (!response.ok || !result?.success || !result.data?.url) throw new Error(result?.error || `Could not upload ${photo.file.name}. Please try again.`);
          url = result.data.url as string;
          uploaded.current.set(photo.id, url);
        }
        designUploadUrls.push(url);
      }
      setProgress('Submitting request…');
      const payload = {
        customerName: name.trim(),
        customerPhone: phone.trim(),
        customerEmail: email.trim() || undefined,
        sizeWidth: width ? parseFloat(width) : undefined,
        sizeHeight: height ? parseFloat(height) : undefined,
        sizeLabel: width && height ? `${width}×${height} in` : "Custom Size",
        framePreference,
        notes: notes.trim(),
        designUploadUrls,
      };

      const res = await fetch("/api/custom-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success || !data.data?.id) {
        throw new Error(data.error || "Failed to submit custom request");
      }

      setCreatedId(data.data.id);
      photos.forEach(photo => URL.revokeObjectURL(photo.preview));
      previews.current.clear();
      uploaded.current.clear();
      setPhotos([]);
      setDone(true);
    } catch (err: any) {
      console.error("Custom request error:", err);
      setErrorMsg(
        err?.message ||
          "Failed to submit request. Please check that phone is 10 digits (07XXXXXXXX).",
      );
    } finally {
      setBusy(false);
      setProgress("");
    }
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-[#EBE8E4] bg-white p-10 text-center max-w-2xl mx-auto shadow-[0_1px_2px_rgba(0,0,0,0.02)] my-8">
        <div className="mx-auto size-14 rounded-full grid place-items-center bg-[var(--store-accent)] text-black">
          <Check size={28} />
        </div>
        <p className="eyebrow mt-6 text-[#777169]">Bespoke Order Desk</p>
        <h2 className="mt-2 text-3xl font-light text-[#000000] tracking-[-0.03em]">
          Request Received
        </h2>
        <p className="mt-3 text-sm text-[#59544F] leading-relaxed max-w-md mx-auto">
          Our studio artisans have received your custom artwork request. We
          will prepare dimensional mockups and WhatsApp or email you a quote
          within 24 hours.
        </p>
        <p className="mt-3 text-xs text-[#59544F]">Reference: {createdId}</p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          {isAuthenticated ? (
            <Link href="/account" className="btn btn-accent text-xs">
              View in My Account
            </Link>
          ) : (
            <Link href="/shop" className="btn btn-accent text-xs">
              Explore Collection
            </Link>
          )}
          <button
            onClick={() => {
              setDone(false);
              setNotes("");
              setWidth("");
              setHeight("");
            }}
            className="btn btn-outline text-xs"
          >
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-6 my-8">
      {/* Logged in indicator */}
      {!isAuthenticated ? (
        <div className="rounded-2xl border border-[#EBE8E4] bg-[#F5F3F1] p-4 flex flex-wrap gap-3 items-center justify-between text-xs">
          <span className="text-[#59544F] flex items-center gap-2">
            <User size={15} className="text-[var(--store-accent-ink)]" />
            Have an account with Ceylon Wall Decor?
          </span>
          <Link
            href="/account/login?redirect=/custom-order"
            className="font-medium text-[#000000] underline hover:text-[var(--store-accent-ink)]"
          >
            Sign In to track your quote in Account →
          </Link>
        </div>
      ) : (
        <div className="text-xs text-[var(--store-accent-ink)] flex items-center gap-1.5 pb-1 font-medium">
          <Check size={14} /> Signed in as {customer?.name}. This request will
          link directly to your account.
        </div>
      )}

      {errorMsg && (
        <div role="alert" className="p-3.5 rounded-xl border border-[#000000] bg-[#F5F3F1] text-xs text-[#000000]">
          {errorMsg}
        </div>
      )}

      <div className="p-6 rounded-2xl border border-[#EBE8E4] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-4">
        <div>
          <p className="eyebrow text-[#777169]">1. Contact Information</p>
          <h3 className="text-lg font-light text-[#000000] mt-1 tracking-[-0.01em]">Your Details</h3>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input text-xs"
            placeholder="Your full name *"
          />
          <input
            required
            pattern="0[0-9]{9}"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input text-xs"
            placeholder="Phone · 07XXXXXXXX *"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input text-xs md:col-span-2"
            placeholder="Email address (optional)"
          />
        </div>
      </div>

      {/* Files are uploaded before the request is submitted. */}
      <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#EBE8E4] bg-[#F5F3F1] hover:bg-white hover:border-black transition-all text-center p-8">
        <Upload size={22} className="text-[var(--store-accent-ink)]" />
        <span className="mt-2 text-sm text-[#000000]">
          {photos.length > 0
            ? `${photos.length} image(s) selected — add more`
            : "Upload reference photos or room wallpaper"}
        </span>
        <small className="text-xs text-[#777169] mt-1">
          Up to 5 PNG, JPG or WEBP photos, 10MB each
        </small>
        <input
          type="file"
          ref={fileInput}
          aria-label="Reference photos"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={busy}
          onChange={(e) => { selectPhotos(Array.from(e.target.files || [])); e.target.value = ''; }}
          className="sr-only"
        />
      </label>
      {photos.length > 0 && <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2" aria-label="Selected reference photos">
        {photos.map(photo => <li key={photo.id} className="flex min-w-0 items-center gap-3 rounded-xl border border-[#EBE8E4] bg-white p-3">
          <Image src={photo.preview} alt={`Reference: ${photo.file.name}`} width={64} height={64} unoptimized className="size-16 rounded-lg object-cover" />
          <span className="min-w-0 flex-1 truncate text-xs">{photo.file.name}</span>
          <button type="button" disabled={busy} aria-label={`Remove ${photo.file.name}`} onClick={() => removePhoto(photo)} className="p-3"><X size={16} /></button>
        </li>)}
      </ul>}

      {/* Dimensions & Framing */}
      <div className="p-6 rounded-2xl border border-[#EBE8E4] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-4">
        <div>
          <p className="eyebrow text-[#777169]">2. Custom Specifications</p>
          <h3 className="text-lg font-light text-[#000000] mt-1 tracking-[-0.01em]">Dimensions &amp; Finish</h3>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <input
            type="number"
            min="4"
            max="120"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            className="input text-xs"
            placeholder="Width (inches)"
          />
          <input
            type="number"
            min="4"
            max="120"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="input text-xs"
            placeholder="Height (inches)"
          />
          <select
            value={framePreference}
            onChange={(e) => setFramePreference(e.target.value)}
            className="input text-xs"
          >
            <option value="Without frame">Without frame</option>
            <option value="With frame">With frame</option>
            <option value="Help me choose">Help me choose</option>
          </select>
        </div>

        <textarea
          required
          minLength={8}
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="input text-xs min-h-32"
          placeholder="Tell us about the textures, colour palette, room wall surface, or style you envision…"
        />
      </div>

      <button
        type="submit"
        disabled={busy}
        className="btn btn-accent w-full justify-center disabled:opacity-50 text-xs font-medium"
      >
        {busy ? progress || "Preparing photos…" : "Submit Bespoke Request"}
        <Sparkles size={14} />
      </button>
      {busy && <p role="status" className="text-center text-xs">{progress}</p>}

      <p className="text-[11px] text-[#777169] text-center">
        No payment required now. Custom pieces are quoted upfront with free WhatsApp consultation.
      </p>
    </form>
  );
}
