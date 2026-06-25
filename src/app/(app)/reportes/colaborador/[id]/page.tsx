import { notFound } from "next/navigation";
import { getPersonaDetalle, getAlertasActivas } from "@/lib/data";
import { nombreCompleto, fechaCorta, semanaActual } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { PrintButton } from "@/components/ui/PrintButton";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CargaBadge } from "@/components/ui/CargaBadge";
import { RolBadge, TipoTrabajoBadge } from "@/components/ui/Badges";
import { ALERTA_TIPO_LABEL, TIPO_CONTRATO_LABEL } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ReporteColaboradorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [data, alertas] = await Promise.all([
    getPersonaDetalle(id),
    getAlertasActivas(),
  ]);
  if (!data) notFound();

  const { persona, asignaciones, activas, registros } = data;
  const decisiones = alertas.filter((a) => a.persona_id === persona.id);
  const hoy = new Date().toISOString().slice(0, 10);
  const semana = semanaActual();
  const registroActual =
    registros.find((r) => r.semana === semana) ?? registros[0] ?? null;
  const historial = asignaciones.slice(0, 5);

  return (
    <div className="print-full">
      <PageHeader
        title={nombreCompleto(persona)}
        back={{ href: "/reportes", label: "Reportería" }}
        subtitle={`Reporte de colaborador · generado el ${fechaCorta(hoy)}`}
        action={<PrintButton />}
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        {persona.cargo && <Badge tone="outline">{persona.cargo}</Badge>}
        <Badge tone="neutral">{TIPO_CONTRATO_LABEL[persona.tipo_contrato]}</Badge>
        {registroActual?.tipo_trabajo && (
          <TipoTrabajoBadge tipo={registroActual.tipo_trabajo} />
        )}
        {!persona.activo && <Badge tone="red">Inactivo</Badge>}
      </div>

      {/* Asignación actual */}
      <Card className="mb-6">
        <CardHeader
          title="Asignación actual"
          subtitle="Cliente, proyecto y carga de la semana en curso"
        />
        <CardBody className="p-0">
          {activas.length === 0 ? (
            <p className="px-5 py-4 text-sm text-muted">
              Sin asignación activa.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {activas.map((a) => (
                <li key={a.id} className="px-5 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-ink">
                      {a.cliente?.nombre ?? "—"}
                      {a.proyecto && (
                        <span className="text-muted"> · {a.proyecto.nombre}</span>
                      )}
                    </span>
                    <div className="flex items-center gap-2">
                      <CargaBadge carga={registroActual?.carga_trabajo ?? null} />
                      <RolBadge rol={a.rol_equipo} />
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    Desde {fechaCorta(a.fecha_inicio)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      {/* Historial de asignaciones */}
      <Card className="mb-6">
        <CardHeader
          title="Historial de asignaciones"
          subtitle="Últimas asignaciones (recientes primero)"
        />
        <CardBody className="p-0">
          {historial.length === 0 ? (
            <p className="px-5 py-4 text-sm text-muted">Sin historial.</p>
          ) : (
            <ul className="divide-y divide-border">
              {historial.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between gap-3 px-5 py-3"
                >
                  <span className="text-sm text-ink">
                    {a.cliente?.nombre ?? "—"}
                    {a.proyecto && (
                      <span className="text-muted"> · {a.proyecto.nombre}</span>
                    )}
                  </span>
                  <span className="shrink-0 text-xs text-muted">
                    {fechaCorta(a.fecha_inicio)} —{" "}
                    {a.fecha_fin ? fechaCorta(a.fecha_fin) : "actual"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      {/* Decisiones pendientes */}
      <Card>
        <CardHeader
          title="Decisiones pendientes"
          subtitle="Alertas de gestión activas que involucran a esta persona"
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
