"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "./cart-context";
import { formatPrice } from "@/lib/products";
import { useCustomerAuth } from "@/contexts/customer-auth-context";
import { Check, ShieldCheck, User } from "lucide-react";
import Link from "next/link";

const districts = [
  "Ampara",
  "Anuradhapura",
  "Badulla",
  "Batticaloa",
  "Colombo",
  "Galle",
  "Gampaha",
  "Hambantota",
  "Jaffna",
  "Kalutara",
  "Kandy",
  "Kegalle",
  "Kilinochchi",
  "Kurunegala",
  "Mannar",
  "Matale",
  "Matara",
  "Monaragala",
  "Mullaitivu",
  "Nuwara Eliya",
  "Polonnaruwa",
  "Puttalam",
  "Ratnapura",
  "Trincomalee",
  "Vavuniya",
];

export function CheckoutForm() {
  const { lines, subtotal, clear } = useCart();
  const { customer, isAuthenticated } = useCustomerAuth();
  const router = useRouter();

  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState(0);

  // Form inputs
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("Colombo");
  const [notes, setNotes] = useState("");

  // Auto-fill from customer session if logged in
  useEffect(() => {
    if (customer) {
      if (customer.name) setFullName(customer.name);
      if (customer.phone) setPhone(customer.phone);
      if (customer.email) setEmail(customer.email);
      if (customer.address) setStreetAddress(customer.address);
      if (customer.city) setCity(customer.city);
      if (customer.district) setDistrict(customer.district);
    }
  }, [customer]);

  const districtFee = subtotal >= 10000 ? 0 : 350;
  const total = Math.max(0, subtotal + districtFee - discount);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!lines.length) return;
    setErrorMsg("");
    setBusy(true);

    try {
      // Map cart lines into order items format
      const items = lines.map((l) => {
        const dims = l.size.replace(/in/g, "").trim().split(/[×x]/);
        const w = parseInt(dims[0]?.trim()) || 12;
        const h = parseInt(dims[1]?.trim()) || 12;
        return {
          productId: l.product.id,
          productName: l.product.name,
          productSlug: l.product.slug,
          image: l.product.image,
          sizeLabel: l.size,
          width: w,
          height: h,
          withFrame: l.framed,
          unitPrice: l.unitPrice,
          frameCost: l.framed ? 1200 : 0,
          qty: l.qty,
          totalPrice: l.unitPrice * l.qty,
        };
      });

      const payload = {
        items,
        deliveryFee: districtFee,
        discountAmount: discount,
        discountCode: code || undefined,
        customer: {
          name: fullName.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
        },
        deliveryAddress: {
          address: streetAddress.trim(),
          city: city.trim(),
          district,
          notes: notes.trim() || undefined,
        },
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to place order");
      }

      const orderRef = result.data.orderRef;

      clear();
      router.push(`/order/confirmation/${encodeURIComponent(orderRef)}`);
    } catch (err: any) {
      console.error("Order submission failed:", err);
      setErrorMsg(
        err?.message ||
          "Could not place order. Please check your contact and delivery details.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1fr_380px] my-6">
      <div className="space-y-6">
        {/* Customer login banner */}
        {!isAuthenticated && (
          <div className="rounded-2xl border border-[#EBE8E4] bg-[#F5F3F1] p-4 flex items-center justify-between text-xs">
            <span className="text-[#59544F] flex items-center gap-2">
              <User size={15} className="text-[var(--store-accent-ink)]" />
              Have an account with Ceylon Wall Decor?
            </span>
            <Link
              href="/account/login?redirect=/checkout"
              className="font-medium text-[#000000] underline hover:text-[var(--store-accent-ink)]"
            >
              Sign In to auto-fill details →
            </Link>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-xl border border-[#000000] bg-[#F5F3F1] text-xs text-[#000000]">
            {errorMsg}
          </div>
        )}

        {/* Contact Information */}
        <section className="p-6 rounded-2xl border border-[#EBE8E4] bg-[#FFFFFF] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="eyebrow text-[#777169]">Collector Details</p>
              <h2 className="text-xl font-light text-[#000000] tracking-[-0.02em] mt-1">Contact Information</h2>
            </div>
            {isAuthenticated && (
              <span className="text-xs text-[var(--store-accent-ink)] flex items-center gap-1 font-medium">
                <Check size={14} /> Logged in as {customer?.name}
              </span>
            )}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input text-xs"
              placeholder="Full name *"
            />
            <input
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input text-xs"
              pattern="0[0-9]{9}"
              placeholder="Mobile Phone · 07XXXXXXXX *"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input text-xs md:col-span-2"
              placeholder="Email address (for dispatch updates)"
            />
          </div>
        </section>

        {/* Delivery Address */}
        <section className="p-6 rounded-2xl border border-[#EBE8E4] bg-[#FFFFFF] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="mb-4">
            <p className="eyebrow text-[#777169]">Island-Wide Delivery</p>
            <h2 className="text-xl font-light text-[#000000] tracking-[-0.02em] mt-1">Delivery Address</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <textarea
              required
              minLength={6}
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              className="input text-xs min-h-24 md:col-span-2"
              placeholder="Street address / Apartment / Landmark *"
            />
            <input
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="input text-xs"
              placeholder="City *"
            />
            <select
              required
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="input text-xs"
            >
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input text-xs min-h-20 md:col-span-2"
              placeholder="Delivery instructions (e.g. Call before delivery)"
            />
          </div>
        </section>

        {/* Payment terms */}
        <section className="rounded-2xl border border-[var(--store-accent-border)]/40 bg-[var(--store-accent)]/10 p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-[var(--store-accent-ink)]" />
            <h2 className="text-sm font-medium text-[#000000]">
              Island-wide Cash on Delivery (COD)
            </h2>
          </div>
          <p className="mt-1.5 text-xs text-[#59544F] leading-relaxed">
            Pay cash or courier bank transfer when your handcrafted artwork
            arrives securely packaged at your doorstep. We will call you to
            confirm your order before crafting begins.
          </p>
        </section>
      </div>

      {/* Order Summary Aside */}
      <aside className="h-fit rounded-2xl bg-[#F5F3F1] border border-[#EBE8E4] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-5">
        <div>
          <p className="eyebrow text-[#777169]">Order Total</p>
          <h2 className="text-2xl font-light text-[#000000] tracking-[-0.02em] mt-1">Your Order</h2>
        </div>

        <div className="divide-y divide-[#EBE8E4]">
          {lines.map((l, i) => (
            <div key={i} className="flex justify-between py-3 text-xs">
              <div>
                <span className="font-normal text-[#000000]">
                  {l.product.name} × {l.qty}
                </span>
                <small className="block text-[11px] text-[#777169]">
                  {l.size} · {l.framed ? "Framed" : "Unframed"}
                </small>
              </div>
              <span className="text-[#000000] font-mono">
                {formatPrice(l.unitPrice * l.qty)}
              </span>
            </div>
          ))}
        </div>

        {/* Discount Code */}
        <div className="flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="input text-xs rounded-full py-2 px-3 border-[#EBE8E4] focus:border-black"
            placeholder="Promo code"
          />
          <button
            type="button"
            onClick={() => {
              const entered = code.trim().toUpperCase();
              if (entered === "SAVE10") {
                setDiscount(Math.round(subtotal * 0.1));
              } else if (entered === "CEYLON15") {
                setDiscount(Math.round(subtotal * 0.15));
              } else {
                setDiscount(0);
              }
            }}
            className="btn btn-dark text-xs px-4"
          >
            Apply
          </button>
        </div>
        <p className="text-[10px] text-[#777169]">
          Demo coupon: SAVE10 (10% off), CEYLON15 (15% off)
        </p>

        {/* Cost Summary */}
        <div className="space-y-2 text-xs border-t border-[#EBE8E4] pt-4">
          <div className="flex justify-between text-[#59544F]">
            <span>Subtotal</span>
            <span className="text-[#000000] font-mono">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-[#59544F]">
            <span>Delivery Fee ({district})</span>
            <span className="text-[#000000] font-mono">
              {districtFee === 0 ? "Free (over Rs. 10k)" : formatPrice(districtFee)}
            </span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-[var(--store-accent-ink)]">
              <span>Discount ({code.toUpperCase()})</span>
              <span className="font-mono">−{formatPrice(discount)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-[#EBE8E4] pt-4 items-baseline text-base">
            <span className="font-normal text-[#000000]">Total (COD)</span>
            <b className="font-medium text-xl text-[#000000] tracking-tight">{formatPrice(total)}</b>
          </div>
        </div>

        <button
          type="submit"
          disabled={busy || !lines.length}
          className="btn btn-accent w-full justify-center disabled:opacity-40 text-xs font-medium"
        >
          {busy ? "Placing order in Admin..." : "Confirm COD Order"}
        </button>

        <p className="text-[11px] text-[#777169] leading-relaxed text-center">
          Handmade to order in Sri Lanka.
          <br />
          Ready in 5–10 working days.
        </p>
      </aside>
    </form>
  );
}
