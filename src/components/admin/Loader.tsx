export default function Loader({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 py-24" role="status" aria-live="polite">
      <div className="relative h-10 w-10">
        {/* Track */}
        <div className="absolute inset-0 rounded-full border-2 border-zinc-200 dark:border-zinc-800" />
        {/* Spinning arc */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-zinc-900 dark:border-t-white animate-spin" />
        {/* Inner counter-arc for a sleeker dual-ring feel */}
        <div
          className="absolute inset-[7px] rounded-full border-2 border-transparent border-b-zinc-400 dark:border-b-zinc-500 animate-spin"
          style={{ animationDirection: "reverse", animationDuration: "0.9s" }}
        />
      </div>
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
        {label}
        <span className="inline-block animate-pulse">…</span>
      </span>
      <span className="sr-only">Loading page content</span>
    </div>
  );
}
