"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "./cart-context";
import { formatPrice } from "@/lib/products";

export function CartDrawer() {
  const { lines, open, setOpen, remove, update, subtotal } = useCart();
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity"
      onClick={() => setOpen(false)}
    >
      <aside
        className="ml-auto flex h-full w-full max-w-md flex-col bg-[#FFFFFF] border-l border-[#EBE8E4] p-6 sm:p-8 shadow-2xl rounded-l-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#EBE8E4] pb-5">
          <div>
            <p className="eyebrow text-[#777169]">Collector Bag</p>
            <h2 className="text-2xl font-light text-[#000000] tracking-[-0.02em]">Your Cart</h2>
          </div>
          <button
            aria-label="Close cart"
            onClick={() => setOpen(false)}
            className="p-2 rounded-full border border-[#EBE8E4] hover:border-black text-[#000000] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-auto divide-y divide-[#EBE8E4] py-2">
          {lines.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-sm text-[#59544F]">
                Your cart is waiting for sculpted artwork.
              </p>
              <Link
                href="/shop"
                onClick={() => setOpen(false)}
                className="pill-btn pill-btn-active mt-4 text-xs"
              >
                Browse Collection
              </Link>
            </div>
          ) : (
            lines.map((l, i) => (
              <div
                key={`${l.product.id}-${i}`}
                className="grid grid-cols-[80px_1fr] gap-4 py-5"
              >
                <div className="relative aspect-[4/5] rounded-xl overflow-hidden border border-[#EBE8E4] bg-[#F5F3F1]">
                  <Image
                    src={l.product.image}
                    alt={l.product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <b className="font-normal text-sm text-[#000000] tracking-[-0.01em]">
                        {l.product.name}
                      </b>
                      <button
                        onClick={() => remove(i)}
                        aria-label="Remove item"
                        className="text-[#777169] hover:text-[#000000] p-1"
                      >
                        <X size={15} />
                      </button>
                    </div>
                    <p className="text-xs text-[#777169] mt-0.5">
                      {l.size} · {l.framed ? "Framed" : "Unframed"}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-[#EBE8E4] bg-[#F5F3F1] p-1 text-xs">
                      <button
                        onClick={() => update(i, l.qty - 1)}
                        className="size-5 rounded-full hover:bg-white grid place-items-center text-[#000000] transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="px-1.5 font-mono text-xs text-[#000000]">{l.qty}</span>
                      <button
                        onClick={() => update(i, l.qty + 1)}
                        className="size-5 rounded-full hover:bg-white grid place-items-center text-[#000000] transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <span className="font-mono text-xs text-[#000000]">
                      {formatPrice(l.unitPrice * l.qty)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-[#EBE8E4] pt-5 space-y-4">
          <div className="flex justify-between items-baseline text-base">
            <span className="text-xs uppercase font-medium tracking-[0.05em] text-[#777169]">Subtotal</span>
            <b className="font-normal text-xl text-[#000000] tracking-[-0.02em]">{formatPrice(subtotal)}</b>
          </div>
          <Link
            href="/checkout"
            onClick={() => setOpen(false)}
            className="btn btn-accent w-full justify-center text-xs font-medium"
          >
            Proceed to Checkout
          </Link>
        </div>
      </aside>
    </div>
  );
}
