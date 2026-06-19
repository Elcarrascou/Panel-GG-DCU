import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { cambiarEstadoAlerta } from "@/lib/actions";
import { fechaCorta } from "@/lib/format";
import {
  ALERTA_CATEGORIA_LABEL,
  ALERTA_TIPO_LABEL,
  type AlertaGestion,
} from "@/lib/types";

type Tone = "red" | "amber" | "neutral";

const TIPO_STYLE: Record<
  AlertaGestion["tipo"],
  { card: string; badge: Tone; icon: "warning" | "target" | "clipboard" }
> = {
  critica: {
    card: "border-l-[3px] border-l-red-500 bg-red-50/60",
    badge: "red",
    icon: "warning",
  },
  importante: {
    card: "border-l-[3px] border-l-amber-400 bg-amber-50/60",
    badge: "amber",
    icon: "target",
  },
  seguimiento: {
    card: "border-l-[3px] border-l-gray-300 bg-surface",
    badge: "neutral",
    icon: "clipboard",
  },
};

function TipoIcon({ kind }: { kind: "warning" | "target" | "clipboard" }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (kind === "warning")
    return (
      <svg {...common} className="text-red-500">
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
        <path d="M12 9v4M12 17h.01" />
      </svg>
    );
  if (kind === "target")
    return (
      <svg {...common} className="text-amber-500">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1" />
      </svg>
    );
  return (
    <svg {...common} className="text-gray-400">
      <rect x="8" y="3" width="8" height="4" rx="1" />
      <path d="M9 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-3" />
    </svg>
  );
}

// Botón-formulario que cambia el estado de la alerta (solo admin).
function AccionEstado({
  id,
  estado,
  label,
  variant,
}: {
  id: string;
  estado: "pendiente" | "en_gestion" | "resuelta";
  label: string;
  variant: "primary" | "ghost";
}) {
  const cls =
    variant === "primary"
      ? "bg-onyx text-white hover:bg-black"
      : "border border-border bg-surface text-ink hover:bg-gray-50";
  return (
    <form action={cambiarEstadoAlerta}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="estado" value={estado} />
      <button
        type="submit"
        className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-medium [transition:background-color_var(--dur-press)_var(--ease-out),transform_var(--dur-press)_var(--ease-out)] active:scale-[0.97] ${cls}`}
      >
        {label}
      </button>
    </form>
  );
}

export function AlertaCard({
  alerta,
  admin,
}: {
  alerta: AlertaGestion;
  admin: boolean;
}) {
  const style = TIPO_STYLE[alerta.tipo];
  const hoy = new Date().toISOString().slice(0, 10);
  const vencida =
    alerta.fecha_limite != null &&
    alerta.estado !== "resuelta" &&
    alerta.fecha_limite < hoy;

  const enlace = alerta.persona_id
    ? {
        href: `/personas/${alerta.persona_id}`,
        label: alerta.personas
          ? `${alerta.personas.nombre} ${alerta.personas.apellido}`
          : "Persona",
        kind: "Persona",
      }
    : alerta.proyecto_id
      ? {
          href: `/proyectos/${alerta.proyecto_id}`,
          label: alerta.proyectos?.nombre ?? "Proyecto",
          kind: "Proyecto",
        }
      : alerta.cliente_id
        ? {
            href: `/clientes/${alerta.cliente_id}`,
            label: alerta.clientes?.nombre ?? "Cliente",
            kind: "Cliente",
          }
        : null;

  return (
    <div
      className={`rounded-xl border border-border p-4 shadow-sm ${style.card}`}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0">
          <TipoIcon kind={style.icon} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge tone={style.badge}>{ALERTA_TIPO_LABEL[alerta.tipo]}</Badge>
            {alerta.categoria && (
              <Badge tone="outline">
                {ALERTA_CATEGORIA_LABEL[alerta.categoria]}
              </Badge>
            )}
            {alerta.estado === "en_gestion" && (
              <Badge tone="dark">En gestión</Badge>
            )}
            {alerta.estado === "resuelta" && (
              <Badge tone="green">Resuelta ✓</Badge>
            )}
          </div>

          <h3
            className={`mt-2 text-sm tracking-tight text-ink ${
              alerta.tipo === "critica" ? "font-bold" : "font-semibold"
            }`}
          >
            {alerta.titulo}
          </h3>

          {alerta.descripcion && (
            <p className="mt-1 text-sm leading-relaxed text-muted">
              {alerta.descripcion}
            </p>
          )}

          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
            {enlace && (
              <span>
                {enlace.kind}:{" "}
                <Link
                  href={enlace.href}
                  className="font-medium text-ink hover:underline"
                >
                  {enlace.label}
                </Link>
              </span>
            )}
            {alerta.fecha_limite && (
              <span
                className={
                  vencida ? "font-semibold text-red-600" : "text-muted"
                }
              >
                {vencida ? "Vencida" : "Límite"}: {fechaCorta(alerta.fecha_limite)}
              </span>
            )}
          </div>

          {admin && (
            <div className="mt-3 flex flex-wrap gap-2">
              {alerta.estado === "pendiente" && (
                <>
                  <AccionEstado
                    id={alerta.id}
                    estado="en_gestion"
                    label="Marcar en gestión"
                    variant="ghost"
                  />
                  <AccionEstado
                    id={alerta.id}
                    estado="resuelta"
                    label="Resolver"
                    variant="primary"
                  />
                </>
              )}
              {alerta.estado === "en_gestion" && (
                <>
                  <AccionEstado
                    id={alerta.id}
                    estado="pendiente"
                    label="Volver a pendiente"
                    variant="ghost"
                  />
                  <AccionEstado
                    id={alerta.id}
                    estado="resuelta"
                    label="Resolver"
                    variant="primary"
                  />
                </>
              )}
              {alerta.estado === "resuelta" && (
                <AccionEstado
                  id={alerta.id}
                  estado="pendiente"
                  label="Reabrir"
                  variant="ghost"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
