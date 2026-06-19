"use client";

import { useActionState } from "react";
import { guardarProyecto, type FormState } from "@/lib/actions";
import {
  Field,
  FormGrid,
  TextInput,
  Select,
  Textarea,
  FormError,
} from "@/components/ui/Form";
import { Button, ButtonLink } from "@/components/ui/Button";
import {
  PROYECTO_ESTADO_LABEL,
  type Cliente,
  type Proyecto,
} from "@/lib/types";

const DATE_CLS =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/40";

export function ProyectoForm({
  proyecto,
  clientes,
  clienteIdDefault,
}: {
  proyecto?: Proyecto;
  clientes: Cliente[];
  clienteIdDefault?: string;
}) {
  const [state, action] = useActionState<FormState, FormData>(guardarProyecto, {
    error: null,
  });
  const fe = state.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-5">
      {proyecto && <input type="hidden" name="id" value={proyecto.id} />}
      <FormGrid>
        <Field label="Nombre" required error={fe.nombre}>
          <TextInput name="nombre" defaultValue={proyecto?.nombre ?? ""} />
        </Field>
        <Field label="Cliente / Área" required error={fe.cliente_id}>
          <Select
            name="cliente_id"
            defaultValue={proyecto?.cliente_id ?? clienteIdDefault ?? ""}
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
        <Field label="Estado" required error={fe.estado}>
          <Select name="estado" defaultValue={proyecto?.estado ?? "activo"}>
            {(
              Object.keys(
                PROYECTO_ESTADO_LABEL,
              ) as (keyof typeof PROYECTO_ESTADO_LABEL)[]
            ).map((e) => (
              <option key={e} value={e}>
                {PROYECTO_ESTADO_LABEL[e]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Fecha de inicio">
          <input
            type="date"
            name="fecha_inicio"
            defaultValue={proyecto?.fecha_inicio ?? ""}
            className={DATE_CLS}
          />
        </Field>
        <Field label="Fecha de fin" error={fe.fecha_fin}>
          <input
            type="date"
            name="fecha_fin"
            defaultValue={proyecto?.fecha_fin ?? ""}
            className={DATE_CLS}
          />
        </Field>
      </FormGrid>
      <Field label="Descripción">
        <Textarea
          name="descripcion"
          defaultValue={proyecto?.descripcion ?? ""}
        />
      </Field>
      <div className="flex items-center gap-3 pt-2">
        <Button type="submit">
          {proyecto ? "Guardar cambios" : "Crear proyecto"}
        </Button>
        <ButtonLink
          href={proyecto ? `/proyectos/${proyecto.id}` : "/proyectos"}
          variant="ghost"
        >
          Cancelar
        </ButtonLink>
      </div>
      <FormError message={state.error} />
    </form>
  );
}
