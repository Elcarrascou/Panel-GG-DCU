import { guardarProyecto } from "@/lib/actions";
import {
  Field,
  FormGrid,
  TextInput,
  Select,
  Textarea,
} from "@/components/ui/Form";
import { Button, ButtonLink } from "@/components/ui/Button";
import {
  PROYECTO_ESTADO_LABEL,
  type Cliente,
  type Proyecto,
} from "@/lib/types";

export function ProyectoForm({
  proyecto,
  clientes,
  clienteIdDefault,
}: {
  proyecto?: Proyecto;
  clientes: Cliente[];
  clienteIdDefault?: string;
}) {
  return (
    <form action={guardarProyecto} className="space-y-5">
      {proyecto && <input type="hidden" name="id" value={proyecto.id} />}
      <FormGrid>
        <Field label="Nombre" required>
          <TextInput
            name="nombre"
            defaultValue={proyecto?.nombre ?? ""}
            required
          />
        </Field>
        <Field label="Cliente / Área" required>
          <Select
            name="cliente_id"
            required
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
        <Field label="Estado" required>
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
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-[#6CD45A] focus:outline-none focus:ring-2 focus:ring-[#8EF67C]/40"
          />
        </Field>
        <Field label="Fecha de fin">
          <input
            type="date"
            name="fecha_fin"
            defaultValue={proyecto?.fecha_fin ?? ""}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-[#6CD45A] focus:outline-none focus:ring-2 focus:ring-[#8EF67C]/40"
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
    </form>
  );
}
