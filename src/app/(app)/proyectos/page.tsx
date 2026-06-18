import Link from "next/link";
import { getProyectos } from "@/lib/data";
import { isAdmin } from "@/lib/auth";
import { fechaCorta } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProyectoEstadoBadge } from "@/components/ui/Badges";

export const dynamic = "force-dynamic";

export default async function ProyectosPage() {
  const [proyectos, admin] = await Promise.all([getProyectos(), isAdmin()]);

  // Agrupar por cliente
  const grupos = new Map<string, typeof proyectos>();
  for (const p of proyectos) {
    const key = p.cliente?.nombre ?? "Sin cliente";
    const arr = grupos.get(key) ?? [];
    arr.push(p);
    grupos.set(key, arr);
  }
  const orden = Array.from(grupos.keys()).sort();

  return (
    <div>
      <PageHeader
        title="Proyectos"
        subtitle="Agrupados por cliente / área"
        action={
          admin && <ButtonLink href="/proyectos/nuevo">+ Nuevo proyecto</ButtonLink>
        }
      />

      {proyectos.length === 0 ? (
        <EmptyState
          title="Aún no hay proyectos"
          description="Crea el primer proyecto y vincúlalo a un cliente."
          action={
            admin && (
              <ButtonLink href="/proyectos/nuevo">+ Nuevo proyecto</ButtonLink>
            )
          }
        />
      ) : (
        <div className="space-y-7">
          {orden.map((cli) => (
            <section key={cli}>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                {cli}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {grupos.get(cli)!.map((p) => (
                  <Link key={p.id} href={`/proyectos/${p.id}`}>
                    <Card className="h-full transition-colors hover:border-[#8EF67C]">
                      <CardBody>
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-ink">{p.nombre}</p>
                          <ProyectoEstadoBadge estado={p.estado} />
                        </div>
                        {p.descripcion && (
                          <p className="mt-1 line-clamp-2 text-xs text-muted">
                            {p.descripcion}
                          </p>
                        )}
                        <p className="mt-3 text-xs text-muted">
                          {p.fecha_inicio
                            ? `Inicio ${fechaCorta(p.fecha_inicio)}`
                            : "Sin fecha de inicio"}
                        </p>
                      </CardBody>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
