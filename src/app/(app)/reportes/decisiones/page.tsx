import { getAlertasActivas } from "@/lib/data";
import { fechaCorta } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { PrintButton } from "@/components/ui/PrintButton";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ALERTA_CATEGORIA_LABEL, ALERTA_TIPO_LABEL } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ReporteDecisionesPage() {
  const alertas = await getAlertasActivas();
  const hoy = new Date().toISOString().slice(0, 10);

  const criticas = alertas.filter((a) => a.tipo === "critica").length;
  const importantes = alertas.filter((a) => a.tipo === "importante").length;
  const seguimiento = alertas.filter((a) => a.tipo === "seguimiento").length;

  function relacionada(a: (typeof alertas)[number]): string | null {
    if (a.persona_id && a.personas)
      return `${a.personas.nombre} ${a.personas.apellido}`;
    if (a.proyecto_id && a.proyectos) return a.proyectos.nombre;
    if (a.cliente_id && a.clientes) return a.clientes.nombre;
    return null;
  }

  return (
    <div className="print-full">
      <PageHeader
        title="Decisiones pendientes"
        back={{ href: "/reportes", label: "Reportería" }}
        subtitle={`Reporte de decisiones · generado el ${fechaCorta(hoy)}`}
        action={<PrintButton />}
      />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Críticas"
          value={criticas}
          tone={criticas > 0 ? "alert" : "ok"}
        />
        <StatCard label="Importantes" value={importantes} />
        <StatCard label="Seguimiento" value={seguimiento} />
        <StatCard label="Total" value={alertas.length} accent />
      </div>

      <Card>
        <CardHeader
          title="Detalle de decisiones activas"
          subtitle="Ordenadas por prioridad (críticas primero)"
        />
        <CardBody className="p-0">
          {alertas.length === 0 ? (
            <p className="px-5 py-4 text-sm text-muted">
              No hay decisiones pendientes.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {alertas.map((a) => {
                const rel = relacionada(a);
                return (
                  <li key={a.id} className="px-5 py-4">
                    <div className="flex flex-wrap items-center gap-2">
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
                      {a.categoria && (
                        <Badge tone="outline">
                          {ALERTA_CATEGORIA_LABEL[a.categoria]}
                        </Badge>
                      )}
                      {a.estado === "en_gestion" && (
                        <Badge tone="dark">En gestión</Badge>
                      )}
                    </div>
                    <p className="mt-2 text-sm font-semibold text-ink">
                      {a.titulo}
                    </p>
                    {a.descripcion && (
                      <p className="mt-1 text-sm text-muted">{a.descripcion}</p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                      {rel && <span>Asociada a: {rel}</span>}
                      <span>Creada: {fechaCorta(a.created_at.slice(0, 10))}</span>
                      {a.fecha_limite && (
                        <span>Límite: {fechaCorta(a.fecha_limite)}</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
