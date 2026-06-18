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
  searchParams: Promise<{
    persona_id?: string;
    persona?: string;
    semana?: string;
  }>;
}) {
  if (!(await isAdmin())) redirect("/registros");
  const sp = await searchParams;
  // Acepta persona_id (nuevo) o persona (legacy). Si viene persona explícita,
  // se bloquean persona y semana porque el acceso es intencional.
  const personaId = sp.persona_id || sp.persona;
  const semana = sp.semana || semanaActual();
  const lock = Boolean(personaId);
  const { personas } = await getOpciones();

  // Si ya existe registro para persona+semana, precargarlo (edición).
  let registro: RegistroSemanal | null = null;
  if (personaId) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("registros_semanales")
      .select("*")
      .eq("persona_id", personaId)
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
            personaId={personaId}
            registro={registro}
            semana={semana}
            redirectTo={`/registros?semana=${semana}`}
            lockPersona={lock}
            lockSemana={lock}
          />
        </CardBody>
      </Card>
    </div>
  );
}
