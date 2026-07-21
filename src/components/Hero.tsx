import Image from "next/image";
import { ChevronDown } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative h-[85vh] min-h-125 w-full overflow-hidden bg-cream">
      {/* Background image */}
      <div className="hero-bg absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1522771930-78848d9293e8?w=1400&q=85"
          alt="Baby in a cozy knit romper"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
      </div>

      {/* Soft gradient overlay — scoped to where the text sits so the photo stays vivid elsewhere */}
      <div className="absolute inset-0 bg-linear-to-t from-cream from-10% via-transparent via-40% to-transparent sm:bg-linear-to-r sm:from-cream sm:from-0% sm:via-cream/20 sm:via-45% sm:to-transparent" />

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end sm:justify-center pb-16 sm:pb-0 px-5 sm:px-10 max-w-7xl mx-auto">
        <div className="max-w-md">
          <div className="fade-up-1 flex items-center gap-2 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose opacity-70" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose" />
            </span>
            <span className="text-[11px] font-semibold tracking-[0.18em] text-ink/60 uppercase">
              New Season Arrivals
            </span>
          </div>

          <h1 className="fade-up-2 text-4xl sm:text-5xl md:text-6xl font-semibold text-ink leading-tight tracking-tight mb-4">
            Soft Starts,<br />Little Wonders
          </h1>

          <p className="fade-up-3 text-ink/70 text-sm sm:text-base mb-8 max-w-xs leading-relaxed">
            Breathable, organic-cotton essentials made gentle for delicate skin — and easy for busy days.
          </p>

          <div className="fade-up-4 flex flex-col sm:flex-row gap-3">
            <a
              href="#new-arrivals"
              className="bg-ink text-cream font-semibold text-sm rounded-full px-7 py-3.5 hover:bg-ink/85 transition-colors text-center"
            >
              Shop New Arrivals
            </a>
            <a
              href="/products"
              className="border border-ink/25 text-ink font-semibold text-sm rounded-full px-7 py-3.5 hover:bg-ink/5 transition-colors text-center"
            >
              Visit Store
            </a>
          </div>
        </div>
      </div>

      {/* Bouncing scroll cue */}
      <a
        href="#new-arrivals"
        className="scroll-cue absolute bottom-6 left-1/2 flex flex-col items-center gap-1.5 text-ink/40 hover:text-ink transition-colors"
        aria-label="Scroll to products"
      >
        <span className="text-[9px] font-semibold tracking-[0.2em] uppercase">Explore</span>
        <ChevronDown size={16} strokeWidth={2.5} />
      </a>
    </section>
  );
}
