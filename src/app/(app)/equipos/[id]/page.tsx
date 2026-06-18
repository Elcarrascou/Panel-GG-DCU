import { notFound } from "next/navigation";
import Link from "next/link";
import { getEquipoDetalle, getOpciones } from "@/lib/data";
import { isAdmin } from "@/lib/auth";
import { cerrarAsignacion } from "@/lib/actions";
import { nombreCompleto, iniciales } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { RolBadge } from "@/components/ui/Badges";
import { EquipoMiembroForm } from "@/components/equipos/EquipoMiembroForm";

export const dynamic = "force-dynamic";

export default async function EquipoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [data, admin] = await Promise.all([getEquipoDetalle(id), isAdmin()]);
  if (!data) notFound();

  const { equipo, cliente, proyecto, miembros } = data;
  const opciones = admin ? await getOpciones() : null;
  const tieneJefe = miembros.some((m) => m.asignacion.rol_equipo === "jefe");

  return (
    <div>
      <PageHeader
        title={equipo.nombre}
        back={{ href: "/equipos", label: "Equipos" }}
        subtitle={
          <>
            {cliente && (
              <Link href={`/clientes/${cliente.id}`} className="hover:underline">
                {cliente.nombre}
              </Link>
            )}
            {proyecto && (
              <>
                {" · "}
                <Link
                  href={`/proyectos/${proyecto.id}`}
                  className="hover:underline"
                >
                  {proyecto.nombre}
                </Link>
              </>
            )}
          </>
        }
        action={
          admin && (
            <ButtonLink href={`/equipos/${id}/editar`} variant="ghost">
              Editar
            </ButtonLink>
          )
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <Badge tone="outline">{miembros.length} miembro(s)</Badge>
        {!tieneJefe && miembros.length > 0 && (
          <Badge tone="amber">Sin jefe asignado</Badge>
        )}
      </div>

      <Card>
        <CardHeader title="Miembros" />
        <CardBody className="p-0">
          {miembros.length === 0 ? (
            <p className="px-5 py-4 text-sm text-muted">
              Este equipo aún no tiene miembros.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {miembros.map((m) =>
                m.persona ? (
                  <li
                    key={m.asignacion.id}
                    className="flex items-center justify-between px-5 py-3"
                  >
                    <Link
                      href={`/personas/${m.persona.id}`}
                      className="flex items-center gap-3"
                    >
                      <Avatar iniciales={iniciales(m.persona)} size={32} />
                      <span className="text-sm font-medium text-ink">
                        {nombreCompleto(m.persona)}
                      </span>
                    </Link>
                    <div className="flex items-center gap-3">
                      <RolBadge rol={m.asignacion.rol_equipo} />
                      {admin && (
                        <form action={cerrarAsignacion}>
                          <input type="hidden" name="id" value={m.asignacion.id} />
                          <input
                            type="hidden"
                            name="redirect_to"
                            value={`/equipos/${id}`}
                          />
                          <button className="text-xs font-medium text-red-600 hover:underline">
                            Quitar
                          </button>
                        </form>
                      )}
                    </div>
                  </li>
                ) : null,
              )}
            </ul>
          )}
        </CardBody>
      </Card>

      {admin && opciones && (
        <Card className="mt-6">
          <CardHeader
            title="Agregar miembro"
            subtitle="Crea una asignación a este equipo"
          />
          <CardBody>
            <EquipoMiembroForm equipo={equipo} personas={opciones.personas} />
          </CardBody>
        </Card>
      )}
    </div>
  );
}
