import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { featuredCollections } from "@/data/products";

export default function FeaturedCollections() {
  return (
    <section id="collections" className="px-4 sm:px-6 py-12 sm:py-16 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-7">
        <p className="text-[11px] font-bold tracking-[0.2em] text-zinc-400 uppercase mb-1">
          Browse By Style
        </p>
        <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 uppercase tracking-tight">
          Featured Collections
        </h2>
      </div>

      {/* Collections grid */}
      {/* Mobile: 2-col equal. Desktop: asymmetric layout */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {featuredCollections.map((col, i) => {
          // First item spans full width on mobile, 2 cols on lg
          const isHero = i === 0;
          return (
            <div
              key={col.id}
              className={`relative group overflow-hidden cursor-pointer ${
                isHero ? "col-span-2 lg:col-span-2 aspect-[16/9] lg:aspect-[3/2]" : "aspect-square"
              }`}
            >
              <Image
                src={col.image}
                alt={col.name}
                fill
                className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                sizes={isHero ? "(max-width: 1024px) 100vw, 66vw" : "(max-width: 640px) 50vw, 33vw"}
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

              {/* Label */}
              <div className="absolute bottom-0 left-0 p-4 sm:p-5 flex items-end justify-between w-full">
                <div>
                  <p className="text-[10px] text-zinc-300 tracking-widest uppercase mb-0.5">
                    {col.itemCount} items
                  </p>
                  <h3 className="text-white font-black text-base sm:text-lg uppercase tracking-tight">
                    {col.name}
                  </h3>
                </div>
                <span className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full p-2 group-hover:bg-white group-hover:text-black transition-colors">
                  <ArrowRight size={14} className="text-white group-hover:text-black" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
