import { getPersonasConEstado } from "@/lib/data";
import { isAdmin } from "@/lib/auth";
import { nombreCompleto, iniciales } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import {
  PersonasTable,
  type PersonaRow,
} from "@/components/personas/PersonasTable";

export const dynamic = "force-dynamic";

export default async function PersonasPage() {
  const [estados, admin] = await Promise.all([
    getPersonasConEstado(),
    isAdmin(),
  ]);

  const rows: PersonaRow[] = estados.map((e) => {
    const reg = e.registroSemana ?? e.ultimoRegistro;
    return {
      id: e.persona.id,
      nombre: nombreCompleto(e.persona),
      iniciales: iniciales(e.persona),
      rut: e.persona.rut,
      cargo: e.persona.cargo,
      activo: e.persona.activo,
      clientes: Array.from(
        new Set(
          e.activas
            .map((a) => a.cliente?.nombre)
            .filter((x): x is string => Boolean(x)),
        ),
      ),
      carga: reg?.carga_trabajo ?? null,
      cargaEsActual: Boolean(e.registroSemana?.carga_trabajo),
      sinAsignacion: e.activas.length === 0,
    };
  });

  const clientes = Array.from(
    new Set(rows.flatMap((r) => r.clientes)),
  ).sort();

  return (
    <div>
      <PageHeader
        title="Personas"
        subtitle="Dotación, asignaciones y carga de trabajo"
        action={
          admin && (
            <ButtonLink href="/personas/nueva">+ Nueva persona</ButtonLink>
          )
        }
      />
      <PersonasTable rows={rows} clientes={clientes} />
    </div>
  );
}
