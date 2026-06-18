import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { ClienteForm } from "@/components/clientes/ClienteForm";

export default async function NuevoClientePage() {
  if (!(await isAdmin())) redirect("/clientes");
  return (
    <div className="max-w-2xl">
      <PageHeader title="Nuevo cliente" back={{ href: "/clientes", label: "Clientes" }} />
      <Card>
        <CardBody>
          <ClienteForm />
        </CardBody>
      </Card>
    </div>
  );
}
