import AnnouncementBar from "@/components/AnnouncementBar";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import NewArrivals from "@/components/NewArrivals";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className="pt-14 sm:pt-16">
        <Hero />
        <NewArrivals />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}
