"use client";

import React, { useEffect, useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap-config";
import {
  MessageSquare,
  Search,
  CheckCircle2,
  Trash2,
  Loader2,
  Phone,
  Mail,
  Plus,
  X,
  Clock,
  Send,
  ExternalLink,
  MessageCircle,
  FileEdit,
  Archive,
} from "lucide-react";
import {
  fetchMessages,
  createMessage,
  updateMessage,
  deleteMessage,
} from "@/lib/admin-client";
import { formatDateTime } from "@/lib/utils";
import type { UserMessage, MessageStatus } from "@/types";

export default function AdminMessagesPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedMessage, setSelectedMessage] = useState<UserMessage | null>(null);

  // Add Message Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    subject: "",
    message: "",
  });

  // Notes editing state
  const [adminNotesInput, setAdminNotesInput] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchMessages();
      setMessages(data);
    } catch (err) {
      console.error("Failed to load messages:", err);
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
        gsap.from(".message-item", {
          opacity: 0,
          y: 12,
          stagger: 0.04,
          duration: 0.35,
          ease: "power2.out",
        });
      }
    },
    { scope: containerRef, dependencies: [loading, statusFilter] }
  );

  const handleUpdateStatus = async (id: string, newStatus: MessageStatus) => {
    try {
      const updated = await updateMessage(id, {
        status: newStatus,
        repliedAt: newStatus === "replied" ? new Date().toISOString() : undefined,
      });
      setMessages((prev) => prev.map((m) => (m.id === id ? updated : m)));
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage(updated);
      }
    } catch {
      alert("Failed to update status");
    }
  };

  const handleSaveNotes = async (id: string) => {
    try {
      const updated = await updateMessage(id, {
        adminNotes: adminNotesInput,
      });
      setMessages((prev) => prev.map((m) => (m.id === id ? updated : m)));
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage(updated);
      }
      alert("Note saved successfully.");
    } catch {
      alert("Failed to save note");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      await deleteMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
    } catch {
      alert("Failed to delete message");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.contact.trim() || !formData.message.trim()) {
      alert("Please fill in name, contact, and message.");
      return;
    }

    setSubmitting(true);
    try {
      const newMsg = await createMessage({
        name: formData.name.trim(),
        contact: formData.contact.trim(),
        subject: formData.subject.trim() || "Manual Inquiry Log",
        message: formData.message.trim(),
        status: "unread",
      });

      setMessages((prev) => [newMsg, ...prev]);
      setIsAddModalOpen(false);
      setFormData({ name: "", contact: "", subject: "", message: "" });
    } catch (err) {
      console.error("Create message error:", err);
      alert("Failed to create message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Stats calculation
  const totalCount = messages.length;
  const unreadCount = messages.filter((m) => m.status === "unread").length;
  const repliedCount = messages.filter((m) => m.status === "replied").length;
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayCount = messages.filter((m) => m.createdAt.startsWith(todayStr)).length;

  const filtered = messages.filter((m) => {
    const matchesStatus =
      statusFilter === "all" ? true : m.status === statusFilter;
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.contact.toLowerCase().includes(search.toLowerCase()) ||
      m.message.toLowerCase().includes(search.toLowerCase()) ||
      (m.subject && m.subject.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const getWhatsAppUrl = (contact: string, name: string) => {
    const digits = contact.replace(/\D/g, "");
    const formatted = digits.startsWith("0")
      ? "94" + digits.slice(1)
      : digits.startsWith("94")
      ? digits
      : "94" + digits;
    const text = encodeURIComponent(
      `Hello ${name}, thank you for contacting Ceylon Wall Decor regarding your inquiry!`
    );
    return `https://wa.me/${formatted}?text=${text}`;
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border/60 pb-5">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-brand-text font-serif flex items-center gap-2.5">
            <MessageSquare className="w-7 h-7 text-brand-accent" />
            <span>Messages & Customer Inquiries</span>
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-1">
            Storefront contact queries, bespoke ideas, and studio communication
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-brand-accent text-white hover:opacity-90 transition-opacity shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Log Direct Inquiry</span>
          </button>
        </div>
      </div>

      {/* Top Stat Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-brand-surface border border-brand-border rounded-xl p-4">
          <p className="text-[11px] uppercase tracking-wider font-mono text-brand-muted">
            Total Inquiries
          </p>
          <p className="text-2xl font-bold text-brand-text mt-1">{totalCount}</p>
        </div>
        <div className="bg-brand-surface border border-brand-border rounded-xl p-4">
          <p className="text-[11px] uppercase tracking-wider font-mono text-brand-muted">
            Unread
          </p>
          <p className="text-2xl font-bold text-brand-accent mt-1">{unreadCount}</p>
        </div>
        <div className="bg-brand-surface border border-brand-border rounded-xl p-4">
          <p className="text-[11px] uppercase tracking-wider font-mono text-brand-muted">
            Replied / Handled
          </p>
          <p className="text-2xl font-bold text-brand-text mt-1">{repliedCount}</p>
        </div>
        <div className="bg-brand-surface border border-brand-border rounded-xl p-4">
          <p className="text-[11px] uppercase tracking-wider font-mono text-brand-muted">
            Received Today
          </p>
          <p className="text-2xl font-bold text-brand-text mt-1">{todayCount}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
          <input
            type="text"
            placeholder="Search by customer name, phone, email, or message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-brand-border rounded-lg bg-brand-surface text-brand-text text-xs focus:outline-none focus:ring-1 focus:ring-brand-accent"
          />
        </div>

        <div className="flex items-center gap-1 border border-brand-border rounded-lg p-0.5 bg-brand-surface overflow-x-auto">
          {["all", "unread", "read", "replied", "archived"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? "bg-brand-accent text-brand-bg shadow-sm"
                  : "text-brand-muted hover:text-brand-text"
              }`}
            >
              {st} {st === "unread" && unreadCount > 0 ? `(${unreadCount})` : ""}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area: List & Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Messages List Column */}
        <div className="lg:col-span-7 space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-brand-surface border border-brand-border rounded-2xl p-12 text-center space-y-2">
              <MessageSquare className="w-10 h-10 text-brand-muted mx-auto opacity-40" />
              <p className="text-sm font-medium text-brand-text">No messages found</p>
              <p className="text-xs text-brand-muted">
                {search ? "No inquiries match your search filter." : "The inbox is completely clear."}
              </p>
            </div>
          ) : (
            filtered.map((msg) => {
              const isSelected = selectedMessage?.id === msg.id;
              const hasPhone = msg.phone || (msg.contact && /\d{9}/.test(msg.contact));
              const hasEmail = msg.email || (msg.contact && msg.contact.includes("@"));

              return (
                <div
                  key={msg.id}
                  onClick={() => {
                    setSelectedMessage(msg);
                    setAdminNotesInput(msg.adminNotes || "");
                    if (msg.status === "unread") {
                      handleUpdateStatus(msg.id, "read");
                    }
                  }}
                  className={`message-item p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-brand-surface border-brand-accent shadow-md"
                      : "bg-brand-surface border-brand-border hover:border-brand-accent/40 hover:bg-brand-surface-hover/70"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-accent/15 text-brand-accent border border-brand-accent/30 flex items-center justify-center font-bold text-xs shrink-0">
                        {msg.name ? msg.name[0].toUpperCase() : "M"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm text-brand-text">
                            {msg.name}
                          </h4>
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                              msg.status === "unread"
                                ? "bg-brand-accent text-white"
                                : msg.status === "replied"
                                ? "bg-green-100 text-green-800 border border-green-300"
                                : msg.status === "read"
                                ? "bg-black/5 text-brand-muted border border-black/10"
                                : "bg-black/10 text-brand-muted"
                            }`}
                          >
                            {msg.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-brand-muted font-mono mt-0.5">
                          {msg.contact}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] text-brand-muted shrink-0 font-mono">
                      {formatDateTime(msg.createdAt).slice(0, 11)}
                    </span>
                  </div>

                  {msg.subject && (
                    <p className="text-xs font-medium text-brand-text mt-2.5">
                      {msg.subject}
                    </p>
                  )}

                  <p className="text-xs text-brand-muted mt-1 line-clamp-2 leading-relaxed">
                    "{msg.message}"
                  </p>

                  {/* Quick Action Bar on Card */}
                  <div className="mt-3 pt-2.5 border-t border-brand-border/40 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {hasPhone && (
                        <a
                          href={getWhatsAppUrl(msg.phone || msg.contact, msg.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 text-[11px] font-medium transition-colors"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                      {hasEmail && (
                        <a
                          href={`mailto:${msg.email || msg.contact}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-black/5 hover:bg-black/10 text-brand-text border border-black/10 text-[11px] font-medium transition-colors"
                        >
                          <Mail className="w-3 h-3" />
                          <span>Email</span>
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {msg.status !== "replied" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(msg.id, "replied");
                          }}
                          className="p-1.5 rounded hover:bg-black/5 text-brand-muted hover:text-green-700 transition-colors"
                          title="Mark as Replied"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(msg.id);
                        }}
                        className="p-1.5 rounded hover:bg-red-50 text-brand-muted hover:text-red-600 transition-colors"
                        title="Delete message"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Message Details / Quick Reply Drawer Column */}
        <div className="lg:col-span-5">
          {selectedMessage ? (
            <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-xl space-y-5 sticky top-20">
              <div className="flex items-start justify-between border-b border-brand-border/50 pb-4">
                <div>
                  <h3 className="font-bold text-base text-brand-text font-serif">
                    {selectedMessage.name}
                  </h3>
                  <p className="text-xs text-brand-muted font-mono mt-0.5">
                    {selectedMessage.contact}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                      selectedMessage.status === "unread"
                        ? "bg-brand-accent text-white"
                        : selectedMessage.status === "replied"
                        ? "bg-green-100 text-green-800"
                        : "bg-black/10 text-brand-muted"
                    }`}
                  >
                    {selectedMessage.status}
                  </span>
                </div>
              </div>

              {/* Subject & Body */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase text-brand-muted tracking-wider block">
                  Inquiry Content
                </span>
                {selectedMessage.subject && (
                  <h4 className="font-semibold text-xs text-brand-text">
                    Subject: {selectedMessage.subject}
                  </h4>
                )}
                <div className="p-4 rounded-xl bg-brand-bg border border-brand-border/60 text-xs text-brand-text leading-relaxed whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
                <p className="text-[10px] text-brand-muted font-mono">
                  Received: {formatDateTime(selectedMessage.createdAt)}
                </p>
              </div>

              {/* Direct Reach Out Action Bar */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-mono uppercase text-brand-muted tracking-wider block">
                  Quick Communication
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={getWhatsAppUrl(
                      selectedMessage.phone || selectedMessage.contact,
                      selectedMessage.name
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium text-xs transition-colors shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Chat</span>
                  </a>

                  <a
                    href={`tel:${selectedMessage.phone || selectedMessage.contact}`}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-black/5 hover:bg-black/10 text-brand-text border border-brand-border font-medium text-xs transition-colors"
                  >
                    <Phone className="w-4 h-4 text-brand-accent" />
                    <span>Call Customer</span>
                  </a>
                </div>
              </div>

              {/* Status Update Actions */}
              <div className="pt-2 border-t border-brand-border/50">
                <span className="text-[10px] font-mono uppercase text-brand-muted tracking-wider block mb-2">
                  Workflow Status
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedMessage.id, "replied")}
                    className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 ${
                      selectedMessage.status === "replied"
                        ? "bg-green-100 text-green-800 border border-green-300"
                        : "border border-brand-border hover:bg-brand-surface-hover text-brand-text"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Replied</span>
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(selectedMessage.id, "archived")}
                    className="py-1.5 px-2.5 rounded-lg border border-brand-border hover:bg-brand-surface-hover text-brand-muted hover:text-brand-text text-xs transition-colors flex items-center gap-1"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span>Archive</span>
                  </button>

                  <button
                    onClick={() => handleDelete(selectedMessage.id)}
                    className="py-1.5 px-2.5 rounded-lg border border-brand-border hover:bg-red-50 text-brand-muted hover:text-red-600 text-xs transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Internal Staff Notes */}
              <div className="space-y-2 pt-2 border-t border-brand-border/50">
                <label className="text-[10px] font-mono uppercase text-brand-muted tracking-wider block">
                  Internal Staff Notes
                </label>
                <textarea
                  rows={2}
                  value={adminNotesInput}
                  onChange={(e) => setAdminNotesInput(e.target.value)}
                  placeholder="Record customer preferences, quote details, or follow-up note..."
                  className="w-full px-3 py-2 border border-brand-border rounded-lg bg-brand-bg text-brand-text text-xs focus:outline-none focus:ring-1 focus:ring-brand-accent resize-none"
                />
                <button
                  onClick={() => handleSaveNotes(selectedMessage.id)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-brand-surface hover:bg-brand-surface-hover border border-brand-border text-brand-text transition-colors"
                >
                  Save Note
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-brand-surface border border-brand-border rounded-2xl p-8 text-center space-y-2 text-brand-muted">
              <FileEdit className="w-8 h-8 mx-auto opacity-30 text-brand-accent" />
              <p className="text-xs">Select any inquiry to view details and reply directly.</p>
            </div>
          )}
        </div>
      </div>

      {/* Manual / Direct Inquiry Log Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white text-black w-full max-w-lg rounded-2xl shadow-2xl border border-brand-border p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-brand-border/40 pb-3">
              <div>
                <h3 className="font-bold text-lg text-brand-text font-serif">
                  Log Customer Inquiry
                </h3>
                <p className="text-xs text-brand-muted">
                  Record inquiry received via phone, Instagram, or walk-in
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg hover:bg-black/5 text-brand-muted hover:text-black transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-brand-text mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ruwan Silva"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-brand-border rounded-lg text-brand-text bg-white focus:outline-none focus:ring-1 focus:ring-brand-accent"
                />
              </div>

              <div>
                <label className="block font-medium text-brand-text mb-1">
                  Contact (Phone or Email) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 0771234567 or customer@email.com"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  className="w-full px-3 py-2 border border-brand-border rounded-lg text-brand-text bg-white focus:outline-none focus:ring-1 focus:ring-brand-accent"
                />
              </div>

              <div>
                <label className="block font-medium text-brand-text mb-1">
                  Subject / Topic
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sun Room Horizon custom 24x36 pricing"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-brand-border rounded-lg text-brand-text bg-white focus:outline-none focus:ring-1 focus:ring-brand-accent"
                />
              </div>

              <div>
                <label className="block font-medium text-brand-text mb-1">
                  Inquiry Message / Notes *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Customer inquired about delivery to Negombo and customized frame..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 py-2 border border-brand-border rounded-lg text-brand-text bg-white focus:outline-none focus:ring-1 focus:ring-brand-accent resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-border/40">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-brand-border rounded-lg hover:bg-black/5 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-brand-accent text-white font-semibold rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Inquiry</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
