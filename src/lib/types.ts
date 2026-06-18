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
  created_at: string;
  updated_at: string;
}

export interface Proyecto {
  id: string;
  nombre: string;
  cliente_id: string;
  estado: ProyectoEstado;
  descripcion: string | null;
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
