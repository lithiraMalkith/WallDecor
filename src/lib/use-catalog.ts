"use client";
import { useEffect, useState } from "react";
import { mapAdminProductToStorefront, type Product } from "@/lib/products";
import type { Product as StoredProduct } from "@/types";

const EMPTY_CATALOG: Product[] = [];
export function useCatalog(initialProducts: Product[] = EMPTY_CATALOG) {
  const [state, setState] = useState({ catalog: initialProducts, catalogError: false });
  useEffect(() => {
    let controller: AbortController | undefined;
    const refresh = async () => {
      controller?.abort();
      const active = new AbortController();
      controller = active;
      try {
        const response = await fetch("/api/products?visibility=published", { cache: "no-store", signal: active.signal });
        if (!response.ok) throw new Error("Catalog unavailable");
        const json = await response.json();
        if (!json.success || !Array.isArray(json.data)) throw new Error("Invalid catalog response");
        if (!active.signal.aborted) {
          setState({ catalog: json.data.filter((p: StoredProduct) => p.visibility === "published").map(mapAdminProductToStorefront), catalogError: false });
        }
      } catch {
        if (!active.signal.aborted) setState({ catalog: [], catalogError: true });
      }
    };
    void refresh();
    window.addEventListener("focus", refresh);
    return () => { controller?.abort(); window.removeEventListener("focus", refresh); };
  }, [initialProducts]);
  return state;
}
