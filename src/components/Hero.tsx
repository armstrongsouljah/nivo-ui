"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

const SLIDES = [
  {
    src:     "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=1400&q=85",
    alt:     "Boys street fashion",
    heading: <>Fresh Fits<br />For The Boys</>,
    sub:     "Street-ready style built for movement. From playground to hang-out — we've got the fit.",
  },
  {
    src:     "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=1400&q=85",
    alt:     "Kids colourful outfits",
    heading: <>Bright Days,<br />Bold Looks</>,
    sub:     "Vibrant colours and comfy cuts that keep up with the adventure.",
  },
  {
    src:     "https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=1400&q=85",
    alt:     "Active kids wear",
    heading: <>Built To<br />Move In</>,
    sub:     "Durable threads engineered for climbing, running, and everything in between.",
  },
];

const INTERVAL   = 5500;
const FADE_MS    = 900;

export default function Hero() {
  const [active, setActive] = useState(0);
  const [prev,   setPrev]   = useState<number | null>(null);

  useEffect(() => {
    const id = setInterval(() => goTo((active + 1) % SLIDES.length), INTERVAL);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  function goTo(next: number) {
    if (next === active) return;
    setPrev(active);
    setActive(next);
    setTimeout(() => setPrev(null), FADE_MS);
  }

  return (
    <section className="relative h-[90vh] min-h-140 w-full overflow-hidden bg-black">

      {/* All slides stacked — CSS opacity crossfade */}
      {SLIDES.map((s, i) => {
        const isActive = i === active;
        const isPrev   = i === prev;
        return (
          <div
            key={i}
            className="absolute inset-0"
            style={{
              zIndex:     isActive ? 2 : isPrev ? 1 : 0,
              opacity:    isActive ? 1 : 0,
              transition: `opacity ${FADE_MS}ms ease-in-out`,
            }}
          >
            <div className={isActive ? "hero-bg absolute inset-0" : "absolute inset-0"}>
              <Image
                src={s.src}
                alt={s.alt}
                fill
                priority={i === 0}
                className="object-cover object-center"
                sizes="100vw"
              />
            </div>
          </div>
        );
      })}

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 bg-linear-to-b from-black/55 via-black/20 to-black/80"
        style={{ zIndex: 3 }}
      />

      {/* Content — re-animates on slide change via key */}
      <div
        className="relative h-full flex flex-col justify-end pb-20 px-5 sm:px-10 max-w-7xl mx-auto"
        style={{ zIndex: 4 }}
      >
        <div key={active} className="max-w-lg">
          {/* Pulsing badge */}
          <div className="fade-up-1 flex items-center gap-2 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-70" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
            </span>
            <span className="text-[11px] font-bold tracking-[0.22em] text-zinc-300 uppercase">
              New Season Drop
            </span>
          </div>

          <h1 className="fade-up-2 text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight uppercase tracking-tight mb-4">
            {SLIDES[active].heading}
          </h1>

          <p className="fade-up-3 text-zinc-300 text-sm sm:text-base mb-8 max-w-xs leading-relaxed">
            {SLIDES[active].sub}
          </p>

          <div className="fade-up-4 flex flex-col sm:flex-row gap-3">
            <a
              href="#new-arrivals"
              className="bg-white text-black font-bold text-sm tracking-widest uppercase px-7 py-3.5 hover:bg-zinc-100 transition-colors text-center"
            >
              Shop Now
            </a>
            <a
              href="#collections"
              className="border border-white/70 text-white font-bold text-sm tracking-widest uppercase px-7 py-3.5 hover:bg-white/10 transition-colors text-center"
            >
              Collections
            </a>
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex items-center gap-2 mt-8">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className="h-1 rounded-full transition-all duration-500"
              style={{
                width:           i === active ? 32 : 12,
                backgroundColor: i === active ? "white" : "rgba(255,255,255,0.35)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Bouncing scroll cue */}
      <a
        href="#new-arrivals"
        className="scroll-cue absolute bottom-6 left-1/2 flex flex-col items-center gap-1.5 text-white/50 hover:text-white transition-colors"
        style={{ zIndex: 4 }}
        aria-label="Scroll to products"
      >
        <span className="text-[9px] font-bold tracking-[0.25em] uppercase">Explore</span>
        <ChevronDown size={16} strokeWidth={2.5} />
      </a>
    </section>
  );
}
