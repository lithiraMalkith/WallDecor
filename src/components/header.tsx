"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Search, ShoppingBag, X, User, Sparkles } from "lucide-react";
import { useState } from "react";
import { useCart } from "./cart-context";
import { useCustomerAuth } from "@/contexts/customer-auth-context";

const links = [
  ["Shop", "/shop"],
  ["Custom Atelier", "/custom-order"],
  ["Wall Studio", "/#studio"],
  ["Gallery", "/gallery"],
  ["Track Order", "/order/track"],
];

export function Header() {
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const router = useRouter();
  const { count, setOpen } = useCart();
  const { customer } = useCustomerAuth();

  return (
    <>
      {/* ElevenLabs-style Top Micro-Banner
      <div className="border-b border-[#EBE8E4] bg-[#F5F3F1] py-2 px-4 text-center text-[11px] font-normal text-[#111111] tracking-wide flex items-center justify-center gap-2">
        <span className="inline-block size-1.5 rounded-full bg-[#BA8E23]" />
        <span>Island-wide Cash on Delivery (COD) · Handcrafted by Sri Lankan Artisans</span>
        <Link
          href="/custom-order"
          className="ml-2 hidden sm:inline-flex items-center gap-1 font-medium underline underline-offset-2 hover:text-[#BA8E23] transition-colors"
        >
          <span>Request Custom Size</span>
          <span>→</span>
        </Link>
      </div> */}

      <header className="sticky top-0 z-40 border-b border-[#EBE8E4] bg-[#FDFCFC]/90 backdrop-blur-md">
        <div className="container-x flex h-16 items-center justify-between">
          {/* Mobile menu button */}
          <button
            aria-label="Open menu"
            className="md:hidden p-2 text-[#111111]"
            onClick={() => setMenu(true)}
          >
            <Menu size={20} />
          </button>

          {/* Brand Logo */}
          <Link
            href="/"
            className="text-base sm:text-lg font-normal tracking-tight uppercase text-[#000000] hover:opacity-80 transition-opacity"
          >
            Wall <span className="text-[#BA8E23]">/</span> Decor
          </Link>

          {/* ElevenLabs-style Segmented Center Pill Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-[#FFFFFF] px-1.5 py-1 rounded-full border-none shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            {links.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="px-3.5 py-1 text-xs font-normal text-[#59544F] hover:text-[#000000] rounded-full hover:bg-[#F5F3F1] transition-all"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2">
            <button
              aria-label="Search"
              onClick={() => setSearch(!search)}
              className="p-2 text-[#000000] hover:text-[#BA8E23] rounded-full hover:bg-[#F5F3F1] transition-colors"
            >
              <Search size={17} />
            </button>

            {/* Account Pill */}
            <Link
              href={customer ? "/account" : "/account/login"}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#EBE8E4] hover:border-[#000000] bg-[#FFFFFF] text-xs transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
              aria-label="Collector Account"
              title={customer ? `Signed in as ${customer.name}` : "Sign In / Register"}
            >
              <User size={14} className="text-[#000000]" />
              <span className="hidden lg:inline text-[11px] font-normal text-[#000000]">
                {customer ? customer.name.split(" ")[0] : "Sign In"}
              </span>

            </Link>

            {/* Cart Pill Button */}
            <button
              aria-label={`Cart with ${count} items`}
              onClick={() => setOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#000000] text-[#FFFFFF] hover:bg-[#222222] text-xs font-normal transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
            >
              <ShoppingBag size={14} />
              {count > 0 && <span className="font-mono text-[11px]">{count}</span>}
            </button>
          </div>
        </div>

        {/* Expandable Search Input */}
        {search && (
          <div className="border-t border-[#EBE8E4] bg-[#FFFFFF] py-3 shadow-sm">
            <div className="container-x">
              <input
                className="input text-xs rounded-full border-[#EBE8E4] focus:border-black"
                autoFocus
                // placeholder="Search textured artwork designs by room, style, or title… (Press Enter)"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    router.push(
                      `/shop?search=${encodeURIComponent(e.currentTarget.value)}`,
                    );
                    setSearch(false);
                  }
                }}
              />
            </div>
          </div>
        )}
      </header>

      {/* Mobile Drawer */}
      {menu && (
        <div className="fixed inset-0 z-50 bg-[#FFFFFF] text-[#000000] flex flex-col">
          <div className="flex items-center justify-between border-b border-[#EBE8E4] p-5">
            <span className="text-xs uppercase tracking-widest text-[#BA8E23] font-medium">
              Ceylon Wall Decor
            </span>
            <button
              aria-label="Close menu"
              onClick={() => setMenu(false)}
              className="p-1.5 text-[#000000] hover:text-[#BA8E23] transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          <nav className="flex flex-col p-6 text-3xl font-light space-y-2 flex-1 overflow-y-auto">
            {links.map(([l, h]) => (
              <Link
                key={h}
                href={h}
                onClick={() => setMenu(false)}
                className="border-b border-[#EBE8E4] py-4 text-[#000000] hover:text-[#BA8E23] transition-colors"
              >
                {l}
              </Link>
            ))}
            <Link
              href={customer ? "/account" : "/account/login"}
              onClick={() => setMenu(false)}
              className="border-b border-[#EBE8E4] py-4 text-[#BA8E23] flex items-center justify-between pt-6"
            >
              <span>
                {customer
                  ? `Account (${customer.name.split(" ")[0]})`
                  : "Sign In / Register"}
              </span>
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
