"use client";

import { useActionState } from "react";
import { crearAsignacion, type FormState } from "@/lib/actions";
import { Field, Select, FormError } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";
import { nombreCompleto } from "@/lib/format";
import { ROL_EQUIPO_LABEL, type Equipo, type Persona } from "@/lib/types";

export function EquipoMiembroForm({
  equipo,
  personas,
}: {
  equipo: Equipo;
  personas: Persona[];
}) {
  const [state, action] = useActionState<FormState, FormData>(crearAsignacion, {
    error: null,
  });
  const fe = state.fieldErrors ?? {};

  return (
    <div className="space-y-2">
      <form action={action} className="flex flex-wrap items-end gap-3">
        <input type="hidden" name="equipo_id" value={equipo.id} />
        <input type="hidden" name="cliente_id" value={equipo.cliente_id} />
        {equipo.proyecto_id && (
          <input type="hidden" name="proyecto_id" value={equipo.proyecto_id} />
        )}
        <input
          type="hidden"
          name="redirect_to"
          value={`/equipos/${equipo.id}`}
        />

        <div className="min-w-56 flex-1">
          <Field label="Persona" required error={fe.persona_id}>
            <Select name="persona_id" defaultValue="">
              <option value="" disabled>
                Selecciona…
              </option>
              {personas.map((p) => (
                <option key={p.id} value={p.id}>
                  {nombreCompleto(p)}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="w-44">
          <Field label="Rol">
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
        </div>
        <Button type="submit">Agregar</Button>
      </form>
      <FormError message={state.error} />
    </div>
  );
}
