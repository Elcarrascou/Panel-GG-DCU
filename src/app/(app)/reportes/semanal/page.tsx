import Link from "next/link";
import {
  getPersonasConEstado,
  getCargaHistorica,
  getClientes,
} from "@/lib/data";
import { nombreCompleto, rangoSemana, semanaActual } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { PrintButton } from "@/components/ui/PrintButton";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/Table";
import { CargaBadge } from "@/components/ui/CargaBadge";
import { Badge } from "@/components/ui/Badge";
import {
  CARGA_COLOR,
  CARGA_LABEL,
  CARGA_ORDEN,
  type CargaTrabajo,
} from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ReporteSemanalPage() {
  const [estados, historica, clientes] = await Promise.all([
    getPersonasConEstado(),
    getCargaHistorica(),
    getClientes(),
  ]);
  const semana = semanaActual();
  const activos = estados.filter((e) => e.persona.activo);

  // --- Reporte por cliente: carga agregada ---
  type Agg = { total: number; counts: Partial<Record<CargaTrabajo, number>> };
  const porCliente = new Map<string, Agg>();
  for (const c of clientes) porCliente.set(c.nombre, { total: 0, counts: {} });
  for (const e of activos) {
    const carga = e.registroSemana?.carga_trabajo ?? null;
    const nombres = Array.from(
      new Set(
        e.activas
          .map((a) => a.cliente?.nombre)
          .filter((x): x is string => Boolean(x)),
      ),
    );
    for (const n of nombres) {
      const agg = porCliente.get(n) ?? { total: 0, counts: {} };
      agg.total += 1;
      if (carga) agg.counts[carga] = (agg.counts[carga] ?? 0) + 1;
      porCliente.set(n, agg);
    }
  }
  const clientesConGente = [...porCliente.entries()].filter(
    ([, a]) => a.total > 0,
  );

  const sinAsignacion = activos.filter((e) => e.activas.length === 0);

  return (
    <div className="print-full">
      <PageHeader
        title="Resumen semanal del equipo"
        back={{ href: "/reportes", label: "Reportería" }}
        subtitle={`Generado para semana · ${rangoSemana(semana)}`}
        action={<PrintButton />}
      />

      {/* 1. Reporte semanal general */}
      <Card className="mb-6">
        <CardHeader
          title="Reporte semanal general"
          subtitle="Todas las personas activas, asignación actual y carga"
        />
        <CardBody className="p-0">
          <Table>
            <THead>
              <TR>
                <TH>Persona</TH>
                <TH>Cargo</TH>
                <TH>Asignación actual</TH>
                <TH>Carga</TH>
              </TR>
            </THead>
            <TBody>
              {activos.map((e) => {
                const clientesN = Array.from(
                  new Set(
                    e.activas
                      .map((a) => a.cliente?.nombre)
                      .filter((x): x is string => Boolean(x)),
                  ),
                );
                return (
                  <TR key={e.persona.id}>
                    <TD className="font-medium text-ink">
                      {nombreCompleto(e.persona)}
                    </TD>
                    <TD className="text-muted">{e.persona.cargo ?? "—"}</TD>
                    <TD>
                      {clientesN.length ? (
                        clientesN.join(", ")
                      ) : (
                        <span className="text-amber-700">Sin asignar</span>
                      )}
                    </TD>
                    <TD>
                      <CargaBadge carga={e.registroSemana?.carga_trabajo ?? null} />
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        </CardBody>
      </Card>

      {/* 2. Reporte por cliente */}
      <Card className="mb-6">
        <CardHeader
          title="Reporte por cliente / área"
          subtitle="Dotación y distribución de carga del equipo"
        />
        <CardBody className="space-y-4">
          {clientesConGente.map(([nombre, agg]) => (
            <div key={nombre}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-ink">{nombre}</span>
                <span className="text-muted">{agg.total} persona(s)</span>
              </div>
              <MiniStacked counts={agg.counts} total={agg.total} />
            </div>
          ))}
        </CardBody>
      </Card>

      {/* 3. Carga histórica */}
      <Card className="mb-6">
        <CardHeader
          title="Carga histórica"
          subtitle="Evolución semanal de la distribución de carga"
        />
        <CardBody>
          {historica.length === 0 ? (
            <p className="text-sm text-muted">
              Aún no hay suficientes registros para mostrar tendencias.
            </p>
          ) : (
            <div className="space-y-3">
              {historica.map((wk) => {
                const total = CARGA_ORDEN.reduce(
                  (s, c) => s + (wk.counts[c] ?? 0),
                  0,
                );
                return (
                  <div key={wk.semana}>
                    <p className="mb-1 text-xs font-medium text-muted">
                      {rangoSemana(wk.semana)}
                    </p>
                    <MiniStacked counts={wk.counts} total={total} />
                  </div>
                );
              })}
              <Leyenda />
            </div>
          )}
        </CardBody>
      </Card>

      {/* 4. Personas sin asignación */}
      <Card id="sin-asignacion">
        <CardHeader
          title="Personas sin asignación"
          subtitle="Capacidad potencialmente disponible"
        />
        <CardBody className="p-0">
          {sinAsignacion.length === 0 ? (
            <p className="px-5 py-4 text-sm text-muted">
              Todas las personas activas tienen asignación.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {sinAsignacion.map((e) => (
                <li
                  key={e.persona.id}
                  className="flex items-center justify-between px-5 py-2.5"
                >
                  <Link
                    href={`/personas/${e.persona.id}`}
                    className="text-sm text-ink hover:underline"
                  >
                    {nombreCompleto(e.persona)}
                  </Link>
                  <Badge tone="outline">{e.persona.cargo ?? "—"}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function MiniStacked({
  counts,
  total,
}: {
  counts: Partial<Record<CargaTrabajo, number>>;
  total: number;
}) {
  const sinRegistro = total - CARGA_ORDEN.reduce((s, c) => s + (counts[c] ?? 0), 0);
  return (
    <div className="flex h-3 w-full overflow-hidden rounded-full bg-gray-100">
      {CARGA_ORDEN.map((c) =>
        counts[c] ? (
          <div
            key={c}
            style={{
              width: `${((counts[c] ?? 0) / total) * 100}%`,
              backgroundColor: CARGA_COLOR[c],
            }}
            title={`${CARGA_LABEL[c]}: ${counts[c]}`}
          />
        ) : null,
      )}
      {sinRegistro > 0 && (
        <div
          style={{ width: `${(sinRegistro / total) * 100}%` }}
          className="bg-gray-300"
          title={`Sin registro: ${sinRegistro}`}
        />
      )}
    </div>
  );
}

function Leyenda() {
  return (
    <div className="flex flex-wrap gap-3 pt-2">
      {CARGA_ORDEN.map((c) => (
        <span key={c} className="flex items-center gap-1.5 text-xs text-muted">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: CARGA_COLOR[c] }}
          />
          {CARGA_LABEL[c]}
        </span>
      ))}
      <span className="flex items-center gap-1.5 text-xs text-muted">
        <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
        Sin registro
      </span>
    </div>
  );
}
