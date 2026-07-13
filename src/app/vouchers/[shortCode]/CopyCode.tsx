"use client";

import { useState } from "react";
import { Copy, Check, X } from "lucide-react";

export default function CopyCode({ code }: { code: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  function handleCopy() {
    navigator.clipboard.writeText(code)
      .then(() => setStatus("copied"))
      .catch(() => setStatus("failed"))
      .finally(() => setTimeout(() => setStatus("idle"), 1500));
  }

  return (
    <>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={`Copy voucher code ${code}`}
        className="flex items-center gap-2 mx-auto font-mono text-lg font-black tracking-widest text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-4 py-2 rounded-lg transition-colors"
      >
        {code}
        {status === "copied" ? (
          <Check size={16} className="text-green-600" />
        ) : status === "failed" ? (
          <X size={16} className="text-red-600" />
        ) : (
          <Copy size={16} className="text-zinc-500" />
        )}
      </button>
      <p role="status" aria-live="polite" className="sr-only">
        {status === "copied" ? "Code copied to clipboard" : status === "failed" ? "Could not copy code" : ""}
      </p>
    </>
  );
}
