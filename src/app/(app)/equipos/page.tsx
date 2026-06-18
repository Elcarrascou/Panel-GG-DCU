import Link from "next/link";
import { getEquipos } from "@/lib/data";
import { isAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function EquiposPage() {
  const [equipos, admin] = await Promise.all([getEquipos(), isAdmin()]);

  return (
    <div>
      <PageHeader
        title="Equipos"
        subtitle="Equipos por cliente o proyecto"
        action={
          admin && <ButtonLink href="/equipos/nuevo">+ Nuevo equipo</ButtonLink>
        }
      />
      {equipos.length === 0 ? (
        <EmptyState
          title="Aún no hay equipos"
          description="Crea un equipo, vincúlalo a un cliente (y opcionalmente a un proyecto) y agrega miembros con sus roles."
          action={
            admin && <ButtonLink href="/equipos/nuevo">+ Nuevo equipo</ButtonLink>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {equipos.map((e) => (
            <Link key={e.id} href={`/equipos/${e.id}`}>
              <Card className="h-full transition-colors hover:border-[#8EF67C]">
                <CardBody>
                  <p className="font-medium text-ink">{e.nombre}</p>
                  <p className="mt-1 text-xs text-muted">
                    {e.cliente?.nombre ?? "—"}
                    {e.proyecto && ` · ${e.proyecto.nombre}`}
                  </p>
                  <div className="mt-3">
                    <Badge tone="outline">{e.miembros} miembro(s)</Badge>
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
