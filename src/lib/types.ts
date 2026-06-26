// ============================================================
// Tipos del dominio Plexotech Tracker (Panel-GG-DCU)
// ============================================================

export type TipoContrato = "interno" | "cliente";
export type ClienteTipo = "externo" | "interno";
export type ClienteEstado = "activo" | "inactivo";
export type ProyectoEstado = "activo" | "pausado" | "cerrado";
export type RolEquipo =
  | "jefe"
  | "senior"
  | "semi_senior"
  | "junior"
  | "colaborador";
export type TipoTrabajo =
  | "mantencion"
  | "desarrollo"
  | "testing"
  | "levantamiento"
  | "soporte"
  | "administrativo"
  | "capacitacion";
export type CargaTrabajo =
  | "sobrecargado"
  | "mucho_trabajo"
  | "normal"
  | "poco_trabajo"
  | "ocioso";
export type AppRole = "admin" | "viewer";

export type HitoEstado = "pendiente" | "cumplido" | "atrasado" | "cancelado";

export type AlertaTipo = "critica" | "importante" | "seguimiento";
export type AlertaEstado = "pendiente" | "en_gestion" | "resuelta";
export type AlertaCategoria =
  | "personas"
  | "proyectos"
  | "clientes"
  | "contratos"
  | "operacional";

export interface Persona {
  id: string;
  nombre: string;
  apellido: string;
  segundo_apellido: string | null;
  rut: string;
  cargo: string | null;
  tipo_contrato: TipoContrato;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Cliente {
  id: string;
  nombre: string;
  tipo: ClienteTipo;
  estado: ClienteEstado;
  descripcion: string | null;
  // Contexto estratégico (texto libre, lo alimenta el Admin/PMO)
  contexto_actual: string | null;
  ultimos_eventos: string | null;
  proximos_pasos: string | null;
  proyectos_futuros: string | null;
  contactos_cliente: string | null;
  notas_estrategicas: string | null;
  created_at: string;
  updated_at: string;
}

export interface Proyecto {
  id: string;
  nombre: string;
  cliente_id: string;
  estado: ProyectoEstado;
  descripcion: string | null;
  notas: string | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  created_at: string;
  updated_at: string;
}

export interface Equipo {
  id: string;
  nombre: string;
  cliente_id: string;
  proyecto_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Asignacion {
  id: string;
  persona_id: string;
  cliente_id: string | null;
  proyecto_id: string | null;
  equipo_id: string | null;
  rol_equipo: RolEquipo;
  fecha_inicio: string;
  fecha_fin: string | null;
  created_at: string;
  updated_at: string;
}

export interface RegistroSemanal {
  id: string;
  persona_id: string;
  semana: string;
  resumen: string | null;
  tipo_trabajo: TipoTrabajo | null;
  carga_trabajo: CargaTrabajo | null;
  hitos: string | null;
  created_at: string;
  updated_at: string;
}

export interface Hito {
  id: string;
  proyecto_id: string;
  titulo: string;
  descripcion: string | null;
  fecha_planificada: string;
  fecha_real: string | null;
  estado: HitoEstado;
  created_at: string;
  updated_at: string;
}

export interface AlertaGestion {
  id: string;
  titulo: string;
  descripcion: string | null;
  tipo: AlertaTipo;
  estado: AlertaEstado;
  categoria: AlertaCategoria | null;
  cliente_id: string | null;
  proyecto_id: string | null;
  persona_id: string | null;
  fecha_limite: string | null;
  created_at: string;
  updated_at: string;
  // Joins opcionales (PostgREST embeds)
  clientes?: { nombre: string } | null;
  proyectos?: { nombre: string } | null;
  personas?: { nombre: string; apellido: string } | null;
}

// ---------- Etiquetas visibles (DB -> UI) ----------

export const TIPO_TRABAJO_LABEL: Record<TipoTrabajo, string> = {
  mantencion: "Mantención",
  desarrollo: "Desarrollo",
  testing: "Testing",
  levantamiento: "Levantamiento de proyecto",
  soporte: "Soporte",
  administrativo: "Administrativo",
  capacitacion: "Capacitación",
};

export const CARGA_LABEL: Record<CargaTrabajo, string> = {
  sobrecargado: "Sobrecargado",
  mucho_trabajo: "Mucho trabajo",
  normal: "Trabajo normal",
  poco_trabajo: "Poco trabajo",
  ocioso: "Capacidad ociosa",
};

// Color por nivel de carga (alineado a variables CSS de marca)
export const CARGA_COLOR: Record<CargaTrabajo, string> = {
  sobrecargado: "#EF4444",
  mucho_trabajo: "#F97316",
  normal: "#8EF67C",
  poco_trabajo: "#EAB308",
  ocioso: "#9CA3AF",
};

// Orden semántico (de más a menos carga) para gráficos y leyendas
export const CARGA_ORDEN: CargaTrabajo[] = [
  "sobrecargado",
  "mucho_trabajo",
  "normal",
  "poco_trabajo",
  "ocioso",
];

export const ROL_EQUIPO_LABEL: Record<RolEquipo, string> = {
  jefe: "Jefe",
  senior: "Senior",
  semi_senior: "Semi Senior",
  junior: "Junior",
  colaborador: "Colaborador",
};

export const PROYECTO_ESTADO_LABEL: Record<ProyectoEstado, string> = {
  activo: "Activo",
  pausado: "Pausado",
  cerrado: "Cerrado",
};

export const CLIENTE_ESTADO_LABEL: Record<ClienteEstado, string> = {
  activo: "Activo",
  inactivo: "Inactivo",
};

export const CLIENTE_TIPO_LABEL: Record<ClienteTipo, string> = {
  externo: "Cliente externo",
  interno: "Área interna",
};

export const TIPO_CONTRATO_LABEL: Record<TipoContrato, string> = {
  interno: "Interno (PlexoTech)",
  cliente: "Financiado por cliente",
};

// ---------- Hitos de proyecto ----------

export const HITO_ESTADO_LABEL: Record<HitoEstado, string> = {
  pendiente: "Pendiente",
  cumplido: "Cumplido",
  atrasado: "Atrasado",
  cancelado: "Cancelado",
};

// Semáforo: 🟢 cumplido · 🟡 pendiente (futuro) · 🔴 atrasado · ⚫ cancelado
export const HITO_ESTADO_TONE: Record<
  HitoEstado,
  "green" | "amber" | "red" | "neutral"
> = {
  cumplido: "green",
  pendiente: "amber",
  atrasado: "red",
  cancelado: "neutral",
};

export const HITO_ESTADO_COLOR: Record<HitoEstado, string> = {
  cumplido: "#22c55e",
  pendiente: "#eab308",
  atrasado: "#ef4444",
  cancelado: "#9ca3af",
};

// Estado efectivo para mostrar: si quedó como 'pendiente' pero la fecha
// planificada ya pasó y no hay fecha real, se muestra 'atrasado'. Si hay
// fecha real, se muestra 'cumplido'. No persiste — se deriva en cada lectura.
export function deriveHitoEstado(
  hito: Pick<Hito, "estado" | "fecha_planificada" | "fecha_real">,
  hoy = new Date().toISOString().slice(0, 10),
): HitoEstado {
  if (hito.estado === "cancelado") return "cancelado";
  if (hito.fecha_real) return "cumplido";
  if (hito.fecha_planificada < hoy) return "atrasado";
  return "pendiente";
}

// ---------- Alertas de gestión ----------

export const ALERTA_TIPO_LABEL: Record<AlertaTipo, string> = {
  critica: "Crítica",
  importante: "Importante",
  seguimiento: "Seguimiento",
};

export const ALERTA_ESTADO_LABEL: Record<AlertaEstado, string> = {
  pendiente: "Pendiente",
  en_gestion: "En gestión",
  resuelta: "Resuelta",
};

export const ALERTA_CATEGORIA_LABEL: Record<AlertaCategoria, string> = {
  personas: "Personas",
  proyectos: "Proyectos",
  clientes: "Clientes",
  contratos: "Contratos",
  operacional: "Operacional",
};

// Orden semántico (de mayor a menor urgencia)
export const ALERTA_TIPO_ORDEN: AlertaTipo[] = [
  "critica",
  "importante",
  "seguimiento",
];
