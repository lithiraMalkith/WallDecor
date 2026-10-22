"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap-config";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Package,
  Sparkles,
  Filter,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { fetchProducts, deleteProduct } from "@/lib/admin-client";
import { formatPrice } from "@/lib/utils";
import { CLOUDINARY_SEED_IMAGES } from "@/lib/cloudinary";
import type { Product } from "@/types";

export default function AdminProductsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("all");
  const [selectedVisibility, setSelectedVisibility] = useState("all");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useGSAP(
    () => {
      if (!loading) {
        gsap.from(".page-header", {
          opacity: 0,
          y: -10,
          duration: 0.35,
          ease: "power2.out",
        });
        const rows = document.querySelectorAll(".item-row");
        if (rows.length > 0) {
          gsap.from(".item-row", {
            opacity: 0,
            y: 15,
            stagger: 0.05,
            duration: 0.4,
            ease: "power2.out",
          });
        }
      }
    },
    { scope: containerRef, dependencies: [loading] },
  );

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setDeleteConfirmId(null);
    } catch (err) {
      alert("Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.room.some((r) => r.toLowerCase().includes(search.toLowerCase()));

    const matchesRoom = selectedRoom === "all" || p.room.includes(selectedRoom);
    const matchesVis =
      selectedVisibility === "all" || p.visibility === selectedVisibility;

    return matchesSearch && matchesRoom && matchesVis;
  });

  if (loading) {
    return (
      <div className="min-h-[450px] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-accent animate-spin" />
        <p className="text-xs uppercase tracking-widest text-brand-muted">
          Loading Artwork Catalog...
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-6 pb-20">
      {/* Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-brand-text font-serif">
            Artwork Catalog
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-1">
            {products.length} handmade designs • Standard sizes (6×6 to 20×24)
            with optional framing
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-brand-accent hover:bg-brand-accent-hover text-brand-bg font-semibold text-xs sm:text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Design</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
          <input
            type="text"
            placeholder="Search by design title, SKU, or room..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input !pl-11 text-xs sm:text-sm"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="form-input py-2 text-xs w-auto"
          >
            <option value="all">All Rooms</option>
            <option value="Living Room">Living Room</option>
            <option value="Bedroom">Bedroom</option>
            <option value="Dining">Dining</option>
            <option value="Office">Office</option>
          </select>

          <select
            value={selectedVisibility}
            onChange={(e) => setSelectedVisibility(e.target.value)}
            className="form-input py-2 text-xs w-auto"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-brand-surface rounded-2xl border border-brand-border overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="min-w-[240px]">Design & SKU</th>
                <th className="min-w-[140px]">Categories</th>
                <th className="min-w-[150px]">Variants & Price</th>
                <th className="min-w-[120px]">Stock Model</th>
                <th className="min-w-[100px]">Status</th>
                <th className="text-right w-48">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const minPrice =
                  product.sizes && product.sizes.length > 0
                    ? product.sizes[0].priceWithoutFrame
                    : 0;
                const maxPrice =
                  product.sizes && product.sizes.length > 0
                    ? product.sizes[product.sizes.length - 1].priceWithFrame
                    : 0;

                return (
                  <tr
                    key={product.id}
                    className="item-row hover:bg-brand-surface-hover/70 transition-colors"
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-brand-bg border border-brand-border overflow-hidden shrink-0">
                          <img
                            src={product.images[0] || CLOUDINARY_SEED_IMAGES.hero}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                CLOUDINARY_SEED_IMAGES.hero;
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-brand-text text-sm truncate">
                              {product.name}
                            </span>
                            {product.isBestseller && (
                              <span className="text-[10px] bg-brand-accent/15 text-brand-accent border border-brand-accent/30 px-1.5 py-0.2 rounded font-medium">
                                Bestseller
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-mono text-brand-accent block mt-0.5">
                            {product.sku}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {product.room.map((r) => (
                          <span
                            key={r}
                            className="text-[11px] px-2 py-0.5 rounded-md bg-brand-bg text-brand-muted border border-brand-border"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td>
                      <div className="text-xs">
                        <span className="font-semibold text-brand-text">
                          {formatPrice(minPrice)} – {formatPrice(maxPrice)}
                        </span>
                        <span className="text-brand-muted block text-[11px] mt-0.5">
                          {product.sizes.length} standard sizes
                        </span>
                      </div>
                    </td>

                    <td>
                      <span className="text-xs font-medium text-brand-text capitalize">
                        {product.stockType === "made_to_order"
                          ? "Made-to-Order"
                          : `Ready (${product.quantity || 0})`}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium inline-block ${
                          product.visibility === "published"
                            ? "bg-brand-accent/10 text-brand-accent border border-brand-accent/30"
                            : product.visibility === "draft"
                              ? "bg-black/5 text-brand-text border-black/10"
                              : "bg-black/5 text-brand-muted border-black/10"
                        }`}
                      >
                        {product.visibility}
                      </span>
                    </td>

                    <td className="text-right w-48 whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/product/${product.slug}`}
                          target="_blank"
                          className="inline-flex items-center justify-center p-2 rounded-lg border border-brand-border bg-white hover:bg-brand-surface text-brand-muted hover:text-brand-text transition-colors shadow-2xs"
                          title="View on Storefront"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-border bg-white hover:bg-brand-surface hover:border-brand-accent/50 text-xs font-semibold text-brand-text hover:text-brand-accent transition-colors shadow-2xs"
                          title="Edit Design"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-brand-accent" />
                          <span>Edit</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(product.id)}
                          className="inline-flex items-center justify-center p-2 rounded-lg border border-brand-border bg-white hover:bg-black/5 text-brand-muted hover:text-black transition-colors shadow-2xs"
                          title="Delete Design"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <Package className="w-8 h-8 text-brand-muted mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium text-brand-text">
                      No artwork designs found
                    </p>
                    <p className="text-xs text-brand-muted mt-1">
                      Try clearing your search query or filters
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-full bg-black/10 text-brand-text flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-brand-accent" />
            </div>
            <div>
              <h3 className="text-base font-bold text-brand-text">
                Delete Artwork Design?
              </h3>
              <p className="text-xs text-brand-muted mt-1">
                {products.find((p) => p.id === deleteConfirmId)?.name ? (
                  <>
                    Are you sure you want to delete{" "}
                    <strong className="text-brand-text">
                      "{products.find((p) => p.id === deleteConfirmId)?.name}"
                    </strong>
                    ? This design will be removed from the catalog.
                  </>
                ) : (
                  "This design will be removed from customer catalog navigation."
                )}
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                disabled={isDeleting}
                className="flex-1 py-2 px-3 rounded-lg border border-brand-border text-xs font-semibold text-brand-text hover:bg-brand-surface-hover"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={isDeleting}
                className="flex-1 py-2 px-3 rounded-lg bg-black hover:bg-black/80 text-white text-xs font-semibold disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete Design"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
