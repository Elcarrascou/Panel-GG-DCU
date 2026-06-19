"use client";

import { useActionState, useState } from "react";
import { crearAlerta, type FormState } from "@/lib/actions";
import {
  Field,
  FormGrid,
  TextInput,
  Select,
  Textarea,
  FormError,
} from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";
import {
  ALERTA_CATEGORIA_LABEL,
  ALERTA_TIPO_LABEL,
  type AlertaCategoria,
  type AlertaTipo,
} from "@/lib/types";

export interface AlertaFormOpciones {
  clientes: { id: string; nombre: string }[];
  proyectos: { id: string; nombre: string }[];
  personas: { id: string; nombre: string; apellido: string }[];
}

const TIPOS: AlertaTipo[] = ["critica", "importante", "seguimiento"];
const CATEGORIAS: AlertaCategoria[] = [
  "personas",
  "proyectos",
  "clientes",
  "contratos",
  "operacional",
];

export function CrearAlertaForm({ opciones }: { opciones: AlertaFormOpciones }) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState<FormState, FormData>(crearAlerta, {
    error: null,
  });
  const fe = state.fieldErrors ?? {};

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>+ Nueva alerta</Button>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink">Nueva alerta</h2>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs font-medium text-muted hover:text-ink"
        >
          Cancelar
        </button>
      </div>
      <form action={action} className="space-y-4">
        <Field label="Título" required error={fe.titulo}>
          <TextInput name="titulo" placeholder="Decisión o acción pendiente…" />
        </Field>
        <Field label="Descripción">
          <Textarea
            name="descripcion"
            placeholder="Contexto: qué hay que hacer y por qué importa…"
          />
        </Field>
        <FormGrid>
          <Field label="Tipo" required error={fe.tipo}>
            <Select name="tipo" defaultValue="critica">
              {TIPOS.map((t) => (
                <option key={t} value={t}>
                  {ALERTA_TIPO_LABEL[t]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Categoría">
            <Select name="categoria" defaultValue="">
              <option value="">Sin categoría</option>
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>
                  {ALERTA_CATEGORIA_LABEL[c]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Cliente / área relacionado">
            <Select name="cliente_id" defaultValue="">
              <option value="">—</option>
              {opciones.clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Proyecto relacionado">
            <Select name="proyecto_id" defaultValue="">
              <option value="">—</option>
              {opciones.proyectos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Persona relacionada">
            <Select name="persona_id" defaultValue="">
              <option value="">—</option>
              {opciones.personas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} {p.apellido}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Fecha límite">
            <TextInput type="date" name="fecha_limite" />
          </Field>
        </FormGrid>
        <div className="pt-1">
          <Button type="submit">Crear alerta</Button>
        </div>
        <FormError message={state.error} />
      </form>
    </div>
  );
}
