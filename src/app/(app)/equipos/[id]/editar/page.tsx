import { notFound, redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getEquipoDetalle, getClientes, getProyectos } from "@/lib/data";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { EquipoForm } from "@/components/equipos/EquipoForm";

export default async function EditarEquipoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!(await isAdmin())) redirect(`/equipos/${id}`);
  const [data, clientes, proyectos] = await Promise.all([
    getEquipoDetalle(id),
    getClientes(),
    getProyectos(),
  ]);
  if (!data) notFound();
  return (
    <div className="max-w-2xl">
      <PageHeader
        title={`Editar · ${data.equipo.nombre}`}
        back={{ href: `/equipos/${id}`, label: "Ficha" }}
      />
      <Card>
        <CardBody>
          <EquipoForm equipo={data.equipo} clientes={clientes} proyectos={proyectos} />
        </CardBody>
      </Card>
    </div>
  );
}
