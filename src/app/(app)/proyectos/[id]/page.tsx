import { notFound } from "next/navigation";
import Link from "next/link";
import { getProyectoDetalle, getHitosProyecto } from "@/lib/data";
import { isAdmin } from "@/lib/auth";
import { HitosManager } from "@/components/proyectos/HitosManager";
import { nombreCompleto, iniciales, fechaCorta } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { CargaBadge } from "@/components/ui/CargaBadge";
import {
  ProyectoEstadoBadge,
  RolBadge,
  TipoTrabajoBadge,
} from "@/components/ui/Badges";
import { TIPO_TRABAJO_LABEL, type TipoTrabajo } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProyectoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [data, hitosProyecto, admin] = await Promise.all([
    getProyectoDetalle(id),
    getHitosProyecto(id),
    isAdmin(),
  ]);
  if (!data) notFound();

  const { proyecto, cliente, equipos, personasAsignadas } = data;

  // Tipo de trabajo predominante (semana en curso)
  const tipoCount = new Map<TipoTrabajo, number>();
  const hitos: { persona: string; texto: string }[] = [];
  for (const pa of personasAsignadas) {
    const reg = pa.registroSemana;
    if (reg?.tipo_trabajo)
      tipoCount.set(reg.tipo_trabajo, (tipoCount.get(reg.tipo_trabajo) ?? 0) + 1);
    if (reg?.hitos && pa.persona)
      hitos.push({ persona: nombreCompleto(pa.persona), texto: reg.hitos });
  }
  const predominante = [...tipoCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];

  return (
    <div>
      <PageHeader
        title={proyecto.nombre}
        back={{ href: "/proyectos", label: "Proyectos" }}
        subtitle={
          cliente ? (
            <Link href={`/clientes/${cliente.id}`} className="hover:underline">
              {cliente.nombre}
            </Link>
          ) : undefined
        }
        action={
          admin && (
            <ButtonLink href={`/proyectos/${id}/editar`} variant="ghost">
              Editar
            </ButtonLink>
          )
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <ProyectoEstadoBadge estado={proyecto.estado} />
        <Badge tone="outline">{personasAsignadas.length} persona(s)</Badge>
        {predominante && (
          <Badge tone="green">
            Predomina: {TIPO_TRABAJO_LABEL[predominante]}
          </Badge>
        )}
      </div>

      {(proyecto.descripcion || proyecto.fecha_inicio) && (
        <Card className="mb-6">
          <CardBody>
            {proyecto.descripcion && (
              <p className="text-sm text-muted">{proyecto.descripcion}</p>
            )}
            <p className="mt-2 text-xs text-muted">
              {proyecto.fecha_inicio
                ? `Inicio ${fechaCorta(proyecto.fecha_inicio)}`
                : "Sin fecha de inicio"}
              {proyecto.fecha_fin && ` · Fin ${fechaCorta(proyecto.fecha_fin)}`}
            </p>
          </CardBody>
        </Card>
      )}

      {proyecto.notas && (
        <Card className="mb-6">
          <CardHeader title="Notas del proyecto" />
          <CardBody>
            <p className="whitespace-pre-wrap text-sm text-ink">
              {proyecto.notas}
            </p>
          </CardBody>
        </Card>
      )}

      <Card className="mb-6">
        <CardHeader
          title="Hitos del proyecto"
          subtitle={
            hitosProyecto.length === 0
              ? "Lo planificado vs lo ejecutado"
              : `${hitosProyecto.filter((h) => h.estadoEfectivo === "cumplido").length}/${hitosProyecto.length} cumplidos${
                  hitosProyecto.some((h) => h.estadoEfectivo === "atrasado")
                    ? ` · ${hitosProyecto.filter((h) => h.estadoEfectivo === "atrasado").length} atrasado(s)`
                    : ""
                }`
          }
        />
        <CardBody className="p-0">
          <HitosManager
            proyectoId={id}
            hitos={hitosProyecto}
            admin={admin}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Equipo asignado"
          subtitle={`${personasAsignadas.length} persona(s) con asignación activa`}
        />
        <CardBody className="p-0">
          {personasAsignadas.length === 0 ? (
            <p className="px-5 py-4 text-sm text-muted">
              Sin personas asignadas a este proyecto.
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
                        <span className="text-sm font-medium text-ink">
                          {nombreCompleto(pa.persona)}
                        </span>
                      </Link>
                      <div className="flex items-center gap-2">
                        <TipoTrabajoBadge
                          tipo={pa.registroSemana?.tipo_trabajo ?? null}
                        />
                        <CargaBadge
                          carga={pa.registroSemana?.carga_trabajo ?? null}
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

      {hitos.length > 0 && (
        <Card className="mt-6">
          <CardHeader title="Hitos recientes" subtitle="Semana en curso" />
          <CardBody className="p-0">
            <ul className="divide-y divide-border">
              {hitos.map((h, i) => (
                <li key={i} className="px-5 py-3 text-sm">
                  <span className="text-green-ink">★</span>{" "}
                  <span className="text-ink">{h.texto}</span>
                  <span className="ml-2 text-xs text-muted">— {h.persona}</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}

      {equipos.length > 0 && (
        <Card className="mt-6">
          <CardHeader title="Equipos" />
          <CardBody className="p-0">
            <ul className="divide-y divide-border">
              {equipos.map((e) => (
                <li key={e.id} className="px-5 py-3">
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
    </div>
  );
}
