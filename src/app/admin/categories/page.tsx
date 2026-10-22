"use client";

import React, { useEffect, useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap-config";
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Layers,
} from "lucide-react";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/admin-client";
import type { CategoryNode, CategoryType } from "@/types";

export default function AdminCategoriesPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [activeType, setActiveType] = useState<CategoryType>("room");
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (err) {
      console.error("Failed to load categories:", err);
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
        gsap.from(".cat-row", {
          opacity: 0,
          y: 12,
          stagger: 0.04,
          duration: 0.35,
          ease: "power2.out",
        });
      }
    },
    { scope: containerRef, dependencies: [loading, activeType] },
  );

  const openAddModal = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setOrder(categories.filter((c) => c.type === activeType).length + 1);
    setModalOpen(true);
  };

  const openEditModal = (cat: CategoryNode) => {
    setEditingId(cat.id);
    setName(cat.name);
    setDescription(cat.description || "");
    setOrder(cat.order);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      if (editingId) {
        const updated = await updateCategory(editingId, {
          name,
          description,
          order,
        });
        setCategories((prev) =>
          prev.map((c) => (c.id === editingId ? updated : c)),
        );
      } else {
        const created = await createCategory({
          name,
          description,
          type: activeType,
          order,
          isActive: true,
        });
        setCategories((prev) => [...prev, created]);
      }
      setModalOpen(false);
    } catch (err) {
      alert("Failed to save category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert("Failed to delete category");
    }
  };

  const currentList = categories
    .filter((c) => c.type === activeType)
    .sort((a, b) => a.order - b.order);

  if (loading) {
    return (
      <div className="min-h-[450px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-accent animate-spin" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="max-w-5xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-brand-text font-serif">
            Category Taxonomy
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-1">
            Organize art pieces by room, aesthetic style, and curated
            collections
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-accent hover:bg-brand-accent-hover text-brand-bg font-semibold text-xs sm:text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add {activeType.toUpperCase()} Category</span>
        </button>
      </div>

      {/* Type Tabs */}
      <div className="flex items-center gap-2 border-b border-brand-border/80 pb-2">
        {(["room", "style", "collection"] as CategoryType[]).map((type) => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-colors ${
              activeType === type
                ? "bg-brand-accent text-brand-bg shadow-xs"
                : "text-brand-muted hover:text-brand-text hover:bg-brand-surface"
            }`}
          >
            {type === "room"
              ? "Room Category"
              : type === "style"
                ? "Aesthetic Style"
                : "Curated Collection"}
          </button>
        ))}
      </div>

      {/* Categories Table */}
      <div className="bg-brand-surface rounded-2xl border border-brand-border overflow-hidden shadow-xl">
        <table className="admin-table">
          <thead>
            <tr>
              <th className="w-16">Sort</th>
              <th>Category Title</th>
              <th>URL Slug</th>
              <th>Description</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentList.map((cat) => (
              <tr
                key={cat.id}
                className="cat-row hover:bg-brand-surface-hover/70 transition-colors"
              >
                <td>
                  <span className="font-mono text-xs font-bold text-brand-accent bg-brand-bg px-2 py-1 rounded border border-brand-border">
                    {cat.order}
                  </span>
                </td>

                <td>
                  <span className="font-semibold text-brand-text text-sm">
                    {cat.name}
                  </span>
                </td>

                <td>
                  <span className="font-mono text-xs text-brand-muted">
                    /{cat.slug}
                  </span>
                </td>

                <td>
                  <span className="text-xs text-brand-muted line-clamp-1">
                    {cat.description || "—"}
                  </span>
                </td>

                <td className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="p-1.5 rounded-lg text-brand-muted hover:text-brand-accent hover:bg-brand-bg transition-colors"
                      title="Edit Category"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-1.5 rounded-lg text-brand-muted hover:text-brand-danger hover:bg-brand-danger/10 transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {currentList.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-10 text-xs text-brand-muted"
                >
                  No {activeType} categories configured yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <h3 className="text-base font-bold text-brand-text">
                {editingId ? "Edit Category" : `Add ${activeType} Category`}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-brand-muted hover:text-brand-text"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-brand-muted uppercase tracking-wider mb-1.5">
                  Category Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Master Bedroom / Minimalist Relief"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-brand-muted uppercase tracking-wider mb-1.5">
                  Short Description
                </label>
                <input
                  type="text"
                  placeholder="Brief description for customer category browsing..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-input"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-brand-muted uppercase tracking-wider mb-1.5">
                  Display Order Priority
                </label>
                <input
                  type="number"
                  min={1}
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                  className="form-input w-24"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2 px-3 rounded-lg border border-brand-border text-xs font-semibold text-brand-text hover:bg-brand-surface-hover"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 px-3 rounded-lg bg-brand-accent hover:bg-brand-accent-hover text-brand-bg text-xs font-semibold"
                >
                  {isSubmitting ? "Saving..." : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
