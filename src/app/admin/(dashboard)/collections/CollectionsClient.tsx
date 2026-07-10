"use client";

import { useState, useRef } from "react";
import {
  Plus, Pencil, Trash2, Loader2, Check, ChevronDown, ChevronUp,
  Package, ToggleLeft, ToggleRight, UploadCloud, ImageOff, X,
} from "lucide-react";
import { api, type FeaturedCollectionSummary, type FeaturedCollectionDetail, type Product } from "@/lib/api";
import { createCollectionAction, updateCollectionAction, deleteCollectionAction, getUploadSignature } from "./actions";

// ─── Image upload ─────────────────────────────────────────────────────────────

type UploadState = "idle" | "uploading" | "done" | "error";

function ImageUpload({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [state, setState] = useState<UploadState>(value ? "done" : "idle");
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) { setUploadError("Please select an image file."); return; }
    setUploadError(null);
    setState("uploading");
    setProgress(0);
    try {
      const sig = await getUploadSignature("collections");
      if (!sig.ok) { setUploadError(sig.error); setState("error"); return; }
      const body = new FormData();
      body.append("file", file);
      body.append("api_key", sig.api_key);
      body.append("timestamp", String(sig.timestamp));
      body.append("signature", sig.signature);
      body.append("folder", sig.folder);

      const url = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `https://api.cloudinary.com/v1_1/${sig.cloud_name}/image/upload`);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve((JSON.parse(xhr.responseText) as { secure_url: string }).secure_url);
          } else {
            reject(new Error(`Upload failed: ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error("Network error during upload."));
        xhr.send(body);
      });

      onChange(url);
      setState("done");
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
      setState("error");
    }
  }

  function handleRemove() {
    onChange("");
    setState("idle");
    setProgress(0);
    setUploadError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  if (state === "done" && value) {
    return (
      <div className="relative w-full h-44 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={value} alt="Cover" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
          <button
            type="button"
            onClick={handleRemove}
            className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 px-3 py-1.5 bg-red-500/90 text-zinc-900 dark:text-white text-xs font-bold rounded-md"
          >
            <X size={12} /> Remove
          </button>
        </div>
      </div>
    );
  }

  if (state === "uploading") {
    return (
      <div className="w-full h-44 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col items-center justify-center gap-3">
        <Loader2 size={22} className="text-zinc-600 dark:text-zinc-500 animate-spin" />
        <div className="w-40">
          <div className="h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 dark:bg-white rounded-full transition-all duration-200" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-[10px] text-zinc-600 dark:text-zinc-500 text-center mt-1.5 font-bold tracking-widest">{progress}%</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" className="sr-only"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        className={`w-full h-44 rounded-lg border-2 border-dashed transition-colors flex flex-col items-center justify-center gap-3 cursor-pointer ${
          state === "error"
            ? "border-red-500/40 bg-red-500/5 hover:border-red-500/60"
            : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-zinc-500 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/50"
        }`}
      >
        {state === "error"
          ? <ImageOff size={22} className="text-red-600 dark:text-red-400" />
          : <UploadCloud size={22} className="text-zinc-600 dark:text-zinc-500" />}
        <div className="text-center">
          <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            {state === "error" ? "Upload failed — try again" : "Drop an image or click to browse"}
          </p>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-600 mt-0.5">PNG, JPG, WEBP</p>
        </div>
      </button>
      {uploadError && <p className="mt-2 text-[11px] text-red-600 dark:text-red-400 font-semibold">{uploadError}</p>}
    </div>
  );
}

// ─── Product picker ───────────────────────────────────────────────────────────

function ProductPicker({
  products,
  selected,
  onChange,
}: {
  products: Product[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const [search, setSearch] = useState("");

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  function toggle(id: string) {
    onChange(
      selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]
    );
  }

  return (
    <div className="border border-zinc-300 dark:border-zinc-700 rounded-lg overflow-hidden">
      <div className="px-3 py-2 border-b border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className="w-full bg-transparent text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none"
        />
      </div>
      <div className="max-h-48 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-xs text-zinc-500 dark:text-zinc-600 px-3 py-4 text-center italic">No products found.</p>
        ) : (
          filtered.map((p) => {
            const checked = selected.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => toggle(p.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${
                  checked ? "bg-zinc-100 dark:bg-zinc-800/60" : ""
                }`}
              >
                <span
                  className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                    checked ? "bg-zinc-900 border-zinc-900 dark:bg-white dark:border-white" : "border-zinc-400 dark:border-zinc-600"
                  }`}
                >
                  {checked && <Check size={10} className="text-white dark:text-black" />}
                </span>
                {p.cover_image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.cover_image_url} alt="" className="w-8 h-8 object-cover rounded shrink-0" />
                )}
                <span className="text-sm text-zinc-800 dark:text-zinc-200 truncate">{p.name}</span>
              </button>
            );
          })
        )}
      </div>
      {selected.length > 0 && (
        <div className="px-3 py-2 border-t border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950">
          <p className="text-[11px] text-zinc-600 dark:text-zinc-400">{selected.length} product{selected.length !== 1 ? "s" : ""} selected</p>
        </div>
      )}
    </div>
  );
}

// ─── Collection form (create & edit) ─────────────────────────────────────────

interface FormState {
  name: string;
  description: string;
  cover_image_url: string;
  is_active: boolean;
  products: string[];
}

function CollectionForm({
  initial,
  products,
  onSave,
  onCancel,
  submitLabel,
}: {
  initial: FormState;
  products: Product[];
  onSave: (data: FormState) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
}) {
  const [form, setForm] = useState<FormState>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showProducts, setShowProducts] = useState(false);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div>
        <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-widest mb-1.5">
          Name <span className="text-red-600 dark:text-red-400">*</span>
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="e.g. Summer Essentials"
          className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-sm px-3.5 py-2.5 rounded-lg placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-widest mb-1.5">
          Description
        </label>
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={3}
          placeholder="Short description of this collection…"
          className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-sm px-3.5 py-2.5 rounded-lg placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors resize-none"
        />
      </div>

      {/* Cover image */}
      <div>
        <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-widest mb-1.5">
          Cover Image
        </label>
        <ImageUpload
          value={form.cover_image_url}
          onChange={(url) => set("cover_image_url", url)}
        />
      </div>

      {/* Active toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Active</span>
        <button
          type="button"
          onClick={() => set("is_active", !form.is_active)}
          className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          {form.is_active ? (
            <ToggleRight size={26} className="text-zinc-900 dark:text-white" />
          ) : (
            <ToggleLeft size={26} />
          )}
        </button>
      </div>

      {/* Products */}
      <div>
        <button
          type="button"
          onClick={() => setShowProducts((p) => !p)}
          className="flex items-center justify-between w-full text-[10px] font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-widest mb-1.5"
        >
          <span>
            Products{" "}
            <span className="text-zinc-500 dark:text-zinc-600 normal-case">
              ({form.products.length} selected)
            </span>
          </span>
          {showProducts ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
        {showProducts && (
          <ProductPicker
            products={products}
            selected={form.products}
            onChange={(ids) => set("products", ids)}
          />
        )}
      </div>

      {error && <p className="text-[11px] text-red-600 dark:text-red-400 font-semibold">{error}</p>}

      <div className="flex items-center gap-2 pt-1">
        <button
          type="submit"
          disabled={saving || !form.name.trim()}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-500 text-white dark:bg-white dark:text-black text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-blue-600 dark:hover:bg-zinc-200 disabled:opacity-40 transition-colors"
        >
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-colors"
        >
          <X size={13} /> Cancel
        </button>
      </div>
    </form>
  );
}

// ─── Collection row ───────────────────────────────────────────────────────────

function CollectionRow({
  collection,
  products,
  onUpdated,
  onDeleted,
}: {
  collection: FeaturedCollectionSummary;
  products: Product[];
  onUpdated: (updated: FeaturedCollectionDetail) => void;
  onDeleted: (slug: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detail, setDetail] = useState<FeaturedCollectionDetail | null>(null);

  async function startEdit() {
    if (detail) { setEditing(true); return; }
    setLoadingDetail(true);
    try {
      const d = await api.featuredCollections.get(collection.slug);
      setDetail(d);
      setEditing(true);
    } catch {
      setDetail(null);
      setEditing(true);
    } finally {
      setLoadingDetail(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Deactivate "${collection.name}"? It will be hidden from the store.`)) return;
    setDeleting(true);
    try {
      await deleteCollectionAction(collection.slug);
      onDeleted(collection.slug);
    } catch {
      setDeleting(false);
    }
  }

  async function handleSave(form: FormState) {
    const updated = await updateCollectionAction(collection.slug, {
      name: form.name,
      description: form.description,
      cover_image_url: form.cover_image_url,
      is_active: form.is_active,
      products: form.products,
    });
    setDetail(updated);
    onUpdated(updated);
    setEditing(false);
  }

  const initialForm: FormState = {
    name: detail?.name ?? collection.name,
    description: detail?.description ?? "",
    cover_image_url: detail?.cover_image_url ?? collection.cover_image_url ?? "",
    is_active: detail?.is_active ?? collection.is_active,
    products: detail?.products.map((p) => p.id) ?? [],
  };

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 overflow-hidden">
      {/* Header row */}
      <div className="flex items-center gap-4 px-5 py-4">
        {collection.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={collection.cover_image_url}
            alt={collection.name}
            className="w-14 h-14 object-cover rounded-lg shrink-0 border border-zinc-300 dark:border-zinc-700"
          />
        ) : (
          <div className="w-14 h-14 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-300 dark:border-zinc-700">
            <Package size={18} className="text-zinc-500 dark:text-zinc-600" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white truncate">{collection.name}</h3>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${
                collection.is_active
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-500"
              }`}
            >
              {collection.is_active ? "Active" : "Inactive"}
            </span>
          </div>
          <p className="text-[11px] text-zinc-600 dark:text-zinc-500 mt-0.5">
            {collection.product_count} product{collection.product_count !== 1 ? "s" : ""}
            {" · "}
            <span className="font-mono">{collection.slug}</span>
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={startEdit}
            disabled={loadingDetail || deleting}
            className="p-2 text-zinc-600 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-40"
            title="Edit"
          >
            {loadingDetail ? <Loader2 size={15} className="animate-spin" /> : <Pencil size={15} />}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting || loadingDetail}
            className="p-2 text-zinc-500 dark:text-zinc-600 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-40"
            title="Deactivate"
          >
            {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
          </button>
        </div>
      </div>

      {/* Edit panel */}
      {editing && (
        <div className="border-t border-zinc-200 dark:border-zinc-800 px-5 py-5">
          <CollectionForm
            initial={initialForm}
            products={products}
            onSave={handleSave}
            onCancel={() => setEditing(false)}
            submitLabel="Save Changes"
          />
        </div>
      )}
    </div>
  );
}

// ─── New collection panel ─────────────────────────────────────────────────────

function NewCollectionPanel({
  products,
  onCreated,
  onClose,
}: {
  products: Product[];
  onCreated: (c: FeaturedCollectionDetail) => void;
  onClose: () => void;
}) {
  async function handleSave(form: FormState) {
    const created = await createCollectionAction({
      name: form.name,
      description: form.description || undefined,
      cover_image_url: form.cover_image_url || undefined,
      is_active: form.is_active,
      products: form.products.length > 0 ? form.products : undefined,
    });
    onCreated(created);
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
      <h3 className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest mb-4">
        New Collection
      </h3>
      <CollectionForm
        initial={{ name: "", description: "", cover_image_url: "", is_active: true, products: [] }}
        products={products}
        onSave={handleSave}
        onCancel={onClose}
        submitLabel="Create Collection"
      />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CollectionsClient({
  initial,
  products,
}: {
  initial: FeaturedCollectionSummary[];
  products: Product[];
}) {
  const [collections, setCollections] = useState<FeaturedCollectionSummary[]>(initial);
  const [creating, setCreating] = useState(false);

  function handleCreated(detail: FeaturedCollectionDetail) {
    const summary: FeaturedCollectionSummary = {
      name: detail.name,
      slug: detail.slug,
      product_count: detail.products.length,
      cover_image_url: detail.cover_image_url,
      is_active: detail.is_active,
    };
    setCollections((prev) => [summary, ...prev]);
    setCreating(false);
  }

  function handleUpdated(detail: FeaturedCollectionDetail) {
    setCollections((prev) =>
      prev.map((c) =>
        c.slug === detail.slug
          ? {
              name: detail.name,
              slug: detail.slug,
              product_count: detail.products.length,
              cover_image_url: detail.cover_image_url,
              is_active: detail.is_active,
            }
          : c
      )
    );
  }

  return (
    <main className="flex-1 px-4 sm:px-6 py-6 overflow-y-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[11px] font-bold tracking-[0.2em] text-zinc-600 dark:text-zinc-500 uppercase mb-1">Store</p>
          <h1 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">Featured Collections</h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-500 mt-1">
            Curate collections that appear on the homepage and have their own shop page.
          </p>
        </div>
        {!creating && (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-500 text-white dark:bg-white dark:text-black text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-blue-600 dark:hover:bg-zinc-200 transition-colors shrink-0"
          >
            <Plus size={13} />
            New Collection
          </button>
        )}
      </div>

      <div className="max-w-2xl space-y-4">
        {creating && (
          <NewCollectionPanel
            products={products}
            onCreated={handleCreated}
            onClose={() => setCreating(false)}
          />
        )}

        {collections.length === 0 && !creating ? (
          <div className="border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl py-16 text-center">
            <Package size={28} className="text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
            <p className="text-sm text-zinc-500 dark:text-zinc-600">No collections yet.</p>
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="mt-3 text-xs font-bold text-zinc-600 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white uppercase tracking-widest transition-colors"
            >
              Create your first collection
            </button>
          </div>
        ) : (
          collections.map((col) => (
            <CollectionRow
              key={col.slug}
              collection={col}
              products={products}
              onUpdated={handleUpdated}
              onDeleted={(slug) =>
                setCollections((prev) => prev.filter((c) => c.slug !== slug))
              }
            />
          ))
        )}
      </div>
    </main>
  );
}
