"use client";

import { useActionState } from "react";
import { guardarCliente, type FormState } from "@/lib/actions";
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
  CLIENTE_ESTADO_LABEL,
  CLIENTE_TIPO_LABEL,
  type Cliente,
} from "@/lib/types";

export function ClienteForm({ cliente }: { cliente?: Cliente }) {
  const [state, action] = useActionState<FormState, FormData>(guardarCliente, {
    error: null,
  });
  const fe = state.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-5">
      {cliente && <input type="hidden" name="id" value={cliente.id} />}
      <FormGrid>
        <Field label="Nombre" required error={fe.nombre}>
          <TextInput name="nombre" defaultValue={cliente?.nombre ?? ""} />
        </Field>
        <Field label="Tipo" required error={fe.tipo}>
          <Select name="tipo" defaultValue={cliente?.tipo ?? "externo"}>
            <option value="externo">{CLIENTE_TIPO_LABEL.externo}</option>
            <option value="interno">{CLIENTE_TIPO_LABEL.interno}</option>
          </Select>
        </Field>
        <Field label="Estado" required error={fe.estado}>
          <Select name="estado" defaultValue={cliente?.estado ?? "activo"}>
            <option value="activo">{CLIENTE_ESTADO_LABEL.activo}</option>
            <option value="inactivo">{CLIENTE_ESTADO_LABEL.inactivo}</option>
          </Select>
        </Field>
      </FormGrid>
      <Field label="Descripción">
        <Textarea name="descripcion" defaultValue={cliente?.descripcion ?? ""} />
      </Field>

      <div className="space-y-5 border-t border-border pt-5">
        <div>
          <h3 className="text-sm font-semibold text-ink">Contexto estratégico</h3>
          <p className="mt-0.5 text-xs text-muted">
            Información ejecutiva que consume el Gerente General. Todos los campos
            son opcionales — los vacíos no se muestran en la ficha.
          </p>
        </div>
        <Field label="Contexto actual">
          <Textarea
            name="contexto_actual"
            defaultValue={cliente?.contexto_actual ?? ""}
            placeholder="Qué está pasando hoy con este cliente, en qué fase del proyecto estamos…"
          />
        </Field>
        <Field label="Últimos eventos relevantes">
          <Textarea
            name="ultimos_eventos"
            defaultValue={cliente?.ultimos_eventos ?? ""}
            placeholder="Hitos recientes, cambios importantes, situaciones a considerar…"
          />
        </Field>
        <Field label="Próximos pasos">
          <Textarea
            name="proximos_pasos"
            defaultValue={cliente?.proximos_pasos ?? ""}
            placeholder="Acciones concretas, reuniones pendientes, qué hay que hacer…"
          />
        </Field>
        <Field label="Proyectos futuros / propuestas">
          <Textarea
            name="proyectos_futuros"
            defaultValue={cliente?.proyectos_futuros ?? ""}
            placeholder="Propuestas u oportunidades de negocio identificadas…"
          />
        </Field>
        <Field label="Contactos del cliente">
          <Textarea
            name="contactos_cliente"
            defaultValue={cliente?.contactos_cliente ?? ""}
            placeholder="Contrapartes en el cliente: nombre, cargo, rol en la relación…"
          />
        </Field>
        <Field label="Notas estratégicas">
          <Textarea
            name="notas_estrategicas"
            defaultValue={cliente?.notas_estrategicas ?? ""}
            placeholder="Información sensible o relevante para la gestión ejecutiva (uso interno)…"
          />
        </Field>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit">
          {cliente ? "Guardar cambios" : "Crear cliente"}
        </Button>
        <ButtonLink
          href={cliente ? `/clientes/${cliente.id}` : "/clientes"}
          variant="ghost"
        >
          Cancelar
        </ButtonLink>
      </div>
      <FormError message={state.error} />
    </form>
  );
}
