"use client";

import { useState } from "react";
import { Check, Loader2, AlertCircle } from "lucide-react";

export function SimpleForm() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          contact: contact.trim(),
          subject: subject.trim() || undefined,
          message: message.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to send message. Please try again.");
      }

      setSent(true);
      setName("");
      setContact("");
      setSubject("");
      setMessage("");
    } catch (err: any) {
      console.error("SimpleForm submit error:", err);
      setError(err?.message || "Something went wrong. Please try again or WhatsApp us directly.");
    } finally {
      setLoading(false);
    }
  };

  if (sent)
    return (
      <div className="rounded-2xl border border-[var(--store-accent-border)] bg-[#F5F3F1] p-8 max-w-xl text-center space-y-3">
        <div className="mx-auto size-12 rounded-full grid place-items-center bg-[var(--store-accent)] text-black">
          <Check size={22} />
        </div>
        <h3 className="text-lg font-light text-[#000000]">Message Received</h3>
        <p className="text-xs text-[#59544F] leading-relaxed">
          Thank you — your inquiry has been logged in our studio inbox. Our artisan team will review and contact you within 24 hours.
        </p>
        <button
          onClick={() => setSent(false)}
          className="mt-3 text-xs underline uppercase tracking-wider text-[var(--store-accent-ink)] hover:text-black transition-colors"
        >
          Send another message
        </button>
      </div>
    );

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl p-6 sm:p-8 rounded-2xl border border-[#EBE8E4] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-4"
    >
      {error && (
        <div className="flex items-center gap-2 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="block text-[11px] uppercase tracking-[0.05em] text-[#777169] mb-1.5 font-medium">
          Your Name *
        </label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input text-xs"
          placeholder="Kasun Fernando"
        />
      </div>

      <div>
        <label className="block text-[11px] uppercase tracking-[0.05em] text-[#777169] mb-1.5 font-medium">
          Phone Number or Email *
        </label>
        <input
          required
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          className="input text-xs"
          placeholder="07XXXXXXXX or name@email.com"
        />
      </div>

      <div>
        <label className="block text-[11px] uppercase tracking-[0.05em] text-[#777169] mb-1.5 font-medium">
          Subject / Inquiry Topic
        </label>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="input text-xs"
          placeholder="e.g. Custom size for Quiet Contour or Delivery time"
        />
      </div>

      <div>
        <label className="block text-[11px] uppercase tracking-[0.05em] text-[#777169] mb-1.5 font-medium">
          Your Message *
        </label>
        <textarea
          required
          minLength={5}
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="input text-xs min-h-28"
          placeholder="How can our studio assist you with textured wall art?"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn btn-accent w-full justify-center text-xs font-medium flex items-center gap-2"
      >
        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        <span>{loading ? "Sending Message..." : "Send Inquiry"}</span>
      </button>
    </form>
  );
}

