import { notFound } from "next/navigation";
import { getClienteDetalle, getAlertasActivas } from "@/lib/data";
import { nombreCompleto, fechaCorta } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { PrintButton } from "@/components/ui/PrintButton";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CargaBadge } from "@/components/ui/CargaBadge";
import {
  ClienteEstadoBadge,
  ProyectoEstadoBadge,
  RolBadge,
} from "@/components/ui/Badges";
import { ALERTA_TIPO_LABEL, type Cliente } from "@/lib/types";

export const dynamic = "force-dynamic";

const SECCIONES: { key: keyof Cliente; titulo: string }[] = [
  { key: "contexto_actual", titulo: "Contexto actual" },
  { key: "ultimos_eventos", titulo: "Últimos eventos" },
  { key: "proximos_pasos", titulo: "Próximos pasos" },
  { key: "proyectos_futuros", titulo: "Proyectos futuros / propuestas" },
  { key: "notas_estrategicas", titulo: "Notas estratégicas" },
];

export default async function ReporteClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [data, alertas] = await Promise.all([
    getClienteDetalle(id),
    getAlertasActivas(),
  ]);
  if (!data) notFound();

  const { cliente, proyectos, personasAsignadas } = data;
  const decisiones = alertas.filter((a) => a.cliente_id === cliente.id);
  const hoy = new Date().toISOString().slice(0, 10);
  const secciones = SECCIONES.filter(
    (s) => typeof cliente[s.key] === "string" && (cliente[s.key] as string).trim(),
  );

  return (
    <div className="print-full">
      <PageHeader
        title={cliente.nombre}
        back={{ href: "/reportes", label: "Reportería" }}
        subtitle={`Reporte de cliente · generado el ${fechaCorta(hoy)}`}
        action={<PrintButton />}
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <ClienteEstadoBadge estado={cliente.estado} />
        <Badge tone="outline">{proyectos.length} proyecto(s)</Badge>
        <Badge tone="outline">{personasAsignadas.length} colaborador(es)</Badge>
      </div>

      {/* Contactos clave */}
      {cliente.contactos_cliente && (
        <Card className="mb-6">
          <CardHeader title="Contactos clave" />
          <CardBody>
            <p className="whitespace-pre-wrap text-sm text-ink">
              {cliente.contactos_cliente}
            </p>
          </CardBody>
        </Card>
      )}

      {/* Contexto estratégico */}
      {secciones.length > 0 && (
        <Card className="mb-6">
          <CardHeader title="Contexto estratégico" />
          <CardBody className="space-y-4">
            {secciones.map((s) => (
              <div key={s.key}>
                <p className="text-xs font-semibold uppercase tracking-wide text-green-ink">
                  {s.titulo}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-ink">
                  {cliente[s.key] as string}
                </p>
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      {/* Proyectos activos */}
      <Card className="mb-6">
        <CardHeader title="Proyectos" subtitle={`${proyectos.length} en total`} />
        <CardBody className="p-0">
          {proyectos.length === 0 ? (
            <p className="px-5 py-4 text-sm text-muted">Sin proyectos.</p>
          ) : (
            <ul className="divide-y divide-border">
              {proyectos.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-3 px-5 py-3"
                >
                  <span className="text-sm font-medium text-ink">{p.nombre}</span>
                  <ProyectoEstadoBadge estado={p.estado} />
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      {/* Colaboradores asignados */}
      <Card className="mb-6">
        <CardHeader
          title="Colaboradores asignados"
          subtitle="Asignación activa y carga de la semana en curso"
        />
        <CardBody className="p-0">
          {personasAsignadas.length === 0 ? (
            <p className="px-5 py-4 text-sm text-muted">
              Sin colaboradores asignados.
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

      {/* Decisiones pendientes del cliente */}
      <Card>
        <CardHeader
          title="Decisiones pendientes"
          subtitle="Alertas de gestión activas asociadas a este cliente"
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
                  {a.fecha_limite && (
                    <p className="mt-1 text-xs text-muted">
                      Límite: {fechaCorta(a.fecha_limite)}
                    </p>
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
