"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Search, ShoppingBag, X, User, Leaf } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
  const [headerQuery, setHeaderQuery] = useState("");
  const menuDialog = useRef<HTMLDialogElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const { count, setOpen } = useCart();
  const { customer } = useCustomerAuth();

  useEffect(() => {
    if (!menu) return;
    const dialog = menuDialog.current;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      menuButton.current?.focus({ preventScroll: true });
    };
  }, [menu]);

  return (
    <>
      {/* ElevenLabs-style Top Micro-Banner */}
      <header className="reference-header sticky top-0 z-40 border-b backdrop-blur-md">
        <div className="container-x header-inner">
          {/* Mobile menu button */}
          <button
            ref={menuButton}
            aria-label="Open menu"
            aria-haspopup="dialog"
            aria-expanded={menu}
            aria-controls="mobile-navigation"
            className="mobile-menu-trigger lg:hidden p-2 text-[#111111]"
            onClick={() => { setSearch(false); setMenu(true); }}
          >
            <Menu size={20} />
          </button>

          {/* Brand Logo */}
          <Link
            href="/"
            className="reference-brand hover:opacity-80 transition-opacity"
          >
            <Leaf size={25} strokeWidth={1.8} /><span>Ceylon<span className="reference-brand-sub">Wall Decor</span></span>
          </Link>

          {/* ElevenLabs-style Segmented Center Pill Navigation */}
          <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-1 bg-[#FFFFFF] px-1.5 py-1 rounded-full border-none shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
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
          <div className="header-actions flex items-center gap-2">
            <button
              aria-label="Search"
              onClick={() => setSearch(!search)}
              className="p-2 text-[#000000] hover:text-[var(--store-accent-ink)] rounded-full hover:bg-[#F5F3F1] transition-colors"
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
                {customer ? customer.name.split(" ")[0] : "Log in"}
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
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const val = headerQuery.trim();
                  if (val) {
                    if (typeof window !== "undefined") {
                      window.dispatchEvent(
                        new CustomEvent("catalog-search", { detail: val }),
                      );
                    }
                    router.push(`/shop?search=${encodeURIComponent(val)}`);
                    setSearch(false);
                  }
                }}
                className="relative flex items-center"
              >
                <Search
                  size={15}
                  className="absolute left-3.5 text-[#777169] pointer-events-none"
                />
                <input
                  value={headerQuery}
                  onChange={(e) => setHeaderQuery(e.target.value)}
                  className="input pl-10 pr-10 text-xs rounded-full border-[#EBE8E4] focus:border-black w-full"
                  autoFocus
                  placeholder="Search textured artwork designs by room, style, or title… (Press Enter)"
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setSearch(false);
                    }
                  }}
                />
                <button
                  type="submit"
                  aria-label="Search"
                  className="absolute right-3 p-1 text-[#777169] hover:text-[#000000] transition-colors"
                >
                  <Search size={15} />
                </button>
              </form>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Drawer */}
      {menu && (
        <dialog
          ref={menuDialog}
          id="mobile-navigation"
          aria-label="Site navigation"
          className="mobile-menu-dialog"
          onCancel={() => setMenu(false)}
          onClose={() => setMenu(false)}
        >
          <div className="flex items-center justify-between border-b border-[#EBE8E4] p-5">
            <span className="text-xs uppercase tracking-widest text-[var(--store-accent-ink)] font-medium">
              Ceylon Wall Decor
            </span>
            <button
              aria-label="Close menu"
              onClick={() => setMenu(false)}
              className="p-1.5 text-[#000000] hover:text-[var(--store-accent-ink)] transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          <nav aria-label="Mobile navigation" className="flex flex-col p-6 text-3xl font-light space-y-2 flex-1 overflow-y-auto">
            {links.map(([l, h]) => (
              <Link
                key={h}
                href={h}
                onClick={() => setMenu(false)}
                className="border-b border-[#EBE8E4] py-4 text-[#000000] hover:text-[var(--store-accent-ink)] transition-colors"
              >
                {l}
              </Link>
            ))}
            <Link
              href={customer ? "/account" : "/account/login"}
              onClick={() => setMenu(false)}
              className="border-b border-[#EBE8E4] py-4 text-[var(--store-accent-ink)] flex items-center justify-between pt-6"
            >
              <span>
                {customer
                  ? `Account (${customer.name.split(" ")[0]})`
                  : "Sign In / Register"}
              </span>
            </Link>
          </nav>
        </dialog>
      )}
    </>
  );
}
