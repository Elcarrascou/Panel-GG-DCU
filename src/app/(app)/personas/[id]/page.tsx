import Link from "next/link";
import { notFound } from "next/navigation";
import { getPersonaDetalle, getOpciones } from "@/lib/data";
import { isAdmin } from "@/lib/auth";
import { cerrarAsignacion } from "@/lib/actions";
import { nombreCompleto, iniciales, fechaCorta, rangoSemana, semanaActual } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { CargaBadge } from "@/components/ui/CargaBadge";
import { RolBadge, TipoTrabajoBadge } from "@/components/ui/Badges";
import { RegistroForm } from "@/components/registros/RegistroForm";
import { AsignacionForm } from "@/components/asignaciones/AsignacionForm";
import { TIPO_CONTRATO_LABEL } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PersonaDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [data, admin] = await Promise.all([getPersonaDetalle(id), isAdmin()]);
  if (!data) notFound();

  const { persona, activas, registros } = data;
  const cerradas = data.asignaciones.filter((a) => a.fecha_fin !== null);
  const semana = semanaActual();
  const registroSemana = registros.find((r) => r.semana === semana) ?? null;
  const opciones = admin ? await getOpciones() : null;

  return (
    <div>
      <PageHeader
        title={nombreCompleto(persona)}
        back={{ href: "/personas", label: "Personas" }}
        action={
          admin && (
            <ButtonLink href={`/personas/${id}/editar`} variant="ghost">
              Editar
            </ButtonLink>
          )
        }
      />

      {/* Cabecera */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex flex-wrap items-center gap-4">
            <Avatar iniciales={iniciales(persona)} size={56} />
            <div className="flex-1">
              <p className="text-lg font-semibold text-ink">
                {nombreCompleto(persona)}
              </p>
              <p className="text-sm text-muted">
                {persona.cargo ?? "Sin cargo definido"} · {persona.rut}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge tone={persona.activo ? "green" : "neutral"}>
                {persona.activo ? "Activo" : "Inactivo"}
              </Badge>
              <Badge tone="outline">
                {TIPO_CONTRATO_LABEL[persona.tipo_contrato]}
              </Badge>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Asignaciones activas */}
        <Card>
          <CardHeader
            title="Asignaciones activas"
            subtitle={`${activas.length} vigente(s)`}
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
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-ink">
                          {a.cliente?.nombre ?? "—"}
                          {a.proyecto && (
                            <span className="text-muted">
                              {" "}
                              · {a.proyecto.nombre}
                            </span>
                          )}
                        </p>
                        <p className="mt-0.5 text-xs text-muted">
                          {a.equipo ? `Equipo ${a.equipo.nombre} · ` : ""}
                          Desde {fechaCorta(a.fecha_inicio)}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <RolBadge rol={a.rol_equipo} />
                        {admin && (
                          <div className="flex items-center gap-3">
                            <Link
                              href={`/personas/${id}/mover/${a.id}`}
                              className="text-xs font-medium text-green-ink hover:underline"
                            >
                              Mover
                            </Link>
                            <form action={cerrarAsignacion}>
                              <input type="hidden" name="id" value={a.id} />
                              <input
                                type="hidden"
                                name="redirect_to"
                                value={`/personas/${id}`}
                              />
                              <button className="text-xs font-medium text-red-600 hover:underline">
                                Cerrar
                              </button>
                            </form>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        {/* Registro de la semana */}
        <Card>
          <CardHeader
            title="Registro de la semana"
            subtitle={rangoSemana(semana)}
          />
          <CardBody>
            {admin ? (
              <>
                {!registroSemana && (
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                    <p className="text-sm font-medium text-amber-900">
                      Sin registro esta semana.
                    </p>
                    <Link
                      href={`/registros/nuevo?persona_id=${id}&semana=${semana}`}
                      className="text-xs font-semibold text-green-ink hover:underline"
                    >
                      Registrar esta semana →
                    </Link>
                  </div>
                )}
                <RegistroForm
                  personaId={id}
                  registro={registroSemana}
                  semana={semana}
                  redirectTo={`/personas/${id}`}
                  compact
                />
              </>
            ) : registroSemana ? (
              <RegistroReadOnly registro={registroSemana} />
            ) : (
              <p className="text-sm text-muted">Sin registro esta semana.</p>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Nueva asignación (admin) */}
      {admin && opciones && (
        <Card className="mt-6">
          <CardHeader title="Nueva asignación" subtitle="Asignar a cliente / proyecto / equipo" />
          <CardBody>
            <AsignacionForm
              personaId={id}
              clientes={opciones.clientes}
              proyectos={opciones.proyectos}
              equipos={opciones.equipos}
              redirectTo={`/personas/${id}`}
            />
          </CardBody>
        </Card>
      )}

      {/* Historial de registros */}
      <Card className="mt-6">
        <CardHeader
          title="Historial de registros semanales"
          subtitle={`${registros.length} registro(s)`}
        />
        <CardBody className="p-0">
          {registros.length === 0 ? (
            <p className="px-5 py-4 text-sm text-muted">Aún sin registros.</p>
          ) : (
            <ul className="divide-y divide-border">
              {registros.map((r) => (
                <li key={r.id} className="px-5 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-ink">
                      {rangoSemana(r.semana)}
                    </span>
                    <CargaBadge carga={r.carga_trabajo} />
                    <TipoTrabajoBadge tipo={r.tipo_trabajo} />
                  </div>
                  {r.resumen && (
                    <p className="mt-1 text-sm text-muted">{r.resumen}</p>
                  )}
                  {r.hitos && (
                    <p className="mt-1 text-xs text-green-ink">
                      ★ {r.hitos}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      {/* Historial de asignaciones cerradas */}
      {cerradas.length > 0 && (
        <Card className="mt-6">
          <CardHeader title="Historial de asignaciones" subtitle="Asignaciones cerradas" />
          <CardBody className="p-0">
            <ul className="divide-y divide-border">
              {cerradas.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between px-5 py-3 text-sm"
                >
                  <span className="text-ink">
                    {a.cliente?.nombre ?? "—"}
                    {a.proyecto && (
                      <span className="text-muted"> · {a.proyecto.nombre}</span>
                    )}
                  </span>
                  <span className="text-xs text-muted">
                    {fechaCorta(a.fecha_inicio)} → {fechaCorta(a.fecha_fin)}
                  </span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

function RegistroReadOnly({
  registro,
}: {
  registro: { carga_trabajo: import("@/lib/types").CargaTrabajo | null; tipo_trabajo: import("@/lib/types").TipoTrabajo | null; resumen: string | null; hitos: string | null };
}) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <CargaBadge carga={registro.carga_trabajo} />
        <TipoTrabajoBadge tipo={registro.tipo_trabajo} />
      </div>
      {registro.resumen && (
        <p className="text-sm text-muted">{registro.resumen}</p>
      )}
      {registro.hitos && (
        <p className="text-xs text-green-ink">★ {registro.hitos}</p>
      )}
    </div>
  );
}
