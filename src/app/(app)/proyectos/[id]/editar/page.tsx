import { notFound, redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getProyectoDetalle, getClientes } from "@/lib/data";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { ProyectoForm } from "@/components/proyectos/ProyectoForm";

export default async function EditarProyectoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!(await isAdmin())) redirect(`/proyectos/${id}`);
  const [data, clientes] = await Promise.all([
    getProyectoDetalle(id),
    getClientes(),
  ]);
  if (!data) notFound();
  return (
    <div className="max-w-2xl">
      <PageHeader
        title={`Editar · ${data.proyecto.nombre}`}
        back={{ href: `/proyectos/${id}`, label: "Ficha" }}
      />
      <Card>
        <CardBody>
          <ProyectoForm proyecto={data.proyecto} clientes={clientes} />
        </CardBody>
      </Card>
    </div>
  );
}
