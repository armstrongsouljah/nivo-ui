import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { api } from "@/lib/api";

export default async function FeaturedCollections() {
  const collections = await api.featuredCollections
    .list()
    .then((r) => r.results.filter((c) => c.is_active))
    .catch(() => []);

  if (collections.length === 0) return null;

  return (
    <section id="collections" className="px-4 sm:px-6 py-12 sm:py-16 max-w-7xl mx-auto w-full">
      <div className="mb-7">
        <p className="text-[11px] font-bold tracking-[0.2em] text-zinc-400 uppercase mb-1">
          Browse By Style
        </p>
        <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 uppercase tracking-tight">
          Featured Collections
        </h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {collections.map((col, i) => {
          const isHero = i === 0;
          return (
            <Link
              key={col.slug}
              href={`/collections/${col.slug}`}
              className={`relative group overflow-hidden cursor-pointer block ${
                isHero ? "col-span-2 lg:col-span-2 aspect-video lg:aspect-3/2" : "aspect-square"
              }`}
            >
              {col.cover_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={col.cover_image_url}
                  alt={col.name}
                  className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-zinc-200" />
              )}

              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />

              <div className="absolute bottom-0 left-0 p-4 sm:p-5 flex items-end justify-between w-full">
                <div>
                  <p className="text-[10px] text-zinc-300 tracking-widest uppercase mb-0.5">
                    {col.product_count} item{col.product_count !== 1 ? "s" : ""}
                  </p>
                  <h3 className="text-white font-black text-base sm:text-lg uppercase tracking-tight">
                    {col.name}
                  </h3>
                </div>
                <span className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full p-2 group-hover:bg-white group-hover:text-black transition-colors">
                  <ArrowRight size={14} className="text-white group-hover:text-black" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
