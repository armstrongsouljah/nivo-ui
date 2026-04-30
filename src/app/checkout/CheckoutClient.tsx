"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Loader2 } from "lucide-react";
import { useCart } from "@/context/cart-context";
import type { ShippingAddress } from "@/lib/api";
import { createOrderAction } from "./actions";

function fmtPrice(price: string | number) {
  const n = typeof price === "string" ? parseFloat(price) : price;
  return isNaN(n) ? "—" : `UGX ${n.toLocaleString("en-UG")}`;
}

function Field({
  label, id, required, children,
}: {
  label: string; id: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full bg-white border border-zinc-200 text-zinc-900 text-sm px-3.5 py-2.5 rounded-md placeholder-zinc-400 focus:outline-none focus:border-zinc-500 transition-colors";

const EMPTY_ADDRESS: ShippingAddress = {
  full_name: "", phone: "", address_line_1: "",
  address_line_2: "", city: "", country: "Uganda",
};

export default function CheckoutClient() {
  const { items, totalCount, clearCart } = useCart();
  const router = useRouter();

  const [address, setAddress] = useState<ShippingAddress>(EMPTY_ADDRESS);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = items.reduce((s, i) => s + parseFloat(i.price || "0") * i.quantity, 0);

  function set<K extends keyof ShippingAddress>(key: K, val: string) {
    setAddress((prev) => ({ ...prev, [key]: val }));
  }

  function validate(): string | null {
    if (!address.full_name.trim()) return "Full name is required.";
    if (!address.phone.trim())     return "Phone number is required — needed for delivery.";
    if (!address.address_line_1.trim()) return "Delivery address is required.";
    if (!address.city.trim())      return "City is required.";
    if (items.length === 0)        return "Your cart is empty.";
    return null;
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError(null);
    setSubmitting(true);
    const result = await createOrderAction({
      total_price:      String(subtotal),
      shipping_address: address,
      items: items.map((i) => ({
        product_variant:   i.variant_id,
        price_at_purchase: i.price,
        quantity:          i.quantity,
        variant_label:     i.label,
      })),
    });
    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }
    await clearCart();
    const qs = result.order.secure_code ? `?code=${result.order.secure_code}` : "";
    router.push(`/order-confirmation/${result.order.id}${qs}`);
  }

  if (items.length === 0 && !submitting) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 flex flex-col items-center gap-4 text-zinc-400">
        <ShoppingBag size={44} strokeWidth={1.2} />
        <p className="text-sm font-semibold">Your cart is empty.</p>
        <a href="/products" className="text-xs font-bold text-zinc-900 underline underline-offset-2">
          Continue shopping
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-xl font-black text-zinc-900 uppercase tracking-tight mb-8">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">

        {/* ── Left: contact + address ── */}
        <div className="space-y-6">

          {/* Contact */}
          <section className="bg-white rounded-xl border border-zinc-200 p-6 space-y-4">
            <h2 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Contact</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name" id="full_name" required>
                <input
                  id="full_name" type="text" autoComplete="name"
                  placeholder="Jane Doe"
                  value={address.full_name}
                  onChange={(e) => set("full_name", e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Phone Number" id="phone" required>
                <input
                  id="phone" type="tel" autoComplete="tel"
                  placeholder="+256 700 000 000"
                  value={address.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  className={inputCls}
                />
              </Field>
            </div>
            <p className="text-[11px] text-zinc-400">
              We use your phone number to coordinate delivery.
            </p>
          </section>

          {/* Shipping address */}
          <section className="bg-white rounded-xl border border-zinc-200 p-6 space-y-4">
            <h2 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Delivery Address</h2>

            <Field label="Address" id="address_line_1" required>
              <input
                id="address_line_1" type="text" autoComplete="address-line1"
                placeholder="Street, building, estate…"
                value={address.address_line_1}
                onChange={(e) => set("address_line_1", e.target.value)}
                className={inputCls}
              />
            </Field>

            <Field label="Apartment / Floor (optional)" id="address_line_2">
              <input
                id="address_line_2" type="text" autoComplete="address-line2"
                placeholder="Apt 4B, 2nd floor…"
                value={address.address_line_2}
                onChange={(e) => set("address_line_2", e.target.value)}
                className={inputCls}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="City / Town" id="city" required>
                <input
                  id="city" type="text" autoComplete="address-level2"
                  placeholder="Kampala"
                  value={address.city}
                  onChange={(e) => set("city", e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Country" id="country">
                <input
                  id="country" type="text" autoComplete="country-name"
                  value={address.country}
                  onChange={(e) => set("country", e.target.value)}
                  className={inputCls}
                />
              </Field>
            </div>
          </section>
        </div>

        {/* ── Right: order summary ── */}
        <div className="space-y-4 lg:sticky lg:top-24">
          <section className="bg-white rounded-xl border border-zinc-200 p-6">
            <h2 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-5">
              Order Summary ({totalCount} item{totalCount !== 1 ? "s" : ""})
            </h2>

            <ul className="divide-y divide-zinc-100 mb-5">
              {items.map((item) => (
                <li key={item.variant_id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="w-12 h-12 rounded bg-zinc-100 shrink-0 overflow-hidden">
                    {item.image_url
                      ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />  // eslint-disable-line @next/next/no-img-element
                      : <div className="w-full h-full flex items-center justify-center"><ShoppingBag size={16} className="text-zinc-300" /></div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-zinc-900 truncate">{item.name}</p>
                    {item.label && <p className="text-[11px] text-zinc-500 truncate">{item.label}</p>}
                    <p className="text-[11px] text-zinc-500">Qty {item.quantity}</p>
                  </div>
                  <p className="text-xs font-bold text-zinc-900 shrink-0">
                    {fmtPrice(parseFloat(item.price) * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>

            <div className="space-y-2 border-t border-zinc-100 pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">Subtotal</span>
                <span className="font-semibold text-zinc-900">{fmtPrice(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">Shipping</span>
                <span className="text-zinc-400 italic text-xs">Calculated on delivery</span>
              </div>
              <div className="flex items-center justify-between text-base font-black text-zinc-900 pt-2 border-t border-zinc-100">
                <span>Total</span>
                <span>{fmtPrice(subtotal)}</span>
              </div>
            </div>
          </section>

          {error && (
            <p className="text-[11px] font-semibold text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-zinc-900 text-white text-sm font-black uppercase tracking-widest rounded-xl hover:bg-zinc-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {submitting
              ? <><Loader2 size={16} className="animate-spin" /> Placing Order…</>
              : "Place Order"}
          </button>

          <p className="text-[11px] text-zinc-400 text-center">
            Payment is collected on delivery.
          </p>
        </div>
      </form>
    </div>
  );
}
