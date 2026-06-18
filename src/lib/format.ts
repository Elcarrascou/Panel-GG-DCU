import type { Persona } from "./types";

export function nombreCompleto(
  p: Pick<Persona, "nombre" | "apellido" | "segundo_apellido">,
): string {
  return [p.nombre, p.apellido, p.segundo_apellido].filter(Boolean).join(" ");
}

export function iniciales(
  p: Pick<Persona, "nombre" | "apellido">,
): string {
  const n = p.nombre?.trim()?.[0] ?? "";
  const a = p.apellido?.trim()?.[0] ?? "";
  return (n + a).toUpperCase();
}

// Devuelve el lunes (ISO) de la semana de una fecha dada, en formato YYYY-MM-DD.
export function lunesDeLaSemana(fecha = new Date()): string {
  const d = new Date(
    Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()),
  );
  const day = d.getUTCDay(); // 0 dom ... 6 sab
  const diff = day === 0 ? -6 : 1 - day; // mover a lunes
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().slice(0, 10);
}

export function semanaActual(): string {
  return lunesDeLaSemana(new Date());
}

const MESES = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

export function fechaCorta(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) {
    const d2 = new Date(iso);
    if (isNaN(d2.getTime())) return "—";
    return `${d2.getUTCDate()} ${MESES[d2.getUTCMonth()]} ${d2.getUTCFullYear()}`;
  }
  return `${d.getUTCDate()} ${MESES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

// Devuelve el día anterior (YYYY-MM-DD) a una fecha ISO dada.
export function diaAnterior(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function rangoSemana(lunesIso: string): string {
  const inicio = new Date(lunesIso + "T00:00:00");
  const fin = new Date(inicio);
  fin.setUTCDate(fin.getUTCDate() + 6);
  return `${inicio.getUTCDate()} ${MESES[inicio.getUTCMonth()]} – ${fin.getUTCDate()} ${MESES[fin.getUTCMonth()]} ${fin.getUTCFullYear()}`;
}
