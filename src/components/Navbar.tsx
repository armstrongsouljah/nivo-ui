"use client";

import { useState } from "react";
import { ShoppingBag, Search, Menu, X } from "lucide-react";
import { useCart } from "@/context/cart-context";

const navLinks = ["New Arrivals", "Collections", "Sale", "About"];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { totalCount, openCart } = useCart();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <a href="/" className="text-white font-bold text-xl tracking-widest uppercase">
            Nivo
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link}
                href="#"
                className="text-zinc-300 hover:text-white text-sm font-medium tracking-wide transition-colors"
              >
                {link}
              </a>
            ))}
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-4">
            <button
              aria-label="Search"
              className="text-zinc-300 hover:text-white transition-colors"
            >
              <Search size={20} />
            </button>
            <button
              aria-label="Cart"
              onClick={openCart}
              className="relative text-zinc-300 hover:text-white transition-colors"
            >
              <ShoppingBag size={20} />
              {totalCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-white text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalCount > 99 ? "99+" : totalCount}
                </span>
              )}
            </button>
            {/* Hamburger — mobile only */}
            <button
              aria-label="Toggle menu"
              className="md:hidden text-zinc-300 hover:text-white transition-colors ml-1"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden bg-black border-t border-zinc-800 px-4 py-6">
          <nav className="flex flex-col gap-5">
            {navLinks.map((link) => (
              <a
                key={link}
                href="#"
                className="text-white text-lg font-medium tracking-wide"
                onClick={() => setMenuOpen(false)}
              >
                {link}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
