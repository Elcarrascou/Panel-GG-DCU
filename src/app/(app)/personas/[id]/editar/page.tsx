import { notFound, redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getPersonaDetalle } from "@/lib/data";
import { nombreCompleto } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { PersonaForm } from "@/components/personas/PersonaForm";

export default async function EditarPersonaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!(await isAdmin())) redirect(`/personas/${id}`);
  const data = await getPersonaDetalle(id);
  if (!data) notFound();

  return (
    <div className="max-w-3xl">
      <PageHeader
        title={`Editar · ${nombreCompleto(data.persona)}`}
        back={{ href: `/personas/${id}`, label: "Ficha" }}
      />
      <Card>
        <CardBody>
          <PersonaForm persona={data.persona} />
        </CardBody>
      </Card>
    </div>
  );
}
