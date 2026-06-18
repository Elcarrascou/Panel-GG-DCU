import { crearAsignacion } from "@/lib/actions";
import { Field, FormGrid, Select } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";
import { semanaActual } from "@/lib/format";
import {
  ROL_EQUIPO_LABEL,
  type Cliente,
  type Equipo,
  type Proyecto,
} from "@/lib/types";

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
  const clienteNombre = new Map(clientes.map((c) => [c.id, c.nombre]));
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={crearAsignacion} className="space-y-4">
      <input type="hidden" name="persona_id" value={personaId} />
      {redirectTo && (
        <input type="hidden" name="redirect_to" value={redirectTo} />
      )}

      <FormGrid>
        <Field label="Cliente / Área" required>
          <Select name="cliente_id" required defaultValue="">
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
            {(Object.keys(ROL_EQUIPO_LABEL) as (keyof typeof ROL_EQUIPO_LABEL)[]).map(
              (r) => (
                <option key={r} value={r}>
                  {ROL_EQUIPO_LABEL[r]}
                </option>
              ),
            )}
          </Select>
        </Field>
        <Field label="Proyecto (opcional)">
          <Select name="proyecto_id" defaultValue="">
            <option value="">— Ninguno —</option>
            {proyectos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} · {clienteNombre.get(p.cliente_id) ?? ""}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Equipo (opcional)">
          <Select name="equipo_id" defaultValue="">
            <option value="">— Ninguno —</option>
            {equipos.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre} · {clienteNombre.get(e.cliente_id) ?? ""}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Fecha de inicio" required>
          <input
            type="date"
            name="fecha_inicio"
            defaultValue={today}
            required
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-[#6CD45A] focus:outline-none focus:ring-2 focus:ring-[#8EF67C]/40"
          />
        </Field>
      </FormGrid>

      <Button type="submit">Crear asignación</Button>
      <input type="hidden" name="_semana" value={semanaActual()} />
    </form>
  );
}
