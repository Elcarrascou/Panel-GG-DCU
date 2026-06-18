import { guardarEquipo } from "@/lib/actions";
import { Field, FormGrid, TextInput, Select } from "@/components/ui/Form";
import { Button, ButtonLink } from "@/components/ui/Button";
import type { Cliente, Equipo, Proyecto } from "@/lib/types";

export function EquipoForm({
  equipo,
  clientes,
  proyectos,
}: {
  equipo?: Equipo;
  clientes: Cliente[];
  proyectos: Proyecto[];
}) {
  const clienteNombre = new Map(clientes.map((c) => [c.id, c.nombre]));
  return (
    <form action={guardarEquipo} className="space-y-5">
      {equipo && <input type="hidden" name="id" value={equipo.id} />}
      <FormGrid>
        <Field label="Nombre" required>
          <TextInput name="nombre" defaultValue={equipo?.nombre ?? ""} required />
        </Field>
        <Field label="Cliente / Área" required>
          <Select
            name="cliente_id"
            required
            defaultValue={equipo?.cliente_id ?? ""}
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
        <Field label="Proyecto (opcional)" hint="Un equipo puede ser a nivel cliente o proyecto">
          <Select name="proyecto_id" defaultValue={equipo?.proyecto_id ?? ""}>
            <option value="">— A nivel cliente —</option>
            {proyectos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} · {clienteNombre.get(p.cliente_id) ?? ""}
              </option>
            ))}
          </Select>
        </Field>
      </FormGrid>
      <div className="flex items-center gap-3 pt-2">
        <Button type="submit">
          {equipo ? "Guardar cambios" : "Crear equipo"}
        </Button>
        <ButtonLink
          href={equipo ? `/equipos/${equipo.id}` : "/equipos"}
          variant="ghost"
        >
          Cancelar
        </ButtonLink>
      </div>
    </form>
  );
}
