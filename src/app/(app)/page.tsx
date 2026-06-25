import Link from "next/link";
import {
  getDashboardData,
  getAlertasActivas,
  getProyectosCriticos,
  type ProyectoCritico,
} from "@/lib/data";
import { isAdmin } from "@/lib/auth";
import { rangoSemana } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CargaBar } from "@/components/charts/CargaBar";
import { Donut, DONUT_PALETTE } from "@/components/charts/Donut";
import { AlertaCard } from "@/components/alertas/AlertaCard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [d, alertas, proyectos, admin] = await Promise.all([
    getDashboardData(),
    getAlertasActivas(),
    getProyectosCriticos(),
    isAdmin(),
  ]);

  const slices = d.porCliente.map((c, i) => ({
    label: c.nombre,
    value: c.value,
    color: DONUT_PALETTE[i % DONUT_PALETTE.length],
  }));

  const criticas = alertas.filter((a) => a.tipo === "critica").length;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={`Semana en curso · ${rangoSemana(d.semana)}`}
        action={
          <ButtonLink href="/presentacion/semanal">
            ▶ Ver presentación semanal
          </ButtonLink>
        }
      />

      {/* ============ ZONA 1 — Decisiones y alertas críticas ============ */}
      <section className="mb-8">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-ink">
              Atención requerida
            </h2>
            <p className="text-sm text-muted">
              {alertas.length > 0
                ? `${alertas.length} decisión(es) pendiente(s)${
                    criticas > 0 ? ` · ${criticas} crítica(s)` : ""
                  }`
                : "Estado de las decisiones de gestión"}
            </p>
          </div>
          <Link
            href="/alertas"
            className="text-sm font-semibold text-green-ink hover:underline"
          >
            Gestionar todas →
          </Link>
        </div>

        {alertas.length === 0 ? (
          <div className="flex items-center gap-3 rounded-xl border border-primary/40 bg-primary/10 px-5 py-4">
            <span className="text-xl">✓</span>
            <p className="text-sm font-medium text-green-ink">
              Sin decisiones pendientes esta semana.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {alertas.map((a) => (
              <AlertaCard key={a.id} alerta={a} admin={admin} />
            ))}
          </div>
        )}
      </section>

      {/* ============ ZONA 2 — KPIs operacionales ============ */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
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
        <StatCard label="Proyectos activos" value={d.proyectosActivos} />
        <StatCard
          label="Sin asignación"
          value={d.sinAsignacion.length}
          tone={d.sinAsignacion.length > 0 ? "alert" : "ok"}
          hint="Capacidad disponible"
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

      {/* ============ ZONA 3 — Estado de proyectos ============ */}
      {proyectos.length > 0 && (
        <div className="mt-6">
          <Card>
            <CardHeader
              title="Estado de proyectos"
              subtitle="Criticidad según alertas activas asociadas"
            />
            <CardBody className="p-0">
              <ul className="divide-y divide-border">
                {proyectos.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-3 px-5 py-3"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/proyectos/${p.id}`}
                        className="block truncate text-sm font-medium text-ink hover:underline"
                      >
                        {p.nombre}
                      </Link>
                      {p.cliente && (
                        <span className="text-xs text-muted">{p.cliente}</span>
                      )}
                    </div>
                    <CriticidadBadge criticidad={p.criticidad} />
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Listas de pendientes operacionales */}
      {(d.personasSinRegistro.length > 0 || d.sinAsignacion.length > 0) && (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader title="Pendientes de registro esta semana" />
            <CardBody className="p-0">
              <ListaPendientes
                items={d.personasSinRegistro}
                empty="Todo el equipo registrado."
                registrarSemana={d.semana}
              />
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Sin asignación activa" />
            <CardBody className="p-0">
              <ListaPendientes
                items={d.sinAsignacion}
                empty="Todos asignados."
              />
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}

function CriticidadBadge({
  criticidad,
}: {
  criticidad: ProyectoCritico["criticidad"];
}) {
  const map = {
    critica: { tone: "red" as const, label: "Crítico" },
    importante: { tone: "amber" as const, label: "Atención" },
    seguimiento: { tone: "neutral" as const, label: "Seguimiento" },
    normal: { tone: "green" as const, label: "En curso" },
  };
  const { tone, label } = map[criticidad];
  return <Badge tone={tone}>{label}</Badge>;
}

function ListaPendientes({
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
          <Link href={`/personas/${p.id}`} className="text-ink hover:underline">
            {p.nombre}
          </Link>
          {registrarSemana ? (
            <Link
              href={`/registros/nuevo?persona_id=${p.id}&semana=${registrarSemana}`}
              className="text-xs font-semibold text-green-ink hover:underline"
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
