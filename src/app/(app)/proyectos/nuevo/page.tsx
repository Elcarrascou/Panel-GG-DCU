import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getClientes } from "@/lib/data";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { ProyectoForm } from "@/components/proyectos/ProyectoForm";

export default async function NuevoProyectoPage({
  searchParams,
}: {
  searchParams: Promise<{ cliente?: string }>;
}) {
  if (!(await isAdmin())) redirect("/proyectos");
  const { cliente } = await searchParams;
  const clientes = await getClientes();
  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Nuevo proyecto"
        back={{ href: "/proyectos", label: "Proyectos" }}
      />
      <Card>
        <CardBody>
          <ProyectoForm clientes={clientes} clienteIdDefault={cliente} />
        </CardBody>
      </Card>
    </div>
  );
}
