import { notFound } from "next/navigation";
import {
  getProyectoDetalle,
  getHitosProyecto,
  getAlertasActivas,
} from "@/lib/data";
import { nombreCompleto, fechaCorta } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { PrintButton } from "@/components/ui/PrintButton";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { CargaBadge } from "@/components/ui/CargaBadge";
import { ProyectoEstadoBadge, RolBadge } from "@/components/ui/Badges";
import {
  ALERTA_TIPO_LABEL,
  HITO_ESTADO_LABEL,
  HITO_ESTADO_TONE,
} from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ReporteProyectoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [data, hitos, alertas] = await Promise.all([
    getProyectoDetalle(id),
    getHitosProyecto(id),
    getAlertasActivas(),
  ]);
  if (!data) notFound();

  const { proyecto, cliente, personasAsignadas } = data;
  const decisiones = alertas.filter(
    (a) =>
      a.proyecto_id === proyecto.id ||
      (a.cliente_id && a.cliente_id === proyecto.cliente_id),
  );
  const hoy = new Date().toISOString().slice(0, 10);

  return (
    <div className="print-full">
      <PageHeader
        title={proyecto.nombre}
        back={{ href: "/reportes", label: "Reportería" }}
        subtitle={`Reporte de proyecto · generado el ${fechaCorta(hoy)}`}
        action={<PrintButton />}
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <ProyectoEstadoBadge estado={proyecto.estado} />
        {cliente && <Badge tone="outline">{cliente.nombre}</Badge>}
        <Badge tone="outline">{personasAsignadas.length} persona(s)</Badge>
      </div>

      {(proyecto.descripcion || proyecto.fecha_inicio) && (
        <Card className="mb-6">
          <CardHeader title="Contexto del proyecto" />
          <CardBody>
            {proyecto.descripcion && (
              <p className="text-sm text-ink">{proyecto.descripcion}</p>
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

      {/* Equipo asignado */}
      <Card className="mb-6">
        <CardHeader
          title="Equipo asignado"
          subtitle={`${personasAsignadas.length} persona(s) con asignación activa`}
        />
        <CardBody className="p-0">
          {personasAsignadas.length === 0 ? (
            <p className="px-5 py-4 text-sm text-muted">
              Sin personas asignadas.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {personasAsignadas.map(
                (pa) =>
                  pa.persona && (
                    <li
                      key={pa.asignacion.id}
                      className="flex items-center justify-between gap-3 px-5 py-3"
                    >
                      <span className="text-sm font-medium text-ink">
                        {nombreCompleto(pa.persona)}
                      </span>
                      <div className="flex items-center gap-2">
                        <CargaBadge
                          carga={pa.registroSemana?.carga_trabajo ?? null}
                        />
                        <RolBadge rol={pa.asignacion.rol_equipo} />
                      </div>
                    </li>
                  ),
              )}
            </ul>
          )}
        </CardBody>
      </Card>

      {/* Hitos */}
      <Card className="mb-6">
        <CardHeader
          title="Hitos del proyecto"
          subtitle="Planificado vs real"
        />
        <CardBody className="p-0">
          {hitos.length === 0 ? (
            <p className="px-5 py-4 text-sm text-muted">Sin hitos registrados.</p>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Hito</TH>
                  <TH>Planificada</TH>
                  <TH>Real</TH>
                  <TH>Estado</TH>
                </TR>
              </THead>
              <TBody>
                {hitos.map((h) => (
                  <TR key={h.id}>
                    <TD className="font-medium text-ink">{h.titulo}</TD>
                    <TD className="text-muted">
                      {fechaCorta(h.fecha_planificada)}
                    </TD>
                    <TD className="text-muted">
                      {h.fecha_real ? fechaCorta(h.fecha_real) : "—"}
                    </TD>
                    <TD>
                      <Badge tone={HITO_ESTADO_TONE[h.estadoEfectivo]}>
                        {HITO_ESTADO_LABEL[h.estadoEfectivo]}
                      </Badge>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Decisiones pendientes */}
      <Card>
        <CardHeader
          title="Decisiones pendientes"
          subtitle="Alertas de gestión activas del proyecto o su cliente"
        />
        <CardBody className="p-0">
          {decisiones.length === 0 ? (
            <p className="px-5 py-4 text-sm text-muted">
              Sin decisiones pendientes.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {decisiones.map((a) => (
                <li key={a.id} className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Badge
                      tone={
                        a.tipo === "critica"
                          ? "red"
                          : a.tipo === "importante"
                            ? "amber"
                            : "neutral"
                      }
                    >
                      {ALERTA_TIPO_LABEL[a.tipo]}
                    </Badge>
                    <span className="text-sm font-medium text-ink">
                      {a.titulo}
                    </span>
                  </div>
                  {a.descripcion && (
                    <p className="mt-1 text-sm text-muted">{a.descripcion}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
