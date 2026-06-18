import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getClientes, getProyectos } from "@/lib/data";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { EquipoForm } from "@/components/equipos/EquipoForm";

export default async function NuevoEquipoPage() {
  if (!(await isAdmin())) redirect("/equipos");
  const [clientes, proyectos] = await Promise.all([
    getClientes(),
    getProyectos(),
  ]);
  return (
    <div className="max-w-2xl">
      <PageHeader title="Nuevo equipo" back={{ href: "/equipos", label: "Equipos" }} />
      <Card>
        <CardBody>
          <EquipoForm clientes={clientes} proyectos={proyectos} />
        </CardBody>
      </Card>
    </div>
  );
}
