"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import type { CartItemPayload } from "@/lib/api";

const CART_ID_KEY    = "nivo_cart_id";
const CART_ITEMS_KEY = "nivo_cart_items";

export interface LocalCartItem {
  variant_id: string;
  quantity:   number;
  name:       string;
  label:      string;       // e.g. "6–9 Months / Grey"
  price:      string;       // decimal string from API
  image_url:  string | null;
}

export interface AddToCartParams {
  variantId: string;
  name:      string;
  label:     string;
  price:     string;
  imageUrl?: string;
}

interface CartContextValue {
  items:          LocalCartItem[];
  totalCount:     number;
  isOpen:         boolean;
  openCart:       () => void;
  closeCart:      () => void;
  isInCart:       (variantId: string) => boolean;
  addToCart:      (params: AddToCartParams) => void;
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart:      () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

function persistItems(items: LocalCartItem[]) {
  localStorage.setItem(CART_ITEMS_KEY, JSON.stringify(items));
}

function loadPersistedItems(): LocalCartItem[] {
  try {
    const raw = localStorage.getItem(CART_ITEMS_KEY);
    return raw ? (JSON.parse(raw) as LocalCartItem[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems]   = useState<LocalCartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const cartIdRef  = useRef<string | null>(null);
  const syncTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Restore display data instantly from localStorage.
    const cached = loadPersistedItems();
    if (cached.length) setItems(cached);

    // Validate against the server and reconcile quantities.
    const storedId = localStorage.getItem(CART_ID_KEY);
    if (!storedId) return;

    api.cart
      .get(storedId)
      .then((cart) => {
        cartIdRef.current = cart.id;
        // Merge: server quantities are authoritative; keep local display metadata.
        setItems((prev) => {
          const merged = cart.items.map((serverItem) => {
            const local = prev.find((i) => i.variant_id === serverItem.product_variant);
            return local
              ? { ...local, quantity: serverItem.quantity }
              : { variant_id: serverItem.product_variant, quantity: serverItem.quantity, name: "", label: "", price: "0", image_url: null };
          });
          persistItems(merged);
          return merged;
        });
      })
      .catch(() => {
        localStorage.removeItem(CART_ID_KEY);
        localStorage.removeItem(CART_ITEMS_KEY);
        setItems([]);
      });
  }, []);

  function scheduleSync(nextItems: LocalCartItem[]) {
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(async () => {
      const payload: CartItemPayload[] = nextItems.map((i) => ({
        product_variant: i.variant_id,
        quantity:        i.quantity,
      }));
      try {
        if (!cartIdRef.current) {
          if (payload.length === 0) return;
          const cart = await api.cart.create(payload);
          cartIdRef.current = cart.id;
          localStorage.setItem(CART_ID_KEY, cart.id);
        } else if (payload.length === 0) {
          await api.cart.delete(cartIdRef.current);
          cartIdRef.current = null;
          localStorage.removeItem(CART_ID_KEY);
          localStorage.removeItem(CART_ITEMS_KEY);
        } else {
          await api.cart.update(cartIdRef.current, payload);
        }
      } catch {
        // Silent fail — optimistic local state is still correct for the UI.
      }
    }, 400);
  }

  function addToCart({ variantId, name, label, price, imageUrl }: AddToCartParams) {
    setItems((prev) => {
      const existing = prev.find((i) => i.variant_id === variantId);
      const next: LocalCartItem[] = existing
        ? prev.map((i) =>
            i.variant_id === variantId ? { ...i, quantity: i.quantity + 1 } : i
          )
        : [...prev, { variant_id: variantId, quantity: 1, name, label, price, image_url: imageUrl ?? null }];
      persistItems(next);
      scheduleSync(next);
      return next;
    });
    setIsOpen(true);
  }

  function removeFromCart(variantId: string) {
    setItems((prev) => {
      const next = prev.filter((i) => i.variant_id !== variantId);
      persistItems(next);
      scheduleSync(next);
      return next;
    });
  }

  function updateQuantity(variantId: string, quantity: number) {
    if (quantity <= 0) { removeFromCart(variantId); return; }
    setItems((prev) => {
      const next = prev.map((i) =>
        i.variant_id === variantId ? { ...i, quantity } : i
      );
      persistItems(next);
      scheduleSync(next);
      return next;
    });
  }

  async function clearCart() {
    if (syncTimer.current) clearTimeout(syncTimer.current);
    const id = cartIdRef.current;
    cartIdRef.current = null;
    setItems([]);
    setIsOpen(false);
    localStorage.removeItem(CART_ID_KEY);
    localStorage.removeItem(CART_ITEMS_KEY);
    if (id) {
      try { await api.cart.delete(id); } catch { /* ignore */ }
    }
  }

  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      totalCount,
      isOpen,
      openCart:       () => setIsOpen(true),
      closeCart:      () => setIsOpen(false),
      isInCart:       (v) => items.some((i) => i.variant_id === v),
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
