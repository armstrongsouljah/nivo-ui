"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setEmail("");
    }
  };

  return (
    <section className="bg-sage/30 py-14 sm:py-20 px-4 sm:px-6">
      <div className="max-w-xl mx-auto text-center">
        <p className="text-[11px] font-semibold tracking-[0.25em] text-ink/50 uppercase mb-3">
          Stay in the Loop
        </p>
        <h2 className="text-2xl sm:text-3xl font-semibold text-ink tracking-tight mb-3">
          Sign Up &amp; Save 10%
        </h2>
        <p className="text-ink/60 text-sm leading-relaxed mb-8">
          Get early access to new arrivals, gentle-care tips, and little-one style inspiration — straight to your inbox.
        </p>

        {submitted ? (
          <div className="bg-white/60 border border-ink/10 rounded-2xl px-6 py-5">
            <p className="text-ink font-semibold text-sm">
              You&apos;re in! Check your inbox for your discount code.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 bg-white/70 border border-ink/10 rounded-full text-ink placeholder-ink/40 text-sm px-5 py-3.5 outline-none focus:border-ink/30 transition-colors"
            />
            <button
              type="submit"
              className="bg-ink text-cream font-semibold text-xs tracking-widest uppercase rounded-full px-6 py-3.5 flex items-center justify-center gap-2 hover:bg-ink/85 transition-colors"
            >
              Subscribe
              <Send size={13} />
            </button>
          </form>
        )}

        <p className="text-ink/40 text-xs mt-4">
          No spam, ever. Unsubscribe at any time.
        </p>
      </div>
    </section>
  );
}
