import Link from "next/link";
import {
  getClientes,
  getProyectos,
  getOpciones,
  getAlertasActivas,
} from "@/lib/data";
import { nombreCompleto } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function ReportesPage() {
  const [clientes, proyectos, opciones, alertas] = await Promise.all([
    getClientes(),
    getProyectos(),
    getOpciones(),
    getAlertasActivas(),
  ]);

  const personas = opciones.personas;
  const criticas = alertas.filter((a) => a.tipo === "critica").length;
  const importantes = alertas.filter((a) => a.tipo === "importante").length;

  return (
    <div>
      <PageHeader
        title="Reportería"
        subtitle="Reportes limpios e imprimibles (exportables a PDF desde el navegador)"
      />

      {/* Reporte de decisiones + resumen semanal: accesos directos */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <Link href="/reportes/decisiones">
          <Card className="h-full transition-colors hover:border-primary">
            <CardBody className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-ink">Decisiones pendientes</p>
                <p className="mt-1 text-xs text-muted">
                  Todas las decisiones activas, críticas primero.
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {criticas > 0 && <Badge tone="red">{criticas} crítica(s)</Badge>}
                  {importantes > 0 && (
                    <Badge tone="amber">{importantes} importante(s)</Badge>
                  )}
                  <Badge tone="outline">{alertas.length} en total</Badge>
                </div>
              </div>
              <span className="text-muted">→</span>
            </CardBody>
          </Card>
        </Link>

        <Link href="/reportes/semanal">
          <Card className="h-full transition-colors hover:border-primary">
            <CardBody className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-ink">
                  Resumen semanal del equipo
                </p>
                <p className="mt-1 text-xs text-muted">
                  Carga, dotación por cliente e histórico semanal.
                </p>
                <div className="mt-3">
                  <Badge tone="outline">{personas.length} persona(s)</Badge>
                </div>
              </div>
              <span className="text-muted">→</span>
            </CardBody>
          </Card>
        </Link>
      </div>

      {/* Reporte por cliente */}
      <Card className="mb-6">
        <CardHeader
          title="Reporte por cliente / área"
          subtitle="Estado, contexto estratégico, proyectos, equipo y decisiones"
        />
        <CardBody>
          <PickerGrid
            items={clientes.map((c) => ({
              id: c.id,
              label: c.nombre,
              href: `/reportes/cliente/${c.id}`,
            }))}
            empty="No hay clientes registrados."
          />
        </CardBody>
      </Card>

      {/* Reporte por proyecto */}
      <Card className="mb-6">
        <CardHeader
          title="Reporte por proyecto"
          subtitle="Cliente, equipo, hitos y contexto"
        />
        <CardBody>
          <PickerGrid
            items={proyectos.map((p) => ({
              id: p.id,
              label: p.nombre,
              sub: p.cliente?.nombre ?? undefined,
              href: `/reportes/proyecto/${p.id}`,
            }))}
            empty="No hay proyectos registrados."
          />
        </CardBody>
      </Card>

      {/* Reporte por colaborador */}
      <Card>
        <CardHeader
          title="Reporte por colaborador"
          subtitle="Asignación actual, historial y decisiones asociadas"
        />
        <CardBody>
          <PickerGrid
            items={personas.map((p) => ({
              id: p.id,
              label: nombreCompleto(p),
              sub: p.cargo ?? undefined,
              href: `/reportes/colaborador/${p.id}`,
            }))}
            empty="No hay colaboradores activos."
          />
        </CardBody>
      </Card>
    </div>
  );
}

function PickerGrid({
  items,
  empty,
}: {
  items: { id: string; label: string; sub?: string; href: string }[];
  empty: string;
}) {
  if (items.length === 0)
    return <p className="text-sm text-muted">{empty}</p>;
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it) => (
        <Link
          key={it.id}
          href={it.href}
          className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm [transition:border-color_var(--dur-ui)_var(--ease-out)] hover:border-primary"
        >
          <span className="min-w-0">
            <span className="block truncate font-medium text-ink">
              {it.label}
            </span>
            {it.sub && (
              <span className="block truncate text-xs text-muted">{it.sub}</span>
            )}
          </span>
          <span className="text-muted">→</span>
        </Link>
      ))}
    </div>
  );
}
