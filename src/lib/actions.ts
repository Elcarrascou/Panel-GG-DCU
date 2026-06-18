"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { assertAdmin } from "@/lib/auth";

// ---------- helpers ----------
function str(fd: FormData, key: string): string | null {
  const v = fd.get(key);
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t === "" ? null : t;
}
function req(fd: FormData, key: string, label: string): string {
  const v = str(fd, key);
  if (!v) throw new Error(`El campo "${label}" es obligatorio.`);
  return v;
}
function fail(error: { message: string } | null, ctx: string) {
  if (error) throw new Error(`${ctx}: ${error.message}`);
}

// ============================================================
// PERSONAS
// ============================================================

export async function guardarPersona(fd: FormData) {
  await assertAdmin();
  const supabase = await createClient();
  const id = str(fd, "id");
  const payload = {
    nombre: req(fd, "nombre", "Nombre"),
    apellido: req(fd, "apellido", "Apellido"),
    segundo_apellido: str(fd, "segundo_apellido"),
    rut: req(fd, "rut", "RUT"),
    cargo: str(fd, "cargo"),
    tipo_contrato: req(fd, "tipo_contrato", "Tipo de contrato"),
    activo: fd.get("activo") === "on" || fd.get("activo") === "true",
  };

  if (id) {
    const { error } = await supabase
      .from("personas")
      .update(payload)
      .eq("id", id);
    fail(error, "No se pudo actualizar la persona");
    revalidatePath(`/personas/${id}`);
  } else {
    const { data, error } = await supabase
      .from("personas")
      .insert({ ...payload, activo: true })
      .select("id")
      .single();
    fail(error, "No se pudo crear la persona");
    revalidatePath("/personas");
    redirect(`/personas/${data!.id}`);
  }
  revalidatePath("/personas");
  redirect(`/personas/${id}`);
}

export async function setPersonaActivo(id: string, activo: boolean) {
  await assertAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("personas")
    .update({ activo })
    .eq("id", id);
  fail(error, "No se pudo cambiar el estado");
  revalidatePath("/personas");
  revalidatePath(`/personas/${id}`);
}

// ============================================================
// CLIENTES
// ============================================================

export async function guardarCliente(fd: FormData) {
  await assertAdmin();
  const supabase = await createClient();
  const id = str(fd, "id");
  const payload = {
    nombre: req(fd, "nombre", "Nombre"),
    tipo: req(fd, "tipo", "Tipo"),
    estado: req(fd, "estado", "Estado"),
    descripcion: str(fd, "descripcion"),
  };

  if (id) {
    const { error } = await supabase
      .from("clientes")
      .update(payload)
      .eq("id", id);
    fail(error, "No se pudo actualizar el cliente");
    revalidatePath(`/clientes/${id}`);
    revalidatePath("/clientes");
    redirect(`/clientes/${id}`);
  } else {
    const { data, error } = await supabase
      .from("clientes")
      .insert(payload)
      .select("id")
      .single();
    fail(error, "No se pudo crear el cliente");
    revalidatePath("/clientes");
    redirect(`/clientes/${data!.id}`);
  }
}

// ============================================================
// PROYECTOS
// ============================================================

export async function guardarProyecto(fd: FormData) {
  await assertAdmin();
  const supabase = await createClient();
  const id = str(fd, "id");
  const payload = {
    nombre: req(fd, "nombre", "Nombre"),
    cliente_id: req(fd, "cliente_id", "Cliente"),
    estado: req(fd, "estado", "Estado"),
    descripcion: str(fd, "descripcion"),
    fecha_inicio: str(fd, "fecha_inicio"),
    fecha_fin: str(fd, "fecha_fin"),
  };

  if (id) {
    const { error } = await supabase
      .from("proyectos")
      .update(payload)
      .eq("id", id);
    fail(error, "No se pudo actualizar el proyecto");
    revalidatePath(`/proyectos/${id}`);
    revalidatePath("/proyectos");
    redirect(`/proyectos/${id}`);
  } else {
    const { data, error } = await supabase
      .from("proyectos")
      .insert(payload)
      .select("id")
      .single();
    fail(error, "No se pudo crear el proyecto");
    revalidatePath("/proyectos");
    redirect(`/proyectos/${data!.id}`);
  }
}

// ============================================================
// EQUIPOS
// ============================================================

export async function guardarEquipo(fd: FormData) {
  await assertAdmin();
  const supabase = await createClient();
  const id = str(fd, "id");
  const payload = {
    nombre: req(fd, "nombre", "Nombre"),
    cliente_id: req(fd, "cliente_id", "Cliente"),
    proyecto_id: str(fd, "proyecto_id"),
  };
  if (id) {
    const { error } = await supabase
      .from("equipos")
      .update(payload)
      .eq("id", id);
    fail(error, "No se pudo actualizar el equipo");
    revalidatePath(`/equipos/${id}`);
    revalidatePath("/equipos");
    redirect(`/equipos/${id}`);
  } else {
    const { data, error } = await supabase
      .from("equipos")
      .insert(payload)
      .select("id")
      .single();
    fail(error, "No se pudo crear el equipo");
    revalidatePath("/equipos");
    redirect(`/equipos/${data!.id}`);
  }
}

// ============================================================
// ASIGNACIONES (soft delete vía fecha_fin)
// ============================================================

export async function crearAsignacion(fd: FormData) {
  await assertAdmin();
  const supabase = await createClient();
  const persona_id = req(fd, "persona_id", "Persona");
  const payload = {
    persona_id,
    cliente_id: str(fd, "cliente_id"),
    proyecto_id: str(fd, "proyecto_id"),
    equipo_id: str(fd, "equipo_id"),
    rol_equipo: str(fd, "rol_equipo") ?? "colaborador",
    fecha_inicio: str(fd, "fecha_inicio") ?? new Date().toISOString().slice(0, 10),
  };
  const { error } = await supabase.from("asignaciones").insert(payload);
  fail(error, "No se pudo crear la asignación");
  revalidatePath(`/personas/${persona_id}`);
  const redirectTo = str(fd, "redirect_to");
  if (redirectTo) redirect(redirectTo);
  redirect(`/personas/${persona_id}`);
}

export async function cerrarAsignacion(fd: FormData) {
  await assertAdmin();
  const supabase = await createClient();
  const id = req(fd, "id", "Asignación");
  const fecha = str(fd, "fecha_fin") ?? new Date().toISOString().slice(0, 10);
  const { error } = await supabase
    .from("asignaciones")
    .update({ fecha_fin: fecha })
    .eq("id", id);
  fail(error, "No se pudo cerrar la asignación");
  const redirectTo = str(fd, "redirect_to");
  if (redirectTo) {
    revalidatePath(redirectTo);
    redirect(redirectTo);
  }
}

// ============================================================
// REGISTROS SEMANALES (upsert por persona + semana)
// ============================================================

export async function guardarRegistro(fd: FormData) {
  await assertAdmin();
  const supabase = await createClient();
  const persona_id = req(fd, "persona_id", "Persona");
  const semana = req(fd, "semana", "Semana");
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
  fail(error, "No se pudo guardar el registro");
  revalidatePath(`/personas/${persona_id}`);
  revalidatePath("/registros");
  revalidatePath("/");
  const redirectTo = str(fd, "redirect_to");
  redirect(redirectTo ?? `/personas/${persona_id}`);
}
