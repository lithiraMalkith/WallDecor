"use client";

import Link from "next/link";
import { Check, Truck, ArrowRight, User } from "lucide-react";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/products";
import { useCustomerAuth } from "@/contexts/customer-auth-context";

export function OrderConfirmation({ id }: { id: string }) {
  const [total, setTotal] = useState<number>();
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const { isAuthenticated } = useCustomerAuth();

  useEffect(() => {
    // Fetch live order details directly from Firebase API
    fetch(`/api/orders/${encodeURIComponent(id)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setTotal(data.data.total);
          setCustomerPhone(data.data.customer?.phone || "");
        } else {
          // Fallback search by orderRef
          return fetch(`/api/orders?search=${encodeURIComponent(id)}`)
            .then((r) => r.json())
            .then((searchData) => {
              if (searchData.success && searchData.data?.[0]) {
                setTotal(searchData.data[0].total);
                setCustomerPhone(searchData.data[0].customer?.phone || "");
              }
            });
        }
      })
      .catch((err) => {
        console.warn("Could not retrieve order details from Firebase:", err);
      });
  }, [id]);

  return (
    <div className="mx-auto max-w-2xl py-16 px-4 text-center">
      <div className="mx-auto size-16 rounded-full grid place-items-center bg-[#BA8E23] text-black">
        <Check size={32} />
      </div>

      <p className="eyebrow mt-6 text-[#777169]">Order Placed Successfully</p>
      <h1 className="mt-2 text-4xl sm:text-5xl font-light text-[#000000] tracking-[-0.03em]">
        Thank you.
      </h1>

      <p className="mt-3 text-sm text-[#59544F] max-w-md mx-auto leading-relaxed font-normal">
        Your order has been recorded in our workshop queue. Our team will
        contact you via WhatsApp or phone call to confirm details before
        handcrafting begins.
      </p>

      <div className="my-8 rounded-2xl border border-[#EBE8E4] p-6 bg-[#F5F3F1] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <p className="text-[11px] uppercase text-[#777169] tracking-[0.05em]">
          Official Order Reference
        </p>
        <b className="mt-2 block font-mono text-3xl font-light text-[#000000] tracking-tight">
          {id}
        </b>
        {total !== undefined && (
          <p className="mt-2 text-sm text-[#59544F]">
            Cash on Delivery:{" "}
            <span className="font-medium text-[#000000]">
              {formatPrice(total)}
            </span>
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href={`/order/track?ref=${encodeURIComponent(id)}${customerPhone ? `&phone=${encodeURIComponent(customerPhone)}` : ""}`}
          className="btn btn-yellow w-full sm:w-auto text-xs font-medium"
        >
          <Truck size={14} />
          Track Live Status
        </Link>

        {isAuthenticated ? (
          <Link href="/account" className="btn btn-outline w-full sm:w-auto text-xs">
            <User size={14} />
            View in My Account
          </Link>
        ) : (
          <Link href="/shop" className="btn btn-outline w-full sm:w-auto text-xs">
            Continue Shopping
            <ArrowRight size={14} />
          </Link>
        )}
      </div>
    </div>
  );
}
