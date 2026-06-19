import Link from "next/link";
import { getTodasLasAlertas, getOpciones } from "@/lib/data";
import { isAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { AlertaCard } from "@/components/alertas/AlertaCard";
import { CrearAlertaForm } from "@/components/alertas/CrearAlertaForm";
import {
  ALERTA_CATEGORIA_LABEL,
  ALERTA_TIPO_LABEL,
  type AlertaCategoria,
  type AlertaTipo,
} from "@/lib/types";

export const dynamic = "force-dynamic";

type Search = {
  tipo?: string;
  estado?: string;
  categoria?: string;
};

const SELECT_CLS =
  "rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/40";

export default async function AlertasPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const [alertas, admin, opciones] = await Promise.all([
    getTodasLasAlertas(),
    isAdmin(),
    getOpciones(),
  ]);

  const fEstado = sp.estado || "activas";
  const fTipo = sp.tipo || "";
  const fCategoria = sp.categoria || "";

  const filtradas = alertas.filter((a) => {
    if (fEstado === "activas" && a.estado === "resuelta") return false;
    if (
      fEstado !== "activas" &&
      fEstado !== "todas" &&
      a.estado !== fEstado
    )
      return false;
    if (fTipo && a.tipo !== fTipo) return false;
    if (fCategoria && a.categoria !== fCategoria) return false;
    return true;
  });

  const resueltas = alertas.filter((a) => a.estado === "resuelta").length;
  const activas = alertas.length - resueltas;

  const tipos: AlertaTipo[] = ["critica", "importante", "seguimiento"];
  const categorias: AlertaCategoria[] = [
    "personas",
    "proyectos",
    "clientes",
    "contratos",
    "operacional",
  ];

  return (
    <div>
      <PageHeader
        title="Decisiones y alertas"
        subtitle={`${activas} activa(s) · ${resueltas} resuelta(s)`}
      />

      {admin && (
        <div className="mb-6">
          <CrearAlertaForm
            opciones={{
              clientes: opciones.clientes.map((c) => ({
                id: c.id,
                nombre: c.nombre,
              })),
              proyectos: opciones.proyectos.map((p) => ({
                id: p.id,
                nombre: p.nombre,
              })),
              personas: opciones.personas.map((p) => ({
                id: p.id,
                nombre: p.nombre,
                apellido: p.apellido,
              })),
            }}
          />
        </div>
      )}

      {/* Filtros (GET) */}
      <form
        method="get"
        className="mb-5 flex flex-wrap items-end gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm"
      >
        <label className="flex flex-col gap-1 text-xs font-medium text-muted">
          Estado
          <select name="estado" defaultValue={fEstado} className={SELECT_CLS}>
            <option value="activas">Activas</option>
            <option value="pendiente">Pendientes</option>
            <option value="en_gestion">En gestión</option>
            <option value="resuelta">Resueltas</option>
            <option value="todas">Todas</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-muted">
          Tipo
          <select name="tipo" defaultValue={fTipo} className={SELECT_CLS}>
            <option value="">Todos</option>
            {tipos.map((t) => (
              <option key={t} value={t}>
                {ALERTA_TIPO_LABEL[t]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-muted">
          Categoría
          <select
            name="categoria"
            defaultValue={fCategoria}
            className={SELECT_CLS}
          >
            <option value="">Todas</option>
            {categorias.map((c) => (
              <option key={c} value={c}>
                {ALERTA_CATEGORIA_LABEL[c]}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="rounded-lg bg-onyx px-3.5 py-2 text-sm font-medium text-white hover:bg-black"
        >
          Filtrar
        </button>
        <Link
          href="/alertas"
          className="px-2 py-2 text-sm font-medium text-muted hover:text-ink"
        >
          Limpiar
        </Link>
      </form>

      <p className="mb-3 text-xs text-muted">
        {filtradas.length} alerta(s) en esta vista
      </p>

      {filtradas.length === 0 ? (
        <EmptyState
          title="Sin alertas para los filtros aplicados"
          description="Ajusta los filtros o crea una nueva alerta."
        />
      ) : (
        <div className="grid gap-3">
          {filtradas.map((a) => (
            <AlertaCard key={a.id} alerta={a} admin={admin} />
          ))}
        </div>
      )}
    </div>
  );
}
