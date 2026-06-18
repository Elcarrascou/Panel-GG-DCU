import { notFound, redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getClienteDetalle } from "@/lib/data";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { ClienteForm } from "@/components/clientes/ClienteForm";

export default async function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!(await isAdmin())) redirect(`/clientes/${id}`);
  const data = await getClienteDetalle(id);
  if (!data) notFound();
  return (
    <div className="max-w-2xl">
      <PageHeader
        title={`Editar · ${data.cliente.nombre}`}
        back={{ href: `/clientes/${id}`, label: "Ficha" }}
      />
      <Card>
        <CardBody>
          <ClienteForm cliente={data.cliente} />
        </CardBody>
      </Card>
    </div>
  );
}
