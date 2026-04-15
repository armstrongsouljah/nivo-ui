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
    <section className="bg-zinc-900 py-14 sm:py-20 px-4 sm:px-6">
      <div className="max-w-xl mx-auto text-center">
        <p className="text-[11px] font-bold tracking-[0.3em] text-zinc-400 uppercase mb-3">
          Stay in the Loop
        </p>
        <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mb-3">
          Sign Up &amp; Save 10%
        </h2>
        <p className="text-zinc-400 text-sm leading-relaxed mb-8">
          Get early access to new drops, exclusive deals, and style inspiration — straight to your inbox.
        </p>

        {submitted ? (
          <div className="bg-white/5 border border-white/10 rounded-sm px-6 py-5">
            <p className="text-white font-bold tracking-wide text-sm">
              You&apos;re in! Check your inbox for your discount code.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-0 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 bg-white/5 border border-white/10 text-white placeholder-zinc-500 text-sm px-4 py-3.5 outline-none focus:border-white/30 transition-colors"
            />
            <button
              type="submit"
              className="bg-white text-black font-bold text-xs tracking-widest uppercase px-6 py-3.5 flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors"
            >
              Subscribe
              <Send size={13} />
            </button>
          </form>
        )}

        <p className="text-zinc-600 text-xs mt-4">
          No spam, ever. Unsubscribe at any time.
        </p>
      </div>
    </section>
  );
}
