"use client";

import { useState } from "react";
import { ShoppingBag, Search, Menu, X } from "lucide-react";
import { useCart } from "@/context/cart-context";

const navLinks = [
  { label: "New Arrivals", href: "#" },
  { label: "Store", href: "/products" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { totalCount, openCart } = useCart();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-cream/90 backdrop-blur-sm border-b border-ink/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <a href="/" className="text-ink font-semibold text-xl tracking-tight">
            Nivo
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-ink/70 hover:text-ink text-sm font-medium transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-4">
            <button
              aria-label="Search"
              className="text-ink/70 hover:text-ink transition-colors"
            >
              <Search size={20} />
            </button>
            <button
              aria-label="Cart"
              onClick={openCart}
              className="relative text-ink/70 hover:text-ink transition-colors"
            >
              <ShoppingBag size={20} />
              {totalCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalCount > 99 ? "99+" : totalCount}
                </span>
              )}
            </button>
            {/* Hamburger — mobile only */}
            <button
              aria-label="Toggle menu"
              className="md:hidden text-ink/70 hover:text-ink transition-colors ml-1"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden bg-cream border-t border-ink/10 px-4 py-6">
          <nav className="flex flex-col gap-5">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-ink text-lg font-medium"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
