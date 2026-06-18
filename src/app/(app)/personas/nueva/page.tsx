import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { PersonaForm } from "@/components/personas/PersonaForm";

export default async function NuevaPersonaPage() {
  if (!(await isAdmin())) redirect("/personas");
  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Nueva persona"
        back={{ href: "/personas", label: "Personas" }}
      />
      <Card>
        <CardBody>
          <PersonaForm />
        </CardBody>
      </Card>
    </div>
  );
}
