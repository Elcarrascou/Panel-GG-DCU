"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { ClientePresentacion } from "@/lib/data";
import { nombreCompleto } from "@/lib/format";
import {
  CARGA_COLOR,
  CARGA_LABEL,
  ROL_EQUIPO_LABEL,
  type Cliente,
  type CargaTrabajo,
} from "@/lib/types";

const SECCIONES: { key: keyof Cliente; emoji: string; titulo: string }[] = [
  { key: "contexto_actual", emoji: "📋", titulo: "Contexto actual" },
  { key: "ultimos_eventos", emoji: "🕐", titulo: "Últimos eventos" },
  { key: "proximos_pasos", emoji: "🎯", titulo: "Próximos pasos" },
  { key: "proyectos_futuros", emoji: "💡", titulo: "Proyectos futuros / propuestas" },
];

function CargaChip({ carga }: { carga: CargaTrabajo | null }) {
  if (!carga) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-white/30 px-2.5 py-1 text-xs text-white/60 print:border-gray-300 print:text-gray-500">
        Sin registro
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-white print:text-gray-800"
      style={{ backgroundColor: `${CARGA_COLOR[carga]}33` }}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: CARGA_COLOR[carga] }}
      />
      {CARGA_LABEL[carga]}
    </span>
  );
}

export function PresentacionView({
  clientes,
}: {
  clientes: ClientePresentacion[];
}) {
  const [idx, setIdx] = useState(0);
  const total = clientes.length;

  const prev = useCallback(
    () => setIdx((i) => (i > 0 ? i - 1 : i)),
    [],
  );
  const next = useCallback(
    () => setIdx((i) => (i < total - 1 ? i + 1 : i)),
    [total],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === "PageDown") next();
      else if (e.key === "ArrowLeft" || e.key === "PageUp") prev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  return (
    <div className="min-h-screen bg-onyx text-white print:bg-white print:text-black">
      {/* Barra de control — oculta en impresión */}
      <header className="no-print sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-white/10 bg-onyx/95 px-6 py-3 backdrop-blur">
        <span className="text-sm text-white/60">
          {total > 0 ? (
            <>
              Cliente <span className="font-semibold text-white">{idx + 1}</span> /{" "}
              {total}
            </>
          ) : (
            "Sin clientes activos"
          )}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/10"
          >
            🖨 Imprimir
          </button>
          <Link
            href="/clientes"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-onyx hover:bg-primary-dark"
          >
            ✕ Salir de presentación
          </Link>
        </div>
      </header>

      {total === 0 ? (
        <div className="flex min-h-[60vh] items-center justify-center px-6 text-center text-white/60">
          No hay clientes activos para presentar.
        </div>
      ) : (
        <main className="mx-auto max-w-4xl px-6 py-10">
          {clientes.map((c, i) => (
            <ClienteSlide
              key={c.cliente.id}
              data={c}
              visible={i === idx}
            />
          ))}

          {/* Navegación slideshow — oculta en impresión */}
          <div className="no-print mt-10 flex items-center justify-between">
            <button
              onClick={prev}
              disabled={idx === 0}
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              ← Anterior
            </button>
            <div className="flex gap-1.5">
              {clientes.map((c, i) => (
                <button
                  key={c.cliente.id}
                  onClick={() => setIdx(i)}
                  aria-label={`Ir a cliente ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    i === idx ? "w-6 bg-primary" : "w-2 bg-white/25 hover:bg-white/40"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={next}
              disabled={idx === total - 1}
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              Siguiente →
            </button>
          </div>
        </main>
      )}
    </div>
  );
}

function ClienteSlide({
  data,
  visible,
}: {
  data: ClientePresentacion;
  visible: boolean;
}) {
  const { cliente, personas } = data;
  const secciones = SECCIONES.filter(
    (s) => typeof cliente[s.key] === "string" && (cliente[s.key] as string).trim(),
  );

  return (
    <article
      className={`${
        visible ? "block" : "hidden"
      } print:mb-0 print:block print:break-after-page`}
    >
      {/* Encabezado del cliente */}
      <div className="flex items-center gap-4 border-b border-white/15 pb-6 print:border-gray-300">
        <span className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-onyx">
          {cliente.nombre.trim().slice(0, 2).toUpperCase()}
        </span>
        <div>
          <h1 className="text-3xl font-bold tracking-tight print:text-black">
            {cliente.nombre}
          </h1>
          <p className="mt-1 text-sm text-white/60 print:text-gray-600">
            Estado: Activo · {personas.length} persona(s) asignada(s)
          </p>
        </div>
      </div>

      {/* Secciones estratégicas */}
      {secciones.map(({ key, emoji, titulo }) => (
        <section key={key} className="border-b border-white/10 py-6 print:border-gray-200">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-primary print:text-green-ink">
            <span aria-hidden>{emoji}</span>
            {titulo}
          </h2>
          <p className="mt-2 whitespace-pre-wrap text-base leading-relaxed text-white/85 print:text-gray-800">
            {cliente[key] as string}
          </p>
        </section>
      ))}

      {/* Equipo asignado */}
      <section className="py-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-primary print:text-green-ink">
          <span aria-hidden>👤</span>
          Equipo asignado
        </h2>
        {personas.length === 0 ? (
          <p className="mt-2 text-base text-white/60 print:text-gray-500">
            Sin personas asignadas.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {personas.map(({ persona, carga, rol }) => (
              <li
                key={persona.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/5 px-4 py-2.5 print:bg-gray-100"
              >
                <span className="font-medium print:text-black">
                  {nombreCompleto(persona)}
                  <span className="ml-2 text-sm text-white/50 print:text-gray-500">
                    {ROL_EQUIPO_LABEL[rol]}
                  </span>
                </span>
                <CargaChip carga={carga} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </article>
  );
}
