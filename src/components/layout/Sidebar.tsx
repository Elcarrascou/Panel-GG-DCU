"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { NAV, isActive } from "./nav";
import type { AppRole } from "@/lib/types";

export function Sidebar({ role }: { role: AppRole }) {
  const pathname = usePathname();

  return (
    <aside className="no-print fixed inset-y-0 left-0 z-30 hidden w-60 flex-col bg-onyx text-white md:flex">
      <div className="flex h-16 items-center border-b border-white/10 px-5">
        <Link href="/">
          <Logo />
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV.map((item) => {
          const active = isActive(pathname, item);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm [transition:background-color_var(--dur-ui)_var(--ease-out),color_var(--dur-ui)_var(--ease-out)] ${
                active
                  ? "bg-primary font-semibold text-onyx"
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
        <p className="mt-3 text-[11px] text-white/40">
          Integramos para simplificar
        </p>
      </div>
    </aside>
  );
}
