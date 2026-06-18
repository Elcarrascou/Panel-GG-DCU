import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getOpciones } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { semanaActual } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { RegistroForm } from "@/components/registros/RegistroForm";
import type { RegistroSemanal } from "@/lib/types";

export default async function NuevoRegistroPage({
  searchParams,
}: {
  searchParams: Promise<{ persona?: string; semana?: string }>;
}) {
  if (!(await isAdmin())) redirect("/registros");
  const { persona, semana: semanaParam } = await searchParams;
  const semana = semanaParam || semanaActual();
  const { personas } = await getOpciones();

  // Si ya existe registro para persona+semana, precargarlo (edición).
  let registro: RegistroSemanal | null = null;
  if (persona) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("registros_semanales")
      .select("*")
      .eq("persona_id", persona)
      .eq("semana", semana)
      .maybeSingle();
    registro = (data as RegistroSemanal) ?? null;
  }

  return (
    <div className="max-w-2xl">
      <PageHeader
        title={registro ? "Editar registro semanal" : "Nuevo registro semanal"}
        back={{ href: `/registros?semana=${semana}`, label: "Registros" }}
      />
      <Card>
        <CardBody>
          <RegistroForm
            personas={personas}
            personaId={persona}
            registro={registro}
            semana={semana}
            redirectTo={`/registros?semana=${semana}`}
          />
        </CardBody>
      </Card>
    </div>
  );
}
