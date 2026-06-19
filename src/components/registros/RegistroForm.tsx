"use client";

import { useActionState } from "react";
import { guardarRegistro, type FormState } from "@/lib/actions";
import { Field, FormGrid, Select, Textarea, FormError } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";
import { nombreCompleto, rangoSemana, semanaActual } from "@/lib/format";
import {
  CARGA_LABEL,
  CARGA_ORDEN,
  TIPO_TRABAJO_LABEL,
  type Persona,
  type RegistroSemanal,
} from "@/lib/types";

const DATE_CLS =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/40";

export function RegistroForm({
  personaId,
  personas,
  registro,
  semana,
  redirectTo,
  compact = false,
  lockPersona = false,
  lockSemana = false,
}: {
  personaId?: string;
  personas?: Persona[];
  registro?: RegistroSemanal | null;
  semana?: string;
  redirectTo?: string;
  compact?: boolean;
  lockPersona?: boolean;
  lockSemana?: boolean;
}) {
  const [state, action] = useActionState<FormState, FormData>(guardarRegistro, {
    error: null,
  });
  const fe = state.fieldErrors ?? {};
  const semanaDefault = registro?.semana ?? semana ?? semanaActual();
  const personaBloqueada =
    lockPersona && personaId
      ? personas?.find((p) => p.id === personaId) ?? null
      : null;

  return (
    <form action={action} className="space-y-4">
      {redirectTo && (
        <input type="hidden" name="redirect_to" value={redirectTo} />
      )}

      {personas && !lockPersona ? (
        <Field label="Persona" required error={fe.persona_id}>
          <Select name="persona_id" defaultValue={personaId ?? ""}>
            <option value="" disabled>
              Selecciona una persona…
            </option>
            {personas.map((p) => (
              <option key={p.id} value={p.id}>
                {nombreCompleto(p)}
              </option>
            ))}
          </Select>
        </Field>
      ) : (
        <>
          <input type="hidden" name="persona_id" value={personaId} />
          {personaBloqueada && (
            <Field label="Persona">
              <div className="rounded-lg border border-border bg-gray-50 px-3 py-2 text-sm font-medium text-ink">
                {nombreCompleto(personaBloqueada)}
              </div>
            </Field>
          )}
        </>
      )}

      <FormGrid>
        <Field label="Semana (lunes)" required hint="Lunes de la semana" error={fe.semana}>
          {lockSemana ? (
            <>
              <input type="hidden" name="semana" value={semanaDefault} />
              <div className="rounded-lg border border-border bg-gray-50 px-3 py-2 text-sm text-ink">
                {rangoSemana(semanaDefault)}
              </div>
            </>
          ) : (
            <input
              type="date"
              name="semana"
              defaultValue={semanaDefault}
              className={DATE_CLS}
            />
          )}
        </Field>
        <Field label="Carga de trabajo">
          <Select
            name="carga_trabajo"
            defaultValue={registro?.carga_trabajo ?? ""}
          >
            <option value="">— Sin definir —</option>
            {CARGA_ORDEN.map((c) => (
              <option key={c} value={c}>
                {CARGA_LABEL[c]}
              </option>
            ))}
          </Select>
        </Field>
      </FormGrid>

      <Field label="Tipo de trabajo">
        <Select name="tipo_trabajo" defaultValue={registro?.tipo_trabajo ?? ""}>
          <option value="">— Sin definir —</option>
          {(
            Object.keys(TIPO_TRABAJO_LABEL) as (keyof typeof TIPO_TRABAJO_LABEL)[]
          ).map((t) => (
            <option key={t} value={t}>
              {TIPO_TRABAJO_LABEL[t]}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Resumen de la semana">
        <Textarea
          name="resumen"
          defaultValue={registro?.resumen ?? ""}
          placeholder="¿Qué hizo esta semana? Si trabajó en varios proyectos, menciónalos."
        />
      </Field>

      {!compact && (
        <Field label="Hitos">
          <Textarea
            name="hitos"
            defaultValue={registro?.hitos ?? ""}
            placeholder="Hitos relevantes (deploys, cierres, entregas)…"
            className="min-h-16"
          />
        </Field>
      )}
      {compact && (
        <input type="hidden" name="hitos" defaultValue={registro?.hitos ?? ""} />
      )}

      <Button type="submit">
        {registro ? "Actualizar registro" : "Guardar registro"}
      </Button>
      <FormError message={state.error} />
    </form>
  );
}
