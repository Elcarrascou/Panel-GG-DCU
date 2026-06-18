"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/layout/Logo";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      setError("Credenciales inválidas. Verifica tu correo y contraseña.");
      setLoading(false);
      return;
    }
    // Recarga completa para que el middleware tome la cookie de sesión.
    window.location.assign("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-onyx px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo />
          <p className="mt-3 text-sm text-white/50">
            Panel de Gestión · Tracking de recursos
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-white/10 bg-white p-6 shadow-xl"
        >
          <h1 className="text-lg font-semibold text-ink">Iniciar sesión</h1>
          <p className="mt-1 text-sm text-muted">
            Acceso restringido a personal autorizado.
          </p>

          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-ink">
                Correo
              </span>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-[#6CD45A] focus:outline-none focus:ring-2 focus:ring-[#8EF67C]/40"
                placeholder="tu@plexotech.cl"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-ink">
                Contraseña
              </span>
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-[#6CD45A] focus:outline-none focus:ring-2 focus:ring-[#8EF67C]/40"
                placeholder="••••••••"
              />
            </label>
          </div>

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-lg bg-[#8EF67C] px-4 py-2.5 text-sm font-semibold text-onyx transition-colors hover:bg-[#6CD45A] disabled:opacity-50"
          >
            {loading ? "Ingresando…" : "Ingresar"}
          </button>
        </form>

        <p className="mt-6 text-center text-[11px] text-white/30">
          PlexoTech · Integramos para simplificar
        </p>
      </div>
    </div>
  );
}
