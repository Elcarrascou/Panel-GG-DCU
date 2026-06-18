import Link from "next/link";
import { getPersonasConEstado, getRegistros } from "@/lib/data";
import { isAdmin } from "@/lib/auth";
import { nombreCompleto, rangoSemana, semanaActual } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/Table";
import { CargaBadge } from "@/components/ui/CargaBadge";
import { TipoTrabajoBadge } from "@/components/ui/Badges";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function RegistrosPage({
  searchParams,
}: {
  searchParams: Promise<{ semana?: string }>;
}) {
  const sp = await searchParams;
  const semana = sp.semana || semanaActual();

  const [estados, registros, admin] = await Promise.all([
    getPersonasConEstado(),
    getRegistros(semana),
    isAdmin(),
  ]);

  const regPorPersona = new Map(registros.map((r) => [r.persona_id, r]));
  const activos = estados.filter((e) => e.persona.activo);
  const conRegistro = activos.filter((e) =>
    regPorPersona.has(e.persona.id),
  ).length;

  return (
    <div>
      <PageHeader
        title="Registros semanales"
        subtitle={rangoSemana(semana)}
        action={
          admin && (
            <ButtonLink href={`/registros/nuevo?semana=${semana}`}>
              + Nuevo registro
            </ButtonLink>
          )
        }
      />

      <Card className="mb-5">
        <CardBody>
          <form method="get" className="flex flex-wrap items-end gap-3">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-ink">
                Semana (lunes)
              </span>
              <input
                type="date"
                name="semana"
                defaultValue={semana}
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-[#6CD45A] focus:outline-none focus:ring-2 focus:ring-[#8EF67C]/40"
              />
            </label>
            <button className="rounded-lg border border-border bg-surface px-3.5 py-2 text-sm font-medium text-ink hover:bg-gray-50">
              Ver semana
            </button>
            <span className="ml-auto text-sm text-muted">
              Cobertura:{" "}
              <span className="font-semibold text-ink">
                {conRegistro}/{activos.length}
              </span>
            </span>
          </form>
        </CardBody>
      </Card>

      <Table>
        <THead>
          <TR>
            <TH>Persona</TH>
            <TH>Cliente / Área</TH>
            <TH>Carga</TH>
            <TH>Tipo</TH>
            <TH />
          </TR>
        </THead>
        <TBody>
          {activos.map((e) => {
            const r = regPorPersona.get(e.persona.id);
            const clientes = Array.from(
              new Set(
                e.activas
                  .map((a) => a.cliente?.nombre)
                  .filter((x): x is string => Boolean(x)),
              ),
            );
            return (
              <TR key={e.persona.id}>
                <TD>
                  <Link
                    href={`/personas/${e.persona.id}`}
                    className="font-medium text-ink hover:underline"
                  >
                    {nombreCompleto(e.persona)}
                  </Link>
                </TD>
                <TD>
                  {clientes.length ? (
                    <span className="text-xs text-muted">
                      {clientes.join(", ")}
                    </span>
                  ) : (
                    <Badge tone="amber">Sin asignar</Badge>
                  )}
                </TD>
                <TD>
                  <CargaBadge carga={r?.carga_trabajo ?? null} />
                </TD>
                <TD>
                  <TipoTrabajoBadge tipo={r?.tipo_trabajo ?? null} />
                </TD>
                <TD className="text-right">
                  {admin && (
                    <Link
                      href={`/registros/nuevo?persona=${e.persona.id}&semana=${semana}`}
                      className="text-xs font-medium text-[#2f6b27] hover:underline"
                    >
                      {r ? "Editar" : "Registrar"}
                    </Link>
                  )}
                </TD>
              </TR>
            );
          })}
        </TBody>
      </Table>
    </div>
  );
}
