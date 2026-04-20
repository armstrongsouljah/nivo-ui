"use client";

import { useState, useRef, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const ZOOM = 2.5;

interface Props {
  images: string[];
  productName: string;
}

export default function ProductImageViewer({ images, productName }: Props) {
  const [active, setActive]       = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  const [hoverPos, setHoverPos]   = useState({ x: 50, y: 50 });
  const [modal, setModal]         = useState(false);
  const [modalIndex, setModalIndex] = useState(0);
  const mainRef = useRef<HTMLDivElement>(null);

  // Clamped lens coords (lens is 1/ZOOM of the image size)
  const lensW = 100 / ZOOM;
  const lensH = 100 / ZOOM;
  const lensLeft = Math.min(Math.max(hoverPos.x - lensW / 2, 0), 100 - lensW);
  const lensTop  = Math.min(Math.max(hoverPos.y - lensH / 2, 0), 100 - lensH);
  // Background-position for zoom result (maps lens position to bg offset)
  const bgX = (100 - lensW) > 0 ? (lensLeft / (100 - lensW)) * 100 : 0;
  const bgY = (100 - lensH) > 0 ? (lensTop  / (100 - lensH)) * 100 : 0;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!mainRef.current) return;
    const rect = mainRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top)  / rect.height) * 100;
    setHoverPos({ x, y });
  }, []);

  function prev() { setActive((i) => (i - 1 + images.length) % images.length); }
  function next() { setActive((i) => (i + 1) % images.length); }

  function openModal(i: number) { setModalIndex(i); setModal(true); }
  function modalPrev() { setModalIndex((i) => (i - 1 + images.length) % images.length); }
  function modalNext() { setModalIndex((i) => (i + 1) % images.length); }

  if (images.length === 0) {
    return (
      <div className="aspect-square w-full bg-zinc-100 flex items-center justify-center rounded-lg">
        <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest">No images</span>
      </div>
    );
  }

  return (
    <>
      {/* ── Main viewer ─────────────────────────────────────────────────── */}
      <div className="flex gap-3">
        {/* Thumbnail strip — vertical on desktop, hidden on mobile */}
        {images.length > 1 && (
          <div className="hidden sm:flex flex-col gap-2 w-16 shrink-0">
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`aspect-square rounded overflow-hidden border-2 transition-colors ${
                  i === active ? "border-zinc-900" : "border-transparent hover:border-zinc-300"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`${productName} view ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Main image + zoom result */}
        <div className="flex gap-4 flex-1 items-start">
          {/* Main image */}
          <div
            ref={mainRef}
            className={`relative flex-1 aspect-square overflow-hidden bg-zinc-100 rounded-lg select-none ${
              isZooming ? "cursor-crosshair" : "cursor-zoom-in"
            }`}
            onMouseEnter={() => setIsZooming(true)}
            onMouseLeave={() => setIsZooming(false)}
            onMouseMove={handleMouseMove}
            onClick={() => openModal(active)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[active]}
              alt={`${productName} — image ${active + 1}`}
              className="w-full h-full object-cover"
              draggable={false}
            />

            {/* Zoom lens overlay */}
            {isZooming && (
              <div
                className="absolute border border-white/70 bg-white/15 pointer-events-none hidden lg:block"
                style={{
                  width:  `${lensW}%`,
                  height: `${lensH}%`,
                  left:   `${lensLeft}%`,
                  top:    `${lensTop}%`,
                }}
              />
            )}

            {/* Mobile prev/next arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prev(); }}
                  className="sm:hidden absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); next(); }}
                  className="sm:hidden absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow"
                >
                  <ChevronRight size={16} />
                </button>
              </>
            )}

            {/* Mobile dot indicators */}
            {images.length > 1 && (
              <div className="sm:hidden absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setActive(i); }}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${i === active ? "bg-zinc-900" : "bg-zinc-400"}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Zoom result panel — only visible on large screens while hovering */}
          {isZooming && (
            <div
              className="hidden lg:block w-[420px] aspect-square border border-zinc-200 rounded-lg overflow-hidden shrink-0 shadow-xl"
              style={{
                backgroundImage:    `url(${images[active]})`,
                backgroundSize:     `${ZOOM * 100}%`,
                backgroundPosition: `${bgX}% ${bgY}%`,
                backgroundRepeat:   "no-repeat",
              }}
            />
          )}
        </div>
      </div>

      {/* ── Fullscreen modal (tap-to-zoom on mobile, click on desktop) ─── */}
      {modal && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center"
          onClick={() => setModal(false)}
        >
          <button
            onClick={() => setModal(false)}
            className="absolute top-4 right-4 p-2 text-white hover:text-zinc-300 transition-colors"
          >
            <X size={24} />
          </button>

          <div
            className="relative max-w-3xl max-h-[85vh] w-full px-12"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[modalIndex]}
              alt={`${productName} — image ${modalIndex + 1}`}
              className="w-full h-full object-contain max-h-[85vh]"
            />

            {images.length > 1 && (
              <>
                <button
                  onClick={modalPrev}
                  className="absolute left-0 top-1/2 -translate-y-1/2 p-2 text-white hover:text-zinc-300 transition-colors"
                >
                  <ChevronLeft size={32} />
                </button>
                <button
                  onClick={modalNext}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-white hover:text-zinc-300 transition-colors"
                >
                  <ChevronRight size={32} />
                </button>
              </>
            )}
          </div>

          {/* Modal thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 mt-4 px-4 overflow-x-auto">
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setModalIndex(i); }}
                  className={`w-14 h-14 shrink-0 rounded overflow-hidden border-2 transition-colors ${
                    i === modalIndex ? "border-white" : "border-white/20"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <p className="text-zinc-500 text-xs mt-3">
            {modalIndex + 1} / {images.length}
          </p>
        </div>
      )}
    </>
  );
}
