"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";
import { Loader2, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const [state, action, pending] = useActionState(loginAction, undefined);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <p className="text-white font-black text-2xl tracking-widest uppercase">Nivo</p>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
            Admin Dashboard
          </p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-7">
          <h1 className="text-sm font-black text-white uppercase tracking-widest mb-1">
            Sign In
          </h1>
          <p className="text-xs text-zinc-500 mb-6">
            Admin accounts only.
          </p>

          <form action={action} className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                defaultValue={state?.email ?? ""}
                placeholder="you@example.com"
                className="w-full bg-zinc-950 border border-zinc-800 text-white text-sm px-3.5 py-2.5 rounded-md placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="w-full bg-zinc-950 border border-zinc-800 text-white text-sm px-3.5 py-2.5 rounded-md placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
              />
            </div>

            {/* Error */}
            {state?.error && (
              <div className="flex items-start gap-2.5 px-3.5 py-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
                <p className="text-xs font-semibold text-red-400 leading-snug">
                  {state.error}
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={pending}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-white text-black text-xs font-black uppercase tracking-widest rounded-md hover:bg-zinc-200 disabled:opacity-50 transition-colors mt-2"
            >
              {pending ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] text-zinc-700 mt-6 uppercase tracking-widest">
          Nivo &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
