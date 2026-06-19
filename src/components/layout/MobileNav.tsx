"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { NAV, isActive } from "./nav";
import type { AppRole } from "@/lib/types";

export function MobileNav({ role }: { role: AppRole }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Cerrar al navegar.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Escape + bloqueo de scroll mientras está abierto.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  // El overlay se monta vía portal en <body> para escapar del containing
  // block que crea el backdrop-filter del Topbar (si no, el drawer fixed
  // queda atrapado dentro de la altura del header).
  const overlay = (
    <div className="md:hidden">
      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden
        className={`fixed inset-0 z-40 bg-black/50 [transition:opacity_var(--dur-drawer)_var(--ease-out)] ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Navegación principal"
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[80%] flex-col bg-onyx text-white [transition:transform_var(--dur-drawer)_var(--ease-drawer)] ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <Link href="/" onClick={() => setOpen(false)}>
            <Logo />
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Cerrar menú"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-white/70 [transition:background-color_var(--dur-press)_var(--ease-out),transform_var(--dur-press)_var(--ease-out)] hover:bg-white/10 hover:text-white active:scale-[0.94]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV.map((item) => {
            const active = isActive(pathname, item);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm [transition:background-color_var(--dur-ui)_var(--ease-out),color_var(--dur-ui)_var(--ease-out)] ${
                  active
                    ? "bg-[#8EF67C] font-semibold text-onyx"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <item.Icon className={active ? "opacity-100" : "opacity-80"} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 px-5 py-4">
          <p className="text-[11px] uppercase tracking-wide text-white/40">
            Acceso
          </p>
          <p className="mt-0.5 text-sm font-medium">
            {role === "admin" ? "Administrador" : "Visor (solo lectura)"}
          </p>
        </div>
      </aside>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir menú"
        aria-expanded={open}
        className="-ml-1 inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink [transition:background-color_var(--dur-press)_var(--ease-out),transform_var(--dur-press)_var(--ease-out)] hover:bg-gray-100 active:scale-[0.94] md:hidden"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>
      {mounted ? createPortal(overlay, document.body) : null}
    </>
  );
}
