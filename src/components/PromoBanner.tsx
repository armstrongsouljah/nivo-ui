import Image from "next/image";

export default function PromoBanner() {
  return (
    <section className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-[340px] md:min-h-[420px]">
        {/* Image side */}
        <div className="relative h-56 md:h-auto overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=800&q=80"
            alt="Sale promotion"
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Text side */}
        <div className="bg-zinc-900 flex flex-col items-center justify-center text-center px-8 py-12 md:py-0">
          <p className="text-xs font-bold tracking-[0.3em] text-zinc-400 uppercase mb-3">
            Limited Time
          </p>
          <div className="mb-4">
            <span className="text-7xl sm:text-8xl font-black text-white leading-none block">
              50
              <span className="text-red-500">%</span>
            </span>
            <span className="text-xl font-black text-white tracking-widest uppercase">
              Off Selected Styles
            </span>
          </div>
          <p className="text-zinc-400 text-sm mb-8 max-w-xs leading-relaxed">
            Find your perfect look at a style and budget that works for your little one.
          </p>
          <a
            href="#"
            className="bg-white text-black font-bold text-xs tracking-widest uppercase px-8 py-3.5 hover:bg-zinc-200 transition-colors"
          >
            Shop The Sale
          </a>
        </div>
      </div>
    </section>
  );
}
