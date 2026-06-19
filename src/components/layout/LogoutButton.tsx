"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      disabled={loading}
      className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-ink [transition:background-color_var(--dur-press)_var(--ease-out),transform_var(--dur-press)_var(--ease-out)] hover:bg-gray-50 active:scale-[0.97] disabled:opacity-50 disabled:active:scale-100"
    >
      {loading ? "Saliendo…" : "Cerrar sesión"}
    </button>
  );
}
