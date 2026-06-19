"use client";

import { useActionState, useState } from "react";
import { crearAsignacion, type FormState } from "@/lib/actions";
import { Field, FormGrid, Select, FormError } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";
import {
  ROL_EQUIPO_LABEL,
  type Cliente,
  type Equipo,
  type Proyecto,
} from "@/lib/types";

const DATE_CLS =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/40";

export function AsignacionForm({
  personaId,
  clientes,
  proyectos,
  equipos,
  redirectTo,
}: {
  personaId: string;
  clientes: Cliente[];
  proyectos: Proyecto[];
  equipos: Equipo[];
  redirectTo?: string;
}) {
  const [state, action] = useActionState<FormState, FormData>(crearAsignacion, {
    error: null,
  });
  const [clienteId, setClienteId] = useState("");
  const fe = state.fieldErrors ?? {};
  const today = new Date().toISOString().slice(0, 10);

  // Selects dependientes: proyectos/equipos filtrados por el cliente elegido.
  const proyectosCliente = clienteId
    ? proyectos.filter(
        (p) => p.cliente_id === clienteId && p.estado === "activo",
      )
    : [];
  const equiposCliente = clienteId
    ? equipos.filter((e) => e.cliente_id === clienteId)
    : [];

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="persona_id" value={personaId} />
      {redirectTo && (
        <input type="hidden" name="redirect_to" value={redirectTo} />
      )}

      <FormGrid>
        <Field label="Cliente / Área" required error={fe.cliente_id}>
          <Select
            name="cliente_id"
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
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
        <Field label="Rol en el equipo">
          <Select name="rol_equipo" defaultValue="colaborador">
            {(
              Object.keys(ROL_EQUIPO_LABEL) as (keyof typeof ROL_EQUIPO_LABEL)[]
            ).map((r) => (
              <option key={r} value={r}>
                {ROL_EQUIPO_LABEL[r]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Proyecto (opcional)">
          <Select
            key={`proy-${clienteId}`}
            name="proyecto_id"
            defaultValue=""
            disabled={!clienteId}
          >
            <option value="">
              {!clienteId
                ? "Selecciona primero un cliente"
                : proyectosCliente.length
                  ? "— Ninguno —"
                  : "Sin proyectos activos"}
            </option>
            {proyectosCliente.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Equipo (opcional)">
          <Select
            key={`eq-${clienteId}`}
            name="equipo_id"
            defaultValue=""
            disabled={!clienteId}
          >
            <option value="">
              {!clienteId
                ? "Selecciona primero un cliente"
                : equiposCliente.length
                  ? "— Ninguno —"
                  : "Sin equipos"}
            </option>
            {equiposCliente.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Fecha de inicio" required error={fe.fecha_inicio}>
          <input
            type="date"
            name="fecha_inicio"
            defaultValue={today}
            className={DATE_CLS}
          />
        </Field>
      </FormGrid>

      <Button type="submit">Crear asignación</Button>
      <FormError message={state.error} />
    </form>
  );
}
