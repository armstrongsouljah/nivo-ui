import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative h-[85vh] min-h-[500px] w-full overflow-hidden">
      {/* Background */}
      <Image
        src="https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=1400&q=85"
        alt="Boys fashion hero"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70" />

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end pb-12 px-5 sm:px-10 max-w-7xl mx-auto">
        <div className="max-w-md">
          <span className="inline-block text-xs font-bold tracking-[0.2em] text-zinc-300 uppercase mb-3">
            New Season Drop
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight uppercase tracking-tight mb-4">
            Fresh Fits<br />For The Boys
          </h1>
          <p className="text-zinc-300 text-sm sm:text-base mb-7 max-w-xs leading-relaxed">
            Street-ready style built for movement. From playground to hang-out — we&apos;ve got the fit.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="#new-arrivals"
              className="bg-white text-black font-bold text-sm tracking-widest uppercase px-7 py-3.5 hover:bg-zinc-100 transition-colors text-center"
            >
              Shop Now
            </a>
            <a
              href="#collections"
              className="border border-white text-white font-bold text-sm tracking-widest uppercase px-7 py-3.5 hover:bg-white/10 transition-colors text-center"
            >
              Collections
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
