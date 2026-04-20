import { notFound } from "next/navigation";
import AnnouncementBar from "@/components/AnnouncementBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { serverApi } from "@/lib/server-api";
import ProductDetailClient from "./ProductDetailClient";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await serverApi.products.getBySlug(slug).catch(() => null);
  if (!product || !product.is_active) notFound();

  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className="pt-14 sm:pt-16 min-h-screen">
        <ProductDetailClient product={product} />
      </main>
      <Footer />
    </>
  );
}
