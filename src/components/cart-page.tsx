"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2, Minus, Plus } from "lucide-react";
import { useCart } from "./cart-context";
import { formatPrice } from "@/lib/products";

export function CartPage() {
  const { lines, remove, update, subtotal } = useCart();

  if (!lines.length)
    return (
      <div className="py-24 text-center rounded-2xl border border-[#EBE8E4] bg-[#F5F3F1] my-8 p-12">
        <p className="eyebrow text-[#777169]">Collector Bag</p>
        <h2 className="text-3xl font-light text-[#000000] mt-2 tracking-[-0.03em]">Your cart is empty.</h2>
        <p className="text-sm text-[#59544F] mt-2">
          Discover hand-sculpted textured art crafted in Sri Lanka.
        </p>
        <Link href="/shop" className="pill-btn pill-btn-active mt-6 text-xs">
          Browse the Collection
        </Link>
      </div>
    );

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_360px] my-8">
      <div className="space-y-4">
        {lines.map((l, i) => (
          <div
            key={i}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border border-[#EBE8E4] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
          >
            <div className="flex items-center gap-4">
              <div className="relative size-20 sm:size-24 rounded-xl overflow-hidden border border-[#EBE8E4] bg-[#F5F3F1] shrink-0">
                <Image
                  src={l.product.image}
                  alt={l.product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="font-normal text-base text-[#000000] tracking-[-0.01em]">
                  {l.product.name}
                </h3>
                <p className="text-xs text-[#777169] mt-0.5">
                  {l.size} · {l.framed ? "Framed Float" : "Unframed Canvas"}
                </p>
                <p className="text-xs font-mono text-[#000000] mt-2">
                  {formatPrice(l.unitPrice)} each
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-[#EBE8E4]">
              {/* Pill quantity control */}
              <div className="inline-flex items-center gap-2 rounded-full border border-[#EBE8E4] bg-[#F5F3F1] p-1 text-xs">
                <button
                  onClick={() => update(i, l.qty - 1)}
                  className="size-6 rounded-full hover:bg-white grid place-items-center text-[#000000] transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus size={12} />
                </button>
                <span className="px-1.5 font-mono text-xs text-[#000000]">{l.qty}</span>
                <button
                  onClick={() => update(i, l.qty + 1)}
                  className="size-6 rounded-full hover:bg-white grid place-items-center text-[#000000] transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus size={12} />
                </button>
              </div>

              <div className="text-right">
                <p className="text-sm font-mono text-[#000000]">
                  {formatPrice(l.unitPrice * l.qty)}
                </p>
                <button
                  aria-label="Remove item"
                  onClick={() => remove(i)}
                  className="mt-1 text-xs text-[#777169] hover:text-[#000000] inline-flex items-center gap-1 transition-colors"
                >
                  <Trash2 size={13} />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <aside className="h-fit rounded-2xl border border-[#EBE8E4] bg-[#F5F3F1] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-5">
        <div>
          <p className="eyebrow text-[#777169]">Order Total</p>
          <h2 className="text-2xl font-light text-[#000000] tracking-[-0.02em] mt-1">Summary</h2>
        </div>

        <div className="divide-y divide-[#EBE8E4] text-xs">
          <div className="py-3 flex justify-between text-[#59544F]">
            <span>Subtotal</span>
            <span className="text-[#000000] font-mono">{formatPrice(subtotal)}</span>
          </div>
          <div className="py-3 flex justify-between text-[#59544F]">
            <span>Delivery</span>
            <span className="text-[#000000]">Calculated at checkout</span>
          </div>
          <div className="py-4 flex justify-between items-baseline text-base">
            <span className="font-normal text-[#000000]">Estimated Total</span>
            <b className="font-medium text-xl text-[#000000] tracking-tight">{formatPrice(subtotal)}</b>
          </div>
        </div>

        <p className="text-[11px] text-[#777169] leading-relaxed">
          Island-wide Cash on Delivery (COD). Free delivery on orders over Rs. 10,000.
        </p>

        <Link href="/checkout" className="btn btn-yellow w-full justify-center text-xs font-medium">
          Proceed to Checkout
        </Link>
      </aside>
    </div>
  );
}
