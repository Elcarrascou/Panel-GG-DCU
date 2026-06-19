import { notFound } from "next/navigation";
import Link from "next/link";
import { getClienteDetalle } from "@/lib/data";
import { isAdmin } from "@/lib/auth";
import { nombreCompleto, iniciales } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { CargaBadge } from "@/components/ui/CargaBadge";
import {
  ClienteEstadoBadge,
  ProyectoEstadoBadge,
  RolBadge,
} from "@/components/ui/Badges";
import { CargaBar } from "@/components/charts/CargaBar";
import { ContextoEstrategico } from "@/components/clientes/ContextoEstrategico";
import { CLIENTE_TIPO_LABEL, type CargaTrabajo } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ClienteDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [data, admin] = await Promise.all([getClienteDetalle(id), isAdmin()]);
  if (!data) notFound();

  const { cliente, proyectos, equipos, personasAsignadas } = data;

  // Distribución de carga del equipo
  const counts: Partial<Record<CargaTrabajo, number>> = {};
  let sinRegistro = 0;
  for (const pa of personasAsignadas) {
    const carga = (pa.registroSemana ?? pa.ultimoRegistro)?.carga_trabajo;
    if (carga) counts[carga] = (counts[carga] ?? 0) + 1;
    else sinRegistro++;
  }

  return (
    <div>
      <PageHeader
        title={cliente.nombre}
        back={{ href: "/clientes", label: "Clientes" }}
        subtitle={CLIENTE_TIPO_LABEL[cliente.tipo]}
        action={
          admin && (
            <ButtonLink href={`/clientes/${id}/editar`} variant="ghost">
              Editar
            </ButtonLink>
          )
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <ClienteEstadoBadge estado={cliente.estado} />
        <Badge tone="outline">{personasAsignadas.length} persona(s)</Badge>
        <Badge tone="outline">{proyectos.length} proyecto(s)</Badge>
      </div>

      {cliente.descripcion && (
        <Card className="mb-6">
          <CardBody>
            <p className="text-sm text-muted">{cliente.descripcion}</p>
          </CardBody>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Carga del equipo" subtitle="Semana en curso" />
          <CardBody>
            <CargaBar counts={counts} sinRegistro={sinRegistro} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Proyectos"
            subtitle={`${proyectos.length} en total`}
            action={
              admin && (
                <ButtonLink
                  href={`/proyectos/nuevo?cliente=${id}`}
                  variant="ghost"
                  className="!px-2.5 !py-1 text-xs"
                >
                  + Proyecto
                </ButtonLink>
              )
            }
          />
          <CardBody className="p-0">
            {proyectos.length === 0 ? (
              <p className="px-5 py-4 text-sm text-muted">Sin proyectos.</p>
            ) : (
              <ul className="divide-y divide-border">
                {proyectos.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between px-5 py-3"
                  >
                    <Link
                      href={`/proyectos/${p.id}`}
                      className="text-sm font-medium text-ink hover:underline"
                    >
                      {p.nombre}
                    </Link>
                    <ProyectoEstadoBadge estado={p.estado} />
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader
          title="Personas asignadas"
          subtitle={`${personasAsignadas.length} con asignación activa`}
        />
        <CardBody className="p-0">
          {personasAsignadas.length === 0 ? (
            <p className="px-5 py-4 text-sm text-muted">
              Sin personas asignadas.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {personasAsignadas.map((pa) =>
                pa.persona ? (
                  <li key={pa.asignacion.id} className="px-5 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <Link
                        href={`/personas/${pa.persona.id}`}
                        className="flex items-center gap-3"
                      >
                        <Avatar iniciales={iniciales(pa.persona)} size={32} />
                        <span>
                          <span className="block text-sm font-medium text-ink">
                            {nombreCompleto(pa.persona)}
                          </span>
                          <span className="block text-xs text-muted">
                            {pa.persona.cargo ?? pa.persona.rut}
                          </span>
                        </span>
                      </Link>
                      <div className="flex items-center gap-2">
                        <CargaBadge
                          carga={
                            (pa.registroSemana ?? pa.ultimoRegistro)
                              ?.carga_trabajo ?? null
                          }
                        />
                        <RolBadge rol={pa.asignacion.rol_equipo} />
                      </div>
                    </div>
                  </li>
                ) : null,
              )}
            </ul>
          )}
        </CardBody>
      </Card>

      {equipos.length > 0 && (
        <Card className="mt-6">
          <CardHeader title="Equipos" />
          <CardBody className="p-0">
            <ul className="divide-y divide-border">
              {equipos.map((e) => (
                <li
                  key={e.id}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <Link
                    href={`/equipos/${e.id}`}
                    className="text-sm font-medium text-ink hover:underline"
                  >
                    {e.nombre}
                  </Link>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}

      <ContextoEstrategico cliente={cliente} />
    </div>
  );
}
