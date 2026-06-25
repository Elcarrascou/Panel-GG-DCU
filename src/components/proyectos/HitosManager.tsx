"use client";

import { useActionState, useState } from "react";
import {
  guardarHito,
  eliminarHito,
  type FormState,
} from "@/lib/actions";
import {
  Field,
  FormGrid,
  TextInput,
  Textarea,
  Select,
  FormError,
} from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";
import { fechaCorta } from "@/lib/format";
import {
  HITO_ESTADO_COLOR,
  HITO_ESTADO_LABEL,
  type HitoEstado,
} from "@/lib/types";
import type { HitoConEstado } from "@/lib/data";

const DATE_CLS =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/40";

// Semáforo visual del estado del hito.
function Semaforo({ estado }: { estado: HitoEstado }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{
        backgroundColor: `${HITO_ESTADO_COLOR[estado]}22`,
        color: HITO_ESTADO_COLOR[estado],
      }}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: HITO_ESTADO_COLOR[estado] }}
      />
      {HITO_ESTADO_LABEL[estado]}
    </span>
  );
}

type FormTarget = { mode: "new" } | { mode: "edit"; hito: HitoConEstado };

export function HitosManager({
  proyectoId,
  hitos,
  admin,
}: {
  proyectoId: string;
  hitos: HitoConEstado[];
  admin: boolean;
}) {
  const [form, setForm] = useState<FormTarget | null>(null);

  return (
    <div>
      {/* Panel de formulario (crear / editar) */}
      {admin && form && (
        <div className="border-b border-border bg-gray-50/60 px-5 py-4">
          <HitoForm
            key={form.mode === "edit" ? form.hito.id : "new"}
            proyectoId={proyectoId}
            hito={form.mode === "edit" ? form.hito : undefined}
            onClose={() => setForm(null)}
          />
        </div>
      )}

      {hitos.length === 0 ? (
        <p className="px-5 py-4 text-sm text-muted">
          Sin hitos registrados para este proyecto.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="border-b border-border bg-gray-50/80 text-left text-xs font-semibold uppercase tracking-wide text-muted">
              <tr>
                <th className="px-5 py-3 font-semibold">Hito</th>
                <th className="px-4 py-3 font-semibold">Planificada</th>
                <th className="px-4 py-3 font-semibold">Real</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                {admin && <th className="px-4 py-3 font-semibold text-right">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {hitos.map((h) => (
                <tr key={h.id} className="hover:bg-gray-50/60">
                  <td className="px-5 py-3 align-top">
                    <p className="font-medium text-ink">{h.titulo}</p>
                    {h.descripcion && (
                      <p className="mt-0.5 text-xs text-muted">{h.descripcion}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top text-muted">
                    {fechaCorta(h.fecha_planificada)}
                  </td>
                  <td className="px-4 py-3 align-top text-muted">
                    {h.fecha_real ? fechaCorta(h.fecha_real) : "—"}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <Semaforo estado={h.estadoEfectivo} />
                  </td>
                  {admin && (
                    <td className="px-4 py-3 align-top">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setForm({ mode: "edit", hito: h })}
                          className="text-xs font-medium text-green-ink hover:underline"
                        >
                          Editar
                        </button>
                        <form
                          action={eliminarHito}
                          onSubmit={(e) => {
                            if (!confirm(`¿Eliminar el hito "${h.titulo}"?`))
                              e.preventDefault();
                          }}
                        >
                          <input type="hidden" name="id" value={h.id} />
                          <input
                            type="hidden"
                            name="proyecto_id"
                            value={proyectoId}
                          />
                          <button
                            type="submit"
                            className="text-xs font-medium text-red-600 hover:underline"
                          >
                            Eliminar
                          </button>
                        </form>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {admin && !form && (
        <div className="px-5 py-3">
          <Button onClick={() => setForm({ mode: "new" })} variant="ghost">
            + Agregar hito
          </Button>
        </div>
      )}
    </div>
  );
}

function HitoForm({
  proyectoId,
  hito,
  onClose,
}: {
  proyectoId: string;
  hito?: HitoConEstado;
  onClose: () => void;
}) {
  const [state, action] = useActionState<FormState, FormData>(guardarHito, {
    error: null,
  });
  const fe = state.fieldErrors ?? {};
  // 'atrasado' es derivado, nunca se selecciona manualmente.
  const estadoDefault =
    hito?.estado === "atrasado" ? "pendiente" : (hito?.estado ?? "pendiente");

  return (
    <form action={action} className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink">
          {hito ? "Editar hito" : "Nuevo hito"}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-medium text-muted hover:text-ink"
        >
          Cancelar
        </button>
      </div>

      {hito && <input type="hidden" name="id" value={hito.id} />}
      <input type="hidden" name="proyecto_id" value={proyectoId} />

      <Field label="Título" required error={fe.titulo}>
        <TextInput
          name="titulo"
          defaultValue={hito?.titulo ?? ""}
          placeholder="Ej: Salida a producción Fase 1"
        />
      </Field>
      <Field label="Descripción">
        <Textarea
          name="descripcion"
          defaultValue={hito?.descripcion ?? ""}
          placeholder="Detalle del hito (opcional)…"
        />
      </Field>
      <FormGrid>
        <Field
          label="Fecha planificada"
          required
          error={fe.fecha_planificada}
        >
          <input
            type="date"
            name="fecha_planificada"
            defaultValue={hito?.fecha_planificada ?? ""}
            className={DATE_CLS}
          />
        </Field>
        <Field label="Fecha real" hint="Se completa cuando el hito se cumple">
          <input
            type="date"
            name="fecha_real"
            defaultValue={hito?.fecha_real ?? ""}
            className={DATE_CLS}
          />
        </Field>
        <Field label="Estado">
          <Select name="estado" defaultValue={estadoDefault}>
            <option value="pendiente">Pendiente</option>
            <option value="cumplido">Cumplido</option>
            <option value="cancelado">Cancelado</option>
          </Select>
        </Field>
      </FormGrid>
      <div className="flex items-center gap-3 pt-1">
        <Button type="submit">{hito ? "Guardar cambios" : "Agregar hito"}</Button>
      </div>
      <FormError message={state.error} />
    </form>
  );
}
