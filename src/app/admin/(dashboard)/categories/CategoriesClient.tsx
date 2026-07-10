"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Check, X, Loader2, FolderOpen } from "lucide-react";
import type { Category } from "@/lib/api";
import { createCategoryAction, updateCategoryAction, deleteCategoryAction } from "./actions";
import { useConfirm } from "@/components/admin/ConfirmDialog";

// ─── Inline edit row ──────────────────────────────────────────────────────────

function CategoryRow({
  category,
  onUpdated,
  onDeleted,
}: {
  category: Category;
  onUpdated: (c: Category) => void;
  onDeleted: (id: string) => void;
}) {
  const confirm = useConfirm();
  const [editing, setEditing]   = useState(false);
  const [name, setName]         = useState(category.name);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  async function handleSave() {
    const trimmed = name.trim();
    if (!trimmed || trimmed === category.name) { setEditing(false); return; }
    setSaving(true);
    setError(null);
    try {
      const updated = await updateCategoryAction(category.id, trimmed);
      onUpdated(updated);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const ok = await confirm({
      title: `Delete "${category.name}"?`,
      message: "Products in this category will be left uncategorised. This cannot be undone.",
      confirmLabel: "Delete",
      variant: "danger",
    });
    if (!ok) return;
    setDeleting(true);
    try {
      await deleteCategoryAction(category.id);
      onDeleted(category.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete.");
      setDeleting(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") { setName(category.name); setEditing(false); }
  }

  return (
    <div className="flex items-center gap-3 px-5 py-3.5 border-b border-zinc-200/70 dark:border-zinc-800/50 last:border-0 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/30 transition-colors group">
      <FolderOpen size={14} className="text-zinc-500 dark:text-zinc-600 shrink-0" />

      {editing ? (
        <input
          autoFocus
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-400 dark:border-zinc-600 text-zinc-900 dark:text-white text-sm px-3 py-1.5 rounded-md focus:outline-none focus:border-zinc-400"
        />
      ) : (
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-900 dark:text-white">{category.name}</p>
          <p className="text-[10px] text-zinc-600 dark:text-zinc-500 font-mono mt-0.5">{category.slug}</p>
        </div>
      )}

      {error && <p className="text-[11px] text-red-600 dark:text-red-400 font-semibold shrink-0">{error}</p>}

      <div className="flex items-center gap-1 shrink-0">
        {editing ? (
          <>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="p-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md transition-colors disabled:opacity-40"
              title="Save"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
            </button>
            <button
              type="button"
              onClick={() => { setName(category.name); setEditing(false); setError(null); }}
              className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
              title="Cancel"
            >
              <X size={13} />
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="p-1.5 text-zinc-500 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md transition-colors opacity-0 group-hover:opacity-100"
              title="Rename"
            >
              <Pencil size={13} />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="p-1.5 text-zinc-500 dark:text-zinc-600 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors disabled:opacity-40 opacity-0 group-hover:opacity-100"
              title="Delete"
            >
              {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Add form ─────────────────────────────────────────────────────────────────

function AddCategoryForm({ onAdded }: { onAdded: (c: Category) => void }) {
  const [name, setName]     = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    setError(null);
    try {
      const created = await createCategoryAction(trimmed);
      onAdded(created);
      setName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Category name (e.g. Sleepwear)"
        className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm px-3.5 py-2.5 rounded-md placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
      />
      <button
        type="submit"
        disabled={saving || !name.trim()}
        className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-500 text-white dark:bg-white dark:text-black text-xs font-bold uppercase tracking-widest rounded-md hover:bg-blue-600 dark:hover:bg-zinc-200 disabled:opacity-40 transition-colors shrink-0"
      >
        {saving ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
        Add
      </button>
      {error && <p className="text-[11px] text-red-600 dark:text-red-400 font-semibold shrink-0">{error}</p>}
    </form>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function CategoriesClient({ initial }: { initial: Category[] }) {
  const [categories, setCategories] = useState<Category[]>(initial);
  const [search, setSearch]         = useState("");

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="flex-1 px-4 sm:px-6 py-6 overflow-y-auto">
      <div className="mb-8">
        <p className="text-[11px] font-bold tracking-[0.2em] text-zinc-600 dark:text-zinc-500 uppercase mb-1">Catalogue</p>
        <h1 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">Categories</h1>
        <p className="text-xs text-zinc-600 dark:text-zinc-500 mt-1">
          Organise your products into categories. Click a category name to rename it.
        </p>
      </div>

      <div className="max-w-xl space-y-5">
        {/* Add form */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
          <h3 className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest mb-4">
            New Category
          </h3>
          <AddCategoryForm
            onAdded={(c) => setCategories((prev) => [c, ...prev])}
          />
        </div>

        {/* List */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          {/* Search */}
          <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories…"
              className="w-full bg-transparent text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none"
            />
          </div>

          {/* Rows */}
          {categories.length === 0 ? (
            <p className="text-xs text-zinc-500 dark:text-zinc-600 text-center py-12 italic">
              No categories yet. Add one above.
            </p>
          ) : filtered.length === 0 ? (
            <p className="text-xs text-zinc-500 dark:text-zinc-600 text-center py-8 italic">No results.</p>
          ) : (
            filtered.map((cat) => (
              <CategoryRow
                key={cat.id}
                category={cat}
                onUpdated={(updated) =>
                  setCategories((prev) => prev.map((c) => c.id === updated.id ? updated : c))
                }
                onDeleted={(id) =>
                  setCategories((prev) => prev.filter((c) => c.id !== id))
                }
              />
            ))
          )}

          <div className="px-5 py-3 border-t border-zinc-200 dark:border-zinc-800">
            <p className="text-[10px] text-zinc-500 dark:text-zinc-600 uppercase tracking-widest font-bold">
              {categories.length} categor{categories.length !== 1 ? "ies" : "y"}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
