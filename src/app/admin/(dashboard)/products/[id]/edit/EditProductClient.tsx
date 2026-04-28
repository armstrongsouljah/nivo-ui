"use client";

import { useState, useId, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft, Check, Plus, Trash2, Pencil, ChevronDown,
  UploadCloud, X, Loader2, Save,
} from "lucide-react";
import {
  updateProductAction,
  addVariantAction,
  updateVariantAction,
  deleteVariantAction,
  addGalleryImageAction,
  deleteGalleryImageAction,
  createCategoryAction,
  getUploadSignature,
} from "../../actions";
import type { ProductDetail, ProductVariantDetail, GalleryImage, Category, AttributeDetail } from "@/lib/api";

// ─── Constants ────────────────────────────────────────────────────────────────

const AGE_GROUPS: { value: string; label: string }[] = [
  { value: "0_3m",   label: "0 – 3 Months"   },
  { value: "3_6m",   label: "3 – 6 Months"   },
  { value: "6_9m",   label: "6 – 9 Months"   },
  { value: "9_12m",  label: "9 – 12 Months"  },
  { value: "12_18m", label: "12 – 18 Months" },
  { value: "18_24m", label: "18 – 24 Months" },
  { value: "3y",     label: "3 Years"         },
  { value: "4y",     label: "4 Years"         },
  { value: "5y",     label: "5 Years"         },
  { value: "6y",     label: "6 Years"         },
  { value: "7y",     label: "7 Years"         },
  { value: "8y",     label: "8 Years"         },
];

// ─── Shared UI primitives ─────────────────────────────────────────────────────

function Label({ htmlFor, children, required }: { htmlFor: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
      {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function FieldInput({ id, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { id: string }) {
  return (
    <input
      id={id}
      {...props}
      className={`w-full bg-zinc-900 border border-zinc-800 text-white text-sm px-3.5 py-2.5 rounded-md placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors ${props.className ?? ""}`}
    />
  );
}

function FieldTextarea({ id, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { id: string }) {
  return (
    <textarea
      id={id}
      rows={4}
      {...props}
      className="w-full bg-zinc-900 border border-zinc-800 text-white text-sm px-3.5 py-2.5 rounded-md placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors resize-none"
    />
  );
}

function SectionCard({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function SaveBtn({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-md hover:bg-zinc-200 disabled:opacity-50 transition-colors"
    >
      {loading ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
      {loading ? "Saving…" : "Save"}
    </button>
  );
}

function InlineError({ msg }: { msg: string | null }) {
  if (!msg) return null;
  return <p className="mt-2 text-[11px] text-red-400 font-semibold">{msg}</p>;
}

// ─── Image upload (reused from new product page) ──────────────────────────────

function ImageUpload({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]   = useState(0);
  const [error, setError]         = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) { setError("Please select an image file."); return; }
    setError(null);
    setUploading(true);
    setProgress(0);
    try {
      const sig = await getUploadSignature("products/covers");
      const body = new FormData();
      body.append("file", file);
      body.append("api_key", sig.api_key);
      body.append("timestamp", String(sig.timestamp));
      body.append("signature", sig.signature);
      body.append("folder", sig.folder);
      const url = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `https://api.cloudinary.com/v1_1/${sig.cloud_name}/image/upload`);
        xhr.upload.onprogress = (e) => { if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100)); };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve((JSON.parse(xhr.responseText) as { secure_url: string }).secure_url);
          else reject(new Error(`Upload failed: ${xhr.status}`));
        };
        xhr.onerror = () => reject(new Error("Network error."));
        xhr.send(body);
      });
      onChange(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  if (uploading) {
    return (
      <div className="w-full h-40 rounded-lg border border-zinc-800 bg-zinc-900 flex flex-col items-center justify-center gap-3">
        <Loader2 size={20} className="text-zinc-500 animate-spin" />
        <div className="w-32">
          <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-[10px] text-zinc-500 text-center mt-1 font-bold">{progress}%</p>
        </div>
      </div>
    );
  }

  if (value) {
    return (
      <div className="relative w-full h-40 rounded-lg overflow-hidden bg-zinc-800 group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={value} alt="Cover" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
          <button
            type="button"
            onClick={() => onChange("")}
            className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 px-3 py-1.5 bg-red-500/90 text-white text-xs font-bold rounded-md"
          >
            <X size={12} /> Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        className="w-full h-40 rounded-lg border-2 border-dashed border-zinc-700 bg-zinc-900 hover:border-zinc-500 hover:bg-zinc-800/50 transition-colors flex flex-col items-center justify-center gap-3 cursor-pointer"
      >
        <UploadCloud size={20} className="text-zinc-500" />
        <p className="text-xs font-semibold text-zinc-400">Drop an image or click to browse</p>
      </button>
      {error && <p className="mt-2 text-[11px] text-red-400 font-semibold">{error}</p>}
    </div>
  );
}

// ─── Attribute picker ─────────────────────────────────────────────────────────

function AttributePicker({
  attributes,
  selected,
  onChange,
}: {
  attributes: AttributeDetail[];
  selected: Record<string, string>; // attributeId → valueId
  onChange: (attributeId: string, valueId: string | null) => void;
}) {
  if (!attributes.length) return null;
  return (
    <div className="space-y-3">
      {attributes.map((attr) => (
        <div key={attr.id}>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
            {attr.name}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(attr.values ?? []).map((val) => {
              const isSelected = selected[attr.id] === val.id;
              const hex = val.metadata?.color as string | undefined;
              return (
                <button
                  key={val.id}
                  type="button"
                  title={val.display_value || val.value}
                  onClick={() => onChange(attr.id, isSelected ? null : val.id)}
                  className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold transition-all ${
                    isSelected
                      ? "border-white text-white bg-zinc-700"
                      : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
                  }`}
                >
                  {hex && (
                    <span
                      className="w-3 h-3 rounded-full border border-zinc-600 shrink-0"
                      style={{ backgroundColor: hex }}
                    />
                  )}
                  {val.display_value || val.value}
                  {isSelected && <Check size={10} className="shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Variant row (existing) ───────────────────────────────────────────────────

function ExistingVariantRow({
  variant,
  productId,
  attributes,
  onUpdated,
  onDeleted,
}: {
  variant: ProductVariantDetail;
  productId: string;
  attributes: AttributeDetail[];
  onUpdated: (v: ProductVariantDetail) => void;
  onDeleted: (id: string) => void;
}) {
  const [editing, setEditing]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const [price, setPrice]               = useState(variant.price);
  const [compareAt, setCompareAt]       = useState(variant.compare_at_price ?? "");
  const [stock, setStock]               = useState(String(variant.stock_quantity));
  const [ageGroup, setAgeGroup]         = useState(variant.age_group);
  const [isActive, setIsActive]         = useState(variant.is_active);
  const [attrSelected, setAttrSelected] = useState<Record<string, string>>(
    () => Object.fromEntries(variant.attributes.map((a) => [a.attribute_id, a.value_id]))
  );

  const priceId    = useId();
  const compareId  = useId();
  const stockId    = useId();
  const ageId      = useId();

  const ageLabel   = AGE_GROUPS.find((a) => a.value === variant.age_group)?.label ?? variant.age_group;
  const attrBadges = variant.attributes.map((a) => a.value).join(" / ");

  async function handleSave() {
    if (!price) { setError("Price is required."); return; }
    setSaving(true);
    setError(null);
    const attribute_value_ids = Object.values(attrSelected).filter(Boolean);
    try {
      await updateVariantAction(productId, variant.id, {
        price,
        compare_at_price: compareAt || undefined,
        stock_quantity: parseInt(stock) || 0,
        age_group: ageGroup,
        is_active: isActive,
        attribute_value_ids,
      });
      const updatedAttrs = variant.attributes.filter((a) => attrSelected[a.attribute_id] === a.value_id);
      onUpdated({ ...variant, price, compare_at_price: compareAt || null, stock_quantity: parseInt(stock) || 0, age_group: ageGroup, is_active: isActive, attributes: updatedAttrs });
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this variant? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await deleteVariantAction(productId, variant.id);
      onDeleted(variant.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete.");
      setDeleting(false);
    }
  }

  return (
    <div className="border border-zinc-800 rounded-lg bg-zinc-950">
      {/* Header row */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <span className="text-[11px] font-bold bg-zinc-700 text-zinc-200 px-2 py-0.5 rounded shrink-0">
            {ageLabel}
          </span>
          {attrBadges && (
            attrBadges.split(" / ").map((b) => (
              <span key={b} className="text-[11px] font-bold bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded">
                {b}
              </span>
            ))
          )}
          <span className={`ml-1 text-[10px] font-bold uppercase tracking-wider ${variant.is_active ? "text-green-400" : "text-zinc-600"}`}>
            {variant.is_active ? "Active" : "Inactive"}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-xs font-semibold text-white mr-2">
            UGX {parseFloat(variant.price).toLocaleString("en-UG")}
          </span>
          <button
            type="button"
            onClick={() => { setEditing((e) => !e); setError(null); }}
            className="p-1.5 rounded-md text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Edit variant"
          >
            <Pencil size={13} />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-40 transition-colors"
            title="Delete variant"
          >
            {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
          </button>
        </div>
      </div>

      {/* Expanded edit form */}
      {editing && (
        <div className="border-t border-zinc-800 px-4 py-4 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label htmlFor={priceId} className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
                Price (UGX)<span className="text-red-500 ml-0.5">*</span>
              </label>
              <input id={priceId} type="number" min="0" step="100" value={price} onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-white text-sm px-3 py-2 rounded-md focus:outline-none focus:border-zinc-500" />
            </div>
            <div>
              <label htmlFor={compareId} className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
                Compare At
              </label>
              <input id={compareId} type="number" min="0" step="100" value={compareAt} onChange={(e) => setCompareAt(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-white text-sm px-3 py-2 rounded-md focus:outline-none focus:border-zinc-500" />
            </div>
            <div>
              <label htmlFor={stockId} className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
                Stock<span className="text-red-500 ml-0.5">*</span>
              </label>
              <input id={stockId} type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-white text-sm px-3 py-2 rounded-md focus:outline-none focus:border-zinc-500" />
            </div>
            <div>
              <label htmlFor={ageId} className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
                Age Group
              </label>
              <div className="relative">
                <select id={ageId} value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)}
                  className="w-full appearance-none bg-zinc-900 border border-zinc-800 text-white text-sm pl-3 pr-8 py-2 rounded-md focus:outline-none focus:border-zinc-500 cursor-pointer">
                  {AGE_GROUPS.map((ag) => <option key={ag.value} value={ag.value}>{ag.label}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {attributes.length > 0 && (
            <AttributePicker
              attributes={attributes}
              selected={attrSelected}
              onChange={(attrId, valueId) =>
                setAttrSelected((prev) => {
                  const next = { ...prev };
                  if (valueId === null) delete next[attrId];
                  else next[attrId] = valueId;
                  return next;
                })
              }
            />
          )}

          <label className="flex items-center gap-2.5 cursor-pointer w-fit">
            <button
              type="button"
              role="switch"
              aria-checked={isActive}
              onClick={() => setIsActive((v) => !v)}
              className={`relative w-9 h-5 rounded-full transition-colors ${isActive ? "bg-white" : "bg-zinc-700"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform ${isActive ? "translate-x-4 bg-black" : "translate-x-0 bg-zinc-400"}`} />
            </button>
            <span className="text-xs font-medium text-zinc-300">{isActive ? "Active" : "Inactive"}</span>
          </label>

          <InlineError msg={error} />

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={handleSave} disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black text-xs font-bold rounded-md hover:bg-zinc-200 disabled:opacity-50 transition-colors">
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
              {saving ? "Saving…" : "Save Changes"}
            </button>
            <button type="button" onClick={() => { setEditing(false); setError(null); }}
              className="px-3 py-1.5 bg-zinc-800 text-zinc-400 text-xs font-bold rounded-md hover:bg-zinc-700 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── New variant form ─────────────────────────────────────────────────────────

function NewVariantForm({
  productId,
  attributes,
  onAdded,
  onCancel,
}: {
  productId: string;
  attributes: AttributeDetail[];
  onAdded: (v: ProductVariantDetail) => void;
  onCancel: () => void;
}) {
  const [price, setPrice]         = useState("");
  const [compareAt, setCompareAt] = useState("");
  const [stock, setStock]         = useState("");
  const [ageGroup, setAgeGroup]   = useState("");
  const [attrSelected, setAttrSelected] = useState<Record<string, string>>({});
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const priceId   = useId();
  const compareId = useId();
  const stockId   = useId();
  const ageId     = useId();

  async function handleAdd() {
    if (!price)    { setError("Price is required."); return; }
    if (!ageGroup) { setError("Age group is required."); return; }
    setSaving(true);
    setError(null);
    const attribute_value_ids = Object.values(attrSelected).filter(Boolean);
    try {
      await addVariantAction(productId, {
        price,
        compare_at_price: compareAt,
        stock_quantity: parseInt(stock) || 0,
        age_group: ageGroup,
        attribute_value_ids,
        sku: "",
        is_active: true,
      });
      const optimistic: ProductVariantDetail = {
        id: crypto.randomUUID(),
        sku: "",
        price,
        compare_at_price: compareAt || null,
        stock_quantity: parseInt(stock) || 0,
        age_group: ageGroup,
        is_active: true,
        attributes: attributes.flatMap((attr) => {
          const valueId = attrSelected[attr.id];
          const val = attr.values.find((v) => v.id === valueId);
          if (!val) return [];
          return [{ attribute_id: attr.id, attribute: attr.name, value_id: val.id, value: val.display_value || val.value, metadata: val.metadata }];
        }),
      };
      onAdded(optimistic);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add variant.");
      setSaving(false);
    }
  }

  return (
    <div className="border border-zinc-700 rounded-lg bg-zinc-950 px-4 py-4 space-y-3">
      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">New Variant</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label htmlFor={priceId} className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
            Price (UGX)<span className="text-red-500 ml-0.5">*</span>
          </label>
          <input id={priceId} type="number" min="0" step="100" placeholder="0" value={price} onChange={(e) => setPrice(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 text-white text-sm px-3 py-2 rounded-md focus:outline-none focus:border-zinc-500" />
        </div>
        <div>
          <label htmlFor={compareId} className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
            Compare At
          </label>
          <input id={compareId} type="number" min="0" step="100" placeholder="—" value={compareAt} onChange={(e) => setCompareAt(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 text-white text-sm px-3 py-2 rounded-md focus:outline-none focus:border-zinc-500" />
        </div>
        <div>
          <label htmlFor={stockId} className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
            Stock<span className="text-red-500 ml-0.5">*</span>
          </label>
          <input id={stockId} type="number" min="0" placeholder="0" value={stock} onChange={(e) => setStock(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 text-white text-sm px-3 py-2 rounded-md focus:outline-none focus:border-zinc-500" />
        </div>
        <div>
          <label htmlFor={ageId} className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
            Age Group<span className="text-red-500 ml-0.5">*</span>
          </label>
          <div className="relative">
            <select id={ageId} value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)}
              className="w-full appearance-none bg-zinc-900 border border-zinc-800 text-white text-sm pl-3 pr-8 py-2 rounded-md focus:outline-none focus:border-zinc-500 cursor-pointer">
              <option value="">Select…</option>
              {AGE_GROUPS.map((ag) => <option key={ag.value} value={ag.value}>{ag.label}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {attributes.length > 0 && (
        <AttributePicker
          attributes={attributes}
          selected={attrSelected}
          onChange={(attrId, valueId) =>
            setAttrSelected((prev) => {
              const next = { ...prev };
              if (valueId === null) delete next[attrId];
              else next[attrId] = valueId;
              return next;
            })
          }
        />
      )}

      <InlineError msg={error} />

      <div className="flex gap-2 pt-1">
        <button type="button" onClick={handleAdd} disabled={saving}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black text-xs font-bold rounded-md hover:bg-zinc-200 disabled:opacity-50 transition-colors">
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
          {saving ? "Adding…" : "Add Variant"}
        </button>
        <button type="button" onClick={onCancel}
          className="px-3 py-1.5 bg-zinc-800 text-zinc-400 text-xs font-bold rounded-md hover:bg-zinc-700 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Gallery manager ──────────────────────────────────────────────────────────

function GalleryManager({ productId, initial }: { productId: string; initial: GalleryImage[] }) {
  const [images, setImages]     = useState<GalleryImage[]>(initial);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]  = useState(0);
  const [error, setError]        = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList) {
    setError(null);
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) { setError("Only image files are allowed."); continue; }
      setUploading(true);
      setProgress(0);
      try {
        const sig = await getUploadSignature("gallery");
        const body = new FormData();
        body.append("file", file);
        body.append("api_key", sig.api_key);
        body.append("timestamp", String(sig.timestamp));
        body.append("signature", sig.signature);
        body.append("folder", sig.folder);
        const url = await new Promise<string>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", `https://api.cloudinary.com/v1_1/${sig.cloud_name}/image/upload`);
          xhr.upload.onprogress = (e) => { if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100)); };
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) resolve((JSON.parse(xhr.responseText) as { secure_url: string }).secure_url);
            else reject(new Error(`Upload failed: ${xhr.status}`));
          };
          xhr.onerror = () => reject(new Error("Network error."));
          xhr.send(body);
        });
        const saved = await addGalleryImageAction(productId, { url, position: images.length });
        setImages((prev) => [...prev, saved]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed.");
      } finally {
        setUploading(false);
      }
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleDelete(id: string) {
    try {
      await deleteGalleryImageAction(productId, id);
      setImages((prev) => prev.filter((img) => img.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete image.");
    }
  }

  return (
    <div className="space-y-3">
      {/* Grid of existing images */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {images.map((img) => (
            <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden bg-zinc-800 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.alt_text || ""} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => handleDelete(img.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-red-500/90 text-white rounded-md"
                  title="Remove image"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}

          {/* Upload slot */}
          {uploading ? (
            <div className="aspect-square rounded-lg border border-zinc-700 bg-zinc-900 flex flex-col items-center justify-center gap-2">
              <Loader2 size={18} className="text-zinc-500 animate-spin" />
              <p className="text-[10px] font-bold text-zinc-600">{progress}%</p>
            </div>
          ) : (
            <button type="button" onClick={() => inputRef.current?.click()}
              className="aspect-square rounded-lg border-2 border-dashed border-zinc-700 bg-zinc-900 hover:border-zinc-500 hover:bg-zinc-800/50 transition-colors flex flex-col items-center justify-center gap-1 cursor-pointer">
              <Plus size={18} className="text-zinc-500" />
              <span className="text-[10px] text-zinc-600 font-bold">Add</span>
            </button>
          )}
        </div>
      )}

      {/* Empty state dropzone */}
      {images.length === 0 && (
        uploading ? (
          <div className="w-full h-32 rounded-lg border border-zinc-800 bg-zinc-900 flex flex-col items-center justify-center gap-2">
            <Loader2 size={20} className="text-zinc-500 animate-spin" />
            <p className="text-[10px] font-bold text-zinc-600">{progress}%</p>
          </div>
        ) : (
          <button type="button" onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files); }}
            className="w-full h-32 rounded-lg border-2 border-dashed border-zinc-700 bg-zinc-900 hover:border-zinc-500 hover:bg-zinc-800/50 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer">
            <UploadCloud size={20} className="text-zinc-500" />
            <p className="text-xs font-semibold text-zinc-400">Drop images or click to browse</p>
            <p className="text-[10px] text-zinc-600">PNG, JPG, WEBP — multiple allowed</p>
          </button>
        )
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(e) => { if (e.target.files?.length) handleFiles(e.target.files); }}
      />
      {error && <p className="text-[11px] text-red-400 font-semibold">{error}</p>}
    </div>
  );
}

// ─── Main client component ────────────────────────────────────────────────────

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
}

export default function EditProductClient({
  product,
  initialCategories,
  attributes,
}: {
  product: ProductDetail;
  initialCategories: Category[];
  attributes: AttributeDetail[];
}) {
  // ── Details state ────────────────────────────────────────────────────────
  const [name, setName]               = useState(product.name);
  const [slug, setSlug]               = useState(product.slug);
  const [description, setDescription] = useState(product.description);
  const [category, setCategory]       = useState(product.category?.id ?? "");
  const [coverUrl, setCoverUrl]       = useState(product.cover_image_url ?? "");
  const [isActive, setIsActive]       = useState(product.is_active);
  const [detailsSaving, setDetailsSaving] = useState(false);
  const [detailsError, setDetailsError]   = useState<string | null>(null);
  const [detailsSaved, setDetailsSaved]   = useState(false);

  // ── Inline new category ──────────────────────────────────────────────────
  const [showNewCat, setShowNewCat]     = useState(false);
  const [newCatName, setNewCatName]     = useState("");
  const [creatingCat, setCreatingCat]   = useState(false);
  const [catError, setCatError]         = useState<string | null>(null);
  const [categories, setCategories]     = useState<Category[]>(initialCategories);

  // ── Variants state ───────────────────────────────────────────────────────
  const [variants, setVariants]   = useState<ProductVariantDetail[]>(product.variants);
  const [addingVariant, setAddingVariant] = useState(false);

  // IDs
  const nameId  = useId();
  const slugId  = useId();
  const descId  = useId();
  const catId   = useId();
  const newCatId = useId();

  function handleNameChange(val: string) {
    setName(val);
    if (slug === toSlug(name)) setSlug(toSlug(val));
  }

  async function handleSaveDetails() {
    if (!name.trim()) { setDetailsError("Product name is required."); return; }
    setDetailsSaving(true);
    setDetailsError(null);
    setDetailsSaved(false);
    try {
      await updateProductAction(product.id, {
        name,
        slug,
        description,
        category: category || null,
        cover_image_url: coverUrl,
        is_active: isActive,
      });
      setDetailsSaved(true);
      setTimeout(() => setDetailsSaved(false), 3000);
    } catch (e) {
      setDetailsError(e instanceof Error ? e.message : "Failed to save.");
    } finally {
      setDetailsSaving(false);
    }
  }

  async function handleCreateCategory() {
    const n = newCatName.trim();
    if (!n) return;
    setCreatingCat(true);
    setCatError(null);
    try {
      const cat = await createCategoryAction(n);
      setCategories((prev) => [...prev, cat]);
      setCategory(cat.id);
      setNewCatName("");
      setShowNewCat(false);
    } catch (e) {
      setCatError(e instanceof Error ? e.message : "Failed to create category.");
    } finally {
      setCreatingCat(false);
    }
  }

  return (
    <main className="flex-1 px-4 sm:px-6 py-6 overflow-y-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-white uppercase tracking-widest transition-colors mb-4"
        >
          <ArrowLeft size={13} /> Products
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-white uppercase tracking-tight">{product.name}</h1>
            <p className="text-xs text-zinc-500 mt-1 font-mono">/products/{product.slug}</p>
          </div>
          <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${product.is_active ? "bg-green-500/10 text-green-400" : "bg-zinc-500/10 text-zinc-500"}`}>
            {product.is_active ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      <div className="max-w-2xl space-y-4">
        {/* ── Product Details ────────────────────────────────────────────── */}
        <SectionCard
          title="Product Details"
          action={
            <div className="flex items-center gap-2">
              {detailsSaved && <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Saved</span>}
              <SaveBtn loading={detailsSaving} onClick={handleSaveDetails} />
            </div>
          }
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor={nameId} required>Product Name</Label>
              <FieldInput id={nameId} value={name} onChange={(e) => handleNameChange(e.target.value)} />
            </div>
            <div>
              <Label htmlFor={slugId}>URL Slug</Label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-zinc-600 select-none pointer-events-none">/products/</span>
                <FieldInput id={slugId} className="pl-22" value={slug} onChange={(e) => setSlug(e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor={descId}>Description</Label>
              <FieldTextarea id={descId} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div>
              <Label htmlFor={catId}>Category</Label>
              <div className="relative">
                <select id={catId} value={category} onChange={(e) => setCategory(e.target.value)}
                  className="w-full appearance-none bg-zinc-900 border border-zinc-800 text-white text-sm pl-3.5 pr-9 py-2.5 rounded-md focus:outline-none focus:border-zinc-500 transition-colors cursor-pointer">
                  <option value="">No category</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
              </div>
              {!showNewCat ? (
                <button type="button" onClick={() => setShowNewCat(true)}
                  className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 hover:text-white uppercase tracking-widest transition-colors">
                  <Plus size={12} /> New category
                </button>
              ) : (
                <div className="mt-2 flex items-center gap-2">
                  <input id={newCatId} type="text" autoFocus placeholder="Category name" value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleCreateCategory(); if (e.key === "Escape") { setShowNewCat(false); setNewCatName(""); } }}
                    className="flex-1 bg-zinc-950 border border-zinc-700 text-white text-sm px-3 py-2 rounded-md placeholder-zinc-600 focus:outline-none focus:border-zinc-500" />
                  <button type="button" onClick={handleCreateCategory} disabled={creatingCat || !newCatName.trim()}
                    className="px-3 py-2 bg-white text-black text-xs font-bold rounded-md hover:bg-zinc-200 disabled:opacity-40 transition-colors">
                    {creatingCat ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                  </button>
                  <button type="button" onClick={() => { setShowNewCat(false); setNewCatName(""); setCatError(null); }}
                    className="p-2 text-zinc-500 hover:text-white transition-colors">
                    <X size={13} />
                  </button>
                </div>
              )}
              {catError && <p className="mt-1 text-[11px] text-red-400 font-semibold">{catError}</p>}
            </div>
            <div>
              <Label htmlFor="cover">Cover Image</Label>
              <ImageUpload value={coverUrl} onChange={setCoverUrl} />
            </div>
            <label className="flex items-center gap-3 cursor-pointer w-fit">
              <button type="button" role="switch" aria-checked={isActive} onClick={() => setIsActive((v) => !v)}
                className={`relative w-10 h-5 rounded-full transition-colors ${isActive ? "bg-white" : "bg-zinc-700"}`}>
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform ${isActive ? "translate-x-5 bg-black" : "translate-x-0 bg-zinc-400"}`} />
              </button>
              <span className="text-sm font-medium text-zinc-300">
                {isActive ? "Active — visible in store" : "Inactive — hidden from store"}
              </span>
            </label>
            <InlineError msg={detailsError} />
          </div>
        </SectionCard>

        {/* ── Variants ──────────────────────────────────────────────────── */}
        <SectionCard
          title={`Variants (${variants.length})`}
          action={
            !addingVariant && (
              <button type="button" onClick={() => setAddingVariant(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 text-zinc-300 text-xs font-bold uppercase tracking-widest rounded-md hover:bg-zinc-700 transition-colors">
                <Plus size={12} /> Add Variant
              </button>
            )
          }
        >
          <div className="space-y-2">
            {variants.length === 0 && !addingVariant && (
              <p className="text-xs text-zinc-600 italic text-center py-6 border border-dashed border-zinc-800 rounded-lg">
                No variants yet. Add one to make this product purchasable.
              </p>
            )}
            {variants.map((v) => (
              <ExistingVariantRow
                key={v.id}
                variant={v}
                productId={product.id}
                attributes={attributes}
                onUpdated={(updated) => setVariants((prev) => prev.map((x) => x.id === updated.id ? updated : x))}
                onDeleted={(id) => setVariants((prev) => prev.filter((x) => x.id !== id))}
              />
            ))}
            {addingVariant && (
              <NewVariantForm
                productId={product.id}
                attributes={attributes}
                onAdded={(v) => { setVariants((prev) => [...prev, v]); setAddingVariant(false); }}
                onCancel={() => setAddingVariant(false)}
              />
            )}
          </div>
        </SectionCard>

        {/* ── Gallery ───────────────────────────────────────────────────── */}
        <SectionCard title="Product Gallery">
          <GalleryManager productId={product.id} initial={product.gallery} />
        </SectionCard>
      </div>
    </main>
  );
}
