import { Badge } from "./Badge";
import {
  CLIENTE_ESTADO_LABEL,
  PROYECTO_ESTADO_LABEL,
  ROL_EQUIPO_LABEL,
  TIPO_TRABAJO_LABEL,
  type ClienteEstado,
  type ProyectoEstado,
  type RolEquipo,
  type TipoTrabajo,
} from "@/lib/types";

export function ClienteEstadoBadge({ estado }: { estado: ClienteEstado }) {
  return (
    <Badge tone={estado === "activo" ? "green" : "neutral"}>
      {CLIENTE_ESTADO_LABEL[estado]}
    </Badge>
  );
}

export function ProyectoEstadoBadge({ estado }: { estado: ProyectoEstado }) {
  const tone =
    estado === "activo" ? "green" : estado === "pausado" ? "amber" : "neutral";
  return <Badge tone={tone}>{PROYECTO_ESTADO_LABEL[estado]}</Badge>;
}

export function RolBadge({ rol }: { rol: RolEquipo }) {
  return (
    <Badge tone={rol === "jefe" ? "dark" : "outline"}>
      {ROL_EQUIPO_LABEL[rol]}
    </Badge>
  );
}

export function TipoTrabajoBadge({ tipo }: { tipo: TipoTrabajo | null }) {
  if (!tipo) return <span className="text-xs text-muted">—</span>;
  return <Badge tone="outline">{TIPO_TRABAJO_LABEL[tipo]}</Badge>;
}
