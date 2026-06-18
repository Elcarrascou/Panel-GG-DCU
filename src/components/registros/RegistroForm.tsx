import { guardarRegistro } from "@/lib/actions";
import { Field, FormGrid, Select, Textarea } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";
import { nombreCompleto, semanaActual } from "@/lib/format";
import {
  CARGA_LABEL,
  CARGA_ORDEN,
  TIPO_TRABAJO_LABEL,
  type Persona,
  type RegistroSemanal,
} from "@/lib/types";

export function RegistroForm({
  personaId,
  personas,
  registro,
  semana,
  redirectTo,
  compact = false,
}: {
  personaId?: string;
  personas?: Persona[];
  registro?: RegistroSemanal | null;
  semana?: string;
  redirectTo?: string;
  compact?: boolean;
}) {
  const semanaDefault = registro?.semana ?? semana ?? semanaActual();

  return (
    <form action={guardarRegistro} className="space-y-4">
      {redirectTo && (
        <input type="hidden" name="redirect_to" value={redirectTo} />
      )}

      {personas ? (
        <Field label="Persona" required>
          <Select name="persona_id" defaultValue={personaId ?? ""} required>
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
        <input type="hidden" name="persona_id" value={personaId} />
      )}

      <FormGrid>
        <Field label="Semana (lunes)" required hint="Lunes de la semana">
          <input
            type="date"
            name="semana"
            defaultValue={semanaDefault}
            required
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-[#6CD45A] focus:outline-none focus:ring-2 focus:ring-[#8EF67C]/40"
          />
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
    </form>
  );
}
