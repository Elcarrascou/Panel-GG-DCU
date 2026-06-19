import { createClient } from "@/lib/supabase/server";
import { semanaActual } from "@/lib/format";
import type {
  AlertaGestion,
  AlertaTipo,
  Asignacion,
  CargaTrabajo,
  Cliente,
  Equipo,
  Persona,
  Proyecto,
  ProyectoEstado,
  RegistroSemanal,
} from "@/lib/types";

// ---------- Tipos compuestos para la UI ----------

export interface AsignacionDetalle extends Asignacion {
  cliente: Cliente | null;
  proyecto: Proyecto | null;
  equipo: Equipo | null;
}

export interface PersonaConEstado {
  persona: Persona;
  activas: AsignacionDetalle[];
  ultimoRegistro: RegistroSemanal | null;
  registroSemana: RegistroSemanal | null;
}

function byId<T extends { id: string }>(rows: T[] | null): Map<string, T> {
  return new Map((rows ?? []).map((r) => [r.id, r]));
}

// ============================================================
// PERSONAS
// ============================================================

export async function getPersonasConEstado(): Promise<PersonaConEstado[]> {
  const supabase = await createClient();
  const semana = semanaActual();

  const [personasR, clientesR, proyectosR, equiposR, asigsR, regsR] =
    await Promise.all([
      supabase.from("personas").select("*").order("apellido"),
      supabase.from("clientes").select("*"),
      supabase.from("proyectos").select("*"),
      supabase.from("equipos").select("*"),
      supabase.from("asignaciones").select("*").is("fecha_fin", null),
      supabase
        .from("registros_semanales")
        .select("*")
        .order("semana", { ascending: false }),
    ]);

  const personas = (personasR.data ?? []) as Persona[];
  const clientes = byId<Cliente>(clientesR.data as Cliente[]);
  const proyectos = byId<Proyecto>(proyectosR.data as Proyecto[]);
  const equipos = byId<Equipo>(equiposR.data as Equipo[]);
  const asigs = (asigsR.data ?? []) as Asignacion[];
  const regs = (regsR.data ?? []) as RegistroSemanal[];

  return personas.map((persona) => {
    const activas: AsignacionDetalle[] = asigs
      .filter((a) => a.persona_id === persona.id)
      .map((a) => ({
        ...a,
        cliente: a.cliente_id ? (clientes.get(a.cliente_id) ?? null) : null,
        proyecto: a.proyecto_id ? (proyectos.get(a.proyecto_id) ?? null) : null,
        equipo: a.equipo_id ? (equipos.get(a.equipo_id) ?? null) : null,
      }));
    const delPersona = regs.filter((r) => r.persona_id === persona.id);
    return {
      persona,
      activas,
      ultimoRegistro: delPersona[0] ?? null,
      registroSemana: delPersona.find((r) => r.semana === semana) ?? null,
    };
  });
}

export async function getPersonaDetalle(id: string) {
  const supabase = await createClient();
  const [personaR, clientesR, proyectosR, equiposR, asigsR, regsR] =
    await Promise.all([
      supabase.from("personas").select("*").eq("id", id).single(),
      supabase.from("clientes").select("*"),
      supabase.from("proyectos").select("*"),
      supabase.from("equipos").select("*"),
      supabase
        .from("asignaciones")
        .select("*")
        .eq("persona_id", id)
        .order("fecha_inicio", { ascending: false }),
      supabase
        .from("registros_semanales")
        .select("*")
        .eq("persona_id", id)
        .order("semana", { ascending: false }),
    ]);

  if (!personaR.data) return null;

  const clientes = byId<Cliente>(clientesR.data as Cliente[]);
  const proyectos = byId<Proyecto>(proyectosR.data as Proyecto[]);
  const equipos = byId<Equipo>(equiposR.data as Equipo[]);
  const asignaciones: AsignacionDetalle[] = (
    (asigsR.data ?? []) as Asignacion[]
  ).map((a) => ({
    ...a,
    cliente: a.cliente_id ? (clientes.get(a.cliente_id) ?? null) : null,
    proyecto: a.proyecto_id ? (proyectos.get(a.proyecto_id) ?? null) : null,
    equipo: a.equipo_id ? (equipos.get(a.equipo_id) ?? null) : null,
  }));

  return {
    persona: personaR.data as Persona,
    asignaciones,
    activas: asignaciones.filter((a) => a.fecha_fin === null),
    registros: (regsR.data ?? []) as RegistroSemanal[],
  };
}

// ============================================================
// CLIENTES
// ============================================================

export async function getClientes(): Promise<Cliente[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("clientes")
    .select("*")
    .order("nombre");
  return (data ?? []) as Cliente[];
}

export async function getClienteDetalle(id: string) {
  const supabase = await createClient();
  const [clienteR, proyectosR, equiposR, asigsR, personasR, regsR] =
    await Promise.all([
      supabase.from("clientes").select("*").eq("id", id).single(),
      supabase
        .from("proyectos")
        .select("*")
        .eq("cliente_id", id)
        .order("estado"),
      supabase.from("equipos").select("*").eq("cliente_id", id),
      supabase
        .from("asignaciones")
        .select("*")
        .eq("cliente_id", id)
        .is("fecha_fin", null),
      supabase.from("personas").select("*"),
      supabase
        .from("registros_semanales")
        .select("*")
        .order("semana", { ascending: false }),
    ]);

  if (!clienteR.data) return null;

  const personas = byId<Persona>(personasR.data as Persona[]);
  const asigs = (asigsR.data ?? []) as Asignacion[];
  const regs = (regsR.data ?? []) as RegistroSemanal[];
  const semana = semanaActual();

  const personasAsignadas = asigs.map((a) => {
    const p = personas.get(a.persona_id) ?? null;
    const reg = regs.find(
      (r) => r.persona_id === a.persona_id && r.semana === semana,
    );
    const ultimo = regs.find((r) => r.persona_id === a.persona_id);
    return { asignacion: a, persona: p, registroSemana: reg ?? null, ultimoRegistro: ultimo ?? null };
  });

  return {
    cliente: clienteR.data as Cliente,
    proyectos: (proyectosR.data ?? []) as Proyecto[],
    equipos: (equiposR.data ?? []) as Equipo[],
    personasAsignadas,
  };
}

// Clientes activos con su equipo asignado, para el modo presentación ejecutiva.
export interface ClientePresentacion {
  cliente: Cliente;
  personas: {
    persona: Persona;
    carga: CargaTrabajo | null;
    rol: Asignacion["rol_equipo"];
  }[];
}

export async function getClientesPresentacion(): Promise<ClientePresentacion[]> {
  const supabase = await createClient();
  const [clientesR, asigsR, personasR, regsR] = await Promise.all([
    supabase
      .from("clientes")
      .select("*")
      .eq("estado", "activo")
      .order("nombre"),
    supabase.from("asignaciones").select("*").is("fecha_fin", null),
    supabase.from("personas").select("*"),
    supabase
      .from("registros_semanales")
      .select("*")
      .order("semana", { ascending: false }),
  ]);

  const clientes = (clientesR.data ?? []) as Cliente[];
  const personas = byId<Persona>(personasR.data as Persona[]);
  const asigs = (asigsR.data ?? []) as Asignacion[];
  const regs = (regsR.data ?? []) as RegistroSemanal[];
  const semana = semanaActual();

  return clientes.map((cliente) => ({
    cliente,
    personas: asigs
      .filter((a) => a.cliente_id === cliente.id)
      .map((a) => {
        const persona = personas.get(a.persona_id) ?? null;
        const reg =
          regs.find(
            (r) => r.persona_id === a.persona_id && r.semana === semana,
          ) ?? regs.find((r) => r.persona_id === a.persona_id);
        return { persona, carga: reg?.carga_trabajo ?? null, rol: a.rol_equipo };
      })
      .filter(
        (m): m is { persona: Persona; carga: CargaTrabajo | null; rol: Asignacion["rol_equipo"] } =>
          m.persona !== null,
      ),
  }));
}

// ============================================================
// PROYECTOS
// ============================================================

export interface ProyectoConCliente extends Proyecto {
  cliente: Cliente | null;
}

export async function getProyectos(): Promise<ProyectoConCliente[]> {
  const supabase = await createClient();
  const [proyectosR, clientesR] = await Promise.all([
    supabase.from("proyectos").select("*").order("nombre"),
    supabase.from("clientes").select("*"),
  ]);
  const clientes = byId<Cliente>(clientesR.data as Cliente[]);
  return ((proyectosR.data ?? []) as Proyecto[]).map((p) => ({
    ...p,
    cliente: clientes.get(p.cliente_id) ?? null,
  }));
}

export async function getProyectoDetalle(id: string) {
  const supabase = await createClient();
  const [proyectoR, clientesR, equiposR, asigsR, personasR, regsR] =
    await Promise.all([
      supabase.from("proyectos").select("*").eq("id", id).single(),
      supabase.from("clientes").select("*"),
      supabase.from("equipos").select("*").eq("proyecto_id", id),
      supabase
        .from("asignaciones")
        .select("*")
        .eq("proyecto_id", id)
        .is("fecha_fin", null),
      supabase.from("personas").select("*"),
      supabase
        .from("registros_semanales")
        .select("*")
        .order("semana", { ascending: false }),
    ]);

  if (!proyectoR.data) return null;
  const clientes = byId<Cliente>(clientesR.data as Cliente[]);
  const personas = byId<Persona>(personasR.data as Persona[]);
  const asigs = (asigsR.data ?? []) as Asignacion[];
  const regs = (regsR.data ?? []) as RegistroSemanal[];
  const semana = semanaActual();

  const proyecto = proyectoR.data as Proyecto;
  return {
    proyecto,
    cliente: clientes.get(proyecto.cliente_id) ?? null,
    equipos: (equiposR.data ?? []) as Equipo[],
    personasAsignadas: asigs.map((a) => ({
      asignacion: a,
      persona: personas.get(a.persona_id) ?? null,
      registroSemana:
        regs.find(
          (r) => r.persona_id === a.persona_id && r.semana === semana,
        ) ?? null,
    })),
  };
}

// ============================================================
// EQUIPOS
// ============================================================

export interface EquipoConContexto extends Equipo {
  cliente: Cliente | null;
  proyecto: Proyecto | null;
  miembros: number;
}

export async function getEquipos(): Promise<EquipoConContexto[]> {
  const supabase = await createClient();
  const [equiposR, clientesR, proyectosR, asigsR] = await Promise.all([
    supabase.from("equipos").select("*").order("nombre"),
    supabase.from("clientes").select("*"),
    supabase.from("proyectos").select("*"),
    supabase.from("asignaciones").select("*").is("fecha_fin", null),
  ]);
  const clientes = byId<Cliente>(clientesR.data as Cliente[]);
  const proyectos = byId<Proyecto>(proyectosR.data as Proyecto[]);
  const asigs = (asigsR.data ?? []) as Asignacion[];
  return ((equiposR.data ?? []) as Equipo[]).map((e) => ({
    ...e,
    cliente: clientes.get(e.cliente_id) ?? null,
    proyecto: e.proyecto_id ? (proyectos.get(e.proyecto_id) ?? null) : null,
    miembros: asigs.filter((a) => a.equipo_id === e.id).length,
  }));
}

export async function getEquipoDetalle(id: string) {
  const supabase = await createClient();
  const [equipoR, clientesR, proyectosR, asigsR, personasR] =
    await Promise.all([
      supabase.from("equipos").select("*").eq("id", id).single(),
      supabase.from("clientes").select("*"),
      supabase.from("proyectos").select("*"),
      supabase
        .from("asignaciones")
        .select("*")
        .eq("equipo_id", id)
        .is("fecha_fin", null),
      supabase.from("personas").select("*"),
    ]);
  if (!equipoR.data) return null;
  const clientes = byId<Cliente>(clientesR.data as Cliente[]);
  const proyectos = byId<Proyecto>(proyectosR.data as Proyecto[]);
  const personas = byId<Persona>(personasR.data as Persona[]);
  const equipo = equipoR.data as Equipo;
  const asigs = (asigsR.data ?? []) as Asignacion[];
  return {
    equipo,
    cliente: clientes.get(equipo.cliente_id) ?? null,
    proyecto: equipo.proyecto_id
      ? (proyectos.get(equipo.proyecto_id) ?? null)
      : null,
    miembros: asigs.map((a) => ({
      asignacion: a,
      persona: personas.get(a.persona_id) ?? null,
    })),
  };
}

// ============================================================
// OPCIONES (para selects de formularios)
// ============================================================

export async function getOpciones() {
  const supabase = await createClient();
  const [personasR, clientesR, proyectosR, equiposR] = await Promise.all([
    supabase
      .from("personas")
      .select("*")
      .eq("activo", true)
      .order("apellido"),
    supabase.from("clientes").select("*").order("nombre"),
    supabase.from("proyectos").select("*").order("nombre"),
    supabase.from("equipos").select("*").order("nombre"),
  ]);
  return {
    personas: (personasR.data ?? []) as Persona[],
    clientes: (clientesR.data ?? []) as Cliente[],
    proyectos: (proyectosR.data ?? []) as Proyecto[],
    equipos: (equiposR.data ?? []) as Equipo[],
  };
}

// ============================================================
// REGISTROS SEMANALES
// ============================================================

export interface RegistroConPersona extends RegistroSemanal {
  persona: Persona | null;
}

export async function getRegistros(
  semana?: string,
): Promise<RegistroConPersona[]> {
  const supabase = await createClient();
  let q = supabase
    .from("registros_semanales")
    .select("*")
    .order("semana", { ascending: false });
  if (semana) q = q.eq("semana", semana);
  const [regsR, personasR] = await Promise.all([
    q,
    supabase.from("personas").select("*"),
  ]);
  const personas = byId<Persona>(personasR.data as Persona[]);
  return ((regsR.data ?? []) as RegistroSemanal[]).map((r) => ({
    ...r,
    persona: personas.get(r.persona_id) ?? null,
  }));
}

export async function getSemanasDisponibles(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("registros_semanales")
    .select("semana")
    .order("semana", { ascending: false });
  const set = new Set((data ?? []).map((r) => r.semana as string));
  const actual = semanaActual();
  set.add(actual);
  return Array.from(set).sort().reverse();
}

// ============================================================
// DASHBOARD
// ============================================================

export interface DashboardData {
  totalActivas: number;
  clientesActivos: number;
  clientesInactivos: number;
  proyectosActivos: number;
  semana: string;
  cargaCounts: Partial<Record<CargaTrabajo, number>>;
  sinRegistro: number;
  conRegistro: number;
  sinAsignacion: { id: string; nombre: string }[];
  personasSinRegistro: { id: string; nombre: string }[];
  porCliente: { nombre: string; value: number }[];
}

export async function getDashboardData(): Promise<DashboardData> {
  const estados = await getPersonasConEstado();
  const supabase = await createClient();
  const [clientesR, proyectosR] = await Promise.all([
    supabase.from("clientes").select("*"),
    supabase.from("proyectos").select("*"),
  ]);
  const clientes = (clientesR.data ?? []) as Cliente[];
  const proyectos = (proyectosR.data ?? []) as Proyecto[];
  const semana = semanaActual();

  const activos = estados.filter((e) => e.persona.activo);

  const cargaCounts: Partial<Record<CargaTrabajo, number>> = {};
  let conRegistro = 0;
  const personasSinRegistro: { id: string; nombre: string }[] = [];
  for (const e of activos) {
    const carga = e.registroSemana?.carga_trabajo;
    if (carga) {
      cargaCounts[carga] = (cargaCounts[carga] ?? 0) + 1;
      conRegistro++;
    } else {
      personasSinRegistro.push({
        id: e.persona.id,
        nombre: `${e.persona.nombre} ${e.persona.apellido}`,
      });
    }
  }

  const sinAsignacion = activos
    .filter((e) => e.activas.length === 0)
    .map((e) => ({
      id: e.persona.id,
      nombre: `${e.persona.nombre} ${e.persona.apellido}`,
    }));

  // Personas por cliente (asignaciones activas)
  const clienteCount = new Map<string, number>();
  for (const e of activos) {
    for (const a of e.activas) {
      if (a.cliente) {
        clienteCount.set(
          a.cliente.nombre,
          (clienteCount.get(a.cliente.nombre) ?? 0) + 1,
        );
      }
    }
  }
  const porCliente = Array.from(clienteCount.entries())
    .map(([nombre, value]) => ({ nombre, value }))
    .sort((a, b) => b.value - a.value);

  return {
    totalActivas: activos.length,
    clientesActivos: clientes.filter((c) => c.estado === "activo").length,
    clientesInactivos: clientes.filter((c) => c.estado === "inactivo").length,
    proyectosActivos: proyectos.filter((p) => p.estado === "activo").length,
    semana,
    cargaCounts,
    sinRegistro: personasSinRegistro.length,
    conRegistro,
    sinAsignacion,
    personasSinRegistro,
    porCliente,
  };
}

// ============================================================
// ALERTAS DE GESTIÓN
// ============================================================

const ALERTA_SELECT =
  "*, clientes(nombre), proyectos(nombre), personas(nombre, apellido)";

const TIPO_ORDEN: Record<AlertaTipo, number> = {
  critica: 0,
  importante: 1,
  seguimiento: 2,
};

// Orden: crítica primero, luego por fecha límite ascendente (sin fecha al final),
// finalmente por antigüedad. Se ordena en memoria porque `tipo` es texto.
function ordenarAlertas(rows: AlertaGestion[]): AlertaGestion[] {
  return [...rows].sort((a, b) => {
    if (TIPO_ORDEN[a.tipo] !== TIPO_ORDEN[b.tipo])
      return TIPO_ORDEN[a.tipo] - TIPO_ORDEN[b.tipo];
    const fa = a.fecha_limite ?? "9999-12-31";
    const fb = b.fecha_limite ?? "9999-12-31";
    if (fa !== fb) return fa < fb ? -1 : 1;
    return a.created_at < b.created_at ? -1 : 1;
  });
}

// Alertas activas (pendiente + en gestión) para el dashboard.
export async function getAlertasActivas(): Promise<AlertaGestion[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("alertas_gestion")
    .select(ALERTA_SELECT)
    .in("estado", ["pendiente", "en_gestion"]);
  return ordenarAlertas((data ?? []) as AlertaGestion[]);
}

// Todas las alertas (para la página de gestión /alertas).
export async function getTodasLasAlertas(): Promise<AlertaGestion[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("alertas_gestion").select(ALERTA_SELECT);
  return ordenarAlertas((data ?? []) as AlertaGestion[]);
}

// Proyectos activos con su nivel de criticidad derivado de las alertas activas
// asociadas (al proyecto o a su cliente). Alimenta la Zona 3 del dashboard.
export interface ProyectoCritico {
  id: string;
  nombre: string;
  cliente: string | null;
  estado: ProyectoEstado;
  criticidad: AlertaTipo | "normal";
}

const CRIT_ORDEN: Record<AlertaTipo | "normal", number> = {
  critica: 0,
  importante: 1,
  seguimiento: 2,
  normal: 3,
};

export async function getProyectosCriticos(): Promise<ProyectoCritico[]> {
  const supabase = await createClient();
  const [proyectosR, clientesR, alertasR] = await Promise.all([
    supabase.from("proyectos").select("*").eq("estado", "activo"),
    supabase.from("clientes").select("*"),
    supabase
      .from("alertas_gestion")
      .select("tipo, cliente_id, proyecto_id")
      .in("estado", ["pendiente", "en_gestion"]),
  ]);
  const clientes = byId<Cliente>(clientesR.data as Cliente[]);
  const alertas = (alertasR.data ?? []) as {
    tipo: AlertaTipo;
    cliente_id: string | null;
    proyecto_id: string | null;
  }[];

  return ((proyectosR.data ?? []) as Proyecto[])
    .map((p) => {
      const rel = alertas.filter(
        (a) => a.proyecto_id === p.id || a.cliente_id === p.cliente_id,
      );
      const criticidad: AlertaTipo | "normal" = rel.some(
        (a) => a.tipo === "critica",
      )
        ? "critica"
        : rel.some((a) => a.tipo === "importante")
          ? "importante"
          : rel.some((a) => a.tipo === "seguimiento")
            ? "seguimiento"
            : "normal";
      return {
        id: p.id,
        nombre: p.nombre,
        cliente: clientes.get(p.cliente_id)?.nombre ?? null,
        estado: p.estado,
        criticidad,
      };
    })
    .sort(
      (a, b) =>
        CRIT_ORDEN[a.criticidad] - CRIT_ORDEN[b.criticidad] ||
        a.nombre.localeCompare(b.nombre),
    );
}

// ============================================================
// REPORTES — carga histórica
// ============================================================

export async function getCargaHistorica() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("registros_semanales")
    .select("semana, carga_trabajo")
    .order("semana", { ascending: true });
  const rows = (data ?? []) as Pick<
    RegistroSemanal,
    "semana" | "carga_trabajo"
  >[];
  const map = new Map<string, Partial<Record<CargaTrabajo, number>>>();
  for (const r of rows) {
    if (!r.carga_trabajo) continue;
    const wk = map.get(r.semana) ?? {};
    wk[r.carga_trabajo] = (wk[r.carga_trabajo] ?? 0) + 1;
    map.set(r.semana, wk);
  }
  return Array.from(map.entries())
    .map(([semana, counts]) => ({ semana, counts }))
    .sort((a, b) => a.semana.localeCompare(b.semana));
}
