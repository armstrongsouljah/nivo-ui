import AnnouncementBar from "@/components/AnnouncementBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CheckoutWrapper from "./CheckoutWrapper";

export const metadata = { title: "Checkout — Nivo" };

export default function CheckoutPage() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className="pt-14 sm:pt-16 min-h-screen bg-zinc-50 flex flex-col">
        <CheckoutWrapper />
      </main>
      <Footer />
    </>
  );
}
