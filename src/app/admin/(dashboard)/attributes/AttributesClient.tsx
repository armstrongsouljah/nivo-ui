"use client";

import { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronRight, Loader2, Check, X } from "lucide-react";
import type { AttributeDetail, AttributeValueItem } from "@/lib/api";
import {
  createAttributeAction,
  deleteAttributeAction,
  getAttributeValuesAction,
  createAttributeValueAction,
  deleteAttributeValueAction,
} from "./actions";

// ─── Add attribute form ───────────────────────────────────────────────────────

function AddAttributeForm({ onAdded }: { onAdded: (a: AttributeDetail) => void }) {
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
      const attr = await createAttributeAction(trimmed);
      onAdded({ ...attr, values: attr.values ?? [] });
      setName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create attribute.");
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
        placeholder="Attribute name (e.g. Color)"
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
      {error && <p className="text-[11px] text-red-600 dark:text-red-400 font-semibold">{error}</p>}
    </form>
  );
}

// ─── Add value form ───────────────────────────────────────────────────────────

function AddValueForm({
  attributeId,
  onAdded,
  onCancel,
}: {
  attributeId: string;
  onAdded: (v: AttributeValueItem) => void;
  onCancel: () => void;
}) {
  const [displayValue, setDisplayValue] = useState("");
  const [hex, setHex]                   = useState("");
  const [saving, setSaving]             = useState(false);
  const [error, setError]               = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const label = displayValue.trim();
    if (!label) return;
    setSaving(true);
    setError(null);
    try {
      const slug = label.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
      const metadata: Record<string, string> = {};
      if (hex) metadata.color = hex;
      const val = await createAttributeValueAction(attributeId, {
        value: slug,
        display_value: label,
        metadata,
      });
      onAdded(val);
      setDisplayValue("");
      setHex("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add value.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2 mt-2">
      <input
        type="text"
        value={displayValue}
        onChange={(e) => setDisplayValue(e.target.value)}
        placeholder="Label (e.g. Sky Blue)"
        autoFocus
        className="flex-1 min-w-32 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-sm px-3 py-2 rounded-md placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
      />
      <div className="flex items-center gap-1.5 shrink-0">
        <label className="text-[10px] font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-widest whitespace-nowrap">
          Hex color
        </label>
        <div className="relative flex items-center">
          {hex && (
            <span
              className="w-5 h-5 rounded-full border border-zinc-400 dark:border-zinc-600 mr-1.5 shrink-0"
              style={{ backgroundColor: hex }}
            />
          )}
          <input
            type="text"
            value={hex}
            onChange={(e) => setHex(e.target.value)}
            placeholder="#000000"
            className="w-24 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-sm px-2.5 py-2 rounded-md placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
          />
        </div>
      </div>
      <div className="flex gap-1.5 shrink-0">
        <button
          type="submit"
          disabled={saving || !displayValue.trim()}
          className="flex items-center gap-1 px-3 py-2 bg-blue-500 text-white dark:bg-white dark:text-black text-xs font-bold rounded-md hover:bg-blue-600 dark:hover:bg-zinc-200 disabled:opacity-40 transition-colors"
        >
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
        >
          <X size={13} />
        </button>
      </div>
      {error && <p className="w-full text-[11px] text-red-600 dark:text-red-400 font-semibold">{error}</p>}
    </form>
  );
}

// ─── Attribute row ────────────────────────────────────────────────────────────

function AttributeRow({
  attribute,
  onDeleted,
}: {
  attribute: AttributeDetail;
  onDeleted: (id: string) => void;
}) {
  const [expanded, setExpanded]           = useState(false);
  const [values, setValues]               = useState<AttributeValueItem[]>(attribute.values ?? []);
  const [count, setCount]                 = useState(attribute.value_count ?? 0);
  const [loadingValues, setLoadingValues] = useState(false);
  const [valuesFetched, setValuesFetched] = useState(false);
  const [addingValue, setAddingValue]     = useState(false);
  const [deleting, setDeleting]           = useState(false);
  const [error, setError]                 = useState<string | null>(null);

  async function handleExpand() {
    const next = !expanded;
    setExpanded(next);
    if (next && !valuesFetched) {
      setLoadingValues(true);
      try {
        const fetched = await getAttributeValuesAction(attribute.id);
        setValues(fetched);
        setValuesFetched(true);
      } catch {
        setError("Failed to load values.");
      } finally {
        setLoadingValues(false);
      }
    }
  }

  async function handleDeleteAttr() {
    if (!confirm(`Delete "${attribute.name}" and all its values? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await deleteAttributeAction(attribute.id);
      onDeleted(attribute.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete.");
      setDeleting(false);
    }
  }

  async function handleDeleteValue(valueId: string) {
    try {
      await deleteAttributeValueAction(attribute.id, valueId);
      setValues((prev) => prev.filter((v) => v.id !== valueId));
      setCount((c) => c - 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete value.");
    }
  }

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <button
          type="button"
          onClick={handleExpand}
          className="flex items-center gap-2 text-left flex-1 min-w-0"
        >
          {expanded ? (
            <ChevronDown size={15} className="text-zinc-600 dark:text-zinc-500 shrink-0" />
          ) : (
            <ChevronRight size={15} className="text-zinc-600 dark:text-zinc-500 shrink-0" />
          )}
          <span className="text-sm font-bold text-zinc-900 dark:text-white truncate">{attribute.name}</span>
          <span className="text-[11px] text-zinc-600 dark:text-zinc-500 shrink-0">
            {count} value{count !== 1 ? "s" : ""}
          </span>
        </button>
        <button
          type="button"
          onClick={handleDeleteAttr}
          disabled={deleting}
          className="p-1.5 text-zinc-500 dark:text-zinc-600 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors disabled:opacity-40 ml-2 shrink-0"
          title="Delete attribute"
        >
          {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
        </button>
      </div>

      {/* Expanded values */}
      {expanded && (
        <div className="border-t border-zinc-200 dark:border-zinc-800 px-5 py-4 space-y-3">
          {/* Value chips */}
          {values.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {values.map((val) => {
                const hex = val.metadata?.color as string | undefined;
                return (
                  <div
                    key={val.id}
                    className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full group"
                  >
                    {hex && (
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-zinc-400 dark:border-zinc-600 shrink-0"
                        style={{ backgroundColor: hex }}
                      />
                    )}
                    <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                      {val.display_value || val.value}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteValue(val.id)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-zinc-600 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 transition-all rounded-full"
                      title="Remove"
                    >
                      <X size={11} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {loadingValues && (
            <Loader2 size={14} className="animate-spin text-zinc-600 dark:text-zinc-500" />
          )}

          {!loadingValues && values.length === 0 && !addingValue && (
            <p className="text-xs text-zinc-500 dark:text-zinc-600 italic">No values yet.</p>
          )}

          {/* Add value inline form */}
          {addingValue ? (
            <AddValueForm
              attributeId={attribute.id}
              onAdded={(v) => { setValues((prev) => [...prev, v]); setCount((c) => c + 1); setAddingValue(false); }}
              onCancel={() => setAddingValue(false)}
            />
          ) : (
            <button
              type="button"
              onClick={() => setAddingValue(true)}
              className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-600 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white uppercase tracking-widest transition-colors"
            >
              <Plus size={12} /> Add value
            </button>
          )}

          {error && <p className="text-[11px] text-red-600 dark:text-red-400 font-semibold">{error}</p>}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AttributesClient({ initial }: { initial: AttributeDetail[] }) {
  const [attributes, setAttributes] = useState<AttributeDetail[]>(initial);

  return (
    <main className="flex-1 px-4 sm:px-6 py-6 overflow-y-auto">
      <div className="mb-8">
        <p className="text-[11px] font-bold tracking-[0.2em] text-zinc-600 dark:text-zinc-500 uppercase mb-1">Catalogue</p>
        <h1 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">Attributes</h1>
        <p className="text-xs text-zinc-600 dark:text-zinc-500 mt-1">
          Manage attributes like Color and their values. Assign values to product variants on the edit page.
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Add attribute */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
          <h3 className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest mb-4">
            New Attribute
          </h3>
          <AddAttributeForm
            onAdded={(attr) => setAttributes((prev) => [...prev, attr])}
          />
        </div>

        {/* Attribute list */}
        {attributes.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-600 text-center py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
            No attributes yet. Add one above.
          </p>
        ) : (
          <div className="space-y-2">
            {attributes.map((attr) => (
              <AttributeRow
                key={attr.id}
                attribute={attr}
                onDeleted={(id) => setAttributes((prev) => prev.filter((a) => a.id !== id))}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
