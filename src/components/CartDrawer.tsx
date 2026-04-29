"use client";

import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";

function fmtPrice(price: string) {
  const n = parseFloat(price);
  return isNaN(n) ? "—" : `UGX ${n.toLocaleString("en-UG")}`;
}

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeFromCart, updateQuantity } = useCart();
  const router = useRouter();

  function goToCheckout() {
    closeCart();
    router.push("/checkout");
  }

  const subtotal = items.reduce(
    (sum, i) => sum + parseFloat(i.price || "0") * i.quantity,
    0
  );

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <h2 className="text-sm font-black uppercase tracking-widest text-zinc-900">
            Your Cart
            {items.length > 0 && (
              <span className="ml-2 text-zinc-400 font-semibold normal-case tracking-normal">
                ({items.reduce((s, i) => s + i.quantity, 0)})
              </span>
            )}
          </h2>
          <button
            onClick={closeCart}
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-zinc-400">
              <ShoppingBag size={40} strokeWidth={1.2} />
              <p className="text-sm font-semibold">Your cart is empty</p>
            </div>
          ) : (
            <ul className="space-y-5">
              {items.map((item) => (
                <li key={item.variant_id} className="flex gap-3">
                  {/* Image */}
                  <div className="w-16 h-16 rounded-md bg-zinc-100 shrink-0 overflow-hidden">
                    {item.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag size={20} className="text-zinc-300" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-zinc-900 truncate">{item.name || "Product"}</p>
                    {item.label && (
                      <p className="text-[11px] text-zinc-500 mt-0.5 truncate">{item.label}</p>
                    )}
                    <p className="text-sm font-semibold text-zinc-700 mt-1">{fmtPrice(item.price)}</p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.variant_id, item.quantity - 1)}
                        className="w-6 h-6 rounded border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 transition-colors"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="text-sm font-bold text-zinc-900 w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.variant_id, item.quantity + 1)}
                        className="w-6 h-6 rounded border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 transition-colors"
                      >
                        <Plus size={11} />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.variant_id)}
                        className="ml-auto p-1 text-zinc-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-zinc-100 px-5 py-5 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500 font-medium">Subtotal</span>
              <span className="font-black text-zinc-900">{fmtPrice(String(subtotal))}</span>
            </div>
            <p className="text-[11px] text-zinc-400">Shipping calculated at checkout.</p>
            <button
              onClick={goToCheckout}
              className="w-full py-3.5 bg-zinc-900 text-white text-xs font-black uppercase tracking-widest rounded hover:bg-zinc-700 transition-colors"
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
