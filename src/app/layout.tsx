import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { CartProvider } from "@/context/cart-context";
import CartDrawer from "@/components/CartDrawer";
import { THEME_STORAGE_KEY, THEME_ROOT_ID } from "@/components/admin/ThemeProvider";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nivo — Boys Clothing",
  description: "Fresh fits for the boys. Shop new arrivals and featured collections.",
};

// Runs before hydration so the admin dashboard's theme is correct on first
// paint instead of flashing light then dark (or vice versa). No-ops on
// every non-admin page since THEME_ROOT_ID only exists in the admin layout.
// `beforeInteractive` scripts must live in the root layout in this Next.js
// version, so this can't be colocated with the rest of the theme code.
const NO_FLASH_SCRIPT = `
(function () {
  try {
    var pref = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
    var dark = pref === "dark" || ((!pref || pref === "system") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    var el = document.getElementById(${JSON.stringify(THEME_ROOT_ID)});
    if (el) el.classList.toggle("dark", dark);
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col font-[var(--font-geist-sans)]">
        <Script id="admin-theme-init" strategy="beforeInteractive">
          {NO_FLASH_SCRIPT}
        </Script>
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
