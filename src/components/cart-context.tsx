"use client";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { mapAdminProductToStorefront, type Product } from "@/lib/products";
import type { Product as StoredProduct } from "@/types";
export type CartLine = {
  product: Product;
  size: string;
  framed: boolean;
  qty: number;
  unitPrice: number;
};
type CartValue = {
  lines: CartLine[];
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (line: CartLine) => void;
  remove: (i: number) => void;
  update: (i: number, q: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
};
const CartContext = createContext<CartValue | undefined>(undefined);
export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const hydrated = useRef(false);
  useEffect(() => {
    const controller = new AbortController();
    const restore = async () => {
      try {
        const stored = JSON.parse(localStorage.getItem("ceylon.cart.v2") || localStorage.getItem("ceylon.cart.v1") || "[]");
        if (!Array.isArray(stored)) return;
        const saved = stored.filter(item => item && typeof (item.productId || item.product?.id) === "string").map(item => ({ productId: item.productId || item.product.id, size: item.size, framed: item.framed === true, qty: item.qty }));
        localStorage.setItem("ceylon.cart.v2", JSON.stringify(saved));
        localStorage.removeItem("ceylon.cart.v1");
        if (saved.length === 0) return;
        const response = await fetch("/api/products?visibility=published", { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error("Cart products unavailable");
        const result = await response.json();
        if (!result.success || !Array.isArray(result.data)) throw new Error("Invalid catalog response");
        const products: Product[] = result.data.filter((p: StoredProduct) => p.visibility === "published").map(mapAdminProductToStorefront);
        const normalize = (label: string) => label.replace(/\s+/g, "").replace(/in$/i, "").replace(/x/g, "×");
        const restored: CartLine[] = saved.flatMap(selection => {
          const product = products.find(p => p.id === selection.productId);
          const variant = product?.sizes?.find(size => typeof selection.size === "string" && normalize(size.label) === normalize(selection.size));
          if (!product || !variant || variant.inStock === false) return [];
          const framed = selection.framed === true;
          return [{ product, size: selection.size, framed, qty: Math.max(1, Math.min(99, Math.floor(Number(selection.qty) || 1))), unitPrice: framed ? variant.priceWithFrame : variant.priceWithoutFrame }];
        });
        // A cart action during the request takes priority over restoration.
        if (!controller.signal.aborted && !hydrated.current) setLines(restored);
      } catch {
        // Retain saved selections on a temporary connection failure; never use
        // saved product names, images, stock, or prices as catalog data.
        return;
      }
      if (!controller.signal.aborted) hydrated.current = true;
    };
    void restore();
    return () => controller.abort();
  }, []);
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem("ceylon.cart.v2", JSON.stringify(lines.map(({ product, size, framed, qty }) => ({ productId: product.id, size, framed, qty }))));
      localStorage.removeItem("ceylon.cart.v1");
    } catch { /* Browsing and shopping still work when storage is disabled. */ }
  }, [lines]);
  const add = (line: CartLine) => {
    hydrated.current = true;
    setLines((v) => [...v, line]);
    setOpen(true);
  };
  const remove = (i: number) => setLines((v) => v.filter((_, x) => x !== i));
  const update = (i: number, q: number) =>
    setLines((v) =>
      v.map((l, x) => (x === i ? { ...l, qty: Math.max(1, q) } : l)),
    );
  const clear = () => setLines([]);
  return (
    <CartContext.Provider
      value={{
        lines,
        open,
        setOpen,
        add,
        remove,
        update,
        clear,
        count: lines.reduce((s, l) => s + l.qty, 0),
        subtotal: lines.reduce((s, l) => s + l.unitPrice * l.qty, 0),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
export function useCart() {
  const v = useContext(CartContext);
  if (!v) throw new Error("useCart requires CartProvider");
  return v;
}
