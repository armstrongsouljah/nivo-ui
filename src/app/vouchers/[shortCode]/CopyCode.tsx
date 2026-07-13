"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex items-center gap-2 mx-auto font-mono text-lg font-black tracking-widest text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-4 py-2 rounded-lg transition-colors"
    >
      {code}
      {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} className="text-zinc-500" />}
    </button>
  );
}
