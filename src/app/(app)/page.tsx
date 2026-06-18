import Link from "next/link";
import { getDashboardData } from "@/lib/data";
import { rangoSemana } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { CargaBar } from "@/components/charts/CargaBar";
import { Donut, DONUT_PALETTE } from "@/components/charts/Donut";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const d = await getDashboardData();
  const slices = d.porCliente.map((c, i) => ({
    label: c.nombre,
    value: c.value,
    color: DONUT_PALETTE[i % DONUT_PALETTE.length],
  }));
  const coberturaPct =
    d.totalActivas > 0
      ? Math.round((d.conRegistro / d.totalActivas) * 100)
      : 0;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={`Semana en curso · ${rangoSemana(d.semana)}`}
      />

      {/* Alertas */}
      {(d.sinRegistro > 0 || d.sinAsignacion.length > 0) && (
        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          {d.sinRegistro > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-sm font-semibold text-amber-900">
                {d.sinRegistro} persona{d.sinRegistro !== 1 && "s"} sin registro
                esta semana
              </p>
              <p className="mt-0.5 text-xs text-amber-800">
                Cobertura de registros: {coberturaPct}% del equipo activo.{" "}
                <Link href="/registros" className="font-medium underline">
                  Ir a registros
                </Link>
              </p>
            </div>
          )}
          {d.sinAsignacion.length > 0 && (
            <div className="rounded-xl border border-gray-300 bg-gray-50 px-4 py-3">
              <p className="text-sm font-semibold text-ink">
                {d.sinAsignacion.length} persona
                {d.sinAsignacion.length !== 1 && "s"} sin asignación activa
              </p>
              <p className="mt-0.5 text-xs text-muted">
                Capacidad potencialmente disponible.{" "}
                <Link
                  href="/reportes#sin-asignacion"
                  className="font-medium underline"
                >
                  Ver detalle
                </Link>
              </p>
            </div>
          )}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Personas activas"
          value={d.totalActivas}
          accent
          hint="Dotación total vigente"
        />
        <StatCard
          label="Clientes activos"
          value={d.clientesActivos}
          hint={`${d.clientesInactivos} inactivo(s)`}
        />
        <StatCard
          label="Proyectos activos"
          value={d.proyectosActivos}
        />
        <StatCard
          label="Sin registro semanal"
          value={d.sinRegistro}
          tone={d.sinRegistro > 0 ? "alert" : "ok"}
          hint={`${d.conRegistro} con registro`}
        />
      </div>

      {/* Gráficos */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Distribución de carga de trabajo"
            subtitle="Semana en curso · equipo activo"
          />
          <CardBody>
            <CargaBar counts={d.cargaCounts} sinRegistro={d.sinRegistro} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Personas por cliente / área"
            subtitle="Según asignaciones activas"
          />
          <CardBody>
            <Donut slices={slices} />
          </CardBody>
        </Card>
      </div>

      {/* Listas de alerta */}
      {(d.personasSinRegistro.length > 0 || d.sinAsignacion.length > 0) && (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader title="Pendientes de registro esta semana" />
            <CardBody className="p-0">
              <AlertList
                items={d.personasSinRegistro}
                empty="Todo el equipo registrado."
                registrarSemana={d.semana}
              />
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Sin asignación activa" />
            <CardBody className="p-0">
              <AlertList items={d.sinAsignacion} empty="Todos asignados." />
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}

function AlertList({
  items,
  empty,
  registrarSemana,
}: {
  items: { id: string; nombre: string }[];
  empty: string;
  registrarSemana?: string;
}) {
  if (items.length === 0)
    return <p className="px-5 py-4 text-sm text-muted">{empty}</p>;
  return (
    <ul className="divide-y divide-border">
      {items.slice(0, 12).map((p) => (
        <li
          key={p.id}
          className="flex items-center justify-between px-5 py-2.5 text-sm hover:bg-gray-50"
        >
          <Link
            href={`/personas/${p.id}`}
            className="text-ink hover:underline"
          >
            {p.nombre}
          </Link>
          {registrarSemana ? (
            <Link
              href={`/registros/nuevo?persona_id=${p.id}&semana=${registrarSemana}`}
              className="text-xs font-semibold text-[#2f6b27] hover:underline"
            >
              Registrar →
            </Link>
          ) : (
            <Link
              href={`/personas/${p.id}`}
              className="text-xs text-muted hover:underline"
            >
              Ver ficha →
            </Link>
          )}
        </li>
      ))}
      {items.length > 12 && (
        <li className="px-5 py-2 text-xs text-muted">
          +{items.length - 12} más…
        </li>
      )}
    </ul>
  );
}
