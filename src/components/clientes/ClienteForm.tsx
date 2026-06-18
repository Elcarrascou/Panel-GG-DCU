import { guardarCliente } from "@/lib/actions";
import { Field, FormGrid, TextInput, Select, Textarea } from "@/components/ui/Form";
import { Button, ButtonLink } from "@/components/ui/Button";
import {
  CLIENTE_ESTADO_LABEL,
  CLIENTE_TIPO_LABEL,
  type Cliente,
} from "@/lib/types";

export function ClienteForm({ cliente }: { cliente?: Cliente }) {
  return (
    <form action={guardarCliente} className="space-y-5">
      {cliente && <input type="hidden" name="id" value={cliente.id} />}
      <FormGrid>
        <Field label="Nombre" required>
          <TextInput name="nombre" defaultValue={cliente?.nombre ?? ""} required />
        </Field>
        <Field label="Tipo" required>
          <Select name="tipo" defaultValue={cliente?.tipo ?? "externo"}>
            <option value="externo">{CLIENTE_TIPO_LABEL.externo}</option>
            <option value="interno">{CLIENTE_TIPO_LABEL.interno}</option>
          </Select>
        </Field>
        <Field label="Estado" required>
          <Select name="estado" defaultValue={cliente?.estado ?? "activo"}>
            <option value="activo">{CLIENTE_ESTADO_LABEL.activo}</option>
            <option value="inactivo">{CLIENTE_ESTADO_LABEL.inactivo}</option>
          </Select>
        </Field>
      </FormGrid>
      <Field label="Descripción">
        <Textarea name="descripcion" defaultValue={cliente?.descripcion ?? ""} />
      </Field>
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
    </form>
  );
}
