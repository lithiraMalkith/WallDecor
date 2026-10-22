"use client";

import React, { useState } from "react";
import {
  Mail,
  Send,
  Save,
  CheckCircle2,
  Clock,
  Eye,
  RefreshCw,
  Sparkles,
} from "lucide-react";

interface Template {
  id: string;
  name: string;
  trigger: string;
  subject: string;
  body: string;
}

const TEMPLATES: Template[] = [
  {
    id: "tpl_order_placed",
    name: "Customer Order Confirmation (COD)",
    trigger: "Automatically on website checkout",
    subject: "Order Confirmed: {orderRef} — Ceylon Wall Decor",
    body: "Hi {customerName},\n\nThank you for ordering handcrafted textured wall art from Ceylon Wall Decor!\n\nOrder Ref: {orderRef}\nItems: {itemSummary}\nPayment: Cash on Delivery ({totalPrice})\nDelivery Address: {address}, {city}\n\nOur studio team will verify your order on WhatsApp before starting production. Lead time is 5-7 business days.\n\nWarm regards,\nCeylon Wall Decor Studio",
  },
  {
    id: "tpl_order_dispatched",
    name: "Order Dispatched with Courier Tracking",
    trigger: "When staff moves order to Dispatched",
    subject: "Your Art Piece Has Shipped! Tracking: {trackingNumber}",
    body: "Hi {customerName},\n\nExciting news! Your textured artwork ({orderRef}) has passed quality check and is on its way via {courierName}.\n\nTracking Number: {trackingNumber}\nPlease have {totalPrice} cash ready for the courier agent upon delivery.\n\nEnjoy your new wall décor!",
  },
  {
    id: "tpl_custom_quote",
    name: "Custom Design Quote Provided",
    trigger: "When staff provides custom quote",
    subject: "Quote for Your Custom Wall Art Request — Ceylon Wall Decor",
    body: "Hi {customerName},\n\nWe have reviewed your custom design reference for size {dimensions}.\n\nQuoted Price: {quotedPrice} (includes texture plaster sculpting & framing).\nProduction Timeline: 5-7 days.\n\nReply directly to this email or on WhatsApp (078 2518184) to proceed.",
  },
];

const SAMPLE_LOGS = [
  {
    id: "log_01",
    to: "niluka.s@gmail.com",
    subject: "Order Confirmed: CWD-000101",
    status: "sent",
    time: "Today, 8:15 AM",
  },
  {
    id: "log_02",
    to: "charith.w@outlook.com",
    subject: "Order Confirmed: CWD-000102",
    status: "sent",
    time: "Yesterday, 2:20 PM",
  },
  {
    id: "log_03",
    to: "dilshan.f@yahoo.com",
    subject: "Your Art Piece Has Shipped! Tracking: DMX-982314",
    status: "sent",
    time: "30 Sep, 10:30 AM",
  },
  {
    id: "log_04",
    to: "minoli.p@gmail.com",
    subject: "Custom Wall Art Request Received",
    status: "sent",
    time: "29 Sep, 9:15 AM",
  },
];

export default function AdminNotificationsPage() {
  const [selectedTpl, setSelectedTpl] = useState<Template>(TEMPLATES[0]);
  const [subject, setSubject] = useState(TEMPLATES[0].subject);
  const [body, setBody] = useState(TEMPLATES[0].body);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSelect = (tpl: Template) => {
    setSelectedTpl(tpl);
    setSubject(tpl.subject);
    setBody(tpl.body);
  };

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-brand-text font-serif">
            Email Notifications & Templates
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-1">
            Customize automated Brevo / Resend transactional emails & view send
            logs
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-accent hover:bg-brand-accent-hover text-brand-bg font-semibold text-xs sm:text-sm transition-colors shadow-sm"
        >
          <Save className="w-4 h-4" />
          <span>Save Email Template</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-brand-accent/10 border border-brand-accent/30 text-brand-accent text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Email template saved successfully!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template List Selector */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
            Transactional Templates
          </h2>

          <div className="space-y-2">
            {TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => handleSelect(tpl)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedTpl.id === tpl.id
                    ? "bg-brand-accent/15 border-brand-accent text-brand-text shadow-sm"
                    : "bg-brand-surface border-brand-border text-brand-muted hover:text-brand-text hover:bg-brand-surface-hover"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-brand-text">
                    {tpl.name}
                  </span>
                  <Mail className="w-3.5 h-3.5 text-brand-accent" />
                </div>
                <p className="text-[11px] text-brand-muted mt-1">
                  {tpl.trigger}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Template Editor */}
        <div className="lg:col-span-2 bg-brand-surface border border-brand-border rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-brand-border pb-3">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-text">
                {selectedTpl.name}
              </h2>
              <span className="text-xs text-brand-muted">
                Trigger: {selectedTpl.trigger}
              </span>
            </div>
            <span className="text-[11px] font-mono text-brand-accent bg-brand-bg px-2 py-0.5 rounded border border-brand-border">
              Brevo / Resend SDK
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium text-brand-muted uppercase tracking-wider mb-1.5">
              Email Subject Line
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="form-input font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-brand-muted uppercase tracking-wider mb-1.5">
              Email Message Body
            </label>
            <textarea
              rows={10}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="form-input font-mono text-xs leading-relaxed"
            />
          </div>

          <div className="p-3 rounded-xl bg-brand-bg border border-brand-border text-xs text-brand-muted space-y-1">
            <span className="font-semibold text-brand-text block">
              Available Dynamic Variables:
            </span>
            <p className="font-mono text-[11px] text-brand-accent">
              {"{customerName}"}, {"{orderRef}"}, {"{totalPrice}"},{" "}
              {"{courierName}"}, {"{trackingNumber}"}, {"{address}"}, {"{city}"}
            </p>
          </div>
        </div>
      </div>

      {/* Email Send Log */}
      <div className="bg-brand-surface rounded-2xl border border-brand-border overflow-hidden shadow-xl">
        <div className="p-5 border-b border-brand-border flex items-center justify-between">
          <h2 className="text-base font-semibold text-brand-text">
            Transactional Transmission Log
          </h2>
          <span className="text-xs text-brand-muted">
            All system emails logged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Recipient</th>
                <th>Subject Line</th>
                <th>Status</th>
                <th>Time Sent</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_LOGS.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-brand-surface-hover/70 transition-colors"
                >
                  <td>
                    <span className="font-medium text-brand-text text-xs">
                      {log.to}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs text-brand-text line-clamp-1">
                      {log.subject}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-brand-accent/10 text-brand-accent border border-brand-accent/30">
                      Delivered
                    </span>
                  </td>
                  <td>
                    <span className="text-xs text-brand-muted font-mono">
                      {log.time}
                    </span>
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
