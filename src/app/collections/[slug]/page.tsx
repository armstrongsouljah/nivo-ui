import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnnouncementBar from "@/components/AnnouncementBar";
import StoreProductCard from "@/components/StoreProductCard";
import { api } from "@/lib/api";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function CollectionDetailPage({ params }: Props) {
  const { slug } = await params;

  const collection = await api.featuredCollections.get(slug).catch(() => null);

  if (!collection || !collection.is_active) notFound();

  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className="pt-14 sm:pt-16">
        {/* Hero banner */}
        <div className="relative w-full aspect-video sm:aspect-[3/1] overflow-hidden bg-zinc-900">
          {collection.cover_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={collection.cover_image_url}
              alt={collection.name}
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <div className="w-full h-full bg-zinc-800" />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 px-6 sm:px-10 pb-8 sm:pb-12">
            <Link
              href="/#collections"
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-zinc-300 uppercase tracking-widest mb-3 hover:text-white transition-colors"
            >
              <ArrowLeft size={13} /> Collections
            </Link>
            <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight leading-none">
              {collection.name}
            </h1>
            {collection.description && (
              <p className="mt-2 text-sm text-zinc-300 max-w-lg">{collection.description}</p>
            )}
            <p className="mt-2 text-[11px] text-zinc-400 uppercase tracking-widest">
              {collection.products.length} item{collection.products.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Products grid */}
        <section className="px-4 sm:px-6 py-10 sm:py-14 max-w-7xl mx-auto w-full">
          {collection.products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-zinc-400 text-sm">No products in this collection yet.</p>
              <Link
                href="/products"
                className="mt-4 inline-block text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                Browse all products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
              {collection.products.map((product) => (
                <StoreProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
