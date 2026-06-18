"use client";

import { useActionState, useState } from "react";
import { guardarEquipo, type FormState } from "@/lib/actions";
import {
  Field,
  FormGrid,
  TextInput,
  Select,
  FormError,
} from "@/components/ui/Form";
import { Button, ButtonLink } from "@/components/ui/Button";
import type { Cliente, Equipo, Proyecto } from "@/lib/types";

export function EquipoForm({
  equipo,
  clientes,
  proyectos,
}: {
  equipo?: Equipo;
  clientes: Cliente[];
  proyectos: Proyecto[];
}) {
  const [state, action] = useActionState<FormState, FormData>(guardarEquipo, {
    error: null,
  });
  const fe = state.fieldErrors ?? {};
  const [clienteId, setClienteId] = useState(equipo?.cliente_id ?? "");
  const [proyectoId, setProyectoId] = useState(equipo?.proyecto_id ?? "");

  // Proyectos activos del cliente elegido; conserva el proyecto actual al editar
  // aunque ya no esté activo, para no perder la selección.
  const proyectosCliente = clienteId
    ? proyectos.filter(
        (p) =>
          p.cliente_id === clienteId &&
          (p.estado === "activo" || p.id === equipo?.proyecto_id),
      )
    : [];

  return (
    <form action={action} className="space-y-5">
      {equipo && <input type="hidden" name="id" value={equipo.id} />}
      <FormGrid>
        <Field label="Nombre" required error={fe.nombre}>
          <TextInput name="nombre" defaultValue={equipo?.nombre ?? ""} />
        </Field>
        <Field label="Cliente / Área" required error={fe.cliente_id}>
          <Select
            name="cliente_id"
            value={clienteId}
            onChange={(e) => {
              setClienteId(e.target.value);
              setProyectoId("");
            }}
          >
            <option value="" disabled>
              Selecciona…
            </option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label="Proyecto (opcional)"
          hint="Un equipo puede ser a nivel cliente o proyecto"
        >
          <Select
            name="proyecto_id"
            value={proyectoId}
            onChange={(e) => setProyectoId(e.target.value)}
            disabled={!clienteId}
          >
            <option value="">
              {!clienteId
                ? "Selecciona primero un cliente"
                : "— A nivel cliente —"}
            </option>
            {proyectosCliente.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </Select>
        </Field>
      </FormGrid>
      <div className="flex items-center gap-3 pt-2">
        <Button type="submit">
          {equipo ? "Guardar cambios" : "Crear equipo"}
        </Button>
        <ButtonLink
          href={equipo ? `/equipos/${equipo.id}` : "/equipos"}
          variant="ghost"
        >
          Cancelar
        </ButtonLink>
      </div>
      <FormError message={state.error} />
    </form>
  );
}
