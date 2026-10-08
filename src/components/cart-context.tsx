"use client";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "@/lib/products";
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
    const timer = setTimeout(() => {
      try {
        setLines(JSON.parse(localStorage.getItem("ceylon.cart.v1") || "[]"));
      } catch {
      } finally {
        hydrated.current = true;
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (hydrated.current)
      localStorage.setItem("ceylon.cart.v1", JSON.stringify(lines));
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
