"use client";

import { useMemo, useState, useEffect } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { products } from "@/lib/products";
import { ProductCard } from "./product-card";
import type { CategoryNode } from "@/types";

export function ShopBrowser({ initial = "All" }: { initial?: string }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState(initial);
  const [sort, setSort] = useState("featured");
  const [dbCategories, setDbCategories] = useState<CategoryNode[]>([]);

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
    const query = q.toLowerCase().trim();
    let v = products.filter((p) => {
      const matchRoom =
        filter === "All" ||
        p.room === filter ||
        (p.rooms && p.rooms.includes(filter)) ||
        (p.room && filter.toLowerCase().includes(p.room.toLowerCase())) ||
        (p.rooms && p.rooms.some((r) => filter.toLowerCase().includes(r.toLowerCase())));

      const matchSearch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.style.toLowerCase().includes(query) ||
        (p.styles && p.styles.some((s) => s.toLowerCase().includes(query))) ||
        (p.description && p.description.toLowerCase().includes(query));

      return matchRoom && matchSearch;
    });

    if (sort === "low") v = [...v].sort((a, b) => a.price - b.price);
    if (sort === "high") v = [...v].sort((a, b) => b.price - a.price);
    return v;
  }, [q, filter, sort]);

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
