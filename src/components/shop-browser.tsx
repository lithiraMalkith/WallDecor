"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { products, mapAdminProductToStorefront, type Product } from "@/lib/products";
import { ProductCard } from "./product-card";
import type { CategoryNode } from "@/types";

function ShopBrowserContent({
  initial = "All",
  initialQuery = "",
  initialRoom,
  initialProducts,
}: {
  initial?: string;
  initialQuery?: string;
  initialRoom?: string;
  initialProducts?: Product[];
}) {
  const effectiveInitialRoom = initialRoom || initial || "All";
  const searchParams = useSearchParams();
  const searchParamQuery = searchParams.get("search") || initialQuery;
  const searchParamRoom = searchParams.get("room") || effectiveInitialRoom;

  const [catalog, setCatalog] = useState<Product[]>(
    initialProducts && initialProducts.length > 0 ? initialProducts : products,
  );
  const [q, setQ] = useState(searchParamQuery);
  const [filter, setFilter] = useState(searchParamRoom);
  const [sort, setSort] = useState("featured");
  const [dbCategories, setDbCategories] = useState<CategoryNode[]>([]);

  // Keep catalog synced if initialProducts updates from server
  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      setCatalog(initialProducts);
    }
  }, [initialProducts]);

  // Client-side fetch to ensure live published catalog
  useEffect(() => {
    let isMounted = true;
    async function loadLiveProducts() {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            const mapped = json.data
              .filter((p: any) => p.visibility === "published")
              .map(mapAdminProductToStorefront);
            if (isMounted && mapped.length > 0) {
              setCatalog(mapped);
            }
          }
        }
      } catch (err) {
        console.warn("Could not fetch live products in ShopBrowser:", err);
      }
    }
    loadLiveProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  // Synchronize with initialQuery / initialRoom prop updates from Server Component
  useEffect(() => {
    if (initialQuery !== undefined) {
      setQ(initialQuery);
      if (initialQuery.trim().length > 0) {
        setFilter("All");
      }
    }
  }, [initialQuery]);

  useEffect(() => {
    if (initialRoom !== undefined) {
      setFilter(initialRoom);
    }
  }, [initialRoom]);

  // Synchronize when URL searchParams changes
  useEffect(() => {
    const urlSearch = searchParams.get("search");
    const urlRoom = searchParams.get("room");

    if (urlSearch !== null) {
      setQ(urlSearch);
      if (urlSearch.trim().length > 0) {
        setFilter("All");
      }
    } else if (!initialQuery) {
      setQ("");
    }

    if (urlRoom) {
      setFilter(urlRoom);
    } else if (urlSearch === null && !initialQuery) {
      setFilter(effectiveInitialRoom);
    }
  }, [searchParams, effectiveInitialRoom, initialQuery]);

  // Listen to instantaneous catalog-search events from the header search bar
  useEffect(() => {
    const handleCatalogSearch = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (typeof customEvent.detail === "string") {
        setQ(customEvent.detail);
        setFilter("All");
      }
    };
    window.addEventListener("catalog-search", handleCatalogSearch);
    return () => {
      window.removeEventListener("catalog-search", handleCatalogSearch);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadCategories() {
      try {
        const res = await fetch("/api/categories?type=room");
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            if (isMounted) setDbCategories(json.data);
          }
        }
      } catch (err) {
        console.warn("Could not fetch categories from db:", err);
      }
    }
    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  const rooms = useMemo(() => {
    if (dbCategories.length > 0) {
      return ["All", ...dbCategories.map((c) => c.name)];
    }
    return ["All", "Living Room", "Bedroom", "Dining", "Office"];
  }, [dbCategories]);

  const visible = useMemo(() => {
    const rawQuery = q.toLowerCase().trim();

    // Store keywords that characterize all products in Ceylon Wall Decor
    const genericStoreKeywords = new Set([
      "art",
      "artwork",
      "artworks",
      "wall",
      "decor",
      "design",
      "designs",
      "piece",
      "pieces",
      "sculpture",
      "relief",
      "reliefs",
    ]);

    const tokens = rawQuery.split(/\s+/).filter(Boolean);
    // Specific search tokens excluding store-wide generic keywords
    const specificTokens = tokens.filter((t) => !genericStoreKeywords.has(t));
    const activeTokens = specificTokens.length > 0 ? specificTokens : tokens;

    let v = catalog.filter((p) => {
      const matchRoom =
        filter === "All" ||
        p.room === filter ||
        (p.rooms && p.rooms.includes(filter)) ||
        (p.room && filter.toLowerCase().includes(p.room.toLowerCase())) ||
        (p.rooms && p.rooms.some((r) => filter.toLowerCase().includes(r.toLowerCase())));

      if (!activeTokens.length) {
        return matchRoom;
      }

      // If user typed only store-wide keywords (e.g. "wall art", "decor", "sculptures"), match all
      if (specificTokens.length === 0 && tokens.length > 0) {
        return matchRoom;
      }

      // Build complete searchable text string for this product
      const searchable = [
        p.name,
        p.slug,
        p.sku,
        p.style,
        ...(p.styles || []),
        p.room,
        ...(p.rooms || []),
        p.description,
        p.longDescription || "",
        p.material || "",
        p.technique || "",
        p.badge || "",
        p.sizes ? "frame framed unframed sizes" : "",
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      // Every specific search token must match somewhere in the product
      const matchSearch = activeTokens.every((token) => searchable.includes(token));

      return matchRoom && matchSearch;
    });

    if (sort === "low") v = [...v].sort((a, b) => a.price - b.price);
    if (sort === "high") v = [...v].sort((a, b) => b.price - a.price);
    return v;
  }, [catalog, q, filter, sort]);

  return (
    <>
      {/* ElevenLabs-style Segmented Filter Bar */}
      <div className="flex flex-col gap-4 border-b border-[#EBE8E4] pb-6 md:flex-row md:items-center md:justify-between">
        {/* Category Filter */}
        <div className="flex items-center gap-6 sm:gap-7 overflow-x-auto py-1">
          {rooms.map((r) => {
            const isActive = filter === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setFilter(r)}
                className={`text-sm font-normal transition-colors whitespace-nowrap ${isActive
                  ? "text-[#000000]"
                  : "text-[#59544F] hover:text-[#000000]"
                  }`}
              >
                {r}
              </button>
            );
          })}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex gap-2 sm:gap-3">
          <label className="relative flex-1 sm:w-64">
            <Search
              className="absolute left-3.5 top-3.5 text-[#777169]"
              size={15}
            />
            <input
              className="input pl-10 text-xs rounded-full border-[#EBE8E4] focus:border-black"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter by title, style or tone…"
            />
          </label>

          <label className="relative">
            <SlidersHorizontal
              className="absolute left-3.5 top-3.5 text-[#777169]"
              size={15}
            />
            <select
              className="input pl-10 text-xs rounded-full border-[#EBE8E4] focus:border-black pr-8"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="featured">Sort: Featured</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
            </select>
          </label>
        </div>
      </div>

      <div className="my-6 flex items-center justify-between text-xs text-[#59544F]">

      </div>

      {visible.length ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {visible.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="border border-[#EBE8E4] rounded-2xl py-20 text-center bg-[#F5F3F1]">
          <p className="text-sm text-[#59544F]">
            No artwork designs match &ldquo;{q}&rdquo;.
          </p>
          <button
            onClick={() => {
              setQ("");
              setFilter("All");
            }}
            className="pill-btn pill-btn-active mt-4 text-xs"
          >
            Clear Filters
          </button>
        </div>
      )}
    </>
  );
}

export function ShopBrowser({
  initialProducts,
  initial = "All",
  initialRoom,
  initialQuery = "",
}: {
  initialProducts?: Product[];
  initial?: string;
  initialRoom?: string;
  initialQuery?: string;
}) {
  const effectiveRoom = initialRoom || initial;
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-xs text-[#777169] font-mono">
          Loading collection...
        </div>
      }
    >
      <ShopBrowserContent
        initialProducts={initialProducts}
        initial={effectiveRoom}
        initialRoom={effectiveRoom}
        initialQuery={initialQuery}
      />
    </Suspense>
  );
}
