"use client";

import { useActionState, useState } from "react";
import { moverPersona, type FormState } from "@/lib/actions";
import { Field, FormGrid, Select, FormError } from "@/components/ui/Form";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ROL_EQUIPO_LABEL, type Cliente, type Proyecto } from "@/lib/types";

const DATE_CLS =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/40";

export function MoverPersonaForm({
  personaId,
  asignacionId,
  clienteActualNombre,
  fechaInicioActual,
  clientes,
  proyectos,
}: {
  personaId: string;
  asignacionId: string;
  clienteActualNombre: string;
  fechaInicioActual: string;
  clientes: Cliente[];
  proyectos: Proyecto[];
}) {
  const [state, action] = useActionState<FormState, FormData>(moverPersona, {
    error: null,
  });
  const [clienteId, setClienteId] = useState("");
  const fe = state.fieldErrors ?? {};
  const today = new Date().toISOString().slice(0, 10);

  const proyectosCliente = clienteId
    ? proyectos.filter(
        (p) => p.cliente_id === clienteId && p.estado === "activo",
      )
    : [];
  const destino = clientes.find((c) => c.id === clienteId)?.nombre;

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="asignacion_id" value={asignacionId} />
      <input type="hidden" name="persona_id" value={personaId} />
      <input
        type="hidden"
        name="fecha_inicio_actual"
        value={fechaInicioActual}
      />

      <FormGrid>
        <Field label="Cliente / Área destino" required error={fe.cliente_id}>
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
        <Field
          label="Fecha de inicio (nueva asignación)"
          required
          error={fe.fecha_inicio}
        >
          <input
            type="date"
            name="fecha_inicio"
            defaultValue={today}
            className={DATE_CLS}
          />
        </Field>
      </FormGrid>

      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Se cerrará la asignación con <b>{clienteActualNombre}</b>
        {destino ? (
          <>
            {" "}
            y se creará una nueva con <b>{destino}</b>.
          </>
        ) : (
          " y se creará una nueva con el cliente destino."
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit">Confirmar movimiento</Button>
        <ButtonLink href={`/personas/${personaId}`} variant="ghost">
          Cancelar
        </ButtonLink>
      </div>
      <FormError message={state.error} />
    </form>
  );
}
