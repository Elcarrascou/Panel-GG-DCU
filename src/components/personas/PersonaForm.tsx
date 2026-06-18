import { guardarPersona } from "@/lib/actions";
import { Field, FormGrid, TextInput, Select } from "@/components/ui/Form";
import { Button, ButtonLink } from "@/components/ui/Button";
import { TIPO_CONTRATO_LABEL, type Persona } from "@/lib/types";

export function PersonaForm({ persona }: { persona?: Persona }) {
  return (
    <form action={guardarPersona} className="space-y-5">
      {persona && <input type="hidden" name="id" value={persona.id} />}

      <FormGrid>
        <Field label="Nombre" required>
          <TextInput name="nombre" defaultValue={persona?.nombre ?? ""} required />
        </Field>
        <Field label="Apellido" required>
          <TextInput
            name="apellido"
            defaultValue={persona?.apellido ?? ""}
            required
          />
        </Field>
        <Field label="Segundo apellido">
          <TextInput
            name="segundo_apellido"
            defaultValue={persona?.segundo_apellido ?? ""}
          />
        </Field>
        <Field label="RUT" required hint="Formato 12.345.678-9 (único)">
          <TextInput name="rut" defaultValue={persona?.rut ?? ""} required />
        </Field>
        <Field label="Cargo">
          <TextInput name="cargo" defaultValue={persona?.cargo ?? ""} />
        </Field>
        <Field
          label="Tipo de contrato"
          required
          hint="Quién financia a la persona"
        >
          <Select
            name="tipo_contrato"
            defaultValue={persona?.tipo_contrato ?? "cliente"}
          >
            <option value="cliente">{TIPO_CONTRATO_LABEL.cliente}</option>
            <option value="interno">{TIPO_CONTRATO_LABEL.interno}</option>
          </Select>
        </Field>
      </FormGrid>

      {persona && (
        <Field label="Estado">
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              name="activo"
              defaultChecked={persona.activo}
              className="h-4 w-4 accent-[#6CD45A]"
            />
            Persona activa
          </label>
        </Field>
      )}

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit">
          {persona ? "Guardar cambios" : "Crear persona"}
        </Button>
        <ButtonLink
          href={persona ? `/personas/${persona.id}` : "/personas"}
          variant="ghost"
        >
          Cancelar
        </ButtonLink>
      </div>
    </form>
  );
}
