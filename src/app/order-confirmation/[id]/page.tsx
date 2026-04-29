import { CheckCircle } from "lucide-react";
import Link from "next/link";
import AnnouncementBar from "@/components/AnnouncementBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = { title: "Order Confirmed — Nivo" };

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ code?: string }>;
}) {
  const { id } = await params;
  const { code } = await searchParams;

  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className="pt-14 sm:pt-16 min-h-screen bg-zinc-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-zinc-200 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={32} className="text-green-500" />
          </div>

          <h1 className="text-xl font-black text-zinc-900 uppercase tracking-tight mb-2">
            Order Placed!
          </h1>
          <p className="text-sm text-zinc-500 mb-6">
            Thank you for your order. We&apos;ll be in touch to confirm delivery details.
          </p>

          {/* Secure code — primary reference */}
          {code && (
            <div className="bg-zinc-900 rounded-xl px-6 py-5 mb-4 text-center">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">
                Your Order Code
              </p>
              <p className="text-3xl font-black text-white tracking-[0.25em]">{code}</p>
              <p className="text-[11px] text-zinc-500 mt-2">
                Quote this when asking about your delivery.
              </p>
            </div>
          )}

          {/* UUID — secondary reference */}
          <div className="bg-zinc-50 rounded-lg px-4 py-3 mb-6 text-left">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
              Order Reference
            </p>
            <p className="text-[11px] font-mono text-zinc-500 break-all">{id}</p>
          </div>

          <p className="text-[11px] text-zinc-400 mb-6">
            Payment is collected on delivery. You&apos;ll receive a call to confirm your order.
          </p>

          <Link
            href="/products"
            className="block w-full py-3 border border-zinc-200 text-zinc-900 text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-zinc-50 transition-colors text-center"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
