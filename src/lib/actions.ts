"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { assertAdmin } from "@/lib/auth";
import { diaAnterior } from "@/lib/format";

// ---------- estado de formularios (useActionState) ----------
// Las Server Actions retornan este objeto para errores ESPERADOS (validación,
// duplicados). Los errores inesperados (500) sí lanzan excepción.
export type FormState = {
  error: string | null;
  fieldErrors?: Record<string, string>;
};

// ---------- helpers ----------
type DbError = { code?: string; message: string } | null;

function str(fd: FormData, key: string): string | null {
  const v = fd.get(key);
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t === "" ? null : t;
}

function invalid(
  fieldErrors: Record<string, string>,
  general = "Revisa los campos marcados.",
): FormState {
  return { error: general, fieldErrors };
}

const today = () => new Date().toISOString().slice(0, 10);

// ============================================================
// PERSONAS
// ============================================================

export async function guardarPersona(
  _prev: FormState,
  fd: FormData,
): Promise<FormState> {
  await assertAdmin();
  const supabase = await createClient();
  const id = str(fd, "id");

  const nombre = str(fd, "nombre");
  const apellido = str(fd, "apellido");
  const rut = str(fd, "rut");
  const tipo_contrato = str(fd, "tipo_contrato");

  const fieldErrors: Record<string, string> = {};
  if (!nombre) fieldErrors.nombre = "El nombre es obligatorio.";
  if (!apellido) fieldErrors.apellido = "El apellido es obligatorio.";
  if (!rut) fieldErrors.rut = "El RUT es obligatorio.";
  if (!tipo_contrato)
    fieldErrors.tipo_contrato = "Selecciona el tipo de contrato.";
  if (Object.keys(fieldErrors).length) return invalid(fieldErrors);

  const payload = {
    nombre,
    apellido,
    segundo_apellido: str(fd, "segundo_apellido"),
    rut,
    cargo: str(fd, "cargo"),
    tipo_contrato,
    activo: fd.get("activo") === "on" || fd.get("activo") === "true",
  };

  let savedId = id;
  if (id) {
    const { error } = await supabase
      .from("personas")
      .update(payload)
      .eq("id", id);
    if (error) return personaDbError(error);
    revalidatePath(`/personas/${id}`);
  } else {
    const { data, error } = await supabase
      .from("personas")
      .insert({ ...payload, activo: true })
      .select("id")
      .single();
    if (error) return personaDbError(error);
    savedId = data!.id;
  }
  revalidatePath("/personas");
  redirect(`/personas/${savedId}`);
}

function personaDbError(error: DbError): FormState {
  if (error?.code === "23505")
    return {
      error: "Ya existe una persona con ese RUT.",
      fieldErrors: { rut: "RUT duplicado." },
    };
  return { error: `No se pudo guardar la persona: ${error?.message ?? ""}` };
}

export async function setPersonaActivo(id: string, activo: boolean) {
  await assertAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("personas")
    .update({ activo })
    .eq("id", id);
  if (error) throw new Error(`No se pudo cambiar el estado: ${error.message}`);
  revalidatePath("/personas");
  revalidatePath(`/personas/${id}`);
}

// ============================================================
// CLIENTES
// ============================================================

export async function guardarCliente(
  _prev: FormState,
  fd: FormData,
): Promise<FormState> {
  await assertAdmin();
  const supabase = await createClient();
  const id = str(fd, "id");

  const nombre = str(fd, "nombre");
  const tipo = str(fd, "tipo");
  const estado = str(fd, "estado");

  const fieldErrors: Record<string, string> = {};
  if (!nombre) fieldErrors.nombre = "El nombre es obligatorio.";
  if (!tipo) fieldErrors.tipo = "Selecciona el tipo.";
  if (!estado) fieldErrors.estado = "Selecciona el estado.";
  if (Object.keys(fieldErrors).length) return invalid(fieldErrors);

  const payload = {
    nombre,
    tipo,
    estado,
    descripcion: str(fd, "descripcion"),
    contexto_actual: str(fd, "contexto_actual"),
    ultimos_eventos: str(fd, "ultimos_eventos"),
    proximos_pasos: str(fd, "proximos_pasos"),
    proyectos_futuros: str(fd, "proyectos_futuros"),
    contactos_cliente: str(fd, "contactos_cliente"),
    notas_estrategicas: str(fd, "notas_estrategicas"),
  };

  if (id) {
    const { error } = await supabase
      .from("clientes")
      .update(payload)
      .eq("id", id);
    if (error) return clienteDbError(error);
    revalidatePath(`/clientes/${id}`);
    revalidatePath("/clientes");
    redirect(`/clientes/${id}`);
  } else {
    const { data, error } = await supabase
      .from("clientes")
      .insert(payload)
      .select("id")
      .single();
    if (error) return clienteDbError(error);
    revalidatePath("/clientes");
    redirect(`/clientes/${data!.id}`);
  }
}

function clienteDbError(error: DbError): FormState {
  if (error?.code === "23505")
    return {
      error: "Ya existe un cliente con ese nombre.",
      fieldErrors: { nombre: "Nombre duplicado." },
    };
  return { error: `No se pudo guardar el cliente: ${error?.message ?? ""}` };
}

// ============================================================
// PROYECTOS
// ============================================================

export async function guardarProyecto(
  _prev: FormState,
  fd: FormData,
): Promise<FormState> {
  await assertAdmin();
  const supabase = await createClient();
  const id = str(fd, "id");

  const nombre = str(fd, "nombre");
  const cliente_id = str(fd, "cliente_id");
  const estado = str(fd, "estado");

  const fieldErrors: Record<string, string> = {};
  if (!nombre) fieldErrors.nombre = "El nombre es obligatorio.";
  if (!cliente_id) fieldErrors.cliente_id = "Selecciona el cliente / área.";
  if (!estado) fieldErrors.estado = "Selecciona el estado.";

  const fecha_inicio = str(fd, "fecha_inicio");
  const fecha_fin = str(fd, "fecha_fin");
  if (fecha_inicio && fecha_fin && fecha_fin < fecha_inicio)
    fieldErrors.fecha_fin =
      "La fecha de fin no puede ser anterior a la de inicio.";
  if (Object.keys(fieldErrors).length) return invalid(fieldErrors);

  const payload = {
    nombre,
    cliente_id,
    estado,
    descripcion: str(fd, "descripcion"),
    fecha_inicio,
    fecha_fin,
  };

  if (id) {
    const { error } = await supabase
      .from("proyectos")
      .update(payload)
      .eq("id", id);
    if (error) return { error: `No se pudo guardar el proyecto: ${error.message}` };
    revalidatePath(`/proyectos/${id}`);
    revalidatePath("/proyectos");
    redirect(`/proyectos/${id}`);
  } else {
    const { data, error } = await supabase
      .from("proyectos")
      .insert(payload)
      .select("id")
      .single();
    if (error) return { error: `No se pudo crear el proyecto: ${error.message}` };
    revalidatePath("/proyectos");
    redirect(`/proyectos/${data!.id}`);
  }
}

// ============================================================
// EQUIPOS
// ============================================================

export async function guardarEquipo(
  _prev: FormState,
  fd: FormData,
): Promise<FormState> {
  await assertAdmin();
  const supabase = await createClient();
  const id = str(fd, "id");

  const nombre = str(fd, "nombre");
  const cliente_id = str(fd, "cliente_id");

  const fieldErrors: Record<string, string> = {};
  if (!nombre) fieldErrors.nombre = "El nombre es obligatorio.";
  if (!cliente_id) fieldErrors.cliente_id = "Selecciona el cliente / área.";
  if (Object.keys(fieldErrors).length) return invalid(fieldErrors);

  const payload = { nombre, cliente_id, proyecto_id: str(fd, "proyecto_id") };
  if (id) {
    const { error } = await supabase
      .from("equipos")
      .update(payload)
      .eq("id", id);
    if (error) return { error: `No se pudo guardar el equipo: ${error.message}` };
    revalidatePath(`/equipos/${id}`);
    revalidatePath("/equipos");
    redirect(`/equipos/${id}`);
  } else {
    const { data, error } = await supabase
      .from("equipos")
      .insert(payload)
      .select("id")
      .single();
    if (error) return { error: `No se pudo crear el equipo: ${error.message}` };
    revalidatePath("/equipos");
    redirect(`/equipos/${data!.id}`);
  }
}

// ============================================================
// ASIGNACIONES (soft delete vía fecha_fin)
// ============================================================

export async function crearAsignacion(
  _prev: FormState,
  fd: FormData,
): Promise<FormState> {
  await assertAdmin();
  const supabase = await createClient();

  const persona_id = str(fd, "persona_id");
  const cliente_id = str(fd, "cliente_id");
  const equipo_id = str(fd, "equipo_id");

  const fieldErrors: Record<string, string> = {};
  if (!persona_id) fieldErrors.persona_id = "Selecciona una persona.";
  if (!cliente_id && !equipo_id)
    fieldErrors.cliente_id = "Selecciona el cliente / área.";
  if (Object.keys(fieldErrors).length) return invalid(fieldErrors);

  const payload = {
    persona_id,
    cliente_id,
    proyecto_id: str(fd, "proyecto_id"),
    equipo_id,
    rol_equipo: str(fd, "rol_equipo") ?? "colaborador",
    fecha_inicio: str(fd, "fecha_inicio") ?? today(),
  };
  const { error } = await supabase.from("asignaciones").insert(payload);
  if (error) return { error: `No se pudo crear la asignación: ${error.message}` };
  revalidatePath(`/personas/${persona_id}`);
  const redirectTo = str(fd, "redirect_to");
  redirect(redirectTo ?? `/personas/${persona_id}`);
}

export async function cerrarAsignacion(fd: FormData) {
  await assertAdmin();
  const supabase = await createClient();
  const id = str(fd, "id");
  if (!id) throw new Error('El campo "Asignación" es obligatorio.');
  const fecha = str(fd, "fecha_fin") ?? today();
  const { error } = await supabase
    .from("asignaciones")
    .update({ fecha_fin: fecha })
    .eq("id", id);
  if (error) throw new Error(`No se pudo cerrar la asignación: ${error.message}`);
  const redirectTo = str(fd, "redirect_to");
  if (redirectTo) {
    revalidatePath(redirectTo);
    redirect(redirectTo);
  }
}

// Mueve a una persona de una asignación a otra en un solo paso:
// cierra la actual (fecha_fin = inicio_nueva - 1 día) y crea la nueva.
export async function moverPersona(
  _prev: FormState,
  fd: FormData,
): Promise<FormState> {
  await assertAdmin();
  const supabase = await createClient();

  const asignacionId = str(fd, "asignacion_id");
  const persona_id = str(fd, "persona_id");
  if (!asignacionId || !persona_id)
    return { error: "Datos de la asignación incompletos." };

  const cliente_id = str(fd, "cliente_id");
  const fecha_inicio = str(fd, "fecha_inicio");
  const fechaInicioActual = str(fd, "fecha_inicio_actual");

  const fieldErrors: Record<string, string> = {};
  if (!cliente_id) fieldErrors.cliente_id = "Selecciona el cliente / área destino.";
  if (!fecha_inicio) fieldErrors.fecha_inicio = "Indica la fecha de inicio.";
  if (
    fecha_inicio &&
    fechaInicioActual &&
    fecha_inicio <= fechaInicioActual
  )
    fieldErrors.fecha_inicio =
      "Debe ser posterior al inicio de la asignación actual.";
  if (Object.keys(fieldErrors).length) return invalid(fieldErrors);

  const fechaFin = diaAnterior(fecha_inicio!);

  // 1) cerrar la asignación actual
  const { error: closeErr } = await supabase
    .from("asignaciones")
    .update({ fecha_fin: fechaFin })
    .eq("id", asignacionId);
  if (closeErr)
    return {
      error: `No se pudo cerrar la asignación actual: ${closeErr.message}`,
    };

  // 2) crear la nueva; si falla, reabrir la anterior (compensación)
  const { error: insErr } = await supabase.from("asignaciones").insert({
    persona_id,
    cliente_id,
    proyecto_id: str(fd, "proyecto_id"),
    equipo_id: null,
    rol_equipo: str(fd, "rol_equipo") ?? "colaborador",
    fecha_inicio,
  });
  if (insErr) {
    await supabase
      .from("asignaciones")
      .update({ fecha_fin: null })
      .eq("id", asignacionId);
    return { error: `No se pudo crear la nueva asignación: ${insErr.message}` };
  }

  revalidatePath(`/personas/${persona_id}`);
  redirect(`/personas/${persona_id}`);
}

// ============================================================
// REGISTROS SEMANALES (upsert por persona + semana)
// ============================================================

export async function guardarRegistro(
  _prev: FormState,
  fd: FormData,
): Promise<FormState> {
  await assertAdmin();
  const supabase = await createClient();

  const persona_id = str(fd, "persona_id");
  const semana = str(fd, "semana");

  const fieldErrors: Record<string, string> = {};
  if (!persona_id) fieldErrors.persona_id = "Selecciona una persona.";
  if (!semana) fieldErrors.semana = "Indica la semana (lunes).";
  if (Object.keys(fieldErrors).length) return invalid(fieldErrors);

  const payload = {
    persona_id,
    semana,
    resumen: str(fd, "resumen"),
    tipo_trabajo: str(fd, "tipo_trabajo"),
    carga_trabajo: str(fd, "carga_trabajo"),
    hitos: str(fd, "hitos"),
  };
  const { error } = await supabase
    .from("registros_semanales")
    .upsert(payload, { onConflict: "persona_id,semana" });
  if (error) return { error: `No se pudo guardar el registro: ${error.message}` };
  revalidatePath(`/personas/${persona_id}`);
  revalidatePath("/registros");
  revalidatePath("/");
  const redirectTo = str(fd, "redirect_to");
  redirect(redirectTo ?? `/personas/${persona_id}`);
}

// ============================================================
// ALERTAS DE GESTIÓN
// ============================================================

// Cambia el estado de una alerta (pendiente / en_gestion / resuelta).
// Se invoca desde botones-formulario, por eso lee FormData.
export async function cambiarEstadoAlerta(fd: FormData) {
  await assertAdmin();
  const supabase = await createClient();
  const id = str(fd, "id");
  const estado = str(fd, "estado");
  if (!id || !estado) throw new Error("Datos de la alerta incompletos.");
  if (!["pendiente", "en_gestion", "resuelta"].includes(estado))
    throw new Error("Estado de alerta inválido.");

  const { error } = await supabase
    .from("alertas_gestion")
    .update({ estado })
    .eq("id", id);
  if (error)
    throw new Error(`No se pudo actualizar la alerta: ${error.message}`);
  revalidatePath("/");
  revalidatePath("/alertas");
}

export async function crearAlerta(
  _prev: FormState,
  fd: FormData,
): Promise<FormState> {
  await assertAdmin();
  const supabase = await createClient();

  const titulo = str(fd, "titulo");
  const tipo = str(fd, "tipo");

  const fieldErrors: Record<string, string> = {};
  if (!titulo) fieldErrors.titulo = "El título es obligatorio.";
  if (!tipo) fieldErrors.tipo = "Selecciona el tipo.";
  if (Object.keys(fieldErrors).length) return invalid(fieldErrors);

  const payload = {
    titulo,
    descripcion: str(fd, "descripcion"),
    tipo,
    estado: "pendiente",
    categoria: str(fd, "categoria"),
    cliente_id: str(fd, "cliente_id"),
    proyecto_id: str(fd, "proyecto_id"),
    persona_id: str(fd, "persona_id"),
    fecha_limite: str(fd, "fecha_limite"),
  };
  const { error } = await supabase.from("alertas_gestion").insert(payload);
  if (error) return { error: `No se pudo crear la alerta: ${error.message}` };
  revalidatePath("/");
  revalidatePath("/alertas");
  redirect("/alertas");
}
