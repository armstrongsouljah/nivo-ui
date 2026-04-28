"use client";

import { useState, useId, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  Trash2,
  ChevronDown,
  ImageOff,
  Sparkles,
  Package,
  UploadCloud,
  X,
  Loader2,
} from "lucide-react";
import { getUploadSignature, createCategoryAction, createProductAction } from "../actions";
import { api, type Category, type AttributeDetail } from "@/lib/api";

// ─── useCategories hook ───────────────────────────────────────────────────────

function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  useEffect(() => {
    api.categories
      .list()
      .then((res) => setCategories(res.results))
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Failed to load categories.")
      )
      .finally(() => setLoading(false));
  }, []);

  async function createCategory(name: string): Promise<Category> {
    const created = await createCategoryAction(name);
    setCategories((prev) => [...prev, created]);
    return created;
  }

  return { categories, loading, error, createCategory };
}

// ─── useAttributes hook ───────────────────────────────────────────────────────

function useAttributes() {
  const [attributes, setAttributes] = useState<AttributeDetail[]>([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    api.attributes
      .list()
      .then((res) =>
        Promise.all(
          res.results.map((attr) =>
            api.attributes
              .listValues(attr.id)
              .then((r) => ({ ...attr, values: r.results }))
              .catch(() => ({ ...attr, values: [] }))
          )
        )
      )
      .then(setAttributes)
      .catch(() => setAttributes([]))
      .finally(() => setLoading(false));
  }, []);

  return { attributes, loading };
}


// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductDetails {
  name: string;
  slug: string;
  description: string;
  category: string;
  cover_image_url: string;
  is_active: boolean;
}

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

interface VariantRow {
  id: string;
  attribute_value_ids: string[];
  age_group: string;
  sku: string;
  price: string;
  compare_at_price: string;
  stock: string;
  is_active: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function variantLabel(valueIds: string[], attributes: AttributeDetail[]): string {
  return valueIds
    .map((vid) => {
      for (const attr of attributes) {
        const v = (attr.values ?? []).find((av) => av.id === vid);
        if (v) return v.display_value || v.value;
      }
      return "";
    })
    .filter(Boolean)
    .join(" / ");
}

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

// ─── ImageUpload ──────────────────────────────────────────────────────────────

type UploadState = "idle" | "uploading" | "done" | "error";

function ImageUpload({
  value,
  onChange,
  folder = "products",
}: {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
}) {
  const [state, setState] = useState<UploadState>(value ? "done" : "idle");
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file.");
      return;
    }
    setUploadError(null);
    setState("uploading");
    setProgress(0);

    try {
      const sig = await getUploadSignature(folder);

      const body = new FormData();
      body.append("file", file);
      body.append("api_key", sig.api_key);
      body.append("timestamp", String(sig.timestamp));
      body.append("signature", sig.signature);
      body.append("folder", sig.folder);

      // XHR for upload progress
      const url = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `https://api.cloudinary.com/v1_1/${sig.cloud_name}/image/upload`);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText) as { secure_url: string };
            resolve(data.secure_url);
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

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleRemove() {
    onChange("");
    setState("idle");
    setProgress(0);
    setUploadError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  // Uploaded — show preview with remove button
  if (state === "done" && value) {
    return (
      <div className="relative w-full h-48 rounded-lg overflow-hidden bg-zinc-800 group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={value} alt="Cover" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
          <button
            type="button"
            onClick={handleRemove}
            className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 px-3 py-1.5 bg-red-500/90 text-white text-xs font-bold rounded-md"
          >
            <X size={12} />
            Remove
          </button>
        </div>
      </div>
    );
  }

  // Uploading — progress bar
  if (state === "uploading") {
    return (
      <div className="w-full h-48 rounded-lg border border-zinc-800 bg-zinc-900 flex flex-col items-center justify-center gap-3">
        <Loader2 size={24} className="text-zinc-500 animate-spin" />
        <div className="w-40">
          <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[10px] text-zinc-500 text-center mt-1.5 font-bold tracking-widest">{progress}%</p>
        </div>
      </div>
    );
  }

  // Idle / error — dropzone
  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleInputChange}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={`w-full h-48 rounded-lg border-2 border-dashed transition-colors flex flex-col items-center justify-center gap-3 cursor-pointer
          ${state === "error"
            ? "border-red-500/40 bg-red-500/5 hover:border-red-500/60"
            : "border-zinc-700 bg-zinc-900 hover:border-zinc-500 hover:bg-zinc-800/50"
          }`}
      >
        {state === "error" ? (
          <ImageOff size={24} className="text-red-400" />
        ) : (
          <UploadCloud size={24} className="text-zinc-500" />
        )}
        <div className="text-center">
          <p className="text-xs font-semibold text-zinc-400">
            {state === "error" ? "Upload failed — try again" : "Drop an image or click to browse"}
          </p>
          <p className="text-[10px] text-zinc-600 mt-0.5">PNG, JPG, WEBP — max 10 MB</p>
        </div>
      </button>
      {uploadError && (
        <p className="mt-2 text-[11px] text-red-400 font-semibold">{uploadError}</p>
      )}
    </div>
  );
}

// ─── Step indicator ───────────────────────────────────────────────────────────

const STEPS = ["Product Details", "Variants", "Review"];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((label, i) => {
        const done   = i < current;
        const active = i === current;
        const last   = i === STEPS.length - 1;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black transition-colors
                ${done   ? "bg-white text-black"
                : active ? "bg-zinc-700 text-white ring-2 ring-white ring-offset-2 ring-offset-zinc-950"
                         : "bg-zinc-800 text-zinc-600"}`}>
                {done ? <Check size={13} strokeWidth={3} /> : i + 1}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest whitespace-nowrap
                ${active ? "text-white" : done ? "text-zinc-400" : "text-zinc-600"}`}>
                {label}
              </span>
            </div>
            {!last && (
              <div className={`h-px w-16 sm:w-24 mx-2 mb-5 transition-colors ${done ? "bg-white" : "bg-zinc-800"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Shared field components ──────────────────────────────────────────────────

function Label({ htmlFor, children, required }: { htmlFor: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function Input({ id, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { id: string }) {
  return (
    <input
      id={id}
      {...props}
      className={`w-full bg-zinc-900 border border-zinc-800 text-white text-sm px-3.5 py-2.5 rounded-md placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors ${props.className ?? ""}`}
    />
  );
}

function Textarea({ id, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { id: string }) {
  return (
    <textarea
      id={id}
      rows={4}
      {...props}
      className="w-full bg-zinc-900 border border-zinc-800 text-white text-sm px-3.5 py-2.5 rounded-md placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors resize-none"
    />
  );
}

function SelectField({ id, children, value, onChange }: { id: string; children: React.ReactNode; value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-zinc-900 border border-zinc-800 text-white text-sm pl-3.5 pr-9 py-2.5 rounded-md focus:outline-none focus:border-zinc-500 transition-colors cursor-pointer"
      >
        {children}
      </select>
      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 sm:p-6">
      <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-5">{title}</h3>
      {children}
    </div>
  );
}

// ─── Step 1: Product details ──────────────────────────────────────────────────

function StepDetails({ data, onChange, categories, loadingCategories, createCategory }: {
  data: ProductDetails;
  onChange: (d: ProductDetails) => void;
  categories: Category[];
  loadingCategories: boolean;
  createCategory: (name: string) => Promise<Category>;
}) {
  const nameId       = useId();
  const slugId       = useId();
  const descId       = useId();
  const catId        = useId();
  const newCatInputId = useId();
  const [showNewCat, setShowNewCat]   = useState(false);
  const [newCatName, setNewCatName]   = useState("");
  const [creatingCat, setCreatingCat] = useState(false);
  const [catError, setCatError]       = useState<string | null>(null);

  async function handleCreateCategory() {
    const name = newCatName.trim();
    if (!name) return;
    setCreatingCat(true);
    setCatError(null);
    try {
      const cat = await createCategory(name);
      onChange({ ...data, category: cat.id });
      setNewCatName("");
      setShowNewCat(false);
    } catch (err) {
      setCatError(err instanceof Error ? err.message : "Failed to create category.");
    } finally {
      setCreatingCat(false);
    }
  }

  function set<K extends keyof ProductDetails>(key: K, val: ProductDetails[K]) {
    onChange({ ...data, [key]: val });
  }

  function handleNameChange(name: string) {
    onChange({
      ...data,
      name,
      slug: data.slug === toSlug(data.name) ? toSlug(name) : data.slug,
    });
  }

  return (
    <div className="space-y-4">
      <SectionCard title="Basic Information">
        <div className="space-y-4">
          <div>
            <Label htmlFor={nameId} required>Product Name</Label>
            <Input
              id={nameId}
              placeholder="e.g. Sport Pullover Hoodie"
              value={data.name}
              onChange={(e) => handleNameChange(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor={slugId}>URL Slug</Label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-zinc-600 select-none pointer-events-none">
                /products/
              </span>
              <Input
                id={slugId}
                className="pl-22"
                placeholder="auto-generated"
                value={data.slug}
                onChange={(e) => set("slug", e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor={descId}>Description</Label>
            <Textarea
              id={descId}
              placeholder="Describe the product — materials, fit, features…"
              value={data.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Organisation">
        <div className="space-y-3">
          <div>
            <Label htmlFor={catId}>Category</Label>
            <SelectField
              id={catId}
              value={data.category}
              onChange={(v) => set("category", v)}
            >
              <option value="">
                {loadingCategories ? "Loading…" : "No category"}
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </SelectField>
          </div>

          {/* Inline new category */}
          {!showNewCat ? (
            <button
              type="button"
              onClick={() => setShowNewCat(true)}
              className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 hover:text-white uppercase tracking-widest transition-colors"
            >
              <Plus size={12} />
              New category
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <input
                id={newCatInputId}
                type="text"
                autoFocus
                placeholder="Category name"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleCreateCategory(); if (e.key === "Escape") { setShowNewCat(false); setNewCatName(""); } }}
                className="flex-1 bg-zinc-950 border border-zinc-700 text-white text-sm px-3 py-2 rounded-md placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
              />
              <button
                type="button"
                onClick={handleCreateCategory}
                disabled={creatingCat || !newCatName.trim()}
                className="px-3 py-2 bg-white text-black text-xs font-bold rounded-md hover:bg-zinc-200 disabled:opacity-40 transition-colors"
              >
                {creatingCat ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
              </button>
              <button
                type="button"
                onClick={() => { setShowNewCat(false); setNewCatName(""); setCatError(null); }}
                className="p-2 text-zinc-500 hover:text-white transition-colors"
              >
                <X size={13} />
              </button>
            </div>
          )}
          {catError && (
            <p className="text-[11px] text-red-400 font-semibold">{catError}</p>
          )}
        </div>
      </SectionCard>

      <SectionCard title="Cover Image">
        <ImageUpload
          value={data.cover_image_url}
          onChange={(url) => set("cover_image_url", url)}
          folder="products/covers"
        />
      </SectionCard>

      <SectionCard title="Visibility">
        <label className="flex items-center gap-3 cursor-pointer w-fit">
          <button
            type="button"
            role="switch"
            aria-checked={data.is_active}
            onClick={() => set("is_active", !data.is_active)}
            className={`relative w-10 h-5 rounded-full transition-colors ${data.is_active ? "bg-white" : "bg-zinc-700"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform ${data.is_active ? "translate-x-5 bg-black" : "translate-x-0 bg-zinc-400"}`} />
          </button>
          <span className="text-sm font-medium text-zinc-300">
            {data.is_active ? "Active — visible in store" : "Inactive — hidden from store"}
          </span>
        </label>
      </SectionCard>
    </div>
  );
}

// ─── Step 2: Variants ─────────────────────────────────────────────────────────

function VariantRowEditor({ row, onChange, onRemove, index, attributes }: {
  row: VariantRow;
  onChange: (r: VariantRow) => void;
  onRemove: () => void;
  index: number;
  attributes: AttributeDetail[];
}) {
  const ageId   = useId();
  const skuId   = useId();
  const priceId = useId();
  const cmpId   = useId();
  const stockId = useId();

  function set<K extends keyof VariantRow>(k: K, v: VariantRow[K]) {
    onChange({ ...row, [k]: v });
  }

  const label = variantLabel(row.attribute_value_ids, attributes);
  const ageLabel = AGE_GROUPS.find((a) => a.value === row.age_group)?.label;

  return (
    <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-950 group">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">#{index + 1}</span>
          {ageLabel && (
            <span className="text-[11px] font-bold bg-zinc-700 text-zinc-200 px-2 py-0.5 rounded">
              {ageLabel}
            </span>
          )}
          {label ? (
            label.split(" / ").map((part) => (
              <span key={part} className="text-[11px] font-bold bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded">
                {part}
              </span>
            ))
          ) : (
            !ageLabel && <span className="text-xs text-zinc-600 italic">No attributes</span>
          )}
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="p-1 text-zinc-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
          title="Remove variant"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Age group — spans full width on its own row */}
      <div className="mb-3">
        <label htmlFor={ageId} className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
          Age Group<span className="text-red-500 ml-0.5">*</span>
        </label>
        <div className="relative">
          <select
            id={ageId}
            value={row.age_group}
            onChange={(e) => set("age_group", e.target.value)}
            className="w-full appearance-none bg-zinc-900 border border-zinc-800 text-white text-sm pl-3 pr-9 py-2 rounded-md focus:outline-none focus:border-zinc-500 transition-colors cursor-pointer"
          >
            <option value="">Select age group…</option>
            {AGE_GROUPS.map((ag) => (
              <option key={ag.value} value={ag.value}>{ag.label}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label htmlFor={priceId} className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
            Price (UGX)<span className="text-red-500 ml-0.5">*</span>
          </label>
          <input
            id={priceId}
            type="number"
            min="0"
            step="100"
            placeholder="0"
            value={row.price}
            onChange={(e) => set("price", e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 text-white text-sm px-3 py-2 rounded-md placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
          />
        </div>

        <div>
          <label htmlFor={cmpId} className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
            Compare At
          </label>
          <input
            id={cmpId}
            type="number"
            min="0"
            step="100"
            placeholder="—"
            value={row.compare_at_price}
            onChange={(e) => set("compare_at_price", e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 text-white text-sm px-3 py-2 rounded-md placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
          />
        </div>

        <div>
          <label htmlFor={stockId} className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
            Stock<span className="text-red-500 ml-0.5">*</span>
          </label>
          <input
            id={stockId}
            type="number"
            min="0"
            placeholder="0"
            value={row.stock}
            onChange={(e) => set("stock", e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 text-white text-sm px-3 py-2 rounded-md placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
          />
        </div>

        <div>
          <label htmlFor={skuId} className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
            SKU
          </label>
          <input
            id={skuId}
            type="text"
            placeholder="Auto"
            value={row.sku}
            onChange={(e) => set("sku", e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 text-white text-sm px-3 py-2 rounded-md placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
          />
        </div>
      </div>
    </div>
  );
}

// ageColors: age_group value → selected color value IDs (key absent = disabled)
type AgeColors = Record<string, string[]>;

function StepVariants({ variants, onVariantsChange, attributes }: {
  variants: VariantRow[];
  onVariantsChange: (v: VariantRow[]) => void;
  attributes: AttributeDetail[];
}) {
  const colorAttr = attributes.find((a) => a.name.toLowerCase() === "color");
  const colorValues = colorAttr?.values ?? [];

  // Per-age-group color selections
  const [ageColors, setAgeColors] = useState<AgeColors>({});

  function toggleAge(ageValue: string) {
    setAgeColors((prev) => {
      const next = { ...prev };
      if (ageValue in next) delete next[ageValue];
      else next[ageValue] = [];
      return next;
    });
  }

  function toggleColor(ageValue: string, colorId: string) {
    setAgeColors((prev) => {
      const current = prev[ageValue] ?? [];
      const next = current.includes(colorId)
        ? current.filter((id) => id !== colorId)
        : [...current, colorId];
      return { ...prev, [ageValue]: next };
    });
  }

  function buildVariants() {
    const defaultPrice = variants[0]?.price ?? "";
    const rows: VariantRow[] = [];
    for (const ag of AGE_GROUPS) {
      if (!(ag.value in ageColors)) continue;
      const colors = ageColors[ag.value];
      if (colors.length === 0) {
        rows.push({ id: uid(), attribute_value_ids: [], age_group: ag.value, sku: "", price: defaultPrice, compare_at_price: "", stock: "", is_active: true });
      } else {
        for (const colorId of colors) {
          rows.push({ id: uid(), attribute_value_ids: [colorId], age_group: ag.value, sku: "", price: defaultPrice, compare_at_price: "", stock: "", is_active: true });
        }
      }
    }
    if (rows.length) onVariantsChange(rows);
  }

  function addBlankVariant() {
    onVariantsChange([
      ...variants,
      { id: uid(), attribute_value_ids: [], age_group: "", sku: "", price: "", compare_at_price: "", stock: "", is_active: true },
    ]);
  }

  function updateVariant(id: string, row: VariantRow) {
    onVariantsChange(variants.map((v) => (v.id === id ? row : v)));
  }

  function removeVariant(id: string) {
    onVariantsChange(variants.filter((v) => v.id !== id));
  }

  const enabledCount = Object.keys(ageColors).length;
  const totalVariants = Object.entries(ageColors).reduce((sum, [, colors]) => sum + Math.max(colors.length, 1), 0);

  return (
    <div className="space-y-4">
      <SectionCard title="Age Groups & Colors">
        <p className="text-xs text-zinc-500 mb-5">
          Enable each age group you want to offer, then pick which colors are available for it.
          Each age group + color becomes its own variant with independent stock.
        </p>

        {colorValues.length === 0 && (
          <p className="text-xs text-zinc-600 italic mb-4">
            No Color attribute found.{" "}
            <a href="/admin/attributes" className="underline hover:text-zinc-400">Add colors</a>{" "}
            to enable color selection per age group.
          </p>
        )}

        <div className="space-y-3">
          {AGE_GROUPS.map((ag) => {
            const enabled = ag.value in ageColors;
            const selectedColors = ageColors[ag.value] ?? [];
            return (
              <div
                key={ag.value}
                className={`rounded-lg border transition-colors ${enabled ? "border-zinc-700 bg-zinc-950" : "border-zinc-800 bg-zinc-900/30"}`}
              >
                {/* Row header — toggle + label */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={enabled}
                    onClick={() => toggleAge(ag.value)}
                    className={`relative w-9 h-5 rounded-full shrink-0 transition-colors ${enabled ? "bg-white" : "bg-zinc-700"}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform ${enabled ? "translate-x-4 bg-black" : "translate-x-0 bg-zinc-400"}`} />
                  </button>
                  <span className={`text-sm font-semibold ${enabled ? "text-white" : "text-zinc-500"}`}>
                    {ag.label}
                  </span>
                  {enabled && selectedColors.length > 0 && (
                    <span className="ml-auto text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                      {selectedColors.length} color{selectedColors.length !== 1 ? "s" : ""}
                    </span>
                  )}
                  {enabled && selectedColors.length === 0 && colorValues.length > 0 && (
                    <span className="ml-auto text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                      No color — 1 variant
                    </span>
                  )}
                </div>

                {/* Color swatches */}
                {enabled && colorValues.length > 0 && (
                  <div className="px-4 pb-3 flex flex-wrap gap-2 border-t border-zinc-800 pt-3">
                    {colorValues.map((val) => {
                      const checked = selectedColors.includes(val.id);
                      const hex = val.metadata?.color as string | undefined;
                      return (
                        <button
                          key={val.id}
                          type="button"
                          onClick={() => toggleColor(ag.value, val.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                            checked
                              ? "bg-white text-black border-white"
                              : "bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-400"
                          }`}
                        >
                          {hex && (
                            <span
                              className="w-3 h-3 rounded-full border border-zinc-400 shrink-0"
                              style={{ backgroundColor: hex }}
                            />
                          )}
                          {val.display_value || val.value}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {enabledCount > 0 && (
          <div className="mt-5 flex items-center gap-3">
            <button
              type="button"
              onClick={buildVariants}
              className="flex items-center gap-1.5 px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-md hover:bg-zinc-200 transition-colors"
            >
              <Sparkles size={13} />
              Build {totalVariants} Variant{totalVariants !== 1 ? "s" : ""}
            </button>
            <span className="text-[11px] text-zinc-600">
              Replaces any existing variants below
            </span>
          </div>
        )}
      </SectionCard>

      <SectionCard title={`Variants (${variants.length})`}>
        <div className="flex justify-end mb-3">
          <button
            type="button"
            onClick={addBlankVariant}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 text-zinc-300 text-xs font-bold uppercase tracking-widest rounded-md hover:bg-zinc-700 transition-colors"
          >
            <Plus size={12} /> Add manually
          </button>
        </div>

        {variants.length === 0 ? (
          <div className="py-8 text-center text-zinc-600 text-xs border border-dashed border-zinc-800 rounded-lg">
            Select age groups above and click &quot;Build Variants&quot;.
          </div>
        ) : (
          <div className="space-y-3">
            {variants.map((row, i) => (
              <VariantRowEditor
                key={row.id}
                index={i}
                row={row}
                attributes={attributes}
                onChange={(r) => updateVariant(row.id, r)}
                onRemove={() => removeVariant(row.id)}
              />
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

// ─── Step 3: Review ───────────────────────────────────────────────────────────

function StepReview({ details, variants, attributes }: { details: ProductDetails; variants: VariantRow[]; attributes: AttributeDetail[] }) {
  const priceNums = variants.map((v) => parseFloat(v.price)).filter(Boolean);
  const minPrice  = priceNums.length ? Math.min(...priceNums) : null;
  const maxPrice  = priceNums.length ? Math.max(...priceNums) : null;
  const totalStock = variants.reduce((acc, v) => acc + (parseInt(v.stock) || 0), 0);

  return (
    <div className="space-y-4">
      <SectionCard title="Product Summary">
        <div className="flex gap-5">
          <div className="w-20 h-20 rounded-lg bg-zinc-800 shrink-0 overflow-hidden flex items-center justify-center">
            {details.cover_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={details.cover_image_url} alt={details.name} className="w-full h-full object-cover" />
            ) : (
              <ImageOff size={20} className="text-zinc-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-black text-white leading-tight">
              {details.name || <span className="text-zinc-600 italic">Untitled</span>}
            </p>
            <p className="text-xs font-mono text-zinc-500 mt-0.5">/products/{details.slug || "—"}</p>
            {details.category && (
              <span className="inline-block mt-2 text-[10px] font-bold bg-zinc-800 text-zinc-400 px-2.5 py-1 rounded-full uppercase tracking-widest">
                {details.category}
              </span>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${details.is_active ? "bg-green-500/10 text-green-400" : "bg-zinc-500/10 text-zinc-500"}`}>
                {details.is_active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>
        {details.description && (
          <p className="mt-4 text-sm text-zinc-400 leading-relaxed">{details.description}</p>
        )}
      </SectionCard>

      <SectionCard title={`Variants — ${variants.length}`}>
        {variants.length === 0 ? (
          <p className="text-xs text-zinc-600 italic">No variants added.</p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: "Variants",    value: variants.length.toString() },
                {
                  label: "Price Range",
                  value: minPrice === null
                    ? "—"
                    : minPrice === maxPrice
                      ? `UGX ${minPrice.toLocaleString("en-UG")}`
                      : `UGX ${minPrice!.toLocaleString("en-UG")} – ${maxPrice!.toLocaleString("en-UG")}`,
                },
                { label: "Total Stock", value: totalStock.toLocaleString() },
              ].map(({ label, value }) => (
                <div key={label} className="bg-zinc-950 rounded-lg px-4 py-3">
                  <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-0.5">{label}</p>
                  <p className="text-sm font-black text-white">{value}</p>
                </div>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-125 text-xs">
                <thead>
                  <tr className="border-b border-zinc-800">
                    {["Variant", "SKU", "Price", "Compare At", "Stock"].map((h) => (
                      <th key={h} className="text-left text-[10px] font-bold text-zinc-600 uppercase tracking-widest py-2 pr-4">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {variants.map((v) => (
                    <tr key={v.id} className="border-b border-zinc-800/50 last:border-b-0">
                      <td className="py-2.5 pr-4">
                        <div className="flex flex-wrap gap-1">
                          {variantLabel(v.attribute_value_ids, attributes)
                            .split(" / ")
                            .map((part) => (
                              <span key={part} className="text-[10px] font-bold bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded">
                                {part}
                              </span>
                            ))}
                          {!v.attribute_value_ids.length && <span className="text-zinc-600 italic">Default</span>}
                        </div>
                      </td>
                      <td className="py-2.5 pr-4 font-mono text-zinc-500">
                        {v.sku || <span className="text-zinc-700 italic">Auto</span>}
                      </td>
                      <td className="py-2.5 pr-4 font-semibold text-white">
                        {v.price
                          ? `UGX ${parseFloat(v.price).toLocaleString("en-UG")}`
                          : <span className="text-red-400">Missing</span>}
                      </td>
                      <td className="py-2.5 pr-4 text-zinc-500">
                        {v.compare_at_price ? `UGX ${parseFloat(v.compare_at_price).toLocaleString("en-UG")}` : "—"}
                      </td>
                      <td className={`py-2.5 pr-4 font-bold ${parseInt(v.stock) === 0 ? "text-amber-400" : "text-white"}`}>
                        {v.stock || "0"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </SectionCard>
    </div>
  );
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validateStep(step: number, details: ProductDetails, variants: VariantRow[]): string | null {
  if (step === 0 && !details.name.trim()) return "Product name is required.";
  if (step === 1) {
    if (variants.length === 0) return "Add at least one variant.";
    for (const v of variants) {
      if (!v.price) return "All variants must have a price.";
    }
  }
  return null;
}

// ─── Main page ────────────────────────────────────────────────────────────────

const DEFAULT_DETAILS: ProductDetails = {
  name: "",
  slug: "",
  description: "",
  category: "",
  cover_image_url: "",
  is_active: true,
};

export default function NewProductPage() {
  const [step, setStep]               = useState(0);
  const [details, setDetails]         = useState<ProductDetails>(DEFAULT_DETAILS);
  const [variants, setVariants]       = useState<VariantRow[]>([]);
  const [error, setError]             = useState<string | null>(null);
  const [submitted, setSubmitted]     = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const { categories, loading: loadingCategories, createCategory } = useCategories();
  const { attributes } = useAttributes();

  function handleNext() {
    const err = validateStep(step, details, variants);
    if (err) { setError(err); return; }
    setError(null);
    setStep((s) => s + 1);
  }

  function handleBack() {
    setError(null);
    setStep((s) => s - 1);
  }

  async function handleSubmit() {
    const err = validateStep(step, details, variants);
    if (err) { setError(err); return; }
    setError(null);
    setSubmitting(true);
    try {
      await createProductAction(
        {
          name:            details.name,
          slug:            details.slug,
          description:     details.description,
          category:        details.category || null,
          cover_image_url: details.cover_image_url,
          is_active:       details.is_active,
        },
        variants.map((v) => ({
          age_group:           v.age_group,
          attribute_value_ids: v.attribute_value_ids,
          sku:                 v.sku,
          price:               v.price,
          compare_at_price:    v.compare_at_price,
          stock_quantity:       parseInt(v.stock) || 0,
          is_active:           v.is_active,
        })),
      );
      setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create product.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <main className="flex-1 px-4 sm:px-6 py-6 overflow-y-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <Check size={28} className="text-green-400" />
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight mb-2">Product Created</h2>
          <p className="text-zinc-500 text-sm mb-6">{details.name} has been added to the catalogue.</p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/admin/products"
              className="px-5 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-md hover:bg-zinc-200 transition-colors"
            >
              Back to Products
            </Link>
            <button
              onClick={() => { setStep(0); setDetails(DEFAULT_DETAILS); setVariants([]); setSubmitted(false); }}
              className="px-5 py-2.5 bg-zinc-800 text-zinc-300 text-xs font-bold uppercase tracking-widest rounded-md hover:bg-zinc-700 transition-colors"
            >
              Add Another
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 px-4 sm:px-6 py-6 overflow-y-auto">
      <div className="mb-8">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-white uppercase tracking-widest transition-colors mb-4"
        >
          <ArrowLeft size={13} />
          Products
        </Link>
        <h1 className="text-xl font-black text-white uppercase tracking-tight">New Product</h1>
        <p className="text-xs text-zinc-500 mt-1">Fill in product details, configure variants, then review before publishing.</p>
      </div>

      <StepIndicator current={step} />

      <div className="max-w-2xl">
        {step === 0 && (
          <StepDetails
            data={details}
            onChange={setDetails}
            categories={categories}
            loadingCategories={loadingCategories}
            createCategory={createCategory}
          />
        )}
        {step === 1 && (
          <StepVariants
            variants={variants}
            onVariantsChange={setVariants}
            attributes={attributes}
          />
        )}
        {step === 2 && <StepReview details={details} variants={variants} attributes={attributes} />}

        {error && (
          <div className="mt-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs font-semibold text-red-400">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between mt-6 pt-6 border-t border-zinc-800">
          <div>
            {step > 0 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 text-zinc-300 text-xs font-bold uppercase tracking-widest rounded-md hover:bg-zinc-700 transition-colors"
              >
                <ArrowLeft size={13} />
                Back
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-zinc-700 font-bold uppercase tracking-widest">
              Step {step + 1} of {STEPS.length}
            </span>
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 px-4 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-md hover:bg-zinc-200 transition-colors"
              >
                Continue
                <ArrowRight size={13} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-md hover:bg-zinc-200 disabled:opacity-50 transition-colors"
              >
                {submitting ? <Loader2 size={13} className="animate-spin" /> : <Package size={13} />}
                {submitting ? "Saving…" : "Create Product"}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
