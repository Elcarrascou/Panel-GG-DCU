import { notFound, redirect } from "next/navigation";
import { getPersonaDetalle, getOpciones } from "@/lib/data";
import { isAdmin } from "@/lib/auth";
import { nombreCompleto, fechaCorta } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { MoverPersonaForm } from "@/components/asignaciones/MoverPersonaForm";

export const dynamic = "force-dynamic";

export default async function MoverAsignacionPage({
  params,
}: {
  params: Promise<{ id: string; asignacionId: string }>;
}) {
  const { id, asignacionId } = await params;
  if (!(await isAdmin())) redirect(`/personas/${id}`);

  const [data, opciones] = await Promise.all([
    getPersonaDetalle(id),
    getOpciones(),
  ]);
  if (!data) notFound();

  const asignacion = data.activas.find((a) => a.id === asignacionId);
  if (!asignacion) notFound();

  return (
    <div className="max-w-2xl">
      <PageHeader
        title={`Mover a ${nombreCompleto(data.persona)}`}
        back={{ href: `/personas/${id}`, label: "Ficha" }}
        subtitle={`Asignación actual: ${asignacion.cliente?.nombre ?? "—"}${
          asignacion.proyecto ? ` · ${asignacion.proyecto.nombre}` : ""
        } · desde ${fechaCorta(asignacion.fecha_inicio)}`}
      />
      <Card>
        <CardBody>
          <MoverPersonaForm
            personaId={id}
            asignacionId={asignacion.id}
            clienteActualNombre={asignacion.cliente?.nombre ?? "—"}
            fechaInicioActual={asignacion.fecha_inicio}
            clientes={opciones.clientes}
            proyectos={opciones.proyectos}
          />
        </CardBody>
      </Card>
    </div>
  );
}
