"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  Sparkles,
  MapPin,
  LogOut,
  Clock,
  CheckCircle2,
  Truck,
  ChevronRight,
  Save,
} from "lucide-react";
import { useCustomerAuth } from "@/contexts/customer-auth-context";
import { GoogleIcon } from "@/components/google-sign-in";
import { formatPrice } from "@/lib/products";
import type { Order, CustomRequest } from "@/types";

export default function AccountPage() {
  const router = useRouter();
  const { customer, isAuthenticated, isLoading, logout, updateProfile } = useCustomerAuth();

  const [activeTab, setActiveTab] = useState<"orders" | "custom" | "address">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [customRequests, setCustomRequests] = useState<CustomRequest[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Address edit state
  const [addressData, setAddressData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    district: "Colombo",
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/account/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (customer) {
      setAddressData({
        name: customer.name || "",
        phone: customer.phone || "",
        email: customer.email || "",
        address: customer.address || "",
        city: customer.city || "",
        district: customer.district || "Colombo",
      });

      // Fetch customer orders and custom requests
      const fetchUserData = async () => {
        setLoadingData(true);
        try {
          const params = new URLSearchParams();
          if (customer.phone) params.set("phone", customer.phone);
          if (customer.email) params.set("email", customer.email);

          const [ordersRes, requestsRes] = await Promise.all([
            fetch(`/api/customer/orders?${params.toString()}`).then((r) => r.json()),
            fetch(`/api/customer/custom-requests?${params.toString()}`).then((r) => r.json()),
          ]);

          if (ordersRes.success) {
            setOrders(ordersRes.data || []);
          }
          if (requestsRes.success) {
            setCustomRequests(requestsRes.data || []);
          }
        } catch (e) {
          console.error("Error loading customer data", e);
        } finally {
          setLoadingData(false);
        }
      };

      fetchUserData();
    }
  }, [customer]);

  if (isLoading || !customer) {
    return (
      <div className="min-h-[70vh] grid place-items-center bg-[#FDFCFC] text-[#000000]">
        <div className="text-center">
          <p className="eyebrow text-[#777169]">Ceylon Wall Decor</p>
          <p className="mt-3 text-sm text-[#59544F]">Loading customer account...</p>
        </div>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      name: addressData.name,
      phone: addressData.phone,
      email: addressData.email,
      address: addressData.address,
      city: addressData.city,
      district: addressData.district,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
      case "completed":
        return "border-black bg-black text-white";
      case "dispatched":
      case "ready_for_dispatch":
        return "border-[var(--store-accent-border)] bg-[var(--store-accent)] text-black font-medium";
      case "processing":
      case "confirmed":
        return "border-[var(--store-accent-border)] text-[#000000] bg-[#F5F3F1]";
      default:
        return "border-[#EBE8E4] text-[#777169] bg-[#F5F3F1]";
    }
  };

  return (
    <div className="min-h-[85vh] bg-[#FDFCFC] text-[#000000] py-12">
      <div className="container-x">
        {/* Top Header */}
        <div className="border-b border-[#EBE8E4] pb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="flex items-start gap-4">
            {customer.avatarUrl ? (
              <div className="size-14 rounded-full border border-[#EBE8E4] overflow-hidden relative shrink-0 bg-[#F5F3F1]">
                <img
                  src={customer.avatarUrl}
                  alt={customer.name}
                  className="size-full object-cover"
                />
              </div>
            ) : (
              <div className="size-14 rounded-full border border-[#EBE8E4] bg-[#000000] text-white flex items-center justify-center text-lg font-mono shrink-0">
                {customer.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                {customer.provider === "google" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono border border-[#EBE8E4] bg-[#F5F3F1] text-[#000000]">
                    <GoogleIcon className="size-2.5" /> Google Account
                  </span>
                )}
              </div>
              <h1 className="mt-1 text-3xl sm:text-4xl font-light text-[#000000] tracking-[-0.03em]">
                Hello, {customer.name}
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-[#59544F]">
                {customer.email && `· ${customer.email}`}{" "}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="pill-btn text-xs text-[#777169] hover:text-black flex items-center gap-1.5"
            >
              <LogOut size={13} />
              Sign Out
            </button>
          </div>
        </div>

        {/* ElevenLabs-style Pill Tab Navigation */}
        <div className="flex gap-2 p-1 rounded-full border border-[#EBE8E4] bg-[#FFFFFF] shadow-[0_1px_2px_rgba(0,0,0,0.02)] mt-8 overflow-x-auto w-fit">
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-1.5 text-xs rounded-full flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === "orders"
              ? "bg-black text-white font-medium shadow-sm"
              : "text-[#59544F] hover:text-black"
              }`}
          >
            My Orders
          </button>
          <button
            onClick={() => setActiveTab("custom")}
            className={`px-4 py-1.5 text-xs rounded-full flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === "custom"
              ? "bg-black text-white font-medium shadow-sm"
              : "text-[#59544F] hover:text-black"
              }`}
          >

            Custom Quotes
          </button>
          <button
            onClick={() => setActiveTab("address")}
            className={`px-4 py-1.5 text-xs rounded-full flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === "address"
              ? "bg-black text-white font-medium shadow-sm"
              : "text-[#59544F] hover:text-black"
              }`}
          >
            Delivery Details
          </button>
        </div>

        {/* Tab Contents */}
        <div className="py-8">
          {/* ORDERS TAB */}
          {activeTab === "orders" && (
            <div>
              {loadingData ? (
                <div className="py-16 text-center text-sm text-[#777169]">
                  Fetching your orders...
                </div>
              ) : orders.length === 0 ? (
                <div className="rounded-2xl border border-[#EBE8E4] p-12 text-center bg-[#F5F3F1]">
                  <Package className="mx-auto text-[#777169]" size={36} />
                  <h3 className="mt-4 text-xl font-light text-[#000000] tracking-[-0.01em]">
                    No orders placed yet
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-[#59544F] max-w-md mx-auto">
                    Your collection begins with your first handmade piece. Explore our
                    hand-sculpted artworks with island-wide COD delivery.
                  </p>
                  <Link href="/shop" className="pill-btn pill-btn-active mt-6 inline-flex text-xs">
                    Explore Collection
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="rounded-2xl border border-[#EBE8E4] bg-white p-6 transition-all hover:border-black shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                    >
                      {/* Order Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBE8E4] pb-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-base font-medium text-[#000000]">
                              {ord.orderRef}
                            </span>
                            <span
                              className={`text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                                ord.status
                              )}`}
                            >
                              {ord.status.replace(/_/g, " ")}
                            </span>
                          </div>
                          <p className="text-xs text-[#777169] mt-1 flex items-center gap-1.5">
                            <Clock size={12} />
                            Placed on {new Date(ord.createdAt).toLocaleDateString("en-LK", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-left sm:text-right">
                            <p className="text-[10px] uppercase text-[#777169] tracking-[0.05em]">Total (COD)</p>
                            <p className="text-base font-medium text-[#000000] font-mono">
                              {formatPrice(ord.total)}
                            </p>
                          </div>
                          <Link
                            href={`/order/track?ref=${encodeURIComponent(ord.orderRef)}`}
                            className="pill-btn pill-btn-active text-xs"
                          >
                            Track
                            <ChevronRight size={13} />
                          </Link>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="pt-4 divide-y divide-[#EBE8E4]">
                        {ord.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="py-3 flex items-center justify-between gap-4"
                          >
                            <div className="flex items-center gap-3">
                              {item.image && (
                                <div className="relative size-14 rounded-xl border border-[#EBE8E4] shrink-0 bg-[#F5F3F1] overflow-hidden">
                                  <Image
                                    src={item.image}
                                    alt={item.productName}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              )}
                              <div>
                                <h4 className="text-sm font-normal text-[#000000] tracking-[-0.01em]">
                                  {item.productName}
                                </h4>
                                <p className="text-xs text-[#777169]">
                                  {item.sizeLabel} · {item.withFrame ? "Framed" : "Unframed"} · Qty: {item.qty}
                                </p>
                              </div>
                            </div>
                            <span className="text-sm text-[#000000] font-mono">
                              {formatPrice(item.totalPrice)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Delivery destination */}
                      <div className="mt-4 pt-4 border-t border-[#EBE8E4] flex flex-col sm:flex-row justify-between text-xs text-[#777169] gap-2">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} />
                          {ord.deliveryAddress.address}, {ord.deliveryAddress.city},{" "}
                          {ord.deliveryAddress.district}
                        </span>
                        {ord.trackingNumber && (
                          <span className="flex items-center gap-1 font-mono text-[#000000]">
                            <Truck size={12} />
                            Tracking: {ord.trackingNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CUSTOM REQUESTS TAB */}
          {activeTab === "custom" && (
            <div>
              {loadingData ? (
                <div className="py-16 text-center text-sm text-[#777169]">
                  Fetching your custom requests...
                </div>
              ) : customRequests.length === 0 ? (
                <div className="rounded-2xl border border-[#EBE8E4] p-12 text-center bg-[#F5F3F1]">
                  <Sparkles className="mx-auto text-[#777169]" size={36} />
                  <h3 className="mt-4 text-xl font-light text-[#000000] tracking-[-0.01em]">
                    No bespoke requests yet
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-[#59544F] max-w-md mx-auto">
                    Want an exclusive piece made for your exact room dimensions and
                    palette? Submit reference photos and get a quote within 24 hours.
                  </p>
                  <Link href="/custom-order" className="pill-btn pill-btn-active mt-6 inline-flex text-xs">
                    Request Custom Piece
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {customRequests.map((req) => (
                    <div
                      key={req.id}
                      className="rounded-2xl border border-[#EBE8E4] bg-white p-6 transition-all hover:border-black shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EBE8E4] pb-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-[#000000]">
                              Custom Artwork Request
                            </span>
                            <span className="text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full border border-[var(--store-accent-border)] bg-[var(--store-accent)]/20 text-black">
                              {req.status}
                            </span>
                          </div>
                          <p className="text-xs text-[#777169] mt-1">
                            Submitted on{" "}
                            {new Date(req.createdAt).toLocaleDateString("en-LK", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                        {req.quotedPrice && (
                          <div className="text-left sm:text-right">
                            <p className="text-[10px] uppercase text-[#777169]">Quoted Price</p>
                            <p className="text-base font-medium text-[#000000] font-mono">
                              {formatPrice(req.quotedPrice)}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 grid gap-3 sm:grid-cols-2 text-xs">
                        <div>
                          <span className="uppercase text-[#777169] block text-[10px] tracking-[0.05em]">
                            Dimensions &amp; Framing
                          </span>
                          <span className="text-[#000000] mt-0.5 block">
                            {req.sizeLabel || `${req.sizeWidth}×${req.sizeHeight} in`} ·{" "}
                            {req.framePreference}
                          </span>
                        </div>
                        <div>
                          <span className="uppercase text-[#777169] block text-[10px] tracking-[0.05em]">
                            Design Brief
                          </span>
                          <p className="text-[#59544F] mt-0.5">{req.notes}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ADDRESS TAB */}
          {activeTab === "address" && (
            <div className="max-w-xl">
              <div className="rounded-2xl border border-[#EBE8E4] bg-white p-6 sm:p-8 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                <h3 className="text-xl font-light text-[#000000] mb-1 tracking-[-0.01em]">
                  Delivery Profile
                </h3>
                <p className="text-xs text-[#59544F] mb-6">
                  Saved delivery details automatically pre-fill at checkout for swift 1-click orders.
                </p>

                {savedSuccess && (
                  <div className="mb-6 p-3 rounded-xl border border-[var(--store-accent-border)] bg-[#F5F3F1] text-xs text-[#000000] flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[var(--store-accent-ink)]" />
                    Delivery details updated successfully!
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.05em] text-[#777169] mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={addressData.name}
                      onChange={(e) =>
                        setAddressData({ ...addressData, name: e.target.value })
                      }
                      className="input text-xs"
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.05em] text-[#777169] mb-1.5">
                        Mobile Phone (07XXXXXXXX)
                      </label>
                      <input
                        type="tel"
                        required
                        value={addressData.phone}
                        onChange={(e) =>
                          setAddressData({ ...addressData, phone: e.target.value })
                        }
                        className="input text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.05em] text-[#777169] mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={addressData.email}
                        onChange={(e) =>
                          setAddressData({ ...addressData, email: e.target.value })
                        }
                        className="input text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.05em] text-[#777169] mb-1.5">
                      Street Address
                    </label>
                    <textarea
                      value={addressData.address}
                      onChange={(e) =>
                        setAddressData({ ...addressData, address: e.target.value })
                      }
                      rows={2}
                      className="input text-xs"
                      placeholder="e.g. 42/3 Horton Place"
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.05em] text-[#777169] mb-1.5">
                        City
                      </label>
                      <input
                        type="text"
                        value={addressData.city}
                        onChange={(e) =>
                          setAddressData({ ...addressData, city: e.target.value })
                        }
                        className="input text-xs"
                        placeholder="e.g. Colombo 07"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.05em] text-[#777169] mb-1.5">
                        District
                      </label>
                      <select
                        value={addressData.district}
                        onChange={(e) =>
                          setAddressData({ ...addressData, district: e.target.value })
                        }
                        className="input text-xs"
                      >
                        {[
                          "Colombo",
                          "Gampaha",
                          "Kalutara",
                          "Kandy",
                          "Matale",
                          "Nuwara Eliya",
                          "Galle",
                          "Matara",
                          "Hambantota",
                          "Jaffna",
                          "Kurunegala",
                          "Puttalam",
                          "Anuradhapura",
                          "Polonnaruwa",
                          "Badulla",
                          "Ratnapura",
                          "Kegalle",
                        ].map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-accent w-full justify-center mt-4 text-xs font-medium"
                  >
                    <Save size={14} />
                    Save Delivery Profile
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
