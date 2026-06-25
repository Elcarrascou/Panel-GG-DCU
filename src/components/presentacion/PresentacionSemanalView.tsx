"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import type { PresentacionSemanal } from "@/lib/data";
import {
  ALERTA_TIPO_LABEL,
  CARGA_COLOR,
  CARGA_LABEL,
  HITO_ESTADO_COLOR,
  HITO_ESTADO_LABEL,
  ROL_EQUIPO_LABEL,
  type AlertaGestion,
  type CargaTrabajo,
} from "@/lib/types";

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function semanaRango(lunesIso: string): string {
  const lunes = new Date(lunesIso + "T00:00:00Z");
  const viernes = new Date(lunes);
  viernes.setUTCDate(viernes.getUTCDate() + 4);
  const d1 = lunes.getUTCDate();
  const d2 = viernes.getUTCDate();
  const m1 = MESES[lunes.getUTCMonth()];
  const m2 = MESES[viernes.getUTCMonth()];
  const y = viernes.getUTCFullYear();
  return m1 === m2
    ? `Semana del ${d1} al ${d2} de ${m2} de ${y}`
    : `Semana del ${d1} de ${m1} al ${d2} de ${m2} de ${y}`;
}

function CargaChip({ carga }: { carga: CargaTrabajo | null }) {
  if (!carga)
    return (
      <span className="inline-flex items-center rounded-full border border-dashed border-white/30 px-2.5 py-1 text-sm text-white/50">
        Sin registro
      </span>
    );
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-medium text-white"
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

function TipoChip({ tipo }: { tipo: AlertaGestion["tipo"] }) {
  const color =
    tipo === "critica" ? "#ef4444" : tipo === "importante" ? "#f59e0b" : "#9ca3af";
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-white"
      style={{ backgroundColor: `${color}33`, color }}
    >
      {ALERTA_TIPO_LABEL[tipo]}
    </span>
  );
}

function Slide({
  eyebrow,
  title,
  children,
  center = false,
}: {
  eyebrow?: string;
  title?: string;
  children?: ReactNode;
  center?: boolean;
}) {
  return (
    <section
      className={`flex min-h-[68vh] flex-col ${
        center ? "items-center justify-center text-center" : "justify-start"
      }`}
    >
      {eyebrow && (
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          {eyebrow}
        </p>
      )}
      {title && (
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>
      )}
      {children && <div className="mt-6 w-full">{children}</div>}
    </section>
  );
}

function alertaRelacion(a: AlertaGestion): string | null {
  if (a.persona_id && a.personas)
    return `${a.personas.nombre} ${a.personas.apellido}`;
  if (a.proyecto_id && a.proyectos) return a.proyectos.nombre;
  if (a.cliente_id && a.clientes) return a.clientes.nombre;
  return null;
}

export function PresentacionSemanalView({
  data,
}: {
  data: PresentacionSemanal;
}) {
  const { resumen, clientes, hitosCriticos, situaciones, decisiones } = data;

  // --- Construcción de los slides ---
  const slides: ReactNode[] = [];

  // 1. Portada
  slides.push(
    <Slide
      center
      eyebrow="Plexotech"
      title="Estatus Semanal"
    >
      <p className="text-xl text-white/80">{semanaRango(data.semana)}</p>
      <p className="mt-4 text-base uppercase tracking-[0.25em] text-white/50">
        Clientes · Proyectos · Colaboradores
      </p>
    </Slide>,
  );

  // 2. Resumen ejecutivo
  slides.push(
    <Slide eyebrow="Resumen ejecutivo" title="La semana en números">
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
        <BigStat label="Clientes activos" value={resumen.clientesActivos} />
        <BigStat label="Proyectos activos" value={resumen.proyectosActivos} />
        <BigStat
          label="Colaboradores asignados"
          value={resumen.colaboradoresAsignados}
        />
      </div>
      <div className="mt-8">
        <div
          className={`inline-flex items-center gap-3 rounded-xl px-5 py-4 ${
            resumen.criticas > 0
              ? "bg-red-500/15 text-red-300"
              : "bg-primary/15 text-primary"
          }`}
        >
          <span className="text-3xl font-bold">{resumen.criticas}</span>
          <span className="text-sm font-medium">
            decisión(es) crítica(s) pendiente(s)
          </span>
        </div>
      </div>
    </Slide>,
  );

  // 3..N. Un slide por cliente activo
  for (const c of clientes) {
    slides.push(
      <Slide eyebrow="Cliente" title={c.cliente.nombre}>
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">
              Proyectos activos
            </h3>
            {c.proyectos.length === 0 ? (
              <p className="text-white/50">Sin proyectos activos.</p>
            ) : (
              <ul className="space-y-1.5">
                {c.proyectos.map((p) => (
                  <li
                    key={p.nombre}
                    className="rounded-lg bg-white/5 px-3 py-2 text-base"
                  >
                    {p.nombre}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">
              Colaboradores ({c.personas.length})
            </h3>
            {c.personas.length === 0 ? (
              <p className="text-white/50">Sin colaboradores asignados.</p>
            ) : (
              <ul className="space-y-1.5">
                {c.personas.map((m, i) => (
                  <li
                    key={i}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/5 px-3 py-2"
                  >
                    <span className="text-base">
                      {m.nombre}
                      <span className="ml-2 text-sm text-white/40">
                        {ROL_EQUIPO_LABEL[m.rol]}
                      </span>
                    </span>
                    <CargaChip carga={m.carga} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        {c.decisiones.length > 0 && (
          <div className="mt-6 rounded-xl border border-red-400/30 bg-red-500/10 p-4">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-red-300">
              Decisiones pendientes
            </h3>
            <ul className="space-y-1.5">
              {c.decisiones.map((d, i) => (
                <li key={i} className="flex items-center gap-2 text-base">
                  <TipoChip tipo={d.tipo} />
                  {d.titulo}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Slide>,
    );
  }

  // N+1. Hitos críticos
  slides.push(
    <Slide
      eyebrow="Proyectos"
      title="Hitos críticos"
    >
      {hitosCriticos.length === 0 ? (
        <div className="rounded-xl bg-primary/15 px-5 py-6 text-lg font-medium text-primary">
          ✓ Sin hitos críticos esta semana.
        </div>
      ) : (
        <p className="mb-4 text-sm text-white/60">
          Atrasados o que vencen en los próximos 14 días.
        </p>
      )}
      {hitosCriticos.length > 0 && (
        <ul className="space-y-2">
          {hitosCriticos.map((h) => (
            <li
              key={h.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/5 px-4 py-3"
            >
              <span>
                <span className="text-base font-medium">{h.titulo}</span>
                <span className="ml-2 text-sm text-white/40">
                  {h.proyecto}
                  {h.cliente ? ` · ${h.cliente}` : ""}
                </span>
              </span>
              <span className="flex items-center gap-3">
                <span className="text-sm text-white/60">
                  {h.fecha_planificada}
                </span>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-medium"
                  style={{
                    backgroundColor: `${HITO_ESTADO_COLOR[h.estadoEfectivo]}22`,
                    color: HITO_ESTADO_COLOR[h.estadoEfectivo],
                  }}
                >
                  {HITO_ESTADO_LABEL[h.estadoEfectivo]}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </Slide>,
  );

  // N+2. Situaciones de colaboradores
  slides.push(
    <Slide eyebrow="Colaboradores" title="Situaciones a revisar">
      <div className="grid gap-6 lg:grid-cols-3">
        <SituacionCol
          titulo="Sin asignación"
          vacio="Todos asignados."
          items={situaciones.sinAsignacion.map((p) => p.nombre)}
        />
        <SituacionCol
          titulo="Carga baja (poca u ociosa)"
          vacio="Sin capacidad ociosa."
          items={situaciones.cargaBaja.map(
            (p) => `${p.nombre} — ${CARGA_LABEL[p.carga]}`,
          )}
        />
        <div>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">
            Decisiones de personas
          </h3>
          {situaciones.decisionesPersonas.length === 0 ? (
            <p className="text-white/50">Sin decisiones de personas.</p>
          ) : (
            <ul className="space-y-1.5">
              {situaciones.decisionesPersonas.map((d, i) => (
                <li
                  key={i}
                  className="rounded-lg bg-white/5 px-3 py-2 text-sm"
                >
                  <span className="flex items-center gap-2">
                    <TipoChip tipo={d.tipo} />
                    {d.persona ?? "—"}
                  </span>
                  <span className="mt-0.5 block text-white/70">{d.titulo}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Slide>,
  );

  // N+3. Decisiones pendientes
  slides.push(
    <Slide eyebrow="Gestión" title="Decisiones pendientes">
      {decisiones.length === 0 ? (
        <div className="rounded-xl bg-primary/15 px-5 py-6 text-lg font-medium text-primary">
          ✓ Sin decisiones pendientes esta semana.
        </div>
      ) : (
        <ul className="space-y-2">
          {decisiones.map((a) => {
            const rel = alertaRelacion(a);
            return (
              <li
                key={a.id}
                className="rounded-lg bg-white/5 px-4 py-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <TipoChip tipo={a.tipo} />
                  <span className="text-base font-medium">{a.titulo}</span>
                </div>
                {rel && (
                  <p className="mt-1 text-sm text-white/50">Asociada a: {rel}</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Slide>,
  );

  // --- Navegación ---
  const [idx, setIdx] = useState(0);
  const total = slides.length;
  const prev = useCallback(() => setIdx((i) => (i > 0 ? i - 1 : i)), []);
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
    <div className="flex min-h-screen flex-col bg-onyx text-white">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-white/10 bg-onyx/95 px-6 py-3 backdrop-blur">
        <span className="text-sm text-white/60">
          Estatus semanal ·{" "}
          <span className="font-semibold text-white">{idx + 1}</span> / {total}
        </span>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-onyx hover:bg-primary-dark"
        >
          ✕ Salir
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-8">
        {slides[idx]}

        <div className="mt-auto flex items-center justify-between pt-8">
          <button
            onClick={prev}
            disabled={idx === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm font-medium hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            ← Anterior
          </button>
          <div className="flex flex-wrap justify-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                aria-label={`Ir a slide ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === idx ? "w-6 bg-primary" : "w-2 bg-white/25 hover:bg-white/40"
                }`}
              />
            ))}
          </div>
          <button
            onClick={next}
            disabled={idx === total - 1}
            className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm font-medium hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            Siguiente →
          </button>
        </div>
      </main>
    </div>
  );
}

function BigStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white/5 px-5 py-6 text-center">
      <p className="text-5xl font-bold text-primary">{value}</p>
      <p className="mt-2 text-sm text-white/60">{label}</p>
    </div>
  );
}

function SituacionCol({
  titulo,
  items,
  vacio,
}: {
  titulo: string;
  items: string[];
  vacio: string;
}) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">
        {titulo} ({items.length})
      </h3>
      {items.length === 0 ? (
        <p className="text-white/50">{vacio}</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((it, i) => (
            <li key={i} className="rounded-lg bg-white/5 px-3 py-2 text-sm">
              {it}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
